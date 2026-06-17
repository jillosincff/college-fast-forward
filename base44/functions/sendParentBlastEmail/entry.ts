import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'Jill and the College Fast Forward Team';
const SUBJECT = "Your student is about to enter the hardest job market in a generation — here's what we're doing about it";
const CTA_URL = 'https://collegefastforward.com/#/ParentLandingPage';

const EMAIL_HTML = (firstName) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9f9f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e5e5e5;">
        <tr>
          <td style="padding:40px 48px 36px;">

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">Dear ${firstName},</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;font-weight:bold;">We won't sugarcoat it.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">The job market your student is walking into is genuinely tough. Hundreds of applicants for every opening. AI screening out resumes before a human ever reads them. Entry-level roles that require three years of experience. It's a lot — and if you've watched your student stress about it, you already know.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">That's exactly why College Fast Forward (CLiFF) exists.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">CLiFF gives students a real edge — not just a better resume, but warm, human connections to professionals who want to help them. People who've been in your student's shoes, who know how to navigate this market, and who are ready to open doors.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;font-weight:bold;">And here's the thing: you are one of those people.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">By being part of our parent network, you're not just supporting your own student. You're part of a community of experienced professionals who believe that a warm introduction can change everything — because it can. Students on CLiFF can reach out to network members like you for guidance, advice, and the kind of real-world insight no classroom can teach.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">The students who land jobs aren't always the most qualified. They're the ones with the right connections at the right moment.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 28px;">Know another parent who would want to be part of this? Invite them to join the network:</p>

            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
              <tr>
                <td style="background-color:#7c3aed;border-radius:8px;">
                  <a href="${CTA_URL}" style="display:inline-block;font-family:Georgia,serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;">Join the CLiFF Parent Network</a>
                </td>
              </tr>
            </table>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 20px;">Together, we can make sure no student has to navigate this alone.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 32px;">Thank you for being part of this network. It means more than you know.</p>

            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0 0 4px;">With gratitude,</p>
            <p style="font-family:Georgia,serif;font-size:17px;color:#1a1a1a;line-height:1.75;margin:0;">Jill and the College Fast Forward Team</p>

          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px 32px;border-top:1px solid #eeeeee;">
            <p style="font-family:Georgia,serif;font-size:12px;color:#aaaaaa;line-height:1.6;margin:0;text-align:center;">
              College Fast Forward &middot; collegefastforward.com<br>
              You're receiving this because you're a member of the College Fast Forward parent network.<br>
              <a href="https://collegefastforward.com/#/Unsubscribe" style="color:#aaaaaa;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

async function sendViaSendGrid(toEmail, firstName, apiKey) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: SUBJECT,
      content: [{ type: 'text/html', value: EMAIL_HTML(firstName) }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid ${res.status}: ${err}`);
  }
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const skip = body.skip ?? 0;
    const limit = body.limit ?? 50;

    // Fetch all parents
    const allParents = await base44.asServiceRole.entities.User.filter({ persona: 'parent' });

    // Deduplicate by email (case-insensitive), keep valid emails only
    const seen = new Set();
    const unique = [];
    for (const p of allParents) {
      if (!p.email) continue;
      const key = p.email.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }

    const totalUnique = unique.length;
    const batch = unique.slice(skip, skip + limit);
    const hasMore = skip + limit < totalUnique;
    const nextSkip = hasMore ? skip + limit : null;

    const results = { sent: 0, failed: 0, errors: [] };

    for (const parent of batch) {
      const firstName = (parent.full_name || '').split(' ')[0].trim() || 'there';
      try {
        await sendViaSendGrid(parent.email, firstName, SENDGRID_API_KEY);
        results.sent++;
      } catch (e) {
        results.failed++;
        results.errors.push({ email: parent.email, error: e.message });
      }
      await new Promise(res => setTimeout(res, 200));
    }

    return Response.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      hasMore,
      totalUnique,
      nextSkip,
      errors: results.errors,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});