import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Re-engages accounts that were created but never finished onboarding (no persona set).
// These users are stuck: OnboardingGuard routes them to GatorAuth on every visit until
// they complete setup. This email brings them back to finish it.
//
// Admin-only. Defaults to dryRun so the recipient list can be reviewed before sending.
// Idempotent: skips anyone who already has an 'onboarding_abandonment' EmailLog entry.

const APP_BASE = 'https://collegefastforward.com';
const EMAIL_TYPE = 'onboarding_abandonment';
// Don't chase someone who signed up minutes ago and may still be mid-flow.
const MIN_AGE_HOURS = 24;

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const isTestAccount = (email) =>
  /example\.com|\+.*test|^test|josinoff\+/i.test(String(email || ''));

const buildHtml = (firstName) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>College Fast Forward</title></head>
<body style="margin:0;padding:0;background:#f8f9ff;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:800;letter-spacing:0.10em;text-transform:uppercase;color:#6d28d9;margin:0;">COLLEGE FAST FORWARD</p>
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(109,40,217,0.12);">
      <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);padding:36px;">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 12px;">✨ FINISH YOUR SETUP</p>
        <h1 style="font-size:26px;font-weight:800;color:#fff;margin:0 0 10px;line-height:1.3;letter-spacing:-0.02em;">Your account is waiting, ${escapeHtml(firstName)}.</h1>
        <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0;line-height:1.6;">You created an account but never finished setup — so CLIFF hasn't been able to start working for you yet.</p>
      </div>
      <div style="padding:28px 36px 32px;">
        <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">
          It takes about two minutes. Tell CLIFF what you're looking for, and it starts finding roles, prepping applications, and spotting warm connections for you.
        </p>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:16px 20px;margin:16px 0;">
          <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;line-height:1.5;">✓ Roles matched to your goals</p>
          <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;line-height:1.5;">✓ A tailored resume for the ones worth applying to</p>
          <p style="font-size:14px;color:#4c1d95;margin:0;line-height:1.5;">✓ Warm connections at those companies, when they exist</p>
        </div>
        <div style="text-align:center;margin:24px 0 4px;">
          <a href="${APP_BASE}/#/GatorAuth" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;">Finish My Setup →</a>
        </div>
        <p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Free to start · No credit card required</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">College Fast Forward · support@collegefastforward.com</p>
    </div>
  </div>
</body>
</html>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow system/scheduled runs (no user context) or admins only.
    const caller = await base44.auth.me().catch(() => null);
    if (caller && caller.role !== 'admin' && !caller.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dryRun = true } = await req.json().catch(() => ({}));

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    const ageCutoff = Date.now() - MIN_AGE_HOURS * 3600000;
    const stranded = allUsers.filter((u) => {
      const noPersona = !String(u.persona || '').trim();
      const oldEnough = u.created_date && new Date(u.created_date).getTime() < ageCutoff;
      return noPersona && oldEnough && u.role !== 'admin' && u.email && !isTestAccount(u.email);
    });

    // Skip anyone who already received this email.
    const priorLogs = await base44.asServiceRole.entities.EmailLog.filter({ email_type: EMAIL_TYPE });
    const alreadySent = new Set(priorLogs.map((l) => String(l.user_email || '').toLowerCase()));

    const recipients = stranded.filter((u) => !alreadySent.has(u.email.toLowerCase()));

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        strandedTotal: stranded.length,
        alreadyEmailed: stranded.length - recipients.length,
        wouldSend: recipients.length,
        recipients: recipients.map((u) => ({ email: u.email, name: u.full_name, created: u.created_date })),
      });
    }

    const sendKey = Deno.env.get('SENDGRID_API_KEY');
    const sent = [];
    const failed = [];

    for (const u of recipients) {
      const firstName = String(u.full_name || '').trim().split(' ')[0] || 'there';
      const subject = `${firstName}, your CLIFF setup is unfinished`;
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: u.email }] }],
            from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
            subject,
            content: [{ type: 'text/html', value: buildHtml(firstName) }],
          }),
        });

        if (!res.ok) {
          failed.push({ email: u.email, error: await res.text() });
          continue;
        }

        await base44.asServiceRole.entities.EmailLog.create({
          user_id: u.id,
          user_email: u.email,
          email_type: EMAIL_TYPE,
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { reason: 'no_persona_never_completed_onboarding' },
        });
        sent.push(u.email);
      } catch (err) {
        failed.push({ email: u.email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      dryRun: false,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});