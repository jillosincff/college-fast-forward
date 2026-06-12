import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ONE-TIME REENGAGEMENT: Grants a 3-day CliFF Premium trial to the April CSV-import
// cohort (source: csv_import_2026_04_25) and emails them that it's already live.
// Idempotent via cliff_reengagement_trial_at marker. Run repeatedly until remaining = 0.
// After granting: checkTrialExpiry auto-expires, cliffTrialEmailScheduler sends ending/ended emails.

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const APP_BASE = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
const APP_URL = `${APP_BASE}/#/FreeTierDashboard`;

const makeUnsubToken = (userId, email) => btoa(`${userId}:${email}`).replace(/=/g, '');
const unsubUrl = (userId, email) => `${APP_BASE}/#/Unsubscribe?token=${makeUnsubToken(userId, email)}`;

const emailWrapper = (content, unsubscribeUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CliFF</title></head>
<body style="margin: 0; padding: 0; background: #F5F5F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">
        CLIFF · COLLEGE FAST FORWARD
      </p>
    </div>
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 12px; color: #AAAAAA; margin: 0 0 4px;">College Fast Forward · support@collegefastforward.com</p>
      <p style="font-size: 11px; color: #CCCCCC; margin: 0 0 4px;">You're receiving this because you joined College Fast Forward.</p>
      <p style="font-size: 11px; color: #CCCCCC; margin: 0;"><a href="${unsubscribeUrl}" style="color: #AAAAAA; text-decoration: underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

function trialLiveEmail(firstName, endDateLabel, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: `We turned on CliFF Premium for you — free until ${endDateLabel}`,
    html: emailWrapper(`
      <div style="background: #0A0A0A; padding: 36px 36px 32px;">
        <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">🎁 PREMIUM IS LIVE ON YOUR ACCOUNT</p>
        <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">Your CliFF Premium is on — no card, no signup.</h1>
        <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">It's already active. Just log in. Free until ${escapeHtml(endDateLabel)}.</p>
      </div>
      <div style="padding: 28px 36px 32px;">
        <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">Hi ${name},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">You created a CliFF account a while back but never got to see the good stuff. So we just unlocked <strong>3 days of full Premium access</strong> on your account — already live, nothing to activate.</p>
        <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">Here's what's open until <strong>${escapeHtml(endDateLabel)}</strong>:</p>
        <p style="font-size: 15px; color: #444; line-height: 1.9; margin: 0 0 16px;">
          ✅ Unlimited alumni searches at your target companies<br>
          ✅ AI outreach drafts that actually get replies<br>
          ✅ Resume tailoring for any job posting<br>
          ✅ Mock interview practice
        </p>
        <div style="text-align: center; margin: 8px 0 4px;">
          <a href="${APP_URL}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">Log in — Premium is waiting →</a>
        </div>
        <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 16px 0 16px;"><br>— Jill</p>
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. The fastest win: search alumni at one company you'd love to work for, and send one message. Most students who do that hear back within a week.</p>
      </div>`, unsubscribeUrl),
  };
}

async function sendViaSendGrid(toEmail, subject, html) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: 'support@collegefastforward.com', name: 'Jill at CliFF' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!response.ok) throw new Error(`SendGrid ${response.status}: ${await response.text()}`);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
    if (!user || !isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { dry_run = false, batch_size = 80, trial_days = 3 } = await req.json().catch(() => ({}));

    // Find the April CSV-import cohort who are eligible
    const cohort = await base44.asServiceRole.entities.User.filter({ source: 'csv_import_2026_04_25' }, '-created_date', 1000);

    const eligible = cohort.filter(u =>
      !u.cliff_reengagement_trial_at &&        // not already granted by this campaign
      u.subscription_status !== 'active' &&    // not paying
      !u.stripe_subscription_id &&
      u.trial_status !== 'active'              // not already in a trial
    );

    // Pre-load unsubscribe prefs once (instead of per-user)
    const unsubPrefs = await base44.asServiceRole.entities.EmailPreference.filter({ all_emails: false }, null, 2000).catch(() => []);
    const unsubIds = new Set(unsubPrefs.map(p => p.user_id));

    if (dry_run) {
      const personas = {};
      eligible.forEach(u => { const p = u.persona || 'unknown'; personas[p] = (personas[p] || 0) + 1; });
      return Response.json({
        dry_run: true,
        personas,
        cohort_total: cohort.length,
        eligible: eligible.length,
        unsubscribed_in_eligible: eligible.filter(u => unsubIds.has(u.id)).length,
        sample: eligible.slice(0, 5).map(u => u.email),
      });
    }

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + trial_days);
    const endDateLabel = end.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' });

    let granted = 0;
    let emailed = 0;
    const errors = [];
    const batch = eligible.slice(0, batch_size);

    for (const u of batch) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, {
          trial_start_date: now.toISOString(),
          trial_end_date: end.toISOString(),
          trial_status: 'active',
          fastiq_trial_active: true,
          membership_tier: 'fastiq_trial',
          subscription_status: 'trial',
          cliff_reengagement_trial_at: now.toISOString(),
        });
        granted++;

        if (!unsubIds.has(u.id)) {
          const firstName = (u.full_name || '').split(' ')[0] || 'there';
          const { subject, html } = trialLiveEmail(firstName, endDateLabel, unsubUrl(u.id, u.email));
          await sendViaSendGrid(u.email, subject, html);
          emailed++;
        }

        base44.asServiceRole.entities.AnalyticsEvent.create({
          event_name: 'reengagement_trial_granted',
          user_id: u.id,
          user_email: u.email,
          school_code: u.school_code || u.school_name || '',
          properties: { trial_end_date: end.toISOString(), campaign: 'csv_import_reengagement_jun_2026' },
        }).catch(() => {});
      } catch (e) {
        errors.push({ email: u.email, error: e.message });
      }
      await new Promise(r => setTimeout(r, 400));
    }

    return Response.json({
      cohort_total: cohort.length,
      eligible_before_run: eligible.length,
      granted,
      emailed,
      remaining: eligible.length - batch.length,
      trial_ends: end.toISOString(),
      errors: errors.slice(0, 5),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});