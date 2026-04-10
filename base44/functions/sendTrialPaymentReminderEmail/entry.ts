import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { userEmail, firstName, portalUrl } = await req.json();

  if (!userEmail) {
    return Response.json({ error: 'userEmail required' }, { status: 400 });
  }

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
    return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });
  }

  const name = firstName || 'there';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f6f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f6f3;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="background-color:#0d1117;border-radius:16px;padding:40px 40px 32px;border-left:4px solid #E85D20;">
        <p style="font-size:13px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">ACTION REQUIRED</p>
        <h1 style="font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;margin:0 0 16px;">Your FastIQ trial ends tomorrow, ${name}.</h1>
        <p style="font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 24px;">To keep your access at the <strong style="color:#ffffff;">$14.50/month founding rate</strong>, add a payment method before midnight tonight. No charge until your trial ends.</p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background-color:#E85D20;border-radius:10px;">
            <a href="${portalUrl}" style="display:inline-block;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;">Add Payment Method →</a>
          </td></tr>
        </table>
        <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:20px 0 0;line-height:1.6;">If you don't add a card, your access will end when the trial expires. You can always rejoin later at the regular $29/month rate — but the founding rate disappears on April 15th.</p>
      </td></tr>
      <tr><td style="height:24px;"></td></tr>
      <tr><td align="center"><p style="font-size:12px;color:#aaaaaa;margin:0;">College Fast Forward · collegefastforward.com</p></td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: userEmail }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
      subject: `Add a payment method to keep your FastIQ access`,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ success: false, error: err }, { status: 500 });
  }

  return Response.json({ success: true });
});