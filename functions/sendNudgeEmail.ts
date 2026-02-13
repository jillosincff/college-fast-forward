import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { dryRun = false, limit = 50 } = await req.json().catch(() => ({}));

    const now = new Date();
    const h24Ago = new Date(now - 24 * 60 * 60 * 1000);
    const h48Ago = new Date(now - 48 * 60 * 60 * 1000);
    const h72Ago = new Date(now - 72 * 60 * 60 * 1000);

    // Get activation prompts that need nudging
    const prompts = await base44.asServiceRole.entities.ActivationPrompt.filter({
      action_taken: false,
      status: 'pending'
    });

    // Get email preferences
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    // Get active UF questions for content
    const recentQuestions = await base44.asServiceRole.entities.HelpRequest.filter(
      { status: 'active' }, '-created_date', 5
    );
    const recentJobs = await base44.asServiceRole.entities.JobRequest.filter(
      { status: 'active' }, '-created_date', 5
    );

    const results = { processed: 0, nudge24Sent: 0, nudge48Sent: 0, skipped: 0, errors: [] };

    for (const prompt of prompts.slice(0, limit)) {
      try {
        results.processed++;

        // Check email preferences
        const pref = prefsByUser[prompt.user_id];
        if (pref && (pref.all_emails === false || pref.nudge_emails === false)) {
          results.skipped++;
          continue;
        }

        const createdAt = new Date(prompt.created_date);
        const hoursSinceSignup = (now - createdAt) / (1000 * 60 * 60);

        let nudgeType = null;
        if (hoursSinceSignup >= 24 && hoursSinceSignup < 48 && !prompt.nudge_24h_sent_at) {
          nudgeType = '24h';
        } else if (hoursSinceSignup >= 48 && hoursSinceSignup < 72 && !prompt.nudge_48h_sent_at) {
          nudgeType = '48h';
        } else {
          results.skipped++;
          continue;
        }

        const firstName = (prompt.user_email || '').split('@')[0] || 'there';
        const isParent = prompt.user_type === 'parent';
        const questions = isParent ? recentQuestions : recentJobs;

        let questionPreview = '';
        if (questions.length > 0) {
          const q = questions[0];
          const studentName = (q.student_name || q.poster_name || 'A Gator').split(' ')[0];
          const desc = (q.description || '').substring(0, 120);
          questionPreview = `
            <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0; background: #fafafa;">
              <strong style="color: #111827;">${studentName}</strong>
              <span style="color: #6b7280; font-size: 13px;"> · ${q.industry || q.target_industry || 'Various'}</span>
              <p style="color: #374151; font-style: italic; margin: 8px 0 0 0;">"${desc}..."</p>
            </div>`;
        }

        let subject, intro, ctaText, ctaUrl;
        if (nudgeType === '24h') {
          if (isParent) {
            subject = `A Gator student could use your help right now`;
            intro = `You signed up yesterday but haven't had a chance to help yet. No pressure — but here's a student who could really use someone with your background:`;
            ctaText = 'See Who Needs Help →';
            ctaUrl = `${APP_BASE_URL}/#Connections?utm_source=nudge&utm_campaign=24h`;
          } else {
            subject = `Gators are ready to help you — ask your first question!`;
            intro = `You joined the Gator Network yesterday. UF parents and alumni are standing by to help with career advice, job leads, and more.`;
            ctaText = 'Ask Your First Question →';
            ctaUrl = `${APP_BASE_URL}/#PostRequest?utm_source=nudge&utm_campaign=24h`;
          }
        } else {
          if (isParent) {
            subject = `${questions.length || 'Several'} Gator students are still waiting for help`;
            intro = `It's been a couple days since you joined. Students are actively posting questions — and many match your professional background.`;
            ctaText = 'Browse Student Questions →';
            ctaUrl = `${APP_BASE_URL}/#Connections?utm_source=nudge&utm_campaign=48h`;
          } else {
            subject = `Your Gator Network is waiting — it takes 30 seconds to ask`;
            intro = `Just a quick reminder: there are experienced UF parents and alumni ready to help you. Post a question and you could get a response within hours.`;
            ctaText = 'Post a Question →';
            ctaUrl = `${APP_BASE_URL}/#PostRequest?utm_source=nudge&utm_campaign=48h`;
          }
        }

        const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 50px;" />
    </div>
    <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 16px;">Hi ${firstName},</p>
      <p style="font-size: 16px;">${intro}</p>
      ${questionPreview}
      <div style="text-align: center; margin: 24px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${ctaText}</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">It only takes 2-3 minutes. Every action helps the Gator family.</p>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">Go Gators! 🐊 — <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a></p>
    </div>
  </div>
</body></html>`;

        if (!dryRun) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: prompt.user_email,
            subject,
            body: emailHtml,
            from_name: 'College Fast Forward'
          });

          // Update activation prompt
          const updateData = nudgeType === '24h'
            ? { nudge_24h_sent_at: now.toISOString(), prompt_stage: 'nudge_24h' }
            : { nudge_48h_sent_at: now.toISOString(), prompt_stage: 'nudge_48h' };
          await base44.asServiceRole.entities.ActivationPrompt.update(prompt.id, updateData);

          // Log
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: prompt.user_id,
            user_email: prompt.user_email,
            email_type: nudgeType === '24h' ? 'nudge_24h' : 'nudge_48h',
            subject,
            status: 'sent',
            sent_at: now.toISOString()
          });
        }

        if (nudgeType === '24h') results.nudge24Sent++;
        else results.nudge48Sent++;

      } catch (err) {
        results.errors.push({ userId: prompt.user_id, error: err.message });
      }
    }

    return Response.json({ success: true, dryRun, results });
  } catch (error) {
    console.error('Nudge email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});