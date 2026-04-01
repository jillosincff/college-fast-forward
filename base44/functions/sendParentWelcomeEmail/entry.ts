Deno.serve(async (req) => {
  const { userEmail, firstName, studentName } = await req.json();

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

    <!-- Dark hero -->
    <div style="background:#0A0A0A;padding:36px 36px 32px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 12px;">
        💙 THANK YOU
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${firstName}, you just did something most parents don't.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        You showed up for ${studentName ? `${studentName}'s` : "your kid's"} career before they even started looking.
      </p>
    </div>

    <!-- Body -->
    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        College Fast Forward exists because of parents like you — professionals who built careers, made connections, and want to pay it forward to the next generation.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Your profile is now live in our network. Students can find you, message you, and ask for the kind of advice and introductions that actually change careers.
      </p>

      <!-- What you can do -->
      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">
          HERE'S HOW YOU CAN HELP:
        </p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">👋 Share your industry experience with students who need it</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🔗 Make introductions to people in your network</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">💬 Answer questions about your field or company</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">🎯 Help a student land their first real opportunity</p>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#F0F0F0;margin:24px 0;"></div>

      <!-- FastIQ pitch -->
      <div style="background:#0A0A0A;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#E85D20;margin:0 0 10px;">
          ⚡ WANT TO DO MORE?
        </p>
        <p style="font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;margin:0 0 16px;">
          FastIQ gives you tools to make an even bigger impact — see which students need your specific expertise, get AI-drafted intro messages so connecting takes 60 seconds, and track the students you've helped along the way.
        </p>
        <p style="font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;margin:0 0 16px;">
          And if you have a college student at home — FastIQ gives them everything they need to land their first job: resume scoring, mock interviews, LinkedIn review, alumni search, and outreach that actually gets replies.
        </p>
        <div style="text-align:center;">
          <a href="https://collegefastforward.com/#FastIQDashboard" 
             style="display:inline-block;background:#E85D20;color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;">
            Learn About FastIQ →
          </a>
        </div>
      </div>

      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        One warm intro beats 100 cold applications. You have the power to be that intro for someone.
      </p>

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="https://collegefastforward.com" 
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          Complete My Profile →
        </a>
      </div>

      <p style="font-size:13px;color:#888;text-align:center;margin:16px 0 0;">
        Questions? Just reply to this email — we're real people and we read every message.
      </p>
    </div>
  </div>

  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:12px;color:#AAAAAA;margin:0 0 4px;">
      College Fast Forward · support@collegefastforward.com
    </p>
    <p style="font-size:11px;color:#CCCCCC;margin:0;">
      You're receiving this because you joined College Fast Forward.
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
      personalizations: [{ to: [{ email: userEmail }] }],
      from: { 
        email: 'support@collegefastforward.com', 
        name: 'College Fast Forward' 
      },
      subject: `${firstName}, thank you for showing up for your kid 💙`,
      html,
    }),
  });

  return Response.json({ success: true });
});