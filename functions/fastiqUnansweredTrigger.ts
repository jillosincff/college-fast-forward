import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  // Called by trusted scheduled automation — no user auth required

  try {
    const { dryRun = false } = await req.json().catch(() => ({}));
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now - 72 * 60 * 60 * 1000).toISOString();
    const seventyEightHoursAgo = new Date(now - 78 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get active questions with 0 answers posted 72-78 hours ago (6h window to match our run interval)
    const allJobRequests = await base44.asServiceRole.entities.JobRequest.filter(
      { status: 'active', poster_type: 'student' }, '-created_date', 200
    );

    const unansweredAt72h = (allJobRequests || []).filter(q => {
      if ((q.answer_count || 0) > 0) return false;
      const created = q.created_date;
      return created && created <= seventyTwoHoursAgo && created >= seventyEightHoursAgo;
    });

    console.log(`Found ${unansweredAt72h.length} questions hitting 72h unanswered window`);

    if (unansweredAt72h.length === 0) {
      return Response.json({ success: true, processed: 0, reason: 'No questions in 72h window' });
    }

    // Pre-fetch: existing FASTIQ triggers (to deduplicate), email logs, families, profiles
    const existingTriggers = await base44.asServiceRole.entities.FastiqOutreachEmail.filter(
      { email_type: 'zero_response_intro' }, '-sent_date', 500
    );
    const triggeredQuestionIds = new Set((existingTriggers || []).map(t => t.job_request_id).filter(Boolean));

    // Weekly rate limit: get triggers sent in last 7 days per student
    const recentTriggers = (existingTriggers || []).filter(t => t.sent_date && t.sent_date >= oneWeekAgo);
    const weeklyTriggersByStudent = {};
    recentTriggers.forEach(t => {
      weeklyTriggersByStudent[t.user_email] = (weeklyTriggersByStudent[t.user_email] || 0) + 1;
    });

    // Get FASTIQ profiles for tier detection
    const fastiqProfiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({}, undefined, 500);
    const profileByEmail = {};
    (fastiqProfiles || []).forEach(p => { if (p.user_email) profileByEmail[p.user_email] = p; });

    // Get families for subscription tier
    const families = await base44.asServiceRole.entities.Family.filter({}, undefined, 500);
    const familyByStudentEmail = {};
    (families || []).forEach(f => {
      if (f.student_email) familyByStudentEmail[f.student_email] = f;
      (f.student_ids || []).forEach(sid => { familyByStudentEmail[`id:${sid}`] = f; });
    });

    // Get alumni counts by category for the email copy
    const allUsers = await base44.asServiceRole.entities.User.filter({}, undefined, 500);
    const alumniByCategory = {};
    const CATEGORY_INDUSTRY_MAP = {
      networking: ['Marketing', 'Consulting', 'Finance & Banking'],
      career_path: ['Technology & Software', 'Engineering', 'Healthcare'],
      first_job: ['Retail', 'Hospitality', 'Media & Entertainment'],
      industry: ['Law & Legal', 'Real Estate', 'Manufacturing', 'Government']
    };
    (allUsers || []).filter(u => u.persona === 'parent' || u.persona === 'alumni').forEach(u => {
      const industries = u.industries || [];
      industries.forEach(ind => {
        Object.entries(CATEGORY_INDUSTRY_MAP).forEach(([cat, inds]) => {
          if (inds.some(i => i.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(i.toLowerCase()))) {
            alumniByCategory[cat] = (alumniByCategory[cat] || 0) + 1;
          }
        });
      });
    });
    // Fallback count
    const totalHelpers = (allUsers || []).filter(u => u.persona === 'parent' || u.persona === 'alumni').length;

    const results = { processed: 0, notificationsSent: 0, emailsSent: 0, skipped: 0, errors: [] };

    for (const question of unansweredAt72h) {
      try {
        results.processed++;

        const studentEmail = question.poster_email || question.created_by;
        if (!studentEmail || studentEmail.includes('service+')) {
          results.skipped++;
          continue;
        }

        // Deduplicate: max 1 trigger per question
        if (triggeredQuestionIds.has(question.id)) {
          results.skipped++;
          continue;
        }

        // Rate limit: max 2 per student per week
        if ((weeklyTriggersByStudent[studentEmail] || 0) >= 2) {
          results.skipped++;
          continue;
        }

        // Check email preferences
        const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: studentEmail });
        if (prefs?.[0]?.all_emails === false) {
          results.skipped++;
          continue;
        }

        // Determine membership tier
        const family = familyByStudentEmail[studentEmail];
        const subscriptionTier = family?.subscription_tier || 'free';
        const isFastiqMember = subscriptionTier === 'fastiq' || (profileByEmail[studentEmail]?.pro_tier === 'fastiq');
        const isBasicMember = subscriptionTier === 'cff' || (!isFastiqMember && family?.subscription_status === 'active');

        // Alumni count for this question's category
        const category = question.category || 'networking';
        const alumniCount = alumniByCategory[category] || Math.min(totalHelpers, 50);

        // Determine CTA based on tier
        let ctaText, ctaUrl, ctaSubtext;
        if (isFastiqMember) {
          ctaText = 'Let FASTIQ find your answer →';
          ctaUrl = `${APP_URL}/#FastIQ?action=outreach&question_id=${question.id}&utm_source=fastiq_unanswered_trigger`;
          ctaSubtext = `FASTIQ will reach out to ${alumniCount} alumni in ${category.replace(/_/g, ' ')} on your behalf.`;
        } else {
          ctaText = 'Unlock FASTIQ to get your answer →';
          ctaUrl = `${APP_URL}/#FastIQ?upgrade=true&question_id=${question.id}&utm_source=fastiq_unanswered_trigger`;
          ctaSubtext = `FASTIQ will find alumni in ${category.replace(/_/g, ' ')} and reach out on your behalf.`;
        }

        const studentName = (question.poster_first_name || question.poster_name?.split(' ')[0] || 'there');
        const questionPreview = (question.title || question.description || '').substring(0, 120);

        // Step 1: Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: studentEmail,
          type: 'fastiq_unanswered',
          title: "Your question hasn't gotten a response yet",
          message: `FASTIQ found ${alumniCount} alumni who work in ${category.replace(/_/g, ' ')} — want me to reach out to them directly?`,
          action_url: ctaUrl,
          is_read: false,
          priority: 'high',
          metadata: { question_id: question.id, alumni_count: alumniCount, category, tier: isFastiqMember ? 'fastiq' : isBasicMember ? 'basic' : 'free' }
        });
        results.notificationsSent++;

        if (dryRun) {
          console.log(`[DRY RUN] Would send FASTIQ trigger to ${studentEmail} for question ${question.id}`);
          continue;
        }

        // Step 2: Send email
        const subject = "Still waiting on an answer? FASTIQ can help.";

        const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${alumniCount} alumni in ${category.replace(/_/g, ' ')} could answer your question — FASTIQ can reach them.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #7C3AED 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${studentName},</p>
      <p style="font-size: 16px;">Your question hasn't gotten a response yet:</p>

      <div style="background: #F8FAFC; border-left: 4px solid #0021A5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1E293B; font-style: italic; margin: 0;">"${questionPreview}"</p>
      </div>

      <div style="background: #F5F3FF; border: 2px solid #7C3AED; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <p style="color: #7C3AED; font-weight: 700; margin: 0 0 8px 0;">⚡ FASTIQ found ${alumniCount} alumni who can help</p>
        <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0;">${ctaSubtext}</p>
        <div style="text-align: center;">
          <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">${ctaText}</a>
        </div>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward — FASTIQ Career Intelligence</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

        const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: studentEmail }] }],
            from: { email: 'notifications@collegefastforward.com', name: 'FASTIQ by CFF' },
            subject,
            content: [{ type: 'text/html', value: emailHtml }]
          })
        });

        const emailStatus = sgResponse.ok ? 'sent' : 'failed';

        // Log to FastiqOutreachEmail
        await base44.asServiceRole.entities.FastiqOutreachEmail.create({
          user_email: studentEmail,
          email_type: 'zero_response_intro',
          sent_date: now.toISOString(),
          job_request_id: question.id,
          student_name: studentName
        });

        // Log to EmailLog
        await base44.asServiceRole.entities.EmailLog.create({
          user_email: studentEmail,
          email_type: 'fastiq_unanswered_trigger',
          subject,
          status: emailStatus,
          sent_at: now.toISOString(),
          metadata: {
            question_id: question.id,
            membership_tier: isFastiqMember ? 'fastiq' : isBasicMember ? 'basic' : 'free',
            fastiq_alumni_count: alumniCount,
            converted_to_fastiq: false
          }
        });

        if (sgResponse.ok) results.emailsSent++;
        console.log(`FASTIQ trigger ${emailStatus} to ${studentEmail} for question ${question.id} (tier: ${isFastiqMember ? 'fastiq' : isBasicMember ? 'basic' : 'free'})`);

        // Update weekly counter
        weeklyTriggersByStudent[studentEmail] = (weeklyTriggersByStudent[studentEmail] || 0) + 1;
        triggeredQuestionIds.add(question.id);

      } catch (err) {
        results.errors.push({ questionId: question.id, error: err.message });
      }
    }

    console.log(`FASTIQ unanswered trigger complete: ${results.emailsSent} emails, ${results.notificationsSent} notifications`);
    return Response.json({ success: true, dryRun, results });
  } catch (error) {
    console.error('fastiqUnansweredTrigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});