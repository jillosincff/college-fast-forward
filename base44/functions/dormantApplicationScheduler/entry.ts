import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { escapeHtml } from '../../shared/emailGuards.ts';

// Daily lifecycle scheduler: no application goes stale silently.
// Finds JobPursuits stuck at "applied" for 7+ days with no update, drafts a
// follow-up message, surfaces it as a dashboard activity, sets the pursuit's
// next action, and emails the student "your follow-up is ready to send".
// Dedupe: one follow_up_due CliffActivity per pursuit, ever. One email per
// student per run. Respects EmailPreference opt-outs.

const DORMANT_DAYS = 7;
const MAX_PER_RUN = 15;

const FROM = 'support@collegefastforward.com';
const FROM_NAME = 'College Fast Forward';

function emailHtml({ firstName, company, role, daysSince, draft, appUrl }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%">
      <tr><td style="background:#0A0A0A;padding:28px 40px">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#a78bfa">YOUR FOLLOW-UP IS READY</p>
        <h1 style="margin:10px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3">${escapeHtml(firstName)}, CLIFF drafted your ${escapeHtml(company)} follow-up.</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7">It's been <strong>${escapeHtml(daysSince)} days</strong> since you applied to <strong>${escapeHtml(company)}</strong>${role ? ` for <strong>${escapeHtml(role)}</strong>` : ''} with no update. That's the perfect window for a short, polite follow-up — so CLIFF wrote one for you.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.08em">YOUR DRAFT:</p>
        <div style="background:#FAFAFA;border:1px solid #E0E0E0;border-radius:10px;padding:20px;margin-bottom:28px">
          <p style="margin:0;font-size:14px;color:#333;line-height:1.7;font-style:italic;white-space:pre-line">${escapeHtml(draft)}</p>
        </div>
        <div style="text-align:center;margin:8px 0 28px">
          <a href="${appUrl}/#/FreeTierDashboard" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 32px;border-radius:100px">Review &amp; Send →</a>
        </div>
        <p style="margin:0;font-size:12px;color:#BBBBBB;line-height:1.6;text-align:center">Following up after a week roughly doubles your chance of a response.</p>
      </td></tr>
      <tr><td style="background:#F9F9F9;padding:20px 40px;text-align:center;border-top:1px solid #E5E5E5">
        <p style="margin:0;font-size:11px;color:#BBBBBB">© ${new Date().getFullYear()} College Fast Forward · <a href="${appUrl}/#UnsubscribeReengagement" style="color:#BBBBBB">Unsubscribe</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Allow system/scheduled runs (no user) or admins only — same trust model
    // as outreachFollowUpScheduler.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && !user.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = false } = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole;
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';
    const cutoff = Date.now() - DORMANT_DAYS * 86400000;

    // Oldest-updated first so the stalest applications are handled first
    const pursuits = await svc.entities.JobPursuit.filter({ application_status: 'applied' }, 'updated_date', 500);
    const dormant = (pursuits || []).filter(p =>
      p.user_email && p.company_name &&
      p.updated_date && new Date(p.updated_date).getTime() < cutoff
    );

    // One pursuit per student per run (list is already oldest-first)
    const byUser = {};
    for (const p of dormant) {
      if (!byUser[p.user_email]) byUser[p.user_email] = p;
    }

    const results = { scanned: pursuits?.length || 0, dormant: dormant.length, processed: 0, skippedDedupe: 0, skippedOptOut: 0, errors: [] };

    for (const [email, pursuit] of Object.entries(byUser)) {
      if (results.processed >= MAX_PER_RUN) break;
      try {
        // Never nudge the same pursuit twice
        const existing = await svc.entities.CliffActivity.filter(
          { job_pursuit_id: pursuit.id, activity_type: 'follow_up_due' }, '-created_date', 1
        ).catch(() => []);
        if (existing?.length) { results.skippedDedupe++; continue; }

        const daysSince = Math.round((Date.now() - new Date(pursuit.updated_date).getTime()) / 86400000);

        if (dryRun) { results.processed++; continue; }

        // Draft the follow-up message
        let draft = '';
        try {
          draft = await svc.integrations.Core.InvokeLLM({
            prompt: `Write a short, professional follow-up email (3-4 sentences, no subject line, no signature block) that a college student can send after applying to the "${pursuit.job_title || 'a role'}" position at ${pursuit.company_name} about ${daysSince} days ago with no response. Tone: polite, confident, brief. Reaffirm interest, mention one generic strength (enthusiasm and readiness to contribute), and ask if there's any update on the timeline. Output only the message text.`,
          });
          if (typeof draft !== 'string') draft = '';
        } catch { draft = ''; }
        if (!draft.trim()) {
          draft = `Hi, I applied for the ${pursuit.job_title || 'open'} position at ${pursuit.company_name} about ${daysSince} days ago and wanted to follow up. I remain very interested in the role and would love to contribute to the team. Is there any update on the hiring timeline? Thank you for your time.`;
        }

        // Surface on the dashboard
        await svc.entities.CliffActivity.create({
          user_id: pursuit.user_id,
          user_email: email,
          job_pursuit_id: pursuit.id,
          activity_type: 'follow_up_due',
          title: `Your ${pursuit.company_name} follow-up is ready to send`,
          summary: `${pursuit.job_title || 'Application'} at ${pursuit.company_name} — applied ${daysSince} days ago, no update`,
          reason: draft,
          priority: 'high',
          action_label: 'Review Follow-Up',
          action_route: 'workspace',
          company_name: pursuit.company_name,
          job_title: pursuit.job_title || '',
          status: 'new',
        });

        // Populate the pursuit's next action
        await svc.entities.JobPursuit.update(pursuit.id, {
          application_status: 'follow_up_due',
          next_action: `Send your follow-up to ${pursuit.company_name} — CLIFF drafted it for you`,
          next_action_due_date: new Date().toISOString(),
        });

        // Email the student (activity is created regardless of email opt-out)
        const prefs = await svc.entities.EmailPreference.filter({ user_email: email }).catch(() => []);
        const pref = prefs?.[0];
        if (pref && (pref.all_emails === false || pref.nudge_emails === false)) {
          results.skippedOptOut++;
        } else {
          const users = await svc.entities.User.filter({ email }).catch(() => []);
          const firstName = users?.[0]?.full_name?.split(' ')[0] || email.split('@')[0];
          const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: { email: FROM, name: FROM_NAME },
              personalizations: [{ to: [{ email }] }],
              subject: `Your ${pursuit.company_name} follow-up is ready to send`,
              content: [{ type: 'text/html', value: emailHtml({ firstName, company: pursuit.company_name, role: pursuit.job_title, daysSince, draft, appUrl }) }],
            }),
          });
          if (!res.ok) throw new Error(`SendGrid: ${await res.text()}`);
        }

        results.processed++;
      } catch (e) {
        results.errors.push({ email, error: e.message });
      }
    }

    console.log('dormantApplicationScheduler results:', JSON.stringify(results));
    return Response.json({ success: true, dryRun, ...results });
  } catch (error) {
    console.error('dormantApplicationScheduler failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}