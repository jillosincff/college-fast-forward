import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AUTOMATION: Daily. Downgrades Fall Semester gifts whose Pro period (Dec 31
// 23:59 ET) has passed, back to free — UNLESS the student now has an active
// paid subscription. Mirrors the webhook's downgrade logic so gift access
// simply ends on Dec 31 as promised.

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  const callerUser = await base44.auth.me().catch(() => null);
  if (callerUser !== null && callerUser?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const runAt = new Date().toISOString();
  const nowIso = new Date().toISOString();
  const errors = [];
  let scanned = 0;
  let downgraded = 0;
  let skippedActiveSub = 0;

  try {
    const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({
      access_source: 'parent_gift_semester',
      access_state: 'pro_active',
      paid_period_ends_at: { $lt: nowIso },
    });
    scanned = plans?.length || 0;
    console.log(`[downgradeExpiredSemesterGifts] ${scanned} expired semester gift(s) to review.`);

    for (const plan of (plans || [])) {
      try {
        const userId = plan.user_id;
        if (!userId) continue;
        const user = await base44.asServiceRole.entities.User.get(userId).catch(() => null);
        // Skip if the student now has an active PAID subscription (a real
        // Stripe sub), so we never cancel paid access.
        if (user && user.subscription_status === 'active' && user.stripe_subscription_id) {
          skippedActiveSub++;
          continue;
        }

        // Downgrade the UserAccessPlan to free.
        await base44.asServiceRole.entities.UserAccessPlan.update(plan.id, {
          plan: 'free',
          access_state: 'free',
          access_source: 'parent_gift_semester',
        });

        // Clear the legacy Pro flags on the User so isFastIQ / entitlements
        // drop the student back to free (only if they don't have a paid sub).
        if (user) {
          await base44.asServiceRole.entities.User.update(user.id, {
            subscription_status: 'canceled',
            membership_tier: 'free',
            fastiq_active: false,
            is_fastiq: false,
          });
        }

        downgraded++;
        console.log(`[downgradeExpiredSemesterGifts] Downgraded ${plan.user_email || userId}`);

        base44.asServiceRole.entities.AnalyticsEvent.create({
          event_name: 'gift_semester_expired',
          user_id: userId,
          user_email: plan.user_email || '',
          properties: { source: 'downgradeExpiredSemesterGifts' },
        }).catch(() => {});
      } catch (e) {
        console.error(`[downgradeExpiredSemesterGifts] error for ${plan.user_id}:`, e.message);
        errors.push({ user_id: plan.user_id, error_message: e.message });
      }
    }
  } catch (e) {
    console.error('[downgradeExpiredSemesterGifts] fatal fetch error:', e.message);
    errors.push({ user_id: 'FETCH_ALL', error_message: e.message });
  }

  const durationMs = Date.now() - startTime;

  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'downgradeExpiredSemesterGifts',
      run_at: runAt,
      users_scanned: scanned,
      actions_taken: downgraded,
      errors,
      duration_ms: durationMs,
      details: { skippedActiveSub },
    });
  } catch (e) { console.error('[downgradeExpiredSemesterGifts] SchedulerRun write failed:', e.message); }

  if (errors.length > 0) {
    const errorList = errors.map(e => `- ${e.user_id}: ${e.error_message}`).join('\n');
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'support@collegefastforward.com',
      subject: `⚠️ downgradeExpiredSemesterGifts errors — ${new Date().toLocaleDateString()}`,
      body: `downgradeExpiredSemesterGifts ran at ${runAt} with ${errors.length} error(s):\n\n${errorList}\n\nScanned: ${scanned}, Downgraded: ${downgraded}, Skipped (active sub): ${skippedActiveSub}, Duration: ${durationMs}ms`,
    }).catch(() => {});
  }

  console.log(`[downgradeExpiredSemesterGifts] done. scanned=${scanned}, downgraded=${downgraded}, skipped=${skippedActiveSub}, errors=${errors.length}, duration=${durationMs}ms`);
  return Response.json({
    success: true,
    scanned,
    downgraded,
    skippedActiveSub,
    errors,
    duration_ms: durationMs,
  });
});