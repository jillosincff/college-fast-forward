import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Email B: Founding Rate Deadline Blast (Promotional, time-based)
// Scheduled sends: April 20, April 27, April 30, 2026
// Audience: trial users + free users who have NOT yet upgraded
// Deadline is fixed: April 30, 2026 — does NOT reference individual trial end dates
// SNAPSHOT LOCK: 2026-04-28 22:57:26 UTC — only users created before this time are eligible

const FOUNDING_RATE_DEADLINE = new Date('2026-04-30T23:59:59-04:00');
const SNAPSHOT_TIMESTAMP = new Date('2026-04-28T22:57:26Z');

const FASTIQ_UPGRADE_URL = 'https://collegefastforward.com/#FastIQDashboard';
const MONTHLY_URL = `${FASTIQ_UPGRADE_URL}?plan=monthly`;
const ANNUAL_URL = `${FASTIQ_UPGRADE_URL}?plan=annual`;

function isUpgraded(user) {
  return (
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.membership_tier === 'founding_gator' ||
    user.fastiq_setup_complete === true
  );
}

function daysRemaining() {
  const now = new Date();
  const diff = FOUNDING_RATE_DEADLINE - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function buildHtml(firstName, school, persona, days) {
  const isParent = persona === 'parent';
  const name = firstName || 'there';

  const studentBody = `Hi ${name},<br/><br/>Quick note from me. The Founding Rate for FastIQ ($14.50/month, locked in forever) expires tomorrow at midnight. After that, it's $29/month for everyone.<br/><br/>If you've been thinking about it, this is the moment. The trial is 5 days now — credit card required, converts automatically unless you cancel.<br/><br/>We're at the start of summer internship season, so these next few weeks matter. If FastIQ is going to help you find alumni, draft outreach, or prep for interviews, you'll know in 5 days.<br/><br/>Lock in the rate before tomorrow: <a href="${FASTIQ_UPGRADE_URL}" style="color:#E85D20; text-decoration:none; font-weight:600;">https://collegefastforward.com/#FastIQDashboard</a><br/><br/>— Jill<br/><br/><strong>P.S.</strong> If you've already tried FastIQ and decided it's not for you, no worries — you'll never hear from me about it again.`;

  const parentBody = `Hi ${name},<br/><br/>Quick note about FastIQ — the AI career tool we built for students on College Fast Forward.<br/><br/>The Founding Rate ($14.50/month, locked in forever) expires tomorrow at midnight. After that, it's $29/month for everyone, no exceptions.<br/><br/>If you've been thinking about getting it for your student, this is the moment. The trial is 5 days, requires a credit card, and auto-converts unless you cancel. That's intentional — we want students who'll actually use it during summer internship recruiting season, not a long free trial that gets ignored.<br/><br/>Lock in the rate before tomorrow: <a href="${FASTIQ_UPGRADE_URL}" style="color:#E85D20; text-decoration:none; font-weight:600;">https://collegefastforward.com/#FastIQDashboard</a><br/><br/>— Jill<br/><br/><strong>P.S.</strong> Any questions, just reply to this email — I read everything that comes in.`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="font-size:15px;color:#333;line-height:1.7;">
      ${isParent ? parentBody : studentBody}
    </div>
  </div>

  <div style="text-align:center;margin-top:32px;">
    <p style="font-size:12px;color:#888;margin:0;">
      Jill Osinoff · Founder, College Fast Forward
    </p>
  </div>

</div>
</body>
</html>`;
}

async function sendEmail(sgKey, toEmail, subject, html) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sgKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return res;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

  const body = await req.json().catch(() => ({}));

  // Single-user mode: called with { userEmail, firstName, school, persona }
  if (body.userEmail) {
    const { userEmail, firstName, school, persona } = body;

    // Exclusion check
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail.toLowerCase() });
      const u = users?.[0];
      if (u && isUpgraded(u)) {
        return Response.json({ success: true, skipped: true, reason: 'already_upgraded' });
      }
    } catch (e) {
      console.warn('[sendFoundingRateBlast] Could not check user status:', e.message);
    }

    const days = daysRemaining();
    const isParent = persona === 'parent';
    const name = firstName || 'there';
    const subject = isParent
      ? `Tomorrow the rate doubles for FastIQ`
      : `Tomorrow the rate doubles`;

    const html = buildHtml(firstName, school, persona, days);
    const res = await sendEmail(SENDGRID_API_KEY, userEmail, subject, html);
    const txt = await res.text();
    if (!res.ok) return Response.json({ error: txt }, { status: 500 });
    return Response.json({ success: true, days_remaining: days });
  }

  // Blast mode: called with {} — finds all eligible users and sends
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const days = daysRemaining();
  if (days < 0) {
    return Response.json({ message: 'Founding Rate deadline has passed — no blast sent.' });
  }

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

  // Eligible: has fastiq_trial_active OR is free user with no subscription — and NOT already upgraded
  // AND created before snapshot timestamp (2026-04-28 22:57:26 UTC) to lock audience
  const eligible = allUsers.filter(u => {
    if (!u.email) return false;
    if (isUpgraded(u)) return false;
    // Snapshot lock: only include users created before snapshot time
    if (new Date(u.created_date) > SNAPSHOT_TIMESTAMP) return false;
    // Has a trial OR is a free member who signed up
    return u.fastiq_trial_active === true || u.trial_status === 'active' || (!u.subscription_status && u.persona);
  });

  let sent = 0;
  let skipped = 0;
  const errors = [];

  for (const u of eligible) {
    const firstName = u.full_name?.split(' ')?.[0] || 'there';
    const school = u.school || u.school_name || '';
    const persona = u.persona || 'student';
    const isParent = persona === 'parent';
    const subject = isParent
      ? `Tomorrow the rate doubles for FastIQ`
      : `Tomorrow the rate doubles`;

    const html = buildHtml(firstName, school, persona, days);
    try {
      const res = await sendEmail(SENDGRID_API_KEY, u.email, subject, html);
      if (res.ok) { sent++; } else { const t = await res.text(); errors.push({ email: u.email, error: t }); }
    } catch (e) {
      errors.push({ email: u.email, error: e.message });
    }
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }

  return Response.json({
    success: true,
    days_remaining: days,
    total_eligible: eligible.length,
    sent,
    skipped,
    error_count: errors.length,
    errors: errors.slice(0, 10),
  });
});