import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// AUTOMATION: Daily at 7:00 AM ET (11:00 UTC) — runs AFTER checkTrialExpiry (6 AM ET).
// Sends on-brand CliFF trial emails:
//   1. "Ends tomorrow" — trial_status active, <=1 day left
//   2. "Just ended" — trial_status expired within the last 2 days
// Skips Stripe-managed subscribers. Dedup via cliff_trial_ending_email_at / cliff_trial_ended_email_at
// compared against the user's current trial_end_date (so a new trial re-arms both emails).

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const APP_URL = 'https://collegefastforward.com/#/FreeTierDashboard';

const emailWrapper = (content) => `
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
      <p style="font-size: 11px; color: #CCCCCC; margin: 0;">You're receiving this because you joined College Fast Forward.</p>
    </div>
  </div>
</body>
</html>`;

const darkHero = (label, headline, subtext) => `
  <div style="background: #0A0A0A; padding: 36px 36px 32px;">
    <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">${label}</p>
    <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">${headline}</h1>
    <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">${subtext}</p>
  </div>`;

const ctaButton = (label) => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${APP_URL}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">${label} →</a>
  </div>`;

const bodyText = (text) => `<p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">${text}</p>`;

function endingTomorrowEmail(firstName) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Your CliFF Premium ends tomorrow',
    html: emailWrapper(`
      ${darkHero('⏳ 1 DAY LEFT', 'Your Premium access ends tomorrow.', 'Make today count — everything is still open right now.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Quick heads up — your free Premium access ends tomorrow. Until then, everything is still open: unlimited alumni searches, resume tailoring, outreach drafts, and mock interviews.`)}
        ${bodyText(`If you want to keep going after tomorrow, Premium is <strong>$4.99/week</strong> (billed monthly at $19.96). No contracts, cancel anytime.`)}
        ${ctaButton('Keep Premium — $4.99/week')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. The best use of your last free day? Run an alumni search at your top target company and send one outreach message. That's how interviews start.</p>
      </div>`),
  };
}

function endedEmail(firstName) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Your Premium access just ended — here\'s what you keep',
    html: emailWrapper(`
      ${darkHero('CLIFF PREMIUM', 'Your free Premium days are up.', 'You\'re back on the free plan — but your work is saved.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Your free Premium access just ended, so you're back on the free plan. Everything you built — your pipeline, drafts, and saved alumni — is still there waiting for you.`)}
        ${bodyText(`Want full access back? Premium is <strong>$4.99/week</strong> (billed monthly at $19.96): unlimited alumni searches, resume tailoring, AI outreach drafts, and mock interview practice. Cancel anytime.`)}
        ${ctaButton('Get Premium — $4.99/week')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Students who reach out to just 3 alumni per week hear back from at least one. Premium makes those 3 messages take 10 minutes instead of an hour.</p>
      </div>`),
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
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  // Allow scheduled automation (no user) OR admin manual call
  const caller = await base44.auth.me().catch(() => null);
  if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { dry_run = false } = await req.json().catch(() => ({}));

  const now = new Date();
  const sent = [];
  const errors = [];

  // ── 1. "Ends tomorrow" — active trials with <= 1 day left ─────────────
  const activeTrials = await base44.asServiceRole.entities.User.filter({
    trial_status: 'active',
    trial_end_date: { $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
  });

  for (const u of activeTrials) {
    if (u.stripe_subscription_id) continue; // Stripe sends its own billing emails
    if (new Date(u.trial_end_date) <= now) continue; // already past — handled by ended email
    // Dedup: skip if we already sent the ending email for THIS trial period
    if (u.cliff_trial_ending_email_at && new Date(u.cliff_trial_ending_email_at) > new Date(new Date(u.trial_end_date).getTime() - 4 * 24 * 60 * 60 * 1000)) continue;

    const firstName = (u.full_name || '').split(' ')[0] || 'there';
    try {
      if (!dry_run) {
        const { subject, html } = endingTomorrowEmail(firstName);
        await sendViaSendGrid(u.email, subject, html);
        await base44.asServiceRole.entities.User.update(u.id, { cliff_trial_ending_email_at: now.toISOString() });
      }
      sent.push({ email: u.email, type: 'ending_tomorrow' });
    } catch (e) {
      errors.push({ email: u.email, type: 'ending_tomorrow', error: e.message });
    }
  }

  // ── 2. "Just ended" — trials expired within the last 2 days ───────────
  const expiredTrials = await base44.asServiceRole.entities.User.filter({
    trial_status: 'expired',
    trial_end_date: {
      $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      $lt: now.toISOString(),
    },
  });

  for (const u of expiredTrials) {
    if (u.stripe_subscription_id) continue;
    if (u.subscription_status === 'active') continue; // converted to paid
    // Dedup: skip if ended email already sent after this trial's end date
    if (u.cliff_trial_ended_email_at && new Date(u.cliff_trial_ended_email_at) >= new Date(u.trial_end_date)) continue;

    const firstName = (u.full_name || '').split(' ')[0] || 'there';
    try {
      if (!dry_run) {
        const { subject, html } = endedEmail(firstName);
        await sendViaSendGrid(u.email, subject, html);
        await base44.asServiceRole.entities.User.update(u.id, { cliff_trial_ended_email_at: now.toISOString() });
      }
      sent.push({ email: u.email, type: 'ended' });
    } catch (e) {
      errors.push({ email: u.email, type: 'ended', error: e.message });
    }
  }

  // SchedulerRun summary
  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'cliffTrialEmailScheduler',
      run_at: now.toISOString(),
      users_scanned: activeTrials.length + expiredTrials.length,
      actions_taken: sent.length,
      errors,
      duration_ms: Date.now() - startTime,
      details: { dry_run, sent },
    });
  } catch {}

  return Response.json({ success: true, dry_run, sent, errors });
});