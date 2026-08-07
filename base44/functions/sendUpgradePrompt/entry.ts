import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// CLIFF Pro upgrade email — current branding (purple), current pricing ($19.96/mo),
// current destination (#/FreeTierDashboard). Replaces the retired FastIQ template.

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const APP_BASE = 'https://collegefastforward.com';

const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>College Fast Forward</title>
</head>
<body style="margin: 0; padding: 0; background: #f8f9ff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.10em; text-transform: uppercase; color: #6d28d9; margin: 0;">
        COLLEGE FAST FORWARD
      </p>
    </div>
    <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(109,40,217,0.12);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        College Fast Forward · support@collegefastforward.com
      </p>
    </div>
  </div>
</body>
</html>
`;

const hero = (label, headline, subtext) => `
  <div style="background: ${GRAD}; padding: 36px 36px 32px;">
    <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 12px;">
      ${label}
    </p>
    <h1 style="font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 10px; line-height: 1.3; letter-spacing: -0.02em;">
      ${headline}
    </h1>
    <p style="font-size: 15px; color: rgba(255,255,255,0.8); margin: 0; line-height: 1.6;">
      ${subtext}
    </p>
  </div>
`;

const ctaButton = (label, url) => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${url}" style="display: inline-block; background: ${GRAD}; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 14px;">
      ${label} →
    </a>
  </div>
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, firstName, featureHit } = await req.json();

    const featureMessages = {
      alumni_search: 'unlimited warm-connection searches at any company',
      resume_tailor: 'unlimited CLIFF-tailored resumes for specific jobs',
      outreach: 'unlimited AI outreach drafts that actually get replies',
      mock_interview: 'unlimited mock interview practice',
      linkedin_review: 'LinkedIn profile scoring and optimization',
    };

    const featureText = featureMessages[featureHit] || 'everything CLIFF Pro does for you';

    const html = emailWrapper(`
      ${hero(
        '✨ CLIFF PRO',
        'Let CLIFF take it from here.',
        `CLIFF Pro powers ${featureText} — and keeps working in the background even when you're not.`
      )}
      <div style="padding: 28px 36px 32px;">
        <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 16px;">
          Hey ${escapeHtml(firstName)}, you just hit a CLIFF Pro feature. Here's everything Pro unlocks:
        </p>
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 14px; padding: 16px 20px; margin: 16px 0;">
          <p style="font-size: 14px; color: #4c1d95; margin: 0 0 8px; line-height: 1.5;">✓ Unlimited CLIFF-powered applications</p>
          <p style="font-size: 14px; color: #4c1d95; margin: 0 0 8px; line-height: 1.5;">✓ Unlimited resume, interview &amp; company prep</p>
          <p style="font-size: 14px; color: #4c1d95; margin: 0 0 8px; line-height: 1.5;">✓ Unlimited outreach &amp; follow-ups</p>
          <p style="font-size: 14px; color: #4c1d95; margin: 0 0 8px; line-height: 1.5;">✓ Proactive background work — CLIFF preps while you sleep</p>
          <p style="font-size: 14px; color: #4c1d95; margin: 0; line-height: 1.5;">✓ Brings you back only when it matters</p>
        </div>
        ${ctaButton('Unlock CLIFF Pro — $4.99/wk', `${APP_BASE}/#/FreeTierDashboard`)}
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 20px 0 0;">
          Billed monthly at $19.96/mo · Cancel anytime
        </p>
      </div>
    `);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: userEmail }] }],
        from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
        subject: `You found a CLIFF Pro feature, ${firstName} ✨`,
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