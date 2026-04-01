import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

function html({ firstName, outreachSent, outreachReplied, alumniFound, pendingFollowUps, topAction, topActionUrl }) {
  const hasActivity = outreachSent > 0 || alumniFound > 0;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
      <tr><td style="background:#0A0A0A;padding:32px 40px">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20">YOUR WEEKLY BRIEF</p>
        <h1 style="margin:10px 0 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2">Hey ${firstName}, here's your week.</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        ${hasActivity ? `
        <p style="margin:0 0 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#AAAAAA">THIS WEEK'S ACTIVITY</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          <tr>
            <td style="text-align:center;padding:16px;background:#F9F9F9;border-radius:10px;width:33%">
              <p style="margin:0;font-size:28px;font-weight:800;color:#1A1A1A">${alumniFound}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888">alumni found</p>
            </td>
            <td width="12"></td>
            <td style="text-align:center;padding:16px;background:#F9F9F9;border-radius:10px;width:33%">
              <p style="margin:0;font-size:28px;font-weight:800;color:#1A1A1A">${outreachSent}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888">messages sent</p>
            </td>
            <td width="12"></td>
            <td style="text-align:center;padding:16px;background:#F9F9F9;border-radius:10px;width:33%">
              <p style="margin:0;font-size:28px;font-weight:800;color:#E85D20">${outreachReplied}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888">replies received</p>
            </td>
          </tr>
        </table>` : `
        <div style="background:#FFF5F0;border-radius:12px;padding:20px 24px;margin-bottom:28px">
          <p style="margin:0;font-size:14px;color:#E85D20;font-weight:600">No activity this week yet.</p>
          <p style="margin:6px 0 0;font-size:13px;color:#888;line-height:1.6">Students who send 3+ messages a week are 4x more likely to land interviews. Let's change that today.</p>
        </div>`}
        ${pendingFollowUps > 0 ? `
        <div style="background:#FFFBEA;border:1px solid #FDE68A;border-radius:12px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-size:14px;font-weight:700;color:#92400E">⏰ ${pendingFollowUps} follow-up${pendingFollowUps > 1 ? 's' : ''} due</p>
          <p style="margin:6px 0 0;font-size:13px;color:#92400E;line-height:1.5">You have outreach from 5+ days ago with no reply. A single follow-up message doubles your response rate.</p>
        </div>` : ''}
        ${topAction ? `
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#AAAAAA">YOUR NEXT MOVE</p>
        <p style="margin:0 0 20px;font-size:15px;color:#1A1A1A;line-height:1.6">${topAction}</p>` : ''}
        <div style="text-align:center;margin:28px 0">
          <a href="${topActionUrl || APP_URL + '/#FreeTierDashboard'}" style="display:inline-block;background:#E85D20;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 32px;border-radius:100px">Open My Dashboard →</a>
        </div>
      </td></tr>
      <tr><td style="background:#F9F9F9;padding:20px 40px;text-align:center;border-top:1px solid #E5E5E5">
        <p style="margin:0;font-size:11px;color:#BBBBBB">© ${new Date().getFullYear()} College Fast Forward · <a href="${APP_URL}/#Privacy" style="color:#BBBBBB">Privacy</a> · <a href="${APP_URL}/#UnsubscribeReengagement" style="color:#BBBBBB">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { to, firstName, outreachSent = 0, outreachReplied = 0, alumniFound = 0, pendingFollowUps = 0, topAction, topActionUrl } = body;
  if (!to) return Response.json({ error: 'Missing to' }, { status: 400 });

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: FROM, name: FROM_NAME },
      personalizations: [{ to: [{ email: to }] }],
      subject: `Your weekly brief, ${firstName || to.split('@')[0]} ⚡`,
      content: [{ type: 'text/html', value: html({ firstName: firstName || to.split('@')[0], outreachSent, outreachReplied, alumniFound, pendingFollowUps, topAction, topActionUrl }) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }
  return Response.json({ success: true });
});