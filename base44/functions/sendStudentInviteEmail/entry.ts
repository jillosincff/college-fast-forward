import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { student_email, student_name, parent_name, student_university } = await req.json();

  if (!student_email) return Response.json({ error: 'Missing student_email' }, { status: 400 });

  const firstName = student_name?.split(' ')[0] || student_name || 'there';
  const parentFirst = parent_name?.split(' ')[0] || parent_name || 'Your parent';
  const uni = student_university ? ` at ${student_university}` : '';

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
        💙 YOUR PARENT IS IN YOUR CORNER
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${parentFirst} just set you up on College Fast Forward.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        They care about your career${uni}. Now it's your turn.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Hey ${firstName},
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        College Fast Forward is a career network built for students like you — connecting you directly with alumni and parents who work at your target companies and want to help you get hired.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
        ${parentFirst} already joined the network. You're next.
      </p>

      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
        <p style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">HERE'S WHAT YOU GET:</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">👥 Direct access to alumni at your dream companies</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">✉️ AI-drafted outreach messages that actually get replies</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">📄 Resume scoring against your target roles</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🎤 Mock interview practice with STAR feedback</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">🔗 LinkedIn profile review and optimization</p>
      </div>

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="https://collegefastforward.com"
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          Join College Fast Forward →
        </a>
      </div>

      <p style="font-size:13px;color:#888;text-align:center;margin:16px 0 0;">
        85% of jobs are filled through connections, not applications. Start building yours today.
      </p>
    </div>
  </div>

  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:12px;color:#AAAAAA;margin:0 0 4px;">
      College Fast Forward · support@collegefastforward.com
    </p>
    <p style="font-size:11px;color:#CCCCCC;margin:0;">
      You're receiving this because ${parentFirst} invited you to join.
    </p>
  </div>
</div>
</body>
</html>`;

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: student_email }] }],
      from: { email: 'support@collegefastforward.com', name: 'College Fast Forward' },
      subject: `${parentFirst} invited you to College Fast Forward 💙`,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  return Response.json({ success: true });
});