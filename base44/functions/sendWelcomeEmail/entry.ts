import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

function html(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
      <!-- Header -->
      <tr><td style="background:#0A0A0A;padding:32px 40px;text-align:center">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20">COLLEGE FAST FORWARD</p>
        <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2">Welcome, ${firstName}.</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px">
        <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">You just joined a network of UF students, parents, and alumni who are serious about getting ahead. No more applications into the void.</p>
        <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7">Here's what to do first:</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:12px 0;border-bottom:1px solid #F0F0F0">
            <p style="margin:0;font-size:14px;color:#1A1A1A;font-weight:600">① Set your career goals</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888">Tell us what you're targeting — we'll build your plan.</p>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #F0F0F0">
            <p style="margin:0;font-size:14px;color:#1A1A1A;font-weight:600">② Upload your resume</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888">We'll score it and tell you exactly how to improve it.</p>
          </td></tr>
          <tr><td style="padding:12px 0">
            <p style="margin:0;font-size:14px;color:#1A1A1A;font-weight:600">③ Find a UF alumni in your field</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888">Search by role or company — one warm intro changes everything.</p>
          </td></tr>
        </table>
        <div style="margin:32px 0;text-align:center">
          <a href="${APP_URL}/#FreeTierDashboard" style="display:inline-block;background:#E85D20;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:100px">Go to My Dashboard →</a>
        </div>
        <p style="margin:0;font-size:13px;color:#999;line-height:1.6">Questions? Just reply to this email — we actually read them.</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#F9F9F9;padding:24px 40px;text-align:center;border-top:1px solid #E5E5E5">
        <p style="margin:0;font-size:11px;color:#BBBBBB">© ${new Date().getFullYear()} College Fast Forward · <a href="${APP_URL}/#Privacy" style="color:#BBBBBB">Privacy</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { to, firstName } = await req.json();
  if (!to) return Response.json({ error: 'Missing to' }, { status: 400 });

  const name = firstName || to.split('@')[0];

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: FROM, name: FROM_NAME },
      personalizations: [{ to: [{ email: to }] }],
      subject: `Welcome to College Fast Forward, ${name} 🐊`,
      content: [{ type: 'text/html', value: html(name) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }
  return Response.json({ success: true });
});