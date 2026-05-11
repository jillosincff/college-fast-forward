/**
 * sendTrialFeedbackEmail
 * 
 * Sends a personal feedback request email to all users whose FastIQ trial
 * expired without converting to paid. Admin-only endpoint.
 * 
 * Supports dryRun=true to preview without sending.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

async function sendEmail(to, firstName) {
  const greeting = firstName === 'Hey there'
    ? 'Hey there,'
    : (firstName ? `Hi ${firstName},` : 'Hi,');

  const body = `${greeting}

I noticed your FastIQ trial ended recently, and I wanted to reach out personally.

We put a lot into building FastIQ — the alumni search, resume tailoring, company intel — and I genuinely want to know if it missed the mark for you.

If you have 60 seconds, could you reply to this email and tell me:

What stopped you from continuing with FastIQ?

Was it the price? Something didn't work the way you expected? You just didn't have time to dig in? You found another solution?

No wrong answers — honest feedback from you is more useful to us than anything else right now.

And if there's anything I can do to help with your job search, reply and let me know. I'm happy to help directly.

— Jill
College Fast Forward

P.S. You still have access to the parent network — it's free and the directory is open to you anytime.`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f9f9f7;margin:0;padding:32px 16px;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:40px 48px;max-width:560px;">
<tr><td>
${body.split('\n').map(line => {
  if (line.trim() === '') return '<br>';
  if (line.trim().startsWith('What stopped you')) {
    return `<p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:17px;font-weight:bold;line-height:1.6;color:#1a1a1a;">${line}</p>`;
  }
  return `<p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1a1a1a;">${line.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`;
}).join('\n')}
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #eee;">
<p style="font-family:Arial,sans-serif;font-size:12px;color:#aaa;margin:0;">
College Fast Forward &nbsp;·&nbsp; <a href="${APP_URL}/#Logout" style="color:#aaa;">Unsubscribe</a>
</p></td></tr>
</table></td></tr></table>
</body></html>`;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
      subject: 'Quick question about FastIQ',
      content: [
        { type: 'text/plain', value: body },
        { type: 'text/html', value: htmlBody },
      ],
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: true },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error for ${to}: ${res.status} ${err}`);
  }
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    // Fetch all expired trial users who didn't convert
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const expiredTrialUsers = allUsers.filter(u =>
      u.trial_status === 'expired' &&
      u.subscription_status !== 'active' &&
      u.membership_tier !== 'fastiq' &&
      u.email &&
      u.email !== 'karenbuxton@comcast.net' // excluded per admin request
    );

    // Name overrides
    const NAME_OVERRIDES = {
      'pgplasma@gmail.com': 'Hey there',
      'mossrex@ufl.edu': 'Rex',
    };

    const results = { sent: 0, failed: 0, skipped: 0, dryRun, users: [] };

    for (const u of expiredTrialUsers) {
      let cleanFirst;
      if (NAME_OVERRIDES[u.email]) {
        cleanFirst = NAME_OVERRIDES[u.email];
      } else {
        const firstName = u.first_name || u.full_name?.split(' ')[0] || null;
        cleanFirst = firstName && !/\d/.test(firstName) && !firstName.includes('@') && firstName.length < 20
          ? firstName : null;
      }

      if (dryRun) {
        results.users.push({ email: u.email, name: u.full_name, firstName: cleanFirst });
        results.sent++;
        continue;
      }

      try {
        await sendEmail(u.email, cleanFirst);
        results.sent++;
        results.users.push({ email: u.email, status: 'sent' });
      } catch (err) {
        results.failed++;
        results.users.push({ email: u.email, status: 'failed', error: err.message });
      }
    }

    return Response.json({ success: true, total: expiredTrialUsers.length, ...results });
  } catch (error) {
    console.error('sendTrialFeedbackEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});