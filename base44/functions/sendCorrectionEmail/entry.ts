/**
 * CFF — Correction Email: "April 15" deadline error
 *
 * Sends a correction to the 19 students who received the broken Day 7/8 trial email
 * with a hardcoded "April 15" deadline. Correct deadline is April 30.
 *
 * Scheduled for: 2026-04-28 at 9:30am ET (one-time).
 * Admin-only. No dry-run parameter needed — list is hardcoded by user_id.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'Jill at CFF';
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

// All users who received a Day 7 or Day 8 email with the broken "April 15" deadline.
// Identified by presence of last_day7_email_sent_at or last_day8_email_sent_at on user record.
// Confirmed count: 19 affected users.
const AFFECTED_EMAILS = [
  'brendanschaefer15@gmail.com',
  'jacksonwhitcomb@ufl.edu',
  'lexiestant@gmail.com',
  'ankes@umich.edu',
  'arunimadeogade@gmail.com',
  'karenbuxton@comcast.net',
  // Additional users from truncated query — fetched dynamically below
];

function buildCorrectionHtml(firstName) {
  const greeting = firstName ? `Hi ${firstName},` : `Hi,`;

  const body = `${greeting}

Quick correction from us.

A recent email you received mentioned April 15 as the deadline to lock in the Founding Rate. That was wrong — the correct deadline is April 30, 2026.

If you'd like to reactivate FastIQ at $14.50/month, you still have until April 30 to lock in that rate permanently. After that, it goes back to full price.

Sorry for the confusion. If you have any questions, just reply to this email.

${APP_URL}

— Jill`;

  const lines = body.split('\n').map(line => {
    if (line.trim() === '') return '<br>';
    return `<p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1a1a1a;">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }).join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f9f9f7;margin:0;padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:40px 48px;max-width:560px;">
<tr><td>${lines}</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #eee;">
<p style="font-family:Arial,sans-serif;font-size:12px;color:#aaa;margin:0;">
You're receiving this because you joined College Fast Forward. &nbsp;
<a href="${APP_URL}/#Logout" style="color:#aaa;">Unsubscribe</a>
</p></td></tr></table></td></tr></table></body></html>`;
}

function buildCorrectionText(firstName) {
  const greeting = firstName ? `Hi ${firstName},` : `Hi,`;
  return `${greeting}

Quick correction from us.

A recent email you received mentioned April 15 as the deadline to lock in the Founding Rate. That was wrong — the correct deadline is April 30, 2026.

If you'd like to reactivate FastIQ at $14.50/month, you still have until April 30 to lock in that rate permanently. After that, it goes back to full price.

Sorry for the confusion. If you have any questions, just reply to this email.

${APP_URL}

— Jill`;
}

async function sendEmail(toEmail, toName, htmlBody, textBody) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail, name: toName || toEmail }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `My mistake — your deadline is April 30, not April 15`,
      content: [
        { type: 'text/plain', value: textBody },
        { type: 'text/html', value: htmlBody },
      ],
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
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    // Dynamically fetch all affected users — anyone with last_day7_email_sent_at or last_day8_email_sent_at
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const affected = allUsers.filter(u =>
      (u.last_day7_email_sent_at || u.last_day8_email_sent_at) &&
      u.email !== 'josinoff@gmail.com'
    );

    console.log(`Found ${affected.length} affected users`);

    const results = { sent: 0, skipped: 0, failed: 0, errors: [], recipients: [] };

    for (const u of affected) {
      if (!u.email) { results.skipped++; continue; }

      // Resolve a clean first name — reject if it looks like an email prefix or contains digits
      const rawName = u.first_name || u.full_name?.split(' ')[0] || null;
      const emailPrefix = u.email.split('@')[0]?.toLowerCase() || '';
      const cleanedName = rawName?.replace(/[,;.]+$/, '').trim(); // strip trailing punctuation
      const nameIsReal = cleanedName &&
        cleanedName.toLowerCase() !== emailPrefix &&
        !/\d/.test(cleanedName) &&
        !cleanedName.includes('_') &&
        !/\.[a-z]/i.test(cleanedName) &&
        cleanedName.length >= 2;
      const resolvedName = nameIsReal ? cleanedName : null;

      if (dryRun) {
        results.recipients.push({ email: u.email, name: resolvedName || '(no name)', day7: u.last_day7_email_sent_at, day8: u.last_day8_email_sent_at });
        results.sent++;
        continue;
      }

      try {
        await sendEmail(
          u.email,
          resolvedName,
          buildCorrectionHtml(resolvedName),
          buildCorrectionText(resolvedName),
        );

        // Log to EmailLog so frequency cap sees it
        await base44.asServiceRole.entities.EmailLog.create({
          user_id: u.id,
          user_email: u.email,
          email_type: 'reengagement_7d', // closest existing type; subject is self-explanatory
          subject: `My mistake — your deadline is April 30, not April 15`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { correction: true, original_bug: 'april_15_hardcoded_deadline' },
        });

        results.recipients.push({ email: u.email, name: resolvedName || '(no name)', status: 'sent' });
        results.sent++;
      } catch (err) {
        console.error(`Failed to send to ${u.email}:`, err.message);
        results.errors.push({ email: u.email, error: err.message });
        results.failed++;
      }
    }

    return Response.json({
      success: true,
      dryRun,
      totalAffected: affected.length,
      sent: results.sent,
      skipped: results.skipped,
      failed: results.failed,
      errors: results.errors,
      recipients: results.recipients,
    });
  } catch (error) {
    console.error('sendCorrectionEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});