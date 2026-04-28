import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

Deno.serve(async (req) => {
  const {
    studentEmail,
    studentFirstName,
    parentFirstName,
    trialDays = 5,
  } = await req.json();

  const subject = `Your parent just did something really cool for you 🎉`;

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

    <div style="background:#0A0A0A;padding:36px 36px 32px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 12px;">
        ⚡ FASTIQ ACTIVATED
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${escapeHtml(parentFirstName)} just did something really cool for you.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Your job search just got a serious upgrade.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 8px;">Hey ${escapeHtml(studentFirstName)},</p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 8px;">
        ${escapeHtml(parentFirstName)} just activated FastIQ on your College Fast Forward account.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
        <strong>Translation?</strong> Your job search just got a serious upgrade.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
        FastIQ is your AI-powered career engine — think of it as having a 24/7 career coach in your pocket that knows exactly what you're looking for and helps you get there.
      </p>

      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:0 0 16px;">HERE'S WHAT JUST UNLOCKED FOR YOU:</p>

      <div style="border-left:3px solid #E85D20;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:14px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">🔍 Find the right people</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">Search alumni from your school at any company — not just the ones posted publicly.</p>
      </div>

      <div style="border-left:3px solid #E85D20;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:14px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">✉️ Send messages that get replies</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">AI drafts your outreach so it sounds like you — warm, specific, and real.</p>
      </div>

      <div style="border-left:3px solid #E85D20;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:14px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">📄 Make your resume work harder</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">FastIQ scores it against your actual target roles and tells you exactly what to fix.</p>
      </div>

      <div style="border-left:3px solid #E85D20;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:14px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">🎤 Practice until you're ready</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">Full mock interviews using the STAR method — with real feedback after every answer.</p>
      </div>

      <div style="border-left:3px solid #E85D20;padding-left:16px;margin-bottom:28px;">
        <p style="font-size:14px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">🧠 Figure out what you actually want</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">Take our Career Archetype Assessment and discover exactly how you're wired to work.</p>
      </div>

      <div style="background:#0A0A0A;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="font-size:15px;color:rgba(255,255,255,0.82);line-height:1.7;margin:0 0 8px;">
          ${escapeHtml(parentFirstName)} believed in you enough to invest in your success.
        </p>
        <p style="font-size:16px;font-weight:700;color:#fff;margin:0;">Now it's your turn.</p>
      </div>

      <div style="text-align:center;margin:0 0 16px;">
        <a href="https://collegefastforward.com"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:10px;">
          Go to My Dashboard →
        </a>
      </div>

      <p style="font-size:13px;color:#AAAAAA;text-align:center;margin:0;">
        You have <strong>${trialDays} days</strong> of full FastIQ access. Let's make them count.
      </p>

      <div style="height:1px;background:#F0F0F0;margin:24px 0;"></div>
      <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
        Questions? Just reply to this email — we're real people and we read every message.
      </p>
    </div>
  </div>

  <div style="text-align:center;margin-top:32px;">
    <p style="font-size:13px;color:#888;margin:0 0 4px;">Jill Osinoff · Founder, College Fast Forward</p>
    <p style="font-size:11px;color:#CCCCCC;margin:0;">support@collegefastforward.com</p>
  </div>

</div>
</body>
</html>`;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: studentEmail }] }],
      from: { email: 'support@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('SendGrid error:', err);
    return Response.json({ success: false, error: err }, { status: 500 });
  }

  return Response.json({ success: true });
});