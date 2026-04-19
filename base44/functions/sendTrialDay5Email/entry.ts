import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {

  const { userEmail, firstName, school, persona, trialEndDate, daysLeft = 2, upgradeUrl = 'https://collegefastforward.com/#FastIQDashboard', parentName, giftedByParent } = await req.json();
  const isParent = persona === 'parent';
  const isGiftedStudent = !isParent && !!giftedByParent;

  const daysLabel = daysLeft === 1 ? '1 day' : `${daysLeft} days`;
  const subject = isParent
    ? `Your student's FastIQ trial ends in ${daysLabel} — don't lose the momentum`
    : `Your FastIQ trial ends in ${daysLabel} — here's what you've unlocked`;

  // Gifted-student variant — plain, personal copy from Jill
  if (isGiftedStudent) {
    const giftedHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 32px;">COLLEGE FAST FORWARD</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">Hi ${firstName},</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    ${parentName || 'Your parent'} gave you 7 days of FastIQ —<br>
    and your trial ends in <strong>${daysLabel}</strong>.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    You've had full access to unlimited alumni searches, AI outreach drafts, resume tailoring, company intel, and mock interviews.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 24px;">
    If it's helping you move faster, now's the time to continue.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 28px;">
    Lock in the Founding Rate of just <strong>$14.50/month</strong> before April 30 — regular price is $29.
  </p>

  <div style="margin:0 0 32px;">
    <a href="${upgradeUrl}" style="display:inline-block;background:#E85D20;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Continue at $14.50/mo →</a>
  </div>

  <p style="font-size:14px;color:#888;line-height:1.65;margin:0 0 8px;">
    Your free UF network stays active no matter what.
  </p>

  <p style="font-size:14px;color:#1A1A1A;margin:0;">Warmly,<br>Jill Osinoff</p>

</div>
</body>
</html>`;

    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: userEmail }] }],
        from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
        subject: `Your FastIQ trial ends in ${daysLabel}`,
        content: [{ type: 'text/html', value: giftedHtml }],
      }),
    });
    const responseBody = await sgRes.text();
    console.log('[SendGrid Day5 Gifted] Status:', sgRes.status, 'Body:', responseBody);
    if (!sgRes.ok) return Response.json({ error: responseBody, status: sgRes.status }, { status: 500 });
    return Response.json({ success: true, sgStatus: sgRes.status });
  }

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
        ⚡ FASTIQ TRIAL — ${daysLabel.toUpperCase()} LEFT
      </p>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${isParent ? `${firstName}, your student's trial ends soon.` : `${firstName}, you're making progress — don't lose the momentum.`}
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        ${isParent
          ? `Keep the AI tools working for your student before the trial ends.`
          : `Keep turning warm intros into real conversations.`}
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Hi ${firstName},
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        ${isParent
          ? `Hope the past few days have given your student a real head start. With FastIQ they've had access to:`
          : `Hope the past few days in the College Fast Forward network have felt different — real parents and alumni ready to help. With FastIQ you've had access to:`}
      </p>

      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🔍 Unlimited alumni and parent searches</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">✉️ AI outreach messages that actually get replies</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">📄 Resume tailoring to specific job descriptions</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🎤 Mock interview practice with real STAR feedback</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">🧠 Career archetype — helps find the right path</p>
      </div>

      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
        ${isParent
          ? `Your student's trial ends on <strong>${trialEndDate}</strong>. Lock in the Founding Rate of <strong>$14.50/month forever</strong> before April 30 — 50% off the regular price, locked in permanently.`
          : `Your trial ends on <strong>${trialEndDate}</strong>. Lock in the Founding Rate of <strong>$14.50/month forever</strong> before April 30 — 50% off the regular price, locked in permanently.`}
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${upgradeUrl}"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          ${isParent ? 'Continue at Founding Rate for My Student →' : 'Continue at Founding Rate →'}
        </a>
      </div>

      <div style="height:1px;background:#F0F0F0;margin:20px 0;"></div>

      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        No pressure — ${isParent ? 'your free profile' : 'your free network'} stays active forever. You can cancel anytime. Questions? Just reply to this email.
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
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
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
  console.log('[SendGrid Day5] Status:', sgRes.status, 'Body:', responseBody);

  if (!sgRes.ok) {
    return Response.json({ error: responseBody, status: sgRes.status }, { status: 500 });
  }

  return Response.json({ success: true, sgStatus: sgRes.status });
});