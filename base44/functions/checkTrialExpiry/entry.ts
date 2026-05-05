import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AUTOMATION: Daily at 6:00 AM ET (10:00 UTC)
// Runs BEFORE trialEmailScheduler so email day-math is always computed against clean flags.
// Finds every user with trial_status:'active' whose trial_end_date is in the past,
// flips all relevant flags to expired state, writes a SchedulerRun summary record.

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  // Allow scheduled automation (no user) OR admin manual call
  const callerUser = await base44.auth.me().catch(() => null);
  if (callerUser !== null && callerUser?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const runAt = new Date().toISOString();
  const errors = [];
  let usersScanned = 0;
  let actionsThaken = 0;

  try {
    // Only expire app-level trials (no Stripe subscription).
    // Stripe-based trial users are expired by stripeWebhook via customer.subscription events.
    const candidates = await base44.asServiceRole.entities.User.filter({
      trial_status: 'active',
      trial_end_date: { $lt: new Date().toISOString() },
    });

    const expiredTrialUsers = candidates.filter(u =>
      !u.stripe_subscription_id &&
      !u.is_founding_member &&
      !u.founding_offer_redeemed
    );

    usersScanned = expiredTrialUsers.length;
    console.log(`[checkTrialExpiry] Found ${usersScanned} stale active-trial users to expire.`);

    for (const u of expiredTrialUsers) {
      try {
        // Update all flags that isFastIQ reads:
        // isFastIQ checks: fastiq_setup_complete || subscription_status==='active' || membership_tier==='fastiq'
        await base44.asServiceRole.entities.User.update(u.id, {
          trial_status: 'expired',
          fastiq_trial_active: false,
          membership_tier: 'free',
          subscription_status: 'inactive',
          fastiq_active: false,
          is_fastiq: false,
        });

        // Analytics event for tracking
        await base44.asServiceRole.entities.AnalyticsEvent.create({
          event_name: 'trial_ended',
          user_id: u.id,
          user_email: u.email,
          school_code: u.school_code || u.school_name || u.school || '',
          properties: {
            persona: u.persona || '',
            trial_end_date: u.trial_end_date || '',
            expired_by: 'checkTrialExpiry_automation',
          },
        }).catch(() => {});

        actionsThaken++;
        console.log(`[checkTrialExpiry] Expired trial for ${u.email}`);
      } catch (e) {
        console.error(`[checkTrialExpiry] Error expiring ${u.id}:`, e.message);
        errors.push({ user_id: u.id, error_message: e.message });
      }
    }
  } catch (e) {
    console.error('[checkTrialExpiry] Fatal error fetching users:', e.message);
    errors.push({ user_id: 'FETCH_ALL', error_message: e.message });
  }

  const durationMs = Date.now() - startTime;

  // Write SchedulerRun summary record
  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'checkTrialExpiry',
      run_at: runAt,
      users_scanned: usersScanned,
      actions_taken: actionsThaken,
      errors,
      duration_ms: durationMs,
      details: {},
    });
  } catch (e) {
    console.error('[checkTrialExpiry] Failed to write SchedulerRun:', e.message);
  }

  // Admin alert if there were errors
  if (errors.length > 0) {
    const errorList = errors.map(e => `- ${e.user_id}: ${e.error_message}`).join('\n');
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'support@collegefastforward.com',
      subject: `⚠️ checkTrialExpiry errors — ${new Date().toLocaleDateString()}`,
      body: `checkTrialExpiry ran at ${runAt} and encountered ${errors.length} error(s):\n\n${errorList}\n\nScanned: ${usersScanned}, Expired: ${actionsThaken}, Duration: ${durationMs}ms`,
    }).catch(() => {});
  }

  console.log(`[checkTrialExpiry] Done. scanned=${usersScanned}, expired=${actionsThaken}, errors=${errors.length}, duration=${durationMs}ms`);
  return Response.json({
    success: true,
    users_scanned: usersScanned,
    expired: actionsThaken,
    errors,
    duration_ms: durationMs,
    message: `Expired ${actionsThaken} trial(s). ${errors.length} error(s).`,
  });
});