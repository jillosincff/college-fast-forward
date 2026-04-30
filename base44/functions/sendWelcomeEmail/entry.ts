import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Inlined email utilities
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>College Fast Forward</title>
</head>
<body style="margin: 0; padding: 0; background: #F5F5F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">
        COLLEGE FAST FORWARD
      </p>
    </div>
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 12px; color: #AAAAAA; margin: 0 0 4px;">
        College Fast Forward · support@collegefastforward.com
      </p>
      <p style="font-size: 11px; color: #CCCCCC; margin: 0;">
        You're receiving this because you joined College Fast Forward.
      </p>
    </div>
  </div>
</body>
</html>
`;

const darkHero = (orangeLabel, headline, subtext) => `
  <div style="background: #0A0A0A; padding: 36px 36px 32px;">
    <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">
      ${orangeLabel}
    </p>
    <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">
      ${headline}
    </h1>
    <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">
      ${subtext}
    </p>
  </div>
`;

const ctaButton = (label, url) => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${url}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
      ${label} →
    </a>
  </div>
`;

const bodySection = (content) => `
  <div style="padding: 28px 36px 32px;">
    ${content}
  </div>
`;

const bodyText = (text) => `
  <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">
    ${text}
  </p>
`;

const featureList = (items) => `
  <div style="background: #F9F9F9; border-radius: 10px; padding: 16px 20px; margin: 16px 0;">
    ${items.map(item => `
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 8px; line-height: 1.5;">
        ${item}
      </p>
    `).join('')}
  </div>
`;

// Build a simple unsubscribe token (base64 of userId:email)
function makeUnsubscribeUrl(userId, email) {
  const token = btoa(`${userId}:${email}`).replace(/=/g, '');
  const appBase = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
  return `${appBase}/#Unsubscribe?token=${token}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userEmail, schoolName, persona, alumniIntent } = body;
    const firstName = body.firstName || body.userName || '';
    const userId = body.userId || user.id;
    const unsubscribeUrl = makeUnsubscribeUrl(userId, userEmail);

    // Routing logic: alumni helpers get a helper-style email, seekers get student email
    const isAlumniHelper =
      persona === 'alumni' && (alumniIntent === 'giving_help' || !alumniIntent);
    const isSeeker =
      persona === 'student' ||
      (persona === 'alumni' && alumniIntent === 'seeking_help');

    let subject, html;

    if (isAlumniHelper) {
      const networkName = escapeHtml(schoolName || 'your network');
      const safeFirstName = escapeHtml(firstName);
      subject = `Welcome to the network, ${firstName || 'friend'}`;
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Network</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f4f1ec; font-family: 'DM Sans', system-ui, -apple-system, sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
    @media (max-width: 600px) {
      .wrapper { margin: 0; border-radius: 0; }
      .header { padding: 28px 24px 24px !important; }
      .header-headline { font-size: 26px !important; }
      .body { padding: 28px 24px !important; }
      .footer { padding: 20px 24px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header" style="background: #0d1117; padding: 36px 48px 32px; text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 300px; height: 200px; background: radial-gradient(ellipse, rgba(232,93,32,0.2) 0%, transparent 70%); pointer-events: none;"></div>
      <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 28px;">
        <div style="width: 8px; height: 8px; background: #E85D20; border-radius: 50%;"></div>
        <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.02em;">College Fast Forward</span>
      </div>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700; color: #E85D20; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px;">Welcome to the Network</p>
      <h1 class="header-headline" style="font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 8px;">
        Thank you for<br /><span style="color: #E85D20; font-style: italic;">showing up.</span>
      </h1>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.5); margin-top: 8px;">${networkName} Alumni Network</p>
    </div>

    <div class="body" style="padding: 40px 48px; background: #ffffff;">
      <p style="font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 400; color: #1a1a1a; line-height: 1.7; margin-bottom: 20px;">
        Hi <strong style="font-weight: 700; color: #0d1117;">${safeFirstName}</strong>,
      </p>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #444; line-height: 1.75; margin-bottom: 20px;">
        You just did something that matters more than you might realize. You joined College Fast Forward as an alumni helper — and that decision puts you in rare company.
      </p>

      <div style="border-left: 3px solid #E85D20; padding: 16px 20px; margin: 28px 0; background: #fdf8f5; border-radius: 0 10px 10px 0;">
        <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-style: italic; font-weight: 700; color: #0d1117; line-height: 1.55; margin: 0;">Every alumni in this network made the same choice you just made. To show up. To open their contacts. To say — I'll help.</p>
      </div>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #444; line-height: 1.75; margin-bottom: 20px;">
        Students from ${networkName} are out there right now — applying, cold emailing, hoping someone inside their target company will take 15 minutes with them. You have relationships they can't buy and experience they haven't earned yet.
      </p>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #444; line-height: 1.75; margin-bottom: 20px;">
        One conversation from you really can change the trajectory of someone's career. We've already seen it happen.
      </p>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent); margin: 32px 0;"></div>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #0d1117; line-height: 1.75; margin-bottom: 20px; font-weight: 600;">
        Here's how it works:
      </p>

      <div style="display: flex; flex-direction: column; gap: 14px; margin: 0 0 28px;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="width: 28px; height: 28px; background: rgba(232,93,32,0.1); border: 1px solid rgba(232,93,32,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; color: #E85D20; text-align: center; line-height: 28px;">1</div>
          <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #444; line-height: 1.6; padding-top: 4px;">Sign in at <a href="https://collegefastforward.com" style="color: #E85D20; font-weight: 600;">collegefastforward.com</a> using this email address. Your profile is already set up and waiting for you.</p>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="width: 28px; height: 28px; background: rgba(232,93,32,0.1); border: 1px solid rgba(232,93,32,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; color: #E85D20; text-align: center; line-height: 28px;">2</div>
          <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #444; line-height: 1.6; padding-top: 4px;">Students from ${networkName} can find you by industry, company, or role and reach out directly through the platform.</p>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="width: 28px; height: 28px; background: rgba(232,93,32,0.1); border: 1px solid rgba(232,93,32,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; color: #E85D20; text-align: center; line-height: 28px;">3</div>
          <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #444; line-height: 1.6; padding-top: 4px;">When someone reaches out, we'll notify you immediately. You decide if and how you want to help — no commitment, no obligation.</p>
        </div>
      </div>

      <div style="text-align: center; margin: 36px 0 28px;">
        <a href="https://collegefastforward.com" style="display: inline-block; background: #E85D20; color: #ffffff; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; padding: 16px 40px; border-radius: 12px; letter-spacing: 0.01em; box-shadow: 0 8px 24px rgba(232,93,32,0.3);">
          Sign In &amp; View Your Profile →
        </a>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #999; text-align: center; margin-top: 10px;">Use Google sign-in or enter your email for a magic link — no password needed.</p>
      </div>

      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent); margin: 32px 0;"></div>

      <div style="background: #fdf8f5; border: 1px solid rgba(232,93,32,0.15); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
        <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: #0d1117; margin-bottom: 8px;">Help strengthen the network.</p>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px;">
          The more ${networkName} alumni who join, the more doors get opened for every student behind them. Know someone who'd want to help?
        </p>
        <a href="https://collegefastforward.com" style="display: inline-block; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #E85D20; text-decoration: none; border: 1px solid rgba(232,93,32,0.35); border-radius: 8px; padding: 10px 24px;">
          Share College Fast Forward →
        </a>
      </div>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #444; line-height: 1.7; margin-bottom: 24px;">
        From the bottom of my heart — thank you. You didn't have to do this. The fact that you did is exactly what makes this community different.
      </p>

      <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; color: #444; line-height: 1.7; margin-bottom: 16px;">
        With gratitude,
      </p>

      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 700; color: #0d1117;">Jill Osinoff</p>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #999; margin-top: 2px;">Founder, College Fast Forward</p>
    </div>

    <div class="footer" style="background: #0d1117; padding: 24px 48px; text-align: center;">
      <p style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.6;">
        You're receiving this because you joined College Fast Forward as an alumni helper.<br />
        <a href="https://collegefastforward.com" style="color: rgba(255,255,255,0.4); text-decoration: none;">collegefastforward.com</a> &nbsp;·&nbsp;
        <a href="mailto:jill@collegefastforward.com" style="color: rgba(255,255,255,0.4); text-decoration: none;">jill@collegefastforward.com</a>
      </p>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 8px;">
        <a href="${unsubscribeUrl}" style="color: rgba(255,255,255,0.3); text-decoration: underline;">Unsubscribe</a>
      </p>
      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-style: italic; color: rgba(255,255,255,0.2); margin-top: 12px;">Building networks at colleges across the country.</p>
    </div>
  </div>
</body>
</html>`;
    } else {
      // Student / seeker email (unchanged)
      subject = `You're in, ${firstName} — let's get you hired 🎯`;
      html = emailWrapper(`
        ${darkHero(
          '⚡ WELCOME TO CFF',
          `You're in, ${escapeHtml(firstName)}.`,
          `The career platform built for ${escapeHtml(schoolName || 'you')} — powered by real connections and AI.`
        )}
        ${bodySection(`
          ${bodyText(`One warm intro beats 100 cold applications. That's why College Fast Forward exists — to connect you with parents and alumni who <em>want</em> to help.`)}
          ${bodyText(`Here's how to get started in the next 10 minutes:`)}
          ${featureList([
            '1️⃣ Set your career goals — takes 3 minutes',
            '2️⃣ Upload your resume — FastIQ will score it instantly',
            '3️⃣ Search our network — 455+ parents and professionals ready to help',
            '4️⃣ Find alumni at your target companies',
          ])}
          ${ctaButton('Set My Career Goals', 'https://collegefastforward.com/#CareerGoals')}
          ${bodyText(`Questions? Just reply to this email — we're real people.`)}
        `)}
      `, unsubscribeUrl);
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: userEmail }] }],
        from: { email: 'support@collegefastforward.com', name: 'College Fast Forward' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: err }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});