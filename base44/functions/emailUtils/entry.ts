export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>College Fast Forward</title>
</head>
<body style="margin: 0; padding: 0; background: #F5F5F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">
        COLLEGE FAST FORWARD
      </p>
    </div>

    <!-- Card -->
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      ${content}
    </div>

    <!-- Footer -->
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

export const darkHero = (orangeLabel, headline, subtext) => `
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

export const ctaButton = (label, url) => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${url}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">
      ${label} →
    </a>
  </div>
`;

export const bodySection = (content) => `
  <div style="padding: 28px 36px 32px;">
    ${content}
  </div>
`;

export const bodyText = (text) => `
  <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">
    ${text}
  </p>
`;

export const featureList = (items) => `
  <div style="background: #F9F9F9; border-radius: 10px; padding: 16px 20px; margin: 16px 0;">
    ${items.map(item => `
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 8px; line-height: 1.5;">
        ${item}
      </p>
    `).join('')}
  </div>
`;

export const divider = () => `
  <div style="height: 1px; background: #F0F0F0; margin: 0 36px;"></div>
`;