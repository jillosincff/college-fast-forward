import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import {
  APP_BASE, escapeHtml, unsubUrl, emailWrapper, darkHero, ctaButton, bodyText,
  getFirstName, sendViaSendGrid, isUnsubscribed,
} from '../../shared/cliffEmailHelpers.ts';

// AUTOMATION: Daily at 7:00 AM ET (11:00 UTC) — runs AFTER checkTrialExpiry (6 AM ET).
// Sends on-brand CliFF trial emails:
//   1. "Ends tomorrow" — trial_status active, <=1 day left
//   2. "Just ended" — trial_status expired within the last 2 days
// Skips Stripe-managed subscribers. Dedup via cliff_trial_ending_email_at / cliff_trial_ended_email_at
// compared against the user's current trial_end_date (so a new trial re-arms both emails).

const APP_URL = `${APP_BASE}/#/FreeTierDashboard`;

function endingTomorrowEmail(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Your CliFF Premium ends tomorrow',
    html: emailWrapper(`
      ${darkHero('⏳ 1 DAY LEFT', 'Your Premium access ends tomorrow.', 'Make today count — everything is still open right now.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Quick heads up — your free Premium access ends tomorrow. Until then, everything is still open: unlimited alumni searches, resume tailoring, outreach drafts, and mock interviews.`)}
        ${bodyText(`If you want to keep going after tomorrow, Premium is <strong>$4.99/week</strong> (billed monthly at $19.96). No contracts, cancel anytime.`)}
        ${ctaButton('Keep Premium — $4.99/week', APP_URL)}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. The best use of your last free day? Run an alumni search at your top target company and send one outreach message. That's how interviews start.</p>
      </div>`, unsubscribeUrl),
  };
}

function endedEmail(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'Your Premium access just ended — here\'s what you keep',
    html: emailWrapper(`
      ${darkHero('CLIFF PREMIUM', 'Your free Premium days are up.', 'You\'re back on the free plan — but your work is saved.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`Your free Premium access just ended, so you're back on the free plan. Everything you built — your pipeline, drafts, and saved alumni — is still there waiting for you.`)}
        ${bodyText(`Want full access back? Premium is <strong>$4.99/week</strong> (billed monthly at $19.96): unlimited alumni searches, resume tailoring, AI outreach drafts, and mock interview practice. Cancel anytime.`)}
        ${ctaButton('Get Premium — $4.99/week', APP_URL)}
        ${bodyText(`<br>— Jill`)}
        <p style="font-size: 13px; color: #888; margin: 0;">P.S. Students who reach out to just 3 alumni per week hear back from at least one. Premium makes those 3 messages take 10 minutes instead of an hour.</p>
      </div>`, unsubscribeUrl),
  };
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  // Allow scheduled automation (no user) OR admin manual call
  const caller = await base44.auth.me().catch(() => null);
  if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { dry_run = false } = await req.json().catch(() => ({}));

  const now = new Date();
  const sent = [];
  const errors = [];

  // ── 1. "Ends tomorrow" — active trials with <= 1 day left ─────────────
  const activeTrials = await base44.asServiceRole.entities.User.filter({
    trial_status: 'active',
    trial_end_date: { $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
  });

  for (const u of activeTrials) {
    if (u.stripe_subscription_id) continue; // Stripe sends its own billing emails
    if (new Date(u.trial_end_date) <= now) continue; // already past — handled by ended email
    // Dedup: skip if we already sent the ending email for THIS trial period
    if (u.cliff_trial_ending_email_at && new Date(u.cliff_trial_ending_email_at) > new Date(new Date(u.trial_end_date).getTime() - 4 * 24 * 60 * 60 * 1000)) continue;

    if (await isUnsubscribed(base44, u.id)) continue;

    const firstName = getFirstName(u.full_name);
    try {
      if (!dry_run) {
        const { subject, html } = endingTomorrowEmail(firstName, unsubUrl(u.id, u.email));
        await sendViaSendGrid(u.email, subject, html);
        await base44.asServiceRole.entities.User.update(u.id, { cliff_trial_ending_email_at: now.toISOString() });
      }
      sent.push({ email: u.email, type: 'ending_tomorrow' });
    } catch (e) {
      errors.push({ email: u.email, type: 'ending_tomorrow', error: e.message });
    }
  }

  // ── 2. "Just ended" — trials expired within the last 2 days ───────────
  const expiredTrials = await base44.asServiceRole.entities.User.filter({
    trial_status: 'expired',
    trial_end_date: {
      $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      $lt: now.toISOString(),
    },
  });

  for (const u of expiredTrials) {
    if (u.stripe_subscription_id) continue;
    if (u.subscription_status === 'active') continue; // converted to paid
    // Dedup: skip if ended email already sent after this trial's end date
    if (u.cliff_trial_ended_email_at && new Date(u.cliff_trial_ended_email_at) >= new Date(u.trial_end_date)) continue;

    if (await isUnsubscribed(base44, u.id)) continue;

    const firstName = getFirstName(u.full_name);
    try {
      if (!dry_run) {
        const { subject, html } = endedEmail(firstName, unsubUrl(u.id, u.email));
        await sendViaSendGrid(u.email, subject, html);
        await base44.asServiceRole.entities.User.update(u.id, { cliff_trial_ended_email_at: now.toISOString() });
      }
      sent.push({ email: u.email, type: 'ended' });
    } catch (e) {
      errors.push({ email: u.email, type: 'ended', error: e.message });
    }
  }

  // SchedulerRun summary
  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'cliffTrialEmailScheduler',
      run_at: now.toISOString(),
      users_scanned: activeTrials.length + expiredTrials.length,
      actions_taken: sent.length,
      errors,
      duration_ms: Date.now() - startTime,
      details: { dry_run, sent },
    });
  } catch {}

  return Response.json({ success: true, dry_run, sent, errors });
});