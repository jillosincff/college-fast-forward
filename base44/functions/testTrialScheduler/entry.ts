import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Test harness for trialEmailScheduler logic.
// Does NOT send real emails — simulates the scheduler against 4 synthetic users
// and verifies trigger/exclusion/idempotency behavior.
// Admin only.

function getDaysSinceTrial(trialStartDate) {
  const start = new Date(trialStartDate);
  start.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

function alreadySentToday(timestamp) {
  if (!timestamp) return false;
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

function isUpgraded(u) {
  return (
    u.subscription_status === 'active' ||
    u.membership_tier === 'fastiq' ||
    u.membership_tier === 'founding_gator' ||
    u.fastiq_setup_complete === true
  );
}

function msAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function runSchedulerLogic(user) {
  if (isUpgraded(user)) return { action: 'SKIPPED', reason: 'upgraded' };
  if (!user.trial_start_date) return { action: 'SKIPPED', reason: 'no_trial_start_date' };

  const days = getDaysSinceTrial(user.trial_start_date);

  if (days === 5) {
    if (alreadySentToday(user.last_day5_email_sent_at)) return { action: 'SKIPPED', reason: 'idempotency_day5' };
    return { action: 'SEND', email: 'sendTrialDay5Email', days };
  }
  if (days === 6 && user.stripe_customer_id && !user.gifted_by_parent_email) {
    if (alreadySentToday(user.last_day6_payment_email_sent_at)) return { action: 'SKIPPED', reason: 'idempotency_day6_payment' };
    return { action: 'SEND', email: 'sendTrialPaymentReminderEmail', days };
  }
  if (days === 6 && user.gifted_by_parent_email) {
    return { action: 'SEND', email: 'sendParentTrialEndingEmail', days };
  }
  if (days === 7) {
    if (alreadySentToday(user.last_day7_email_sent_at)) return { action: 'SKIPPED', reason: 'idempotency_day7' };
    return { action: 'SEND', email: 'sendTrialDay7Email', days };
  }
  if (days === 8) {
    if (alreadySentToday(user.last_day8_email_sent_at)) return { action: 'SKIPPED', reason: 'idempotency_day8' };
    return { action: 'SEND', email: 'sendTrialDay8Email', days };
  }
  return { action: 'NO_MATCH', days };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const now = new Date().toISOString();

  const syntheticUsers = [
    // Case 1: Day 5 — should trigger sendTrialDay5Email
    {
      id: 'seed-1',
      email: 'seed-day5@cff-test.com',
      trial_start_date: msAgo(5),
      subscription_status: null,
      membership_tier: null,
    },
    // Case 2: Day 6, Stripe user — should trigger sendTrialPaymentReminderEmail
    {
      id: 'seed-2',
      email: 'seed-day6@cff-test.com',
      trial_start_date: msAgo(6),
      subscription_status: null,
      membership_tier: null,
      stripe_customer_id: 'cus_test_seed',
    },
    // Case 3: Day 7, subscription_status active — should be SKIPPED
    {
      id: 'seed-3',
      email: 'seed-day7-active@cff-test.com',
      trial_start_date: msAgo(7),
      subscription_status: 'active',
    },
    // Case 4: Day 7, membership_tier founding_gator — should be SKIPPED
    {
      id: 'seed-4',
      email: 'seed-day7-founding@cff-test.com',
      trial_start_date: msAgo(7),
      membership_tier: 'founding_gator',
    },
    // Case 5: Idempotency — Day 5, already sent today → should be SKIPPED
    {
      id: 'seed-5',
      email: 'seed-day5-idempotent@cff-test.com',
      trial_start_date: msAgo(5),
      subscription_status: null,
      last_day5_email_sent_at: now, // already sent today
    },
    // Case 6: UTC boundary — trial started at 23:00 UTC yesterday (should be day 1, not day 0)
    {
      id: 'seed-6',
      email: 'seed-utc-boundary@cff-test.com',
      trial_start_date: (() => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - 1);
        d.setUTCHours(23, 0, 0, 0); // 11pm UTC yesterday
        return d.toISOString();
      })(),
      subscription_status: null,
    },
  ];

  const results = syntheticUsers.map(u => {
    const days = u.trial_start_date ? getDaysSinceTrial(u.trial_start_date) : null;
    const result = runSchedulerLogic(u);
    return { id: u.id, email: u.email, days_since_trial: days, ...result };
  });

  const pass = (
    results[0].action === 'SEND' && results[0].email === 'sendTrialDay5Email' &&        // Case 1 ✅
    results[1].action === 'SEND' && results[1].email === 'sendTrialPaymentReminderEmail' && // Case 2 ✅
    results[2].action === 'SKIPPED' && results[2].reason === 'upgraded' &&               // Case 3 ✅
    results[3].action === 'SKIPPED' && results[3].reason === 'upgraded' &&               // Case 4 ✅
    results[4].action === 'SKIPPED' && results[4].reason === 'idempotency_day5' &&       // Case 5 ✅
    results[5].days_since_trial === 1                                                     // Case 6 ✅
  );

  return Response.json({
    overall: pass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED',
    cases: results,
  });
});