import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

function html({ firstName, daysSinceLogin, nextAction, nextActionUrl, pendingFollowUps }) {
  const isLongAbsence = daysSinceLogin >= 14;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
      <tr><td style="background:#0A0A0A;padding:28px 40px">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20">WE MISS YOU</p>
        <h1 style="margin:10px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3">
          ${isLongAbsence ? `${firstName}, it's been ${daysSinceLogin} days.` : `${firstName}, your network is waiting.`}
        </h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7">
          ${isLongAbsence
            ? `Your career goals haven't changed — but your competition hasn't stopped either. Let's pick up where you left off.`
            : `You're making real progress. Don't let momentum slip — your next move is right here.`}
        </p>
        ${pendingFollowUps > 0 ? `
        <div style="background:#FFFBEA;border:1px solid #FDE68A;border-radius:12px;padding:16px 20px;margin-bottom:20px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#92400E">⏰ ${pendingFollowUps} follow-up${pendingFollowUps > 1 ? 's' : ''} overdue</p>
          <p style="margin:6px 0 0;font-size:13px;color:#92400E;line-height:1.5">People you reached out to are still waiting to hear from you.</p>
        </div>` : ''}
        ${nextAction ? `
        <div style="background:#F9F9F9;border-left:3px solid #E85D20;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">YOUR NEXT MOVE</p>
          <p style="margin:0;font-size:15px;color:#1A1A1A;line-height:1.6">${nextAction}</p>
        </div>` : ''}
        <div style="text-align:center;margin:28px 0 8px">
          <a href="${nextActionUrl || APP_URL + '/#FreeTierDashboard'}" style="display:inline-block;background:#E85D20;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:100px">Pick Up Where I Left Off →</a>
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#CCCCCC;text-align:center;line-height:1.6">It only takes 5 minutes a day to stay ahead.</p>
      </td></tr>
      <tr><td style="background:#F9F9F9;padding:20px 40px;text-align:center;border-top:1px solid #E5E5E5">
        <p style="margin:0;font-size:11px;color:#BBBBBB">© ${new Date().getFullYear()} College Fast Forward · <a href="${APP_URL}/#UnsubscribeReengagement" style="color:#BBBBBB">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { to, firstName, daysSinceLogin = 7, nextAction, nextActionUrl, pendingFollowUps = 0 } = await req.json();
  if (!to) return Response.json({ error: 'Missing to' }, { status: 400 });

  const name = firstName || to.split('@')[0];
  const subject = daysSinceLogin >= 14
    ? `${name}, we haven't seen you in ${daysSinceLogin} days`
    : `${name}, your network is still waiting`;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: FROM, name: FROM_NAME },
      personalizations: [{ to: [{ email: to }] }],
      subject,
      content: [{ type: 'text/html', value: html({ firstName: name, daysSinceLogin, nextAction, nextActionUrl, pendingFollowUps }) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }
  return Response.json({ success: true });
});