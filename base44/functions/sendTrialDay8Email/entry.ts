import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { userEmail, firstName, school, persona } = await req.json();
  const isParent = persona === 'parent';

  const subject = isParent
    ? `${firstName}, your student's FastIQ trial has ended — reactivate at $14.50/mo`
    : `${firstName}, your FastIQ trial has ended — want to keep going?`;

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
        TRIAL ENDED
      </p>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${firstName}, your FastIQ trial has ended.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Reactivate instantly and lock in the Founding Rate before April 15.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Hi ${firstName},
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Your FastIQ trial has now ended. We hope it gave ${isParent ? 'your student' : 'you'} a real taste of how AI + the parent and alumni network can accelerate ${isParent ? 'their' : 'your'} job search.
      </p>

      <div style="background:#FFF5F0;border-left:3px solid #E85D20;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:14px;color:#555;font-style:italic;line-height:1.7;margin:0 0 8px;">
          "This site is invaluable. My son connected with a parent in the CPG industry and gave him advice that literally changed the trajectory of his career."
        </p>
        <p style="font-size:12px;color:#E85D20;font-weight:700;margin:0;">
          — Desiree M., CFF Parent · University of Florida
        </p>
      </div>

      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
        Good news: You can reactivate right now and lock in the <strong>Founding Rate of $14.50/month forever</strong> — but only if you do it before <strong>April 15</strong>.
      </p>

      <div style="background:#0A0A0A;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#E85D20;margin:0 0 8px;">
          🎖 REACTIVATE AT FOUNDING RATE
        </p>
        <p style="font-size:28px;font-weight:700;color:#fff;margin:0 0 4px;">
          $14.50<span style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:400;">/month forever</span>
        </p>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;">
          50% off forever · Locked in permanently · Expires April 15
        </p>
      </div>

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="https://collegefastforward.com/#FastIQDashboard"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          ${isParent ? 'Reactivate for My Student at $14.50/mo →' : 'Reactivate at Founding Rate →'}
        </a>
      </div>

      <p style="font-size:13px;color:#888;text-align:center;margin:12px 0 0;">
        If the trial helped even a little — imagine what consistent access could do.
      </p>

      <div style="height:1px;background:#F0F0F0;margin:20px 0;"></div>

      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        ${isParent ? 'Your free profile' : 'Your free College Fast Forward network'} stays active — you can still connect with parents and alumni anytime. Any questions? Hit reply — we answer personally.
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
      from: { email: 'support@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!sgRes.ok) {
    const err = await sgRes.text();
    return Response.json({ error: err }, { status: 500 });
  }

  return Response.json({ success: true });
});