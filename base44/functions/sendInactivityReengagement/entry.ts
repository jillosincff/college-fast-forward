import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// SCHEDULED: Daily. Re-engages users who haven't been active in 4–30 days.
// Rules:
//   - Only users who completed onboarding
//   - Inactive 4+ days (last_active_at, falling back to updated_date)
//   - Skip if inactive >30 days (don't blast ancient dormant accounts)
//   - Max 1 re-engagement email per user per 14 days (cliff_reengagement_email_at)
//   - Skip unsubscribed (all_emails or reengagement_emails false, reengagement_unsubscribed)
//   - Skip if ANY email was sent to them in the last 3 days (EmailLog)
//   - Batch cap: 50 sends per run

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

function studentReengagement(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Your job feed kept moving while you were away',
    html: emailWrapper(`
      ${darkHero('👋 CHECKING IN', `Still here, ${name}.`, 'New roles and alumni signals have landed since your last visit.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`It's been a few days since you last logged in — no judgment, the job search is exhausting. But fresh roles have hit your feed since then, and early outreach is what gets responses.`)}
        ${bodyText(`Here's a 5-minute re-entry: open your dashboard, pick one job that interests you, and let CliFF draft the outreach message. That's it.`)}
        ${ctaButton('Pick Up Where I Left Off')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Consistency beats intensity in a job search. One small action today keeps your momentum alive.</p>
      </div>`, unsubscribeUrl),
  };
}

function parentReengagement(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Students at your school are searching — you can help',
    html: emailWrapper(`
      ${darkHero('🤝 CHECKING IN', `We miss you, ${name}.`, 'Students have been actively networking since your last visit.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`It's been a few days since you visited College Fast Forward. Students at your school are actively researching companies and looking for warm connections — and your profile is one of the paths they can find.`)}
        ${bodyText(`Two minutes on your dashboard keeps your profile fresh and visible. If a student has reached out, even a short reply makes a real difference.`)}
        ${ctaButton('Check My Network')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Thank you for being part of this. Every active parent makes the network stronger for every student.</p>
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
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automation (no user) OR admin manual call
    const caller = await base44.auth.me().catch(() => null);
    if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dry_run = false, batch_limit = 50 } = await req.json().catch(() => ({}));

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const fourDaysAgo = new Date(now - 4 * DAY).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * DAY).toISOString();
    const fourteenDaysAgo = new Date(now - 14 * DAY).toISOString();
    const threeDaysAgo = new Date(now - 3 * DAY).toISOString();

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Recent email sends across all sources — global frequency guard
    const recentLogs = await base44.asServiceRole.entities.EmailLog.list('-sent_at', 2000).catch(() => []);
    const recentlyEmailed = new Set(
      (recentLogs || [])
        .filter(e => e.sent_at >= threeDaysAgo && e.status === 'sent')
        .map(e => e.user_email?.toLowerCase())
        .filter(Boolean)
    );

    // Email preference opt-outs — match by BOTH user_id and email,
    // since older EmailPreference records may lack user_email
    const allPrefs = await base44.asServiceRole.entities.EmailPreference.list(undefined, 5000).catch(() => []);
    const optedOut = new Set();
    for (const p of (allPrefs || [])) {
      if (p.all_emails === false || p.reengagement_emails === false) {
        if (p.user_email) optedOut.add(p.user_email.toLowerCase());
        if (p.user_id) optedOut.add(p.user_id);
      }
    }

    const sent = [];
    const errors = [];
    let scanned = 0;

    for (const u of allUsers) {
      if (sent.length >= batch_limit) break;
      if (!u.email) continue;
      if (u.onboarding_completed !== true) continue;
      if (!u.persona) continue;
      scanned++;

      const emailLower = u.email.toLowerCase();

      // Activity window: inactive 4–30 days
      const lastActive = u.last_active_at || u.updated_date || u.created_date;
      if (!lastActive) continue;
      if (lastActive >= fourDaysAgo) continue;       // still active
      if (lastActive < thirtyDaysAgo) continue;       // too dormant — separate campaign territory

      // Don't email brand-new users (welcome covers them)
      if (u.created_date >= fourDaysAgo) continue;

      // Max 1 re-engagement per 14 days
      if (u.cliff_reengagement_email_at && u.cliff_reengagement_email_at >= fourteenDaysAgo) continue;

      // Opt-outs + recent email guard
      if (u.reengagement_unsubscribed) continue;
      if (optedOut.has(emailLower) || optedOut.has(u.id)) continue;
      if (recentlyEmailed.has(emailLower)) continue;

      const firstName = (u.full_name || '').split(' ')[0] || 'there';
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const unsubscribeUrl = unsubUrl(u.id, u.email);

      const { subject, html } = isParent
        ? parentReengagement(firstName, unsubscribeUrl)
        : studentReengagement(firstName, unsubscribeUrl);

      try {
        if (!dry_run) {
          await sendViaSendGrid(u.email, subject, html);
          await base44.asServiceRole.entities.User.update(u.id, { cliff_reengagement_email_at: new Date().toISOString() });
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: u.id,
            user_email: u.email,
            persona: isParent ? 'parent' : 'student',
            email_type: 'reengagement_7d',
            subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }).catch(() => {});
        }
        sent.push({ email: u.email, variant: isParent ? 'parent' : 'student' });
      } catch (e) {
        errors.push({ email: u.email, error: e.message });
      }
    }

    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'sendInactivityReengagement',
      run_at: new Date().toISOString(),
      users_scanned: scanned,
      actions_taken: sent.length,
      errors,
      duration_ms: Date.now() - startTime,
      details: { dry_run, sent },
    }).catch(() => {});

    return Response.json({ success: true, dry_run, scanned, sent_count: sent.length, sent, errors });
  } catch (error) {
    console.error('sendInactivityReengagement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});