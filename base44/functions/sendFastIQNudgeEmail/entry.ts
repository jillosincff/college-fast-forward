import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

function html({ firstName, resumeScore, alumniFound, trigger }) {
  const triggerMessages = {
    resume_scored: { headline: `Your resume scored ${resumeScore}/100.`, sub: `FastIQ can fix every gap — tailored to each job description — in under 60 seconds.` },
    alumni_searched: { headline: `You found ${alumniFound} alumni. Now let FastIQ draft your messages.`, sub: `FastIQ writes personalized outreach for every contact you find. You just review and send.` },
    idle_7_days: { headline: `${firstName}, your job search is on pause.`, sub: `FastIQ keeps moving even when you don't. It scouts companies, finds alumni, and builds your action plan — every single day.` },
    default: { headline: `${firstName}, you're 3 steps away from a warm intro.`, sub: `FastIQ finds the right alumni, writes your outreach, and tracks every follow-up. Students with FastIQ get 4x more replies.` },
  };
  const msg = triggerMessages[trigger] || triggerMessages.default;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;overflow:hidden;max-width:560px;width:100%;border:1px solid #2A2A2A">
      <tr><td style="padding:36px 40px;text-align:center">
        <p style="margin:0 0 16px;font-size:24px">⚡</p>
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20">FASTIQ</p>
        <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3">${msg.headline}</h1>
        <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.7;max-width:400px;margin-left:auto;margin-right:auto">${msg.sub}</p>
      </td></tr>
      <tr><td style="padding:0 40px 32px">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          ${[
            ['Alumni search', 'Find any UF alum at any company'],
            ['Personalized outreach', 'AI-drafted messages that get replies'],
            ['Resume tailoring', 'Optimized for each job in 60 seconds'],
            ['Follow-up tracking', 'Never let a lead go cold'],
          ].map(([title, desc]) => `
          <tr><td style="padding:10px 0;border-bottom:1px solid #2A2A2A">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8)">
              <span style="color:#22C55E;margin-right:8px">✓</span>
              <strong style="color:#fff">${title}</strong> — <span style="color:rgba(255,255,255,0.5)">${desc}</span>
            </p>
          </td></tr>`).join('')}
        </table>
        <div style="background:#2A2A2A;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center">
          <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#fff">$29<span style="font-size:14px;font-weight:400;color:rgba(255,255,255,0.4)">/month</span></p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4)">Start free for 7 days · Cancel anytime</p>
        </div>
        <div style="text-align:center">
          <a href="${APP_URL}/#FreeTierDashboard?upgrade=true" style="display:inline-block;background:#E85D20;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:15px 40px;border-radius:100px">Start My Free Trial →</a>
        </div>
      </td></tr>
      <tr><td style="background:#111;padding:20px 40px;text-align:center;border-top:1px solid #2A2A2A">
        <p style="margin:0;font-size:11px;color:#444">© ${new Date().getFullYear()} College Fast Forward · <a href="${APP_URL}/#UnsubscribeReengagement" style="color:#444">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { to, firstName, resumeScore, alumniFound, trigger } = await req.json();
  if (!to) return Response.json({ error: 'Missing to' }, { status: 400 });

  const subjects = {
    resume_scored: `Your resume scored ${resumeScore}/100 — here's how to fix it`,
    alumni_searched: `FastIQ can draft your alumni outreach for you`,
    idle_7_days: `${firstName || to.split('@')[0]}, your job search needs you back`,
    default: `The career engine you're not using yet`,
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: FROM, name: FROM_NAME },
      personalizations: [{ to: [{ email: to }] }],
      subject: subjects[trigger] || subjects.default,
      content: [{ type: 'text/html', value: html({ firstName: firstName || to.split('@')[0], resumeScore, alumniFound, trigger }) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: err }, { status: 500 });
  }
  return Response.json({ success: true });
});