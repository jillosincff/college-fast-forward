import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Admin-only one-time parent gift email ("School Year" $99 gift).
// mode: 'preview' (default) → compute audience + return report, no send.
// mode: 'test'  → same report + send ONE copy to testEmail (or the calling admin).
// mode: 'send'  → send to the full audience and log each in EmailLog. ("go")
//
// Exclusions (deduped by trimmed, lowercase email):
//   no email · unsubscribed (EmailPreference all_emails=false) · active paid Pro
//   (UserAccessPlan pro_active + billing_provider) · admin/owner accounts ·
//   lindseyosinoff@ufl.edu · anyone already sent this email (EmailLog parent_gift_email, sent).

const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'CLIFF at College Fast Forward';
const SUBJECT = 'A job search coach for your own student';
const PREVIEW = 'The rest of the school year, $99 once. Not a subscription.';
const CTA_LABEL = 'Give them a coach — $99';
const APP_BASE = 'https://collegefastforward.com';
const EMAIL_TYPE = 'parent_gift_email';
const SKIP_EMAILS = new Set(['josinoff@gmail.com', 'losinoff@gmail.com', 'lindseyosinoff@ufl.edu']);

const escapeHtml = (s) => {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Same token scheme as handleUnsubscribe: base64(userId:email), padding stripped.
function makeToken(userId, email) {
  return btoa(`${userId}:${email}`).replace(/=/g, '');
}

function buildEmailHtml(parent, unsubscribeUrl) {
  const first = (parent.full_name || '').split(' ')[0].trim() || 'there';
  const cta = `${APP_BASE}/?utm_source=parent_email&utm_medium=email&utm_campaign=parent_gift_fall&parent_name=${encodeURIComponent(first)}&parent_email=${encodeURIComponent(parent.email)}#/ForParents`;
  const bullets = [
    'Best Moves, the openings actually worth their time',
    'A resume tailored to every job, with no limit',
    'One clear next step at a time: pick, tailor, apply, track',
    'Mock interview practice when they land an interview',
  ];
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(PREVIEW)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ff;">
    <tr><td align="center" style="padding:28px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;border:1px solid #ede9fe;box-shadow:0 2px 8px rgba(109,40,217,0.06);">
        <tr><td style="padding:32px 28px 8px;">
          <p style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 4px;">Hi ${escapeHtml(first)},</p>
        </td></tr>
        <tr><td style="padding:8px 28px 0;">
          <p style="font-size:16px;color:#475569;line-height:1.65;margin:0 0 16px;">Thanks for being part of College Fast Forward. Here's a way to help your own student.</p>
          <p style="font-size:16px;color:#475569;line-height:1.65;margin:0 0 16px;">If your student has sent out dozens of applications and heard back from almost none, it's usually not effort that's missing. It's a plan.</p>
          <p style="font-size:16px;color:#0f172a;font-weight:700;line-height:1.65;margin:0 0 12px;">CLIFF gives them one:</p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">
            ${bullets.map((b) => `<tr><td style="padding:3px 0;"><p style="font-size:15px;color:#475569;line-height:1.55;margin:0;"><span style="color:#6d28d9;font-weight:800;">✓</span>&nbsp; ${escapeHtml(b)}</p></td></tr>`).join('')}
          </table>
          <p style="font-size:16px;color:#475569;line-height:1.65;margin:0 0 24px;">Give them the rest of the school year for $99. You pay once, and it ends May 31, 2027. If your student doesn't use it, you get a full refund within 14 days.</p>
        </td></tr>
        <tr><td align="center" style="padding:0 28px 28px;">
          <a href="${cta}" style="display:inline-block;background-color:#6d28d9;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 36px;border-radius:14px;border:1px solid #5b21b6;-webkit-text-fill-color:#ffffff;">${escapeHtml(CTA_LABEL)}</a>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <p style="font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px;">Not the right fit this year? No problem, and thanks for being part of this.</p>
          <p style="font-size:15px;color:#0f172a;font-weight:700;line-height:1.5;margin:0 0 2px;">CLIFF</p>
          <p style="font-size:14px;color:#94a3b8;line-height:1.5;margin:0;">College Fast Forward</p>
        </td></tr>
        <tr><td style="padding:16px 28px 24px;border-top:1px solid #f1e9ff;">
          <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0;text-align:center;">
            <a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendViaSendGrid(toEmail, html, apiKey) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: SUBJECT,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid ${res.status}: ${err}`);
  }
  return true;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'preview'; // 'preview' | 'test' | 'send'
    const testEmail = (body.testEmail || '').trim().toLowerCase();

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

    // ── Audience selection ────────────────────────────────────────────────
    const [allParents, accessPlans, prefs, priorLogs] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ persona: 'parent' }).catch(() => []),
      base44.asServiceRole.entities.UserAccessPlan.filter({ access_state: 'pro_active' }).catch(() => []),
      base44.asServiceRole.entities.EmailPreference.list().catch(() => []),
      base44.asServiceRole.entities.EmailLog.filter({ email_type: EMAIL_TYPE }).catch(() => []),
    ]);

    // Active paid Pro user_ids (billing_provider only — excludes pilot/founding/admin grants)
    const paidProIds = new Set();
    for (const p of (accessPlans || [])) {
      if (p.access_state === 'pro_active' && p.access_source === 'billing_provider' && p.user_id) {
        paidProIds.add(p.user_id);
      }
    }

    // Unsubscribed user_ids + emails (all_emails === false)
    const unsubIds = new Set();
    const unsubEmails = new Set();
    for (const pr of (prefs || [])) {
      if (pr.all_emails === false) {
        if (pr.user_id) unsubIds.add(pr.user_id);
        if (pr.user_email) unsubEmails.add(pr.user_email.toLowerCase());
      }
    }

    // Already-sent emails (status 'sent')
    const alreadySent = new Set();
    for (const l of (priorLogs || [])) {
      if (l.status === 'sent' && l.user_email) alreadySent.add(l.user_email.toLowerCase());
    }

    // Dedupe parents by trimmed, lowercase email
    const seen = new Set();
    const excluded = { no_email: 0, unsubscribed: 0, active_paid_pro: 0, admin_owner: 0, lindsey: 0, already_sent: 0, duplicate: 0 };
    const audience = [];
    for (const p of (allParents || [])) {
      const email = (p.email || '').trim().toLowerCase();
      if (!email) { excluded.no_email++; continue; }
      if (seen.has(email)) { excluded.duplicate++; continue; }
      seen.add(email);
      if (unsubIds.has(p.id) || unsubEmails.has(email)) { excluded.unsubscribed++; continue; }
      if (paidProIds.has(p.id)) { excluded.active_paid_pro++; continue; }
      if (p.role === 'admin') { excluded.admin_owner++; continue; }
      if (SKIP_EMAILS.has(email)) {
        // lindsey is the only SKIP_EMAILS entry that isn't already an owner/admin
        excluded.lindsey++;
        continue;
      }
      if (alreadySent.has(email)) { excluded.already_sent++; continue; }
      audience.push(p);
    }

    const totalToSend = audience.length;
    const samples = audience.slice(0, 5).map((p) => ({
      email: p.email,
      name: p.full_name || '',
    }));

    const report = { total_to_send: totalToSend, excluded, samples };

    // ── Preview: return the report only ───────────────────────────────────
    if (mode === 'preview') {
      return Response.json({ mode, report });
    }

    // ── Test: send ONE copy to the admin (or testEmail), log it, return report ─
    if (mode === 'test') {
      const targetEmail = testEmail || user.email;
      if (!targetEmail) return Response.json({ error: 'No test email address' }, { status: 400 });
      const targetName = testEmail ? '' : (user.full_name || '');
      const fakeParent = { email: targetEmail, full_name: targetName, id: user.id || 'test' };
      const unsubUrl = `${APP_BASE}/#Unsubscribe?token=${makeToken(user.id || 'test', targetEmail)}`;
      const html = buildEmailHtml(fakeParent, unsubUrl);
      let sendError = null;
      try {
        await sendViaSendGrid(targetEmail, html, SENDGRID_API_KEY);
        try {
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: user.id || '',
            user_email: targetEmail,
            persona: 'parent',
            email_type: EMAIL_TYPE,
            subject: SUBJECT,
            content_preview: PREVIEW,
            status: 'sent',
            sent_at: new Date().toISOString(),
            utm_source: 'parent_email',
            utm_campaign: 'parent_gift_fall',
            metadata: { mode: 'test', sent_to_admin: true },
          });
        } catch (e) { console.error('[sendParentGiftEmail] test EmailLog failed:', e.message); }
      } catch (e) {
        sendError = e.message;
      }
      return Response.json({ mode, report, test_sent_to: targetEmail, send_error: sendError });
    }

    // ── Send: deliver to the full audience, log each ───────────────────────
    if (mode === 'send') {
      const results = { sent: 0, failed: 0, errors: [] };
      for (const p of audience) {
        const unsubUrl = `${APP_BASE}/#Unsubscribe?token=${makeToken(p.id, p.email)}`;
        const html = buildEmailHtml(p, unsubUrl);
        try {
          await sendViaSendGrid(p.email, html, SENDGRID_API_KEY);
          results.sent++;
          try {
            await base44.asServiceRole.entities.EmailLog.create({
              user_id: p.id,
              user_email: p.email,
              persona: 'parent',
              email_type: EMAIL_TYPE,
              subject: SUBJECT,
              content_preview: PREVIEW,
              status: 'sent',
              sent_at: new Date().toISOString(),
              utm_source: 'parent_email',
              utm_campaign: 'parent_gift_fall',
              metadata: { source: 'parent_gift_email_blast' },
            });
          } catch (e) { console.error('[sendParentGiftEmail] EmailLog failed for', p.email, e.message); }
        } catch (e) {
          results.failed++;
          results.errors.push({ email: p.email, error: e.message });
          try {
            await base44.asServiceRole.entities.EmailLog.create({
              user_id: p.id,
              user_email: p.email,
              persona: 'parent',
              email_type: EMAIL_TYPE,
              subject: SUBJECT,
              content_preview: PREVIEW,
              status: 'failed',
              sent_at: new Date().toISOString(),
              utm_source: 'parent_email',
              utm_campaign: 'parent_gift_fall',
              error_message: e.message,
              metadata: { source: 'parent_gift_email_blast' },
            });
          } catch (_) {}
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      return Response.json({ mode, report, results });
    }

    return Response.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
  } catch (err) {
    console.error('[sendParentGiftEmail] error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}