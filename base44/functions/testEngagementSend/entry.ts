/**
 * Test send for timezone verification.
 * Sends a real Day 0 email via SendGrid to the requesting admin's email address.
 * Logs the exact UTC timestamp so we can verify schedule offset.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'Jill at CFF';
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const nowUTC = new Date().toISOString();
    const nowET = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'long' });

    const subject = `[TIMEZONE TEST] CFF Engagement Agent — ${nowET}`;

    const bodyText = `Hi Jill,

This is a timezone verification test sent from the CFF Engagement Agent.

If you are reading this email, the SendGrid integration is working correctly.

Sent at:
  UTC:           ${nowUTC}
  Eastern Time:  ${nowET}

When the daily automation fires at its scheduled time, it will also log these timestamps so you can confirm the actual ET delivery time matches 9:30am.

— CFF System

P.S. Once you confirm receipt, we are cleared for activation.`;

    const bodyHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="background:#f9f9f7;margin:0;padding:32px 16px;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px 48px;max-width:560px;">
<tr><td>
<p style="font-size:13px;color:#aaa;margin:0 0 24px;font-family:Arial,sans-serif;background:#fffbe6;border:1px solid #f0d060;border-radius:6px;padding:10px 14px;">
  ⏱ <strong>TIMEZONE TEST</strong> — This email was sent manually to verify scheduling accuracy.
</p>
<p style="font-size:16px;line-height:1.6;color:#1a1a1a;">Hi Jill,</p>
<p style="font-size:16px;line-height:1.6;color:#1a1a1a;">This is a timezone verification test sent from the CFF Engagement Agent.</p>
<p style="font-size:16px;line-height:1.6;color:#1a1a1a;">If you are reading this email, the SendGrid integration is working correctly.</p>
<table style="background:#f4f4f4;border-radius:8px;padding:16px 20px;margin:20px 0;width:100%;">
  <tr><td style="font-family:monospace;font-size:14px;color:#333;">
    <strong>UTC:</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${nowUTC}<br>
    <strong>Eastern Time:</strong>&nbsp;${nowET}
  </td></tr>
</table>
<p style="font-size:16px;line-height:1.6;color:#1a1a1a;">
  When the daily automation fires at its scheduled time, it will also log these timestamps so you can confirm the actual ET delivery time matches 9:30am.
</p>
<p style="font-size:16px;line-height:1.6;color:#1a1a1a;">— CFF System</p>
<p style="font-size:14px;color:#888;font-style:italic;">P.S. Once you confirm receipt, we are cleared for activation.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: user.email, name: user.full_name || user.email }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: bodyText },
          { type: 'text/html', value: bodyHtml },
        ],
      }),
    });

    const msgId = res.headers.get('X-Message-Id');

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `SendGrid error ${res.status}: ${err}` }, { status: 500 });
    }

    return Response.json({
      success: true,
      sent_to: user.email,
      sent_at_utc: nowUTC,
      sent_at_et: nowET,
      sendgrid_message_id: msgId,
      note: 'Check your inbox. Subject line contains the ET timestamp so you can verify timezone accuracy.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});