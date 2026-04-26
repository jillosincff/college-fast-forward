/**
 * CFF Engagement Agent — Dispatch Approved Emails
 * 
 * Runs daily (or on-demand). Finds all EngagementEmail records with status="approved"
 * and sends them via SendGrid. Updates status to "sent" or "failed".
 * 
 * This is separate from the queue-builder (runEngagementAgent) so Jill can
 * review and approve emails before they go out.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'Jill at CFF';
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

async function sendEmail(toEmail, toName, subject, bodyHtml, bodyText) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail, name: toName || toEmail }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [
        { type: 'text/plain', value: bodyText || subject },
        { type: 'text/html', value: bodyHtml },
      ],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
      },
    }),
  });
  const msgId = res.headers.get('X-Message-Id');
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid ${res.status}: ${err}`);
  }
  return msgId || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Fetch all approved emails
    const allEmails = await base44.asServiceRole.entities.EngagementEmail.list('-created_date', 200);
    const approved = allEmails.filter(e => e.status === 'approved');

    const results = { sent: 0, failed: 0, errors: [] };

    for (const email of approved) {
      try {
        const msgId = await sendEmail(
          email.user_email,
          email.user_name,
          email.subject,
          email.body_html,
          email.body_text,
        );
        await base44.asServiceRole.entities.EngagementEmail.update(email.id, {
          status: 'sent',
          sent_at: new Date().toISOString(),
          sendgrid_message_id: msgId || '',
        });
        results.sent++;
      } catch (err) {
        await base44.asServiceRole.entities.EngagementEmail.update(email.id, {
          status: 'failed',
          error_message: err.message,
        });
        results.failed++;
        results.errors.push({ email: email.user_email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      totalApproved: approved.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});