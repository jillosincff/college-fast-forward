import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

function html({ firstName, recipientName, recipientTitle, daysSinceSent, draftId }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
      <tr><td style="background:#0A0A0A;padding:28px 40px">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20">FOLLOW-UP REMINDER</p>
        <h1 style="margin:10px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3">${firstName}, it's time to follow up.</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7">It's been <strong>${daysSinceSent} days</strong> since you messaged <strong>${recipientName}</strong>${recipientTitle ? ` (${recipientTitle})` : ''} — and you haven't heard back.</p>
        <div style="background:#F9F9F9;border-left:3px solid #E85D20;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#555;line-height:1.6"><strong>Don't give up yet.</strong> Most people are busy, not disinterested. A short, polite follow-up message gets a response 40% of the time.</p>
        </div>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.08em">TRY THIS MESSAGE:</p>
        <div style="background:#FAFAFA;border:1px solid #E0E0E0;border-radius:10px;padding:20px;margin-bottom:28px">
          <p style="margin:0;font-size:14px;color:#333;line-height:1.7;font-style:italic">"Hi ${recipientName?.split(' ')[0] || 'there'}, just wanted to follow up on my message from last week. I know you're busy — even a 15-minute chat would mean a lot. Happy to work around your schedule."</p>
        </div>
        <div style="text-align:center;margin:8px 0 28px">
          <a href="${APP_URL}/#OutreachDrafts${draftId ? '?id=' + draftId : ''}" style="display:inline-block;background:#E85D20;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 32px;border-radius:100px">Send Follow-Up →</a>
        </div>
        <p style="margin:0;font-size:12px;color:#BBBBBB;line-height:1.6;text-align:center">You can edit and send this directly from your Outreach Drafts.</p>
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
  const { to, firstName, recipientName, recipientTitle, daysSinceSent = 5, draftId } = await req.json();
  if (!to || !recipientName) return Response.json({ error: 'Missing required fields' }, { status: 400 });

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: FROM, name: FROM_NAME },
      personalizations: [{ to: [{ email: to }] }],
      subject: `Did ${recipientName?.split(' ')[0] || 'they'} get your message? Time to follow up.`,
      content: [{ type: 'text/html', value: html({ firstName: firstName || to.split('@')[0], recipientName, recipientTitle, daysSinceSent, draftId }) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }
  return Response.json({ success: true });
});