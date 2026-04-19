import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Email A: Trial Ending (Transactional, per-user)
// Triggered on day 7 of user's personal trial — references their trial_end_date dynamically.
// Does NOT mention the April 30 promo deadline — that's Email B (sendFoundingRateBlast).

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { userEmail, firstName, school, persona, trialEndDate, upgradeUrl } = await req.json();

  if (!userEmail) return Response.json({ error: 'userEmail required' }, { status: 400 });

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

  // Exclusion check — skip already-upgraded users
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail.toLowerCase() });
    const u = users?.[0];
    if (u) {
      const upgraded =
        u.subscription_status === 'active' ||
        u.membership_tier === 'fastiq' ||
        u.membership_tier === 'founding_gator' ||
        u.fastiq_setup_complete === true;
      if (upgraded) {
        console.log('[sendTrialDay7Email] Skipping — user already upgraded:', userEmail);
        return Response.json({ success: true, skipped: true, reason: 'already_upgraded' });
      }
    }
  } catch (e) {
    console.warn('[sendTrialDay7Email] Could not check user status:', e.message);
  }

  const isParent = persona === 'parent';
  const name = firstName || 'there';
  const displaySchool = school || 'your school';
  const trialEndDisplay = trialEndDate || 'today';
  const ctaUrl = upgradeUrl || 'https://collegefastforward.com/#FastIQDashboard';

  const subject = isParent
    ? `${name}, your student's FastIQ trial ends today`
    : `${name}, your FastIQ trial ends today`;

  const html = `
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
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 12px;">
        ⏰ YOUR TRIAL ENDS TODAY
      </p>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${name}, your FastIQ trial ends on ${trialEndDisplay}.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Keep the tools that move your career forward.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Hi ${name},
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        ${isParent
          ? `Students at ${displaySchool} are using these AI tools to craft outreach that gets replies, tailor applications that stand out, and get organized with a personalized career dashboard.`
          : `Students at ${displaySchool} are using FastIQ to craft outreach that gets replies in 48 hours, tailor resumes that stand out, and land conversations they never could have found alone.`}
      </p>

      <div style="background:#FFF5F0;border-left:3px solid #E85D20;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:14px;color:#555;font-style:italic;line-height:1.7;margin:0 0 8px;">
          "I found an internship in legal marketing that was never posted. I got it through a parent in College Fast Forward."
        </p>
        <p style="font-size:12px;color:#E85D20;font-weight:700;margin:0;">
          — UF Student, CFF Member
        </p>
      </div>

      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
        If you want to keep that edge — now's the time. Lock in the <strong>Founding Rate of $14.50/month forever</strong> (50% off regular pricing). This special rate won't last.
      </p>

      <div style="background:#0A0A0A;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#E85D20;margin:0 0 8px;">
          🎖 FOUNDING RATE
        </p>
        <p style="font-size:28px;font-weight:700;color:#fff;margin:0 0 4px;">
          $14.50<span style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:400;">/month forever</span>
        </p>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;">
          50% off the regular $29/month · Locked in permanently
        </p>
      </div>

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="${ctaUrl}"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          ${isParent ? 'Yes, Lock in $14.50/mo for My Student →' : 'Yes, Lock in $14.50/mo →'}
        </a>
      </div>

      <div style="height:1px;background:#F0F0F0;margin:20px 0;"></div>

      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        ${isParent ? 'Your free profile' : 'Your free CFF network'} stays with you no matter what. Cancel anytime. Questions? Just reply.
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

  const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: userEmail }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  const responseBody = await sgRes.text();
  console.log('[sendTrialDay7Email] Status:', sgRes.status, 'Body:', responseBody);

  if (!sgRes.ok) return Response.json({ error: responseBody, status: sgRes.status }, { status: 500 });

  return Response.json({ success: true, sgStatus: sgRes.status });
});