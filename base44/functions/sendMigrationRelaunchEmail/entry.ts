import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function buildEmailHtml(firstName, appBaseUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>We're now one platform — here's how to access your account</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f6f3;font-family:'Georgia',serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f7f6f3;">
  Your account is ready at collegefastforward.com — here's how to get in.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
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
              We're now one platform — and your account is ready.
            </h1>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#aaaaaa;line-height:1.7;margin:0;">
              Your profile has already been moved over. Here's how to get in.
            </p>
          </td>
        </tr>

        <tr><td style="height:24px;"></td></tr>

        <tr>
          <td style="background-color:#ffffff;border-radius:16px;padding:40px 48px;border:1px solid #e5e5e5;">

            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
              Hi ${firstName},
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
              A while back you signed up for College Fast Forward — a platform connecting college students with parents and alumni who can help them get hired through warm introductions. Thank you for being an early supporter.
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
              We've been building, and today we're bringing everything together into one home at <strong>collegefastforward.com</strong>. Your profile is already there — you just need to sign in.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f6f3;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">
                    How to access your account
                  </p>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <table cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="width:20px;height:20px;background-color:#E85D20;border-radius:10px;text-align:center;">
                            <span style="font-size:11px;color:#ffffff;font-family:Georgia,serif;font-weight:700;line-height:20px;display:inline-block;">1</span>
                          </td>
                        </tr></table>
                      </td>
                      <td style="padding-left:10px;">
                        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                          Go to <strong>collegefastforward.com</strong> and click <strong>Sign In</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <table cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="width:20px;height:20px;background-color:#E85D20;border-radius:10px;text-align:center;">
                            <span style="font-size:11px;color:#ffffff;font-family:Georgia,serif;font-weight:700;line-height:20px;display:inline-block;">2</span>
                          </td>
                        </tr></table>
                      </td>
                      <td style="padding-left:10px;">
                        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                          Enter your email and password — or click <strong>Forgot Password</strong> to set a new one
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <table cellpadding="0" cellspacing="0" border="0"><tr>
                          <td style="width:20px;height:20px;background-color:#E85D20;border-radius:10px;text-align:center;">
                            <span style="font-size:11px;color:#ffffff;font-family:Georgia,serif;font-weight:700;line-height:20px;display:inline-block;">3</span>
                          </td>
                        </tr></table>
                      </td>
                      <td style="padding-left:10px;">
                        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6;margin:0;">
                          Your profile is already there — pick up right where you left off
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8f5;border-radius:12px;border:1px solid #f0c9b0;margin-bottom:32px;">
              <tr>
                <td style="padding:16px 24px;">
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.65;margin:0;">
                    <strong>Can't remember your password?</strong> No problem — just click <strong>Forgot Password</strong> on the sign in page, enter your email, and we'll send you a reset link. Takes 30 seconds.
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">
              What you're part of
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
              College Fast Forward is a network of parents and alumni who make themselves available to college students for introductions, career advice, and referrals. Students find you, reach out, and you decide how you want to help.
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
              <strong>Being part of the network is completely free — forever.</strong> No subscription, no catch.
            </p>

            <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">
              We also built something new — FastIQ
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
              FastIQ is an AI career engine for college students — alumni search, resume tailoring, mock interviews, company intel, and a personalized daily briefing. If you have a student searching for a job or internship right now, watch for my next email. I'll show you how to give them 7 days of free access before April 15th.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1a0e06;border-radius:16px;margin-bottom:32px;border:2px solid #8B2E0A;">
              <tr>
                <td style="padding:32px 28px;">
                  <p style="font-family:Georgia,serif;font-size:13px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">
                    Ready to log in?
                  </p>
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#ffffff;line-height:1.7;margin:0 0 28px;">
                    Click below to go to the new platform. Sign in with your email and password — or use Forgot Password if you need to set a new one. Your profile and network are waiting.
                  </p>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:#E85D20;border-radius:12px;">
                        <a href="${appBaseUrl}/#GetStarted" style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;letter-spacing:0.01em;">
                          Access My Account →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8f5;border-radius:12px;border:1px solid #f0c9b0;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="font-family:Georgia,serif;font-size:11px;font-weight:700;color:#E85D20;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">
                    ⏰ Founding Member Offer — Ends April 15
                  </p>
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.65;margin:0;">
                    If you'd like to unlock FastIQ for your student, our Founding Member rate of <strong>$14.50/month</strong> expires April 15th — after that it's $29/month. More details coming in my next email.
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
              Thank you for being an early believer in what we're building. The students in this network are lucky to have people like you willing to show up for them.
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
              See you on the platform.
            </p>

            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 4px;">Warmly,</p>
                  <p style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Jill Osinoff</p>
                  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#888888;margin:0;line-height:1.5;">
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
          <td style="background-color:#ffffff;border-radius:12px;padding:20px 28px;border:1px solid #e5e5e5;">
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#555555;line-height:1.65;margin:0;">
              <strong>P.S.</strong> Having any trouble getting in? Just reply to this email with the address you signed up with and I'll help you personally. I read every reply.
            </p>
          </td>
        </tr>

        <tr><td style="height:32px;"></td></tr>

        <tr>
          <td align="center" style="padding-bottom:32px;">
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#aaaaaa;line-height:1.6;margin:0 0 8px;">
              College Fast Forward &middot; collegefastforward.com
            </p>
            <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#aaaaaa;line-height:1.6;margin:0;">
              You're receiving this because you signed up for College Fast Forward.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required.' }, { status: 403, headers: corsHeaders });
    }

    const { blast = false, test_email } = await req.json().catch(() => ({}));

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://www.collegefastforward.com';
    if (!SENDGRID_API_KEY) {
      return Response.json({ error: 'SENDGRID_API_KEY not set.' }, { status: 500, headers: corsHeaders });
    }

    // TEST MODE
    if (!blast) {
      const recipient = test_email || 'josinoff@gmail.com';
      const html = buildEmailHtml('Jill', appBaseUrl);
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient, name: 'Jill Osinoff' }] }],
          from: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
          reply_to: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
          subject: "We're now one platform — here's how to access your account",
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (!sgRes.ok) {
        const err = await sgRes.text();
        return Response.json({ error: err }, { status: 500, headers: corsHeaders });
      }
      return Response.json({ success: true, mode: 'test', sent_to: recipient }, { headers: corsHeaders });
    }

    // BLAST MODE: migrated users only
    // Cutoff: April 1, 2026 — all migrated users were imported before the new platform launched
    const MIGRATION_CUTOFF = new Date('2026-04-01T00:00:00.000Z');
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);
    const targets = allUsers.filter(u =>
      u.hashed_password &&
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.email &&
      new Date(u.created_date) < MIGRATION_CUTOFF
    );
    console.log(`📊 Total with hashed_password+persona: ${allUsers.filter(u => u.hashed_password && (u.persona === 'parent' || u.persona === 'alumni')).length}, after cutoff filter: ${targets.length}`);

    console.log(`📧 Blast mode: sending to ${targets.length} migrated parents/alumni`);

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const target of targets) {
      const firstName = target.full_name?.split(' ')[0] || 'there';
      const html = buildEmailHtml(firstName, appBaseUrl);
      try {
        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: target.email, name: target.full_name || '' }] }],
            from: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
            reply_to: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
            subject: "We're now one platform — here's how to access your account",
            content: [{ type: 'text/html', value: html }],
          }),
        });
        if (sgRes.ok) {
          sent++;
        } else {
          failed++;
          errors.push({ email: target.email, status: sgRes.status });
        }
      } catch (e) {
        failed++;
        errors.push({ email: target.email, error: e.message });
      }
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100));
    }

    return Response.json({ success: true, mode: 'blast', sent, failed, errors }, { headers: corsHeaders });

  } catch (e) {
    console.error('sendMigrationRelaunchEmail error:', e);
    return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
  }
});