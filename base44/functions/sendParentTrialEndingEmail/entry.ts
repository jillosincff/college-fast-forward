import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const { parentEmail, parentName, studentName, upgradeUrl = 'https://collegefastforward.com/#ParentHome' } = await req.json();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 32px;">COLLEGE FAST FORWARD</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">Hi ${parentName || 'there'},</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    Just a quick note — <strong>${studentName || 'your student'}</strong>'s FastIQ trial ends tomorrow.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 28px;">
    If it's been useful for their job search, you can lock in the Founding Rate of <strong>$14.50/month</strong> before April 30.
  </p>

  <div style="margin:0 0 32px;">
    <a href="${upgradeUrl}" style="display:inline-block;background:#E85D20;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Keep ${studentName || 'their'} FastIQ Access →</a>
  </div>

  <p style="font-size:14px;color:#1A1A1A;margin:0;">Warmly,<br>Jill</p>

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
      personalizations: [{ to: [{ email: parentEmail }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject: `${studentName || 'Your student'}'s FastIQ trial ends tomorrow`,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  const responseBody = await sgRes.text();
  console.log('[SendGrid ParentTrialEnding] Status:', sgRes.status, 'Body:', responseBody);

  if (!sgRes.ok) {
    return Response.json({ error: responseBody, status: sgRes.status }, { status: 500 });
  }

  return Response.json({ success: true, sgStatus: sgRes.status });
});