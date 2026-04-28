/**
 * One-time corrective send for PaywallScreen FOUNDING_DEADLINE display bug (April 15–28).
 * Sends to 7 active-trial users who saw $29/month instead of $14.50/month.
 * Logs each send to EmailLog so the unified frequency cap accounts for it.
 * Admin-only. Dry-run mode available via { dryRun: true } in request body.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AFFECTED_USERS = [
  { email: 'gracestoker16@gmail.com',   firstName: 'Grace' },
  { email: 'dschneider416@icloud.com',  firstName: null },     // no first name known
  { email: 'suztab.43@gmail.com',       firstName: null },
  { email: 'szczesniakc@gmail.com',     firstName: null },
  { email: 'tscholder@wisc.edu',        firstName: null },
  { email: 'laelarocksat123@gmail.com', firstName: null },
  { email: 'eugetzel126@gmail.com',     firstName: null },
];

function buildHtml(firstName) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">
  <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 32px;">COLLEGE FAST FORWARD</p>
  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">${greeting}</p>
  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    When you signed up for FastIQ recently, the checkout screen showed $29/month. That was a display bug on our end — the actual Founding Rate is <strong>$14.50/month</strong>, locked in permanently for anyone who subscribes before April 30.
  </p>
  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 32px;">
    That's the price you'll be charged when your trial converts. Sorry for the confusion — we're fixing the display now.
  </p>
  <p style="font-size:14px;color:#1A1A1A;margin:0;">— Jill</p>
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E8E8E8;">
    <p style="font-size:11px;color:#AAAAAA;margin:0;">College Fast Forward · jill@collegefastforward.com</p>
  </div>
</div>
</body>
</html>`;
}

function buildText(firstName) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${greeting}

When you signed up for FastIQ recently, the checkout screen showed $29/month. That was a display bug on our end — the actual Founding Rate is $14.50/month, locked in permanently for anyone who subscribes before April 30.

That's the price you'll be charged when your trial converts. Sorry for the confusion — we're fixing the display now.

— Jill`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const previewOnly = body.previewOnly === true;
    const targetEmail = body.targetEmail || null; // send to single user if specified

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY && !dryRun && !previewOnly) {
      return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });
    }

    // Preview mode — return rendered HTML for a single user for review
    if (previewOnly) {
      const target = targetEmail
        ? AFFECTED_USERS.find(u => u.email === targetEmail)
        : AFFECTED_USERS[0];
      if (!target) return Response.json({ error: 'User not found in affected list' }, { status: 404 });

      // Look up actual first name from User entity
      let resolvedFirstName = target.firstName;
      if (!resolvedFirstName) {
        try {
          const users = await base44.asServiceRole.entities.User.filter({ email: target.email });
          const dbUser = users?.[0];
          if (dbUser?.full_name) resolvedFirstName = dbUser.full_name.split(' ')[0];
        } catch (_) {}
      }

      return Response.json({
        preview: true,
        email: target.email,
        firstName: resolvedFirstName,
        subject: 'One thing I want to correct — you saw the wrong price',
        html: buildHtml(resolvedFirstName),
        text: buildText(resolvedFirstName),
      });
    }

    // Resolve first names from User entity for all targets
    const targets = targetEmail
      ? AFFECTED_USERS.filter(u => u.email === targetEmail)
      : AFFECTED_USERS;

    const results = { sent: 0, skipped: 0, errors: [] };

    for (const target of targets) {
      let firstName = target.firstName;
      let userId = null;

      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: target.email });
        const dbUser = users?.[0];
        if (dbUser?.full_name) firstName = dbUser.full_name.split(' ')[0];
        if (dbUser?.id) userId = dbUser.id;
      } catch (_) {}

      const html = buildHtml(firstName);
      const text = buildText(firstName);
      const subject = 'One thing I want to correct — you saw the wrong price';

      if (dryRun) {
        results.sent++;
        continue;
      }

      // Send via SendGrid
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: target.email }] }],
          from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (!sgRes.ok) {
        const errText = await sgRes.text();
        results.errors.push({ email: target.email, error: errText });
        continue;
      }

      results.sent++;

      // Log to EmailLog so unified frequency cap accounts for this send
      try {
        await base44.asServiceRole.entities.EmailLog.create({
          user_id: userId || target.email,
          user_email: target.email,
          email_type: 'paywall_correction',
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          notes: 'Corrective send: PaywallScreen showed $29/month due to hardcoded April 15 deadline bug (April 15–28 window). Actual price $14.50/month.',
        });
      } catch (logErr) {
        console.warn(`[sendPaywallCorrectionEmail] EmailLog write failed for ${target.email}:`, logErr.message);
      }

      await new Promise(r => setTimeout(r, 200));
    }

    return Response.json({
      success: true,
      dryRun,
      targetEmail,
      totalTargets: targets.length,
      ...results,
    });

  } catch (error) {
    console.error('[sendPaywallCorrectionEmail] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});