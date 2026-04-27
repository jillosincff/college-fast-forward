import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Email B: Founding Rate Deadline Blast (Promotional, time-based)
// Scheduled sends: April 20, April 27, April 30, 2026
// Audience: trial users + free users who have NOT yet upgraded
// Deadline is fixed: April 30, 2026 — does NOT reference individual trial end dates

const FOUNDING_RATE_DEADLINE = new Date('2026-04-30T23:59:59-04:00');

const MONTHLY_URL = 'https://collegefastforward.com/#FastIQDashboard?plan=monthly';
const ANNUAL_URL = 'https://collegefastforward.com/#FastIQDashboard?plan=annual';

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
  const displaySchool = school || 'your school';
  const urgencyLabel = days === 0 ? 'Today is the last day' : days === 1 ? '1 day left' : `${days} days left`;
  const urgencyColor = days <= 1 ? '#D32737' : days <= 7 ? '#E85D20' : '#E85D20';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0;">
      COLLEGE FAST FORWARD
    </p>
  </div>

  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <div style="background:#0A0A0A;padding:32px 36px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${urgencyColor};margin:0 0 12px;">
        🎖 FOUNDING RATE — ${urgencyLabel.toUpperCase()}
      </p>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        Hi ${name}, ${urgencyLabel} to lock in the Founding Rate.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Lock in $14.50/month before it's gone forever.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Hi ${name},
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        The Founding Rate for FastIQ expires <strong>April 30, 2026</strong> — permanently. After that, it's $29/month for everyone.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
        ${isParent
          ? `Students at ${displaySchool} are using FastIQ to craft outreach that gets replies, tailor applications, and land conversations they never could have found alone. Lock in their access now.`
          : `Students at ${displaySchool} are using FastIQ to discover alumni, craft outreach that actually gets replies, tailor resumes to specific jobs, and prep for interviews. Lock in your rate today.`}
      </p>

      <div style="background:#FFF5F0;border-left:3px solid #E85D20;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:14px;color:#555;font-style:italic;line-height:1.7;margin:0 0 8px;">
          "I found an internship in legal marketing that was never posted. I got it through a parent in College Fast Forward."
        </p>
        <p style="font-size:12px;color:#E85D20;font-weight:700;margin:0;">
          — UF Student, CFF Member
        </p>
      </div>

      <div style="background:#0A0A0A;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#E85D20;margin:0 0 12px;">
          🎖 FOUNDING RATE — EXPIRES APRIL 30
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:180px;">
            <p style="font-size:22px;font-weight:700;color:#fff;margin:0 0 2px;">
              $14.50<span style="font-size:13px;color:rgba(255,255,255,0.5);font-weight:400;">/mo</span>
            </p>
            <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0;">Monthly · Cancel anytime</p>
          </div>
          <div style="flex:1;min-width:180px;">
            <p style="font-size:22px;font-weight:700;color:#fff;margin:0 0 2px;">
              $124.50<span style="font-size:13px;color:rgba(255,255,255,0.5);font-weight:400;">/yr</span>
            </p>
            <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0;">Annual · Save 2 months</p>
          </div>
        </div>
        <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:12px 0 0;">
          Both options are 50% off the regular rate · Locked in permanently
        </p>
      </div>

      <div style="text-align:center;margin:0 0 12px;">
        <a href="${MONTHLY_URL}"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin-bottom:8px;">
          ${isParent ? 'Lock in $14.50/mo for My Student →' : 'Lock in $14.50/mo →'}
        </a>
      </div>
      <div style="text-align:center;margin:0 0 20px;">
        <a href="${ANNUAL_URL}"
           style="display:inline-block;background:transparent;border:1px solid #E85D20;color:#E85D20;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:10px;">
          Or save more with Annual ($124.50/yr) →
        </a>
      </div>

      <div style="height:1px;background:#F0F0F0;margin:20px 0;"></div>

      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        ${isParent ? 'Your free profile' : 'Your free CFF network'} stays active no matter what. Cancel anytime. Questions? Just reply.
      </p>
    </div>
  </div>

  <div style="text-align:center;margin-top:32px;">
    <p style="font-size:13px;color:#888;margin:0 0 4px;">
      Jill Osinoff · Founder, College Fast Forward
    </p>
    <p style="font-size:11px;color:#CCCCCC;margin:0;">
      support@collegefastforward.com
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
      ? `Last chance — lock in $14.50/mo for your student before April 30`
      : `Last chance — lock in $14.50/mo before April 30 🎖`;

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
  const eligible = allUsers.filter(u => {
    if (!u.email) return false;
    if (isUpgraded(u)) return false;
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
      ? `Last chance — lock in $14.50/mo for your student before April 30`
      : `Last chance — lock in $14.50/mo before April 30 🎖`;

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