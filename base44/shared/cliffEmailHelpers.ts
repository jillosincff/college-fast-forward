// Shared CLIFF email helpers — used by cliffTrialEmailScheduler and sendJobsComebackEmail.
// Plain module: no Deno.serve, exports only.

export const APP_BASE = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

export const escapeHtml = (str: string): string => String(str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export const makeUnsubToken = (userId: string, email: string): string =>
  btoa(`${userId}:${email}`).replace(/=/g, '');

export const unsubUrl = (userId: string, email: string): string =>
  `${APP_BASE}/#/Unsubscribe?token=${makeUnsubToken(userId, email)}`;

export const emailWrapper = (content: string, unsubscribeUrl: string): string => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CliFF</title></head>
<body style="margin: 0; padding: 0; background: #F5F5F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">
        CLIFF · COLLEGE FAST FORWARD
      </p>
    </div>
    <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 12px; color: #AAAAAA; margin: 0 0 4px;">College Fast Forward · support@collegefastforward.com</p>
      <p style="font-size: 11px; color: #CCCCCC; margin: 0 0 4px;">You're receiving this because you joined College Fast Forward.</p>
      <p style="font-size: 11px; color: #CCCCCC; margin: 0;"><a href="${unsubscribeUrl}" style="color: #AAAAAA; text-decoration: underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

export const darkHero = (label: string, headline: string, subtext: string): string => `
  <div style="background: #0A0A0A; padding: 36px 36px 32px;">
    <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">${label}</p>
    <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">${headline}</h1>
    <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">${subtext}</p>
  </div>`;

export const ctaButton = (label: string, url: string): string => `
  <div style="text-align: center; margin: 8px 0 4px;">
    <a href="${url}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">${label}</a>
  </div>`;

export const bodyText = (text: string): string =>
  `<p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">${text}</p>`;

export const getFirstName = (fullName: string): string =>
  (fullName || '').split(' ')[0] || 'there';

export async function sendViaSendGrid(toEmail: string, subject: string, html: string): Promise<void> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: 'support@collegefastforward.com', name: 'Jill at CliFF' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!response.ok) throw new Error(`SendGrid ${response.status}: ${await response.text()}`);
}

export async function isUnsubscribed(base44: any, userId: string): Promise<boolean> {
  const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_id: userId }).catch(() => []);
  return prefs?.[0]?.all_emails === false;
}