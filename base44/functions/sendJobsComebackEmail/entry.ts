import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import {
  APP_BASE, escapeHtml, unsubUrl, emailWrapper, darkHero, ctaButton, bodyText,
  getFirstName, sendViaSendGrid, isUnsubscribed,
} from '../../shared/cliffEmailHelpers.ts';

// ONE-TIME "CLIFF found jobs" comeback email.
// Hard cap: 40 students. Stops after 40 sends — never loops the rest.
// Criteria:
//   - persona === 'student', onboarding_completed === true, not a test account
//   - onboarded 30+ days ago (onboarding_completed_at, else created_date)
//   - not paid Pro / not active trial (no stripe_subscription_id, trial_status !== 'active', not in UserAccessPlan pro)
//   - not unsubscribed (EmailPreference.all_emails === false)
//   - skip if already tagged cliff_jobs_comeback_email_at
//   - skip if got a trial-ending/trial-ended email in the last 7 days
// Sort oldest first. Take the first 40.

const HARD_CAP = 40;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const APP_URL = `${APP_BASE}/#/FreeTierDashboard`;

function comebackEmail(firstName, unsubscribeUrl) {
  const name = escapeHtml(firstName);
  return {
    subject: 'CLIFF found jobs that match your search',
    html: emailWrapper(`
      ${darkHero('YOUR MATCHES ARE WAITING', 'CLIFF found jobs that match your search.', 'Your dashboard has roles that fit what you told us you\'re looking for.')}
      <div style="padding: 28px 36px 32px;">
        ${bodyText(`Hi ${name},`)}
        ${bodyText(`You don't need to start from scratch. Open your dashboard to see the matches waiting for you.`)}
        ${ctaButton('See my jobs →', APP_URL)}
        ${bodyText(`<br>— Jill`)}
      </div>`, unsubscribeUrl),
  };
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  // Admin-only (or scheduled automation with no user)
  const caller = await base44.auth.me().catch(() => null);
  if (caller !== null && caller?.role !== 'admin' && !caller?.roles?.includes('admin')) {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const now = new Date();
  const dormancyCutoff = new Date(now.getTime() - THIRTY_DAYS);
  const trialEmailCutoff = new Date(now.getTime() - SEVEN_DAYS);

  // ── 1. Fetch pro users (precompute set) ───────────────────────────────
  const proEmails = new Set();
  try {
    let pSkip = 0;
    while (true) {
      const proPlans = await base44.asServiceRole.entities.UserAccessPlan.filter({ plan: 'pro' }, '-created_date', 500, pSkip);
      if (!proPlans || proPlans.length === 0) break;
      proPlans.forEach(p => { if (p.user_email) proEmails.add(p.user_email.toLowerCase()); });
      if (proPlans.length < 500) break;
      pSkip += 500;
    }
  } catch {}

  // ── 2. Fetch all students, filter, sort oldest first ──────────────────
  let allStudents = [];
  let skip = 0;
  while (true) {
    const batch = await base44.asServiceRole.entities.User.filter({ persona: 'student' }, 'created_date', 500, skip);
    if (!batch || batch.length === 0) break;
    allStudents = allStudents.concat(batch);
    if (batch.length < 500) break;
    skip += 500;
    if (skip > 5000) break;
  }

  const eligible = [];
  const skipped = { pro: 0, unsubscribed: 0, trialEmail7d: 0, tooNew: 0, alreadyTagged: 0, noOnboardingDate: 0 };

  for (const u of allStudents) {
    if (u.onboarding_completed !== true || u.exclude_from_analytics === true) continue;

    const email = (u.email || '').toLowerCase();

    // Not paid Pro / not active trial
    if (u.stripe_subscription_id || u.trial_status === 'active') { skipped.pro++; continue; }
    if (proEmails.has(email)) { skipped.pro++; continue; }

    // Onboarded 30+ days ago
    const onboardingAt = u.onboarding_completed_at ? new Date(u.onboarding_completed_at) : (u.created_date ? new Date(u.created_date) : null);
    if (!onboardingAt) { skipped.noOnboardingDate++; continue; }
    if (onboardingAt > dormancyCutoff) { skipped.tooNew++; continue; }

    // Already tagged
    if (u.cliff_jobs_comeback_email_at) { skipped.alreadyTagged++; continue; }

    // Trial email in last 7 days
    const endingAt = u.cliff_trial_ending_email_at ? new Date(u.cliff_trial_ending_email_at) : null;
    const endedAt = u.cliff_trial_ended_email_at ? new Date(u.cliff_trial_ended_email_at) : null;
    if ((endingAt && endingAt > trialEmailCutoff) || (endedAt && endedAt > trialEmailCutoff)) {
      skipped.trialEmail7d++; continue;
    }

    // Unsubscribed
    if (await isUnsubscribed(base44, u.id)) { skipped.unsubscribed++; continue; }

    eligible.push({ u, onboardingAt });
  }

  // Sort oldest first (earliest onboarding date = oldest)
  eligible.sort((a, b) => a.onboardingAt.getTime() - b.onboardingAt.getTime());

  // ── 3. HARD CAP — take first 40 only ──────────────────────────────────
  const batch = eligible.slice(0, HARD_CAP);
  const overflow = eligible.length - batch.length;

  const sent = [];
  const errors = [];

  for (const { u } of batch) {
    const firstName = getFirstName(u.full_name);
    try {
      const { subject, html } = comebackEmail(firstName, unsubUrl(u.id, u.email));
      await sendViaSendGrid(u.email, subject, html);

      // Tag the user so they can never be emailed again
      await base44.asServiceRole.entities.User.update(u.id, { cliff_jobs_comeback_email_at: now.toISOString() });

      // Write ReengagementEmail tracking row
      try {
        await base44.asServiceRole.entities.ReengagementEmail.create({
          user_id: u.id,
          user_email: u.email,
          email_type: 'jobs_comeback',
          status: 'sent',
          sent_at: now.toISOString(),
          description: 'One-time CLIFF jobs comeback email (30+ day dormant)',
        });
      } catch {}

      sent.push({ id: u.id });
    } catch (e) {
      errors.push({ id: u.id, error: e.message });
    }
  }

  // ── 4. SchedulerRun summary ───────────────────────────────────────────
  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'sendJobsComebackEmail',
      run_at: now.toISOString(),
      users_scanned: allStudents.length,
      actions_taken: sent.length,
      errors,
      duration_ms: Date.now() - startTime,
      details: {
        hard_cap: HARD_CAP,
        matched_30d_dormant: eligible.length,
        sent: sent.length,
        skipped,
        overflow_not_emailed: overflow,
      },
    });
  } catch {}

  return Response.json({
    success: true,
    hard_cap: HARD_CAP,
    matched_30d_dormant: eligible.length,
    sent: sent.length,
    skipped,
    overflow_not_emailed: overflow,
    errors: errors.length,
    error_details: errors,
    duration_ms: Date.now() - startTime,
  });
});