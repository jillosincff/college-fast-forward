import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// SCHEDULED SWEEP (every 15 min): finds users who signed up in the last 14
// days, completed onboarding, and haven't received a welcome email — sends a
// persona-aware CliFF welcome (student vs parent variant).
// Dedup via user flag cliff_welcome_email_at + EmailLog record.

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
<body style="margin: 0; padding: 0; background: #f8f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #6d28d9; margin: 0;">
        CLIFF · COLLEGE FAST FORWARD
      </p>
    </div>
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(109,40,217,0.08);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">College Fast Forward · support@collegefastforward.com</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0 0 4px;">You're receiving this because you joined College Fast Forward.</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0;"><a href="${unsubscribeUrl}" style="color: #6d28d9; text-decoration: underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

const darkHero = (label, headline, subtext) => `
  <div style="background: #312e81; padding: 36px 36px 32px;">
    <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #8b5cf6; margin: 0 0 12px;">${label}</p>
    <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">${headline}</h1>
    <p style="font-size: 15px; color: rgba(255,255,255,0.65); margin: 0; line-height: 1.6;">${subtext}</p>
  </div>`;

const ctaButton = (label, url = APP_URL) => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${url}" style="display: inline-block; background: #6d28d9; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">${label} →</a>
  </div>`;

const bodyText = (text) => `<p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 16px;">${text}</p>`;

function studentWelcome(firstName, school, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  const schoolStr = school ? escapeHtml(school) : 'your school';
  return {
    subject: 'Welcome to CliFF — your first move takes 5 minutes',
    html: emailWrapper(`
      ${darkHero('👋 WELCOME', `You're in, ${name}.`, 'CliFF is already mapping warm paths into the companies you care about.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Welcome to College Fast Forward. While most students send 100+ applications into a black hole, you now have a different playbook: find a real person at the company first, then apply.`)}
        ${bodyText(`Here's the best way to start today:`)}
        ${bodyText(`<strong>1.</strong> Open your dashboard — CliFF has job matches and ${schoolStr} alumni signals waiting.<br>
        <strong>2.</strong> Pick one company you actually care about.<br>
        <strong>3.</strong> Hit "Generate Message" — CliFF drafts the outreach for you.`)}
        ${ctaButton('Open My Dashboard')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Students who send one outreach message in their first week hear back at a dramatically higher rate. One message. That's the whole assignment.</p>
      </div>`, unsubscribeUrl),
  };
}

function parentWelcome(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Welcome to the CFF parent network — thank you',
    html: emailWrapper(`
      ${darkHero('🤝 WELCOME', `Thank you for joining, ${name}.`, 'You just became a warm path for a student trying to break in.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Welcome to the College Fast Forward parent network. By joining, you've made your professional experience visible to students who need exactly what you have: a real person on the inside.`)}
        ${bodyText(`Here's what happens next:`)}
        ${bodyText(`<strong>•</strong> Students at your school can discover you when researching your company or industry.<br>
        <strong>•</strong> If one reaches out, a short reply — even two sentences — can change their search.<br>
        <strong>•</strong> Your own student gets stronger network signals because you're here.`)}
        ${ctaButton('See Your Network')}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Most parents tell us the first student conversation takes 10 minutes and feels great. There's no commitment beyond what you choose to give.</p>
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

    // Allow scheduled automation (no user) OR admin manual call
    const caller = await base44.auth.me().catch(() => null);
    if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const dryRun = payload.dry_run === true;

    // SWEEP MODE: scan recent users needing a welcome email.
    // Single-user mode still supported via payload.data (for testing).
    let candidates;
    if (payload.data?.email) {
      candidates = [payload.data];
    } else {
      // 14-day signup window: covers users who finish onboarding a few days
      // after signing up, while never "welcoming" long-time users.
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const recentUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
      candidates = (recentUsers || []).filter(u =>
        u.email &&
        u.onboarding_completed === true &&
        !u.cliff_welcome_email_at &&
        u.created_date >= fourteenDaysAgo
      );
    }

    // Prior welcome logs (covers legacy sends before the flag existed)
    const priorLogs = await base44.asServiceRole.entities.EmailLog.filter({ email_type: 'welcome' }, '-sent_at', 5000).catch(() => []);
    const alreadyWelcomed = new Set((priorLogs || []).map(e => e.user_email?.toLowerCase()).filter(Boolean));

    const sent = [];
    const errors = [];

    for (const userRecord of candidates.slice(0, 25)) {
      if (userRecord.onboarding_completed !== true) continue;
      if (userRecord.cliff_welcome_email_at) continue;
      if (alreadyWelcomed.has(userRecord.email.toLowerCase())) continue;

      // Respect opt-outs
      const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_id: userRecord.id }).catch(() => []);
      if (prefs?.[0]?.all_emails === false) continue;

      const firstName = (userRecord.full_name || '').split(' ')[0] || 'there';
      const isParent = userRecord.persona === 'parent' || (Array.isArray(userRecord.roles) && userRecord.roles.includes('parent'));
      const school = userRecord.school_name || userRecord.school || '';
      const unsubscribeUrl = unsubUrl(userRecord.id, userRecord.email);

      const { subject, html } = isParent
        ? parentWelcome(firstName, unsubscribeUrl)
        : studentWelcome(firstName, school, unsubscribeUrl);

      try {
        if (!dryRun) {
          await sendViaSendGrid(userRecord.email, subject, html);
          await base44.asServiceRole.entities.User.update(userRecord.id, { cliff_welcome_email_at: new Date().toISOString() });
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: userRecord.id,
            user_email: userRecord.email,
            persona: isParent ? 'parent' : 'student',
            email_type: 'welcome',
            subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }).catch(() => {});
        }
        sent.push({ email: userRecord.email, variant: isParent ? 'parent' : 'student', subject });
      } catch (e) {
        errors.push({ email: userRecord.email, error: e.message });
      }
    }

    return Response.json({ success: true, dry_run: dryRun, candidates: candidates.length, sent_count: sent.length, sent, errors });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});