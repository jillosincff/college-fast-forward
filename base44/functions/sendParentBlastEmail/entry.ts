import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EMAIL_HTML = (firstName) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Big news — the UF parent network just got a major upgrade</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f6f3;font-family:'Georgia',serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f7f6f3;">
  The network is free forever. And we built something new for your student.
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f6f3;">
  <tr>
    <td align="center" style="padding:32px 16px;">

  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <tr>
      <td align="center" style="padding-bottom:28px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#E85D20;border-radius:8px;padding:8px 18px;">
              <span style="font-family:Georgia,serif;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">
                COLLEGE FAST FORWARD
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="background-color:#0d1117;border-radius:16px;padding:48px 48px 40px;border-left:4px solid #E85D20;">
        <p style="font-family:Georgia,serif;font-size:13px;font-weight:400;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">
          A note from Jill
        </p>
        <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.25;margin:0 0 24px;letter-spacing:-0.02em;">
          Big news — the UF parent network just got a major upgrade.
        </h1>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.7);line-height:1.7;margin:0;">
          And I have a gift for your student.
        </p>
      </td>
    </tr>

    <tr><td style="height:24px;"></td></tr>

    <tr>
      <td style="background-color:#ffffff;border-radius:16px;padding:40px 48px;border:1px solid rgba(0,0,0,0.07);">

        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
          Hi ${firstName},
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
          When I launched College Fast Forward for UF families, the goal was simple: give students access to the warm introductions that actually get them hired. You showed up. Over 1,000 UF parents and alumni joined, and real connections have been made because of this community.
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
          Today I'm writing to share what we just built — and to say thank you.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f6f3;border-radius:12px;margin-bottom:32px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;">
                First, the good news
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0;">
                The UF parent and alumni network is now <strong>completely free. Forever.</strong> No membership fee, no expiration. The connections you've made and the community you're part of stays open, always.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">
          Now, the exciting part
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
          We spent the last several months building something I'm genuinely proud of. It's called <strong>FastIQ</strong> — an AI career engine built specifically for college students navigating today's brutal job market.
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 24px;">
          Here's what it does for your student:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;background-color:#E85D20;border-radius:50%;text-align:center;line-height:20px;">
                      <span style="font-size:11px;color:#fff;font-family:Georgia,serif;font-weight:700;">1</span>
                    </div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                      <strong>Alumni Search</strong> — finds UF alumni working at their target companies, with AI-drafted outreach that actually sounds human
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;background-color:#E85D20;border-radius:50%;text-align:center;line-height:20px;">
                      <span style="font-size:11px;color:#fff;font-family:Georgia,serif;font-weight:700;">2</span>
                    </div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                      <strong>Company Intel</strong> — real-time hiring signals from the companies they care about most
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;background-color:#E85D20;border-radius:50%;text-align:center;line-height:20px;">
                      <span style="font-size:11px;color:#fff;font-family:Georgia,serif;font-weight:700;">3</span>
                    </div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                      <strong>Resume Tailoring</strong> — scores and rewrites their resume for specific roles and companies
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;background-color:#E85D20;border-radius:50%;text-align:center;line-height:20px;">
                      <span style="font-size:11px;color:#fff;font-family:Georgia,serif;font-weight:700;">4</span>
                    </div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                      <strong>Mock Interviews</strong> — AI-powered practice with real, specific feedback
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding-top:2px;">
                    <div style="width:20px;height:20px;background-color:#E85D20;border-radius:50%;text-align:center;line-height:20px;">
                      <span style="font-size:11px;color:#fff;font-family:Georgia,serif;font-weight:700;">5</span>
                    </div>
                  </td>
                  <td style="padding-left:8px;">
                    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                      <strong>Personalized Daily Briefing</strong> — tells them exactly what to do next based on where they are in their search
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
          This isn't another job board. It's the difference between your student sending 50 applications into the void and making three warm introductions that actually go somewhere.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1a0e06,#2a1506);border-radius:16px;margin-bottom:32px;border:1px solid rgba(232,93,32,0.3);">
          <tr>
            <td style="padding:32px 28px;">
              <p style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">
                🎁 Here's your gift
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.7;margin:0 0 20px;">
                For the next 7 days, you can unlock the full FastIQ experience for your student — completely free, no credit card needed.
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.7;margin:0 0 28px;">
                Just click below, enter your student's email, and we'll take it from there. They'll get access instantly.
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#E85D20;border-radius:12px;">
                    <a href="https://collegefastforward.com/#ParentHome?gift=open" style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Give My Student FastIQ Free →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8f5;border-radius:12px;border:1px solid rgba(232,93,32,0.2);margin-bottom:32px;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">
                ⏰ Founding Member Offer — Ends April 15
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.65;margin:0;">
                If FastIQ gives your student a real edge, lock in our Founding Member rate of just <strong>$14.50/month</strong> before April 15th — that's 50% off the regular price of $29, guaranteed forever.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
          The job market is hard right now. Your student having warm UF connections AND an AI career engine in their corner? That's a real edge.
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
          Thank you for being part of this from the beginning. It means more than you know.
        </p>

        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 4px;">
                Warmly,
              </p>
              <p style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">
                Jill Osinoff
              </p>
              <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#888;margin:0;line-height:1.5;">
                Founder, College Fast Forward<br>
                UF Mom &middot; 25 Years in Recruiting
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <tr><td style="height:24px;"></td></tr>

    <tr>
      <td style="background-color:#ffffff;border-radius:12px;padding:20px 28px;border:1px solid rgba(0,0,0,0.06);">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#555;line-height:1.65;margin:0;">
          <strong>P.S.</strong> The $14.50 founding rate disappears after April 15th. After that, FastIQ is $29/month. If you think it's worth it for your student, lock it in now while you can.
        </p>
      </td>
    </tr>

    <tr><td style="height:32px;"></td></tr>

    <tr>
      <td align="center" style="padding-bottom:32px;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;margin:0 0 8px;">
          College Fast Forward &middot; collegefastforward.com
        </p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;margin:0;">
          You're receiving this because you're a member of the UF parent network.
        </p>
      </td>
    </tr>

  </table>
    </td>
  </tr>
</table>

</body>
</html>`;

const SENDGRID_FROM = { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' };
const SUBJECT = "Big news — the UF parent network just got a major upgrade";

async function sendViaSendGrid(toEmail, firstName, apiKey) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: SENDGRID_FROM,
      subject: SUBJECT,
      content: [{ type: 'text/html', value: EMAIL_HTML(firstName) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${err}`);
  }
  return true;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  // mode: 'test' (send only to test_email) | 'blast' (send to all parents — NOT enabled yet)
  const mode = body.mode || 'test';
  const testEmail = body.test_email || 'josinoff@gmail.com';

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

  if (mode === 'test') {
    await sendViaSendGrid(testEmail, 'Jill', SENDGRID_API_KEY);
    return Response.json({ success: true, sent_to: testEmail, mode: 'test' });
  }

  // BLAST MODE — gated, must be explicitly enabled
  if (mode !== 'blast') {
    return Response.json({ error: 'Unknown mode. Use mode: "test" or mode: "blast".' }, { status: 400 });
  }

  // Fetch all parents
  const parents = await base44.asServiceRole.entities.User.filter({ persona: 'parent' });
  const results = { sent: 0, failed: 0, errors: [] };

  for (const parent of parents) {
    if (!parent.email) continue;
    const firstName = parent.full_name?.split(' ')[0] || 'there';
    try {
      await sendViaSendGrid(parent.email, firstName, SENDGRID_API_KEY);
      results.sent++;
      // Throttle — 3 per second to stay within SendGrid rate limits
      await new Promise(r => setTimeout(r, 333));
    } catch (e) {
      results.failed++;
      results.errors.push({ email: parent.email, error: e.message });
    }
  }

  return Response.json({ success: true, mode: 'blast', ...results });
});