import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { escapeHtml } from '../../shared/emailGuards.ts';
import { firstNameOf, unsubUrl } from '../../shared/emailIdentity.ts';

// SCHEDULED: Weekly. Covers the segment nothing else reaches — students dormant
// 60+ days. The lifecycle engine caps at 60 days and the inactivity sweep at 30,
// so these accounts currently get nothing.
//
// Posture: not a nudge, not guilt. A clean-slate restart offer — "your search
// starts over, and CLIFF does the first pass for you."
//
// Rules:
//   - Students only, onboarding completed
//   - Dormant 60+ days (last_active_at, falling back to updated_date)
//   - ONE win-back email per user, ever (EmailLog email_type='winback_60d')
//   - Skip unsubscribed (reengagement_unsubscribed, EmailPreference opt-outs)
//   - Skip anyone emailed in the last 7 days (global frequency guard)
//   - Batch cap: 40 sends per run

const APP_BASE = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

function winBackEmail(firstName, monthsAway, userId, email) {
  const name = escapeHtml(firstName);
  const unsub = unsubUrl(APP_BASE, userId, email);
  return {
    subject: `${name}, want a clean slate?`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#6d28d9;margin:0;">CLIFF · COLLEGE FAST FORWARD</p>
  </div>
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(109,40,217,0.08);">
    <div style="background:#312e81;padding:36px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8b5cf6;margin:0 0 12px;">A CLEAN SLATE</p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">No catching up required, ${name}.</h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.65);margin:0;line-height:1.6;">You've been away ${escapeHtml(monthsAway)}. Nothing is waiting to be cleaned up.</p>
    </div>
    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">Job searches stall. Semesters get busy. You don't owe anyone an explanation — and there's no half-finished checklist sitting in here judging you.</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">Here's what's different now: <strong>CLIFF does the first pass for you.</strong> Log back in and it will find roles that fit your goals, check whether anyone in your school's network can open a door, and prepare one complete application — resume tailored, outreach drafted — before you do anything.</p>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">One login. You review finished work instead of starting from a blank page.</p>
      <div style="text-align:center;margin:26px 0 8px;">
        <a href="${APP_BASE}/#/FreeTierDashboard" style="display:inline-block;background:#6d28d9;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Start fresh →</a>
      </div>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:20px 0 8px;">— Jill</p>
      <p style="font-size:13px;color:#888;margin:0;">P.S. If you already landed something, that's genuinely the best outcome — just reply and tell me, and I'll stop emailing you.</p>
    </div>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:11px;color:#9ca3af;margin:0 0 4px;">You're receiving this because you joined College Fast Forward.</p>
    <p style="font-size:11px;color:#9ca3af;margin:0;"><a href="${unsub}" style="color:#6d28d9;">Unsubscribe</a></p>
  </div>
</div>
</body></html>`,
  };
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled runs have no user; manual runs must be admin.
    const caller = await base44.auth.me().catch(() => null);
    if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dry_run = false, batch_limit = 40 } = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const DAY = 86_400_000;
    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * DAY).toISOString();
    const sevenDaysAgo = new Date(now - 7 * DAY).toISOString();

    const allUsers = await svc.User.list('-created_date', 5000);

    // Global frequency guard + "already won back once" dedupe, both from EmailLog
    const logs = await svc.EmailLog.list('-sent_at', 5000).catch(() => []);
    const recentlyEmailed = new Set();
    const alreadyWonBack = new Set();
    for (const l of (logs || [])) {
      const e = l.user_email?.toLowerCase();
      if (!e) continue;
      if (l.email_type === 'winback_60d') alreadyWonBack.add(e);
      if (l.status === 'sent' && l.sent_at >= sevenDaysAgo) recentlyEmailed.add(e);
    }

    const prefs = await svc.EmailPreference.list(undefined, 5000).catch(() => []);
    const optedOut = new Set();
    for (const p of (prefs || [])) {
      if (p.all_emails === false || p.reengagement_emails === false) {
        if (p.user_email) optedOut.add(p.user_email.toLowerCase());
        if (p.user_id) optedOut.add(p.user_id);
      }
    }

    const sent = [];
    const errors = [];
    let scanned = 0;

    for (const u of allUsers) {
      if (sent.length >= batch_limit) break;
      if (!u.email) continue;
      if (u.onboarding_completed !== true) continue;

      // Students only — parents/alumni have their own lifecycle
      const isStudent = u.persona === 'student' || u.roles?.includes('student');
      if (!isStudent) continue;

      const lastActive = u.last_active_at || u.updated_date || u.created_date;
      if (!lastActive || lastActive >= sixtyDaysAgo) continue;
      scanned++;

      const emailLower = u.email.toLowerCase();
      if (u.reengagement_unsubscribed) continue;
      if (optedOut.has(emailLower) || optedOut.has(u.id)) continue;
      if (alreadyWonBack.has(emailLower)) continue;
      if (recentlyEmailed.has(emailLower)) continue;

      const firstName = firstNameOf(u.full_name);
      const months = Math.max(2, Math.round((now - new Date(lastActive).getTime()) / (30 * DAY)));
      const monthsAway = months >= 12 ? 'over a year' : `about ${months} months`;
      const { subject, html } = winBackEmail(firstName, monthsAway, u.id, u.email);

      try {
        if (!dry_run) {
          const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: u.email }] }],
              from: { email: 'support@collegefastforward.com', name: 'Jill at CliFF' },
              subject,
              content: [{ type: 'text/html', value: html }],
            }),
          });
          if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text()}`);

          // The EmailLog row IS the permanent one-per-user record — write it always.
          await svc.EmailLog.create({
            user_id: u.id,
            user_email: u.email,
            persona: 'student',
            email_type: 'winback_60d',
            subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });
          alreadyWonBack.add(emailLower);
        }
        sent.push({ email: u.email, months_away: monthsAway });
      } catch (e) {
        errors.push({ email: u.email, error: e.message });
      }
    }

    await svc.SchedulerRun.create({
      automation_name: 'longDormantWinBack',
      run_at: new Date().toISOString(),
      users_scanned: scanned,
      actions_taken: sent.length,
      errors,
      duration_ms: Date.now() - startTime,
      details: { dry_run, sent },
    }).catch(() => {});

    return Response.json({ success: true, dry_run, dormant_scanned: scanned, sent_count: sent.length, sent, errors });
  } catch (error) {
    console.error('longDormantWinBack error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});