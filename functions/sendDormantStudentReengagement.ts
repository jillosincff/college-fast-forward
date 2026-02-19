import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.FastTrackProfile.list();
    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No FastTrackProfiles found', sent: 0 });
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get active parent count for messaging
    const allUsers = await base44.asServiceRole.entities.User.list();
    const activeParents = (allUsers || []).filter(u =>
      (u.persona === 'parent' || (u.roles && u.roles.includes('parent')))
    );

    // Get class activity stats for final nudge
    const allInteractions = await base44.asServiceRole.entities.InteractionLog.filter({ status: 'completed' });
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthInteractions = (allInteractions || []).filter(i => i.completed_at && i.completed_at >= thisMonthStart);
    const activeStudentsThisMonth = new Set(monthInteractions.map(i => i.student_email)).size;
    const monthConversations = monthInteractions.length;

    let warmSent = 0;
    let finalSent = 0;
    let skipped = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        if (!profile.user_email || !profile.last_activity_date) continue;

        const lastActivity = new Date(profile.last_activity_date);
        const daysDormant = Math.round((now - lastActivity) / (1000 * 60 * 60 * 24));

        if (daysDormant < 14) continue; // Not dormant yet

        // Check existing activation prompts to avoid spamming
        const existingPrompts = await base44.asServiceRole.entities.ActivationPrompt.filter({
          user_email: profile.user_email
        });

        const reengagementPrompts = (existingPrompts || []).filter(p =>
          p.action_type === 'dormant_14d' || p.action_type === 'dormant_30d'
        );

        const has14dNudge = reengagementPrompts.some(p => p.action_type === 'dormant_14d');
        const has30dNudge = reengagementPrompts.some(p => p.action_type === 'dormant_30d');

        // After final nudge was sent, STOP — do not spam
        if (has30dNudge) {
          skipped++;
          continue;
        }

        const studentName = profile.user_name || profile.user_email.split('@')[0];
        const industries = (profile.target_industries || []).join(', ') || 'your target industry';

        // 30+ days dormant and already got 14d nudge → send final nudge
        if (daysDormant >= 30 && has14dNudge) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.user_email,
            subject: "Opportunities don't wait",
            body: `Hey ${studentName},

${activeStudentsThisMonth} students in your class have had ${monthConversations} professional conversations this month. The ones showing up are getting noticed.

When you're ready, we're here. Your next conversation is one click away.

— College Fast Forward at UF`,
            from_name: 'College Fast Forward'
          });

          await base44.asServiceRole.entities.ActivationPrompt.create({
            user_id: profile.user_id,
            user_email: profile.user_email,
            user_type: 'student',
            prompt_stage: 'nudge_48h',
            status: 'shown',
            action_type: 'dormant_30d',
            shown_at: now.toISOString()
          });

          finalSent++;
          continue;
        }

        // 14+ days dormant, no nudge yet → send warm re-engagement
        if (!has14dNudge) {
          // Find a suggested parent match
          let suggestedParent = '';
          if (activeParents.length > 0) {
            const matchingParent = activeParents.find(p => {
              const pIndustries = (p.industries || []).map(i => i.toLowerCase());
              return (profile.target_industries || []).some(ti => pIndustries.includes(ti.toLowerCase()));
            }) || activeParents[0];

            if (matchingParent) {
              const parentName = matchingParent.full_name || 'A CFF parent';
              const parentIndustry = (matchingParent.industries || [])[0] || (matchingParent.job_title || '');
              suggestedParent = parentIndustry
                ? `\nHere's one parent who matches your interests: ${parentName}, ${parentIndustry}\n`
                : `\nHere's one parent ready to help: ${parentName}\n`;
            }
          }

          const activeParentCount = activeParents.length;

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.user_email,
            subject: `${studentName}, the door is still open`,
            body: `Hey ${studentName},

${activeParentCount} parents in ${industries} are active on CFF this week. It only takes one conversation to get moving.
${suggestedParent}
Just say hi. That's all it takes.

— College Fast Forward at UF`,
            from_name: 'College Fast Forward'
          });

          await base44.asServiceRole.entities.ActivationPrompt.create({
            user_id: profile.user_id,
            user_email: profile.user_email,
            user_type: 'student',
            prompt_stage: 'nudge_24h',
            status: 'shown',
            action_type: 'dormant_14d',
            shown_at: now.toISOString()
          });

          warmSent++;
        }
      } catch (studentError) {
        console.error(`Error processing student ${profile.user_email}:`, studentError.message);
        errors.push({ email: profile.user_email, error: studentError.message });
      }
    }

    return Response.json({
      message: 'Dormant re-engagement complete',
      warm_sent: warmSent,
      final_sent: finalSent,
      skipped,
      total_profiles: profiles.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Dormant re-engagement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});