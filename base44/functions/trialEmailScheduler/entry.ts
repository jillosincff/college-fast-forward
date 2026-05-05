import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AUTOMATION: Daily at 7:00 AM ET (11:00 UTC) — runs AFTER checkTrialExpiry (6 AM ET).
// Routes each active/recently-expired trial user to the correct email template.
//
// TRIAL LENGTH IS PER-USER, COMPUTED FROM DATA — NOT A GLOBAL POLICY CONSTANT.
// Each user's trial length = Math.round((trial_end_date - trial_start_date) / 86400000)
// This means manually-extended users, gifted users, and any future variable-length trials
// are all routed correctly without touching this scheduler. Do not add a TRIAL_LENGTH_DAYS
// constant here — that's what this replaces.
//
// Routing table:
//   5-day users:  daysLeft===1 → Day4 warning; daysSinceTrial===5 → ends today; daysSinceTrial===6 → reactivate
//   7-day users:  daysLeft===2 → Day5 mid-trial; daysLeft===1 → Day6 payment/parent; daysSinceTrial===7 → ends today; daysSinceTrial===8 → reactivate
//   All lengths:  daysLeft===1 + gifted → parent notification
//
// Idempotency: checks EmailEvent entity before every send — no duplicate emails.
// After every successful send, writes an EmailEvent record.

// Check if a user already received a specific template
async function alreadyReceived(base44, userId, templateName) {
  try {
    const existing = await base44.asServiceRole.entities.EmailEvent.filter({
      user_id: userId,
      template_name: templateName,
    });
    return existing && existing.length > 0;
  } catch (_) {
    // If lookup fails, err on the side of not sending to avoid spam
    return true;
  }
}

// Write an EmailEvent record after a successful send
async function recordEmailSent(base44, user, templateName, metadata = {}) {
  try {
    await base44.asServiceRole.entities.EmailEvent.create({
      user_id: user.id,
      user_email: user.email,
      template_name: templateName,
      sent_at: new Date().toISOString(),
      school_code: user.school_code || user.school_name || user.school || '',
      metadata,
    });
  } catch (e) {
    console.error(`[trialEmailScheduler] Failed to write EmailEvent for ${user.email}:`, e.message);
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const base44 = createClientFromRequest(req);

  // Allow scheduled automation (no user) OR admin manual call
  const callerUser = await base44.auth.me().catch(() => null);
  if (callerUser !== null && callerUser?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const runAt = new Date().toISOString();
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
  const errors = [];
  const skippedInvalid = [];
  const templateCounts = {
    day5_new_model: 0,
    day5_legacy: 0,
    day6_payment: 0,
    day6_parent: 0,
    day7: 0,
    day8: 0,
    skipped_already_sent: 0,
    skipped_upgraded: 0,
    skipped_invalid_trial_length: 0,
  };

  // Fetch all users who have ever started a trial and are not yet paid/active
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
  const trialUsers = allUsers.filter(u =>
    u.trial_start_date &&
    u.subscription_status !== 'active' &&
    u.fastiq_setup_complete !== true &&
    !u.is_founding_member &&
    !u.founding_offer_redeemed
  );

  console.log(`[trialEmailScheduler] Processing ${trialUsers.length} trial users.`);

  for (const u of trialUsers) {
    try {
      // ── Compute trial length from the user's actual dates ─────────────────
      // This is the ground truth — no global policy constant, no cutover date.
      // Each user's trial length is whatever their data says it is.
      if (!u.trial_start_date || !u.trial_end_date) {
        // No end date set — can't route correctly, skip safely
        skippedInvalid.push({ user_id: u.id, reason: 'missing trial_end_date' });
        templateCounts.skipped_invalid_trial_length++;
        continue;
      }

      const trialStartMs = new Date(u.trial_start_date).getTime();
      const trialEndMs = new Date(u.trial_end_date).getTime();
      const trialLengthDays = Math.round((trialEndMs - trialStartMs) / (1000 * 60 * 60 * 24));

      // Defensive bounds: skip records with clearly bad date data
      if (isNaN(trialLengthDays) || trialLengthDays < 1 || trialLengthDays > 90) {
        console.warn(`[trialEmailScheduler] Skipping ${u.email} — invalid trial length: ${trialLengthDays} days`);
        skippedInvalid.push({ user_id: u.id, email: u.email, reason: `invalid trial length: ${trialLengthDays}` });
        templateCounts.skipped_invalid_trial_length++;
        continue;
      }

      // 5-day model = any trial ≤ 5 days; 7-day model = anything longer (legacy)
      const isNewModel = trialLengthDays <= 5;

      const trialEndDateTime = new Date(u.trial_end_date);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((trialEndDateTime - now) / (1000 * 60 * 60 * 24)));
      const daysSinceTrial = Math.floor((now - new Date(u.trial_start_date)) / (1000 * 60 * 60 * 24));

      // Skip users whose trial ended more than (trialLengthDays + 3) days ago
      if (daysSinceTrial > trialLengthDays + 3) continue;

      const firstName = u.full_name?.split(' ')[0] || 'there';
      const trialEndDate = trialEndDateTime.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
      const upgradeUrl = `${appBaseUrl}/#FastIQDashboard`;

      const payload = {
        userEmail: u.email,
        firstName,
        school: u.school_name || 'your school',
        persona: u.persona,
        trialEndDate,
        daysLeft,
        upgradeUrl,
        giftedByParent: u.gifted_by_parent_email || null,
        parentName: u.linked_parent_name || null,
        isNewModel,
      };

      // ── Route to correct email template ──────────────────────────────────
      // All daysLeft checks are relative to trial_end_date (self-correcting for any length).
      // daysSinceTrial checks must be length-aware for "ends today" and "reactivate" emails.

      // 5-DAY MODEL: 1 day before end — warning email (not gifted)
      if (isNewModel && daysLeft === 1 && !u.gifted_by_parent_email) {
        if (await alreadyReceived(base44, u.id, 'sendTrialDay5Email')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
        await recordEmailSent(base44, u, 'sendTrialDay5Email', { daysLeft, isNewModel, trialLengthDays });
        templateCounts.day5_new_model++;

      // 7-DAY LEGACY: 2 days left — mid-trial check-in (skipped for 5-day, too short)
      } else if (!isNewModel && daysLeft === 2) {
        if (await alreadyReceived(base44, u.id, 'sendTrialDay5Email')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
        await recordEmailSent(base44, u, 'sendTrialDay5Email', { daysLeft, isNewModel, trialLengthDays });
        templateCounts.day5_legacy++;

      // 7-DAY LEGACY: Day 6 — Stripe payment method nudge (not parent-gifted)
      } else if (!isNewModel && daysLeft === 1 && u.stripe_customer_id && !u.gifted_by_parent_email) {
        if (await alreadyReceived(base44, u.id, 'sendTrialPaymentReminderEmail')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
        let portalUrl = upgradeUrl;
        try {
          const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${STRIPE_SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ customer: u.stripe_customer_id, return_url: `${appBaseUrl}/#FreeTierDashboard` }),
          });
          const portalSession = await portalRes.json();
          if (portalSession.url) portalUrl = portalSession.url;
        } catch (_) {}
        await base44.asServiceRole.functions.invoke('sendTrialPaymentReminderEmail', { userEmail: u.email, firstName, portalUrl });
        await recordEmailSent(base44, u, 'sendTrialPaymentReminderEmail', { daysLeft, trialLengthDays });
        templateCounts.day6_payment++;

      // ALL MODELS: 1 day before end, parent-gifted — notify the parent
      } else if (daysLeft === 1 && u.gifted_by_parent_email) {
        if (await alreadyReceived(base44, u.id, 'sendParentTrialEndingEmail')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        let parentRecord = null;
        try {
          const parents = await base44.asServiceRole.entities.User.filter({ email: u.gifted_by_parent_email });
          parentRecord = parents?.[0] || null;
        } catch (_) {}
        if (parentRecord) {
          const parentFirstName = parentRecord.full_name?.split(' ')[0] || u.linked_parent_name || 'there';
          await base44.asServiceRole.functions.invoke('sendParentTrialEndingEmail', {
            parentEmail: u.gifted_by_parent_email,
            parentName: parentFirstName,
            studentName: firstName,
            upgradeUrl: `${appBaseUrl}/#ParentHome`,
          });
          await recordEmailSent(base44, u, 'sendParentTrialEndingEmail', { daysLeft, trialLengthDays });
          templateCounts.day6_parent++;
        }

      // ALL MODELS: Trial ends today — computed from actual trial length
      } else if (daysSinceTrial === trialLengthDays) {
        if (await alreadyReceived(base44, u.id, 'sendTrialDay7Email')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        await base44.asServiceRole.functions.invoke('sendTrialDay7Email', payload);
        await recordEmailSent(base44, u, 'sendTrialDay7Email', { daysSinceTrial, trialLengthDays });
        templateCounts.day7++;

      // ALL MODELS: Trial ended yesterday — reactivate prompt, computed from actual trial length
      } else if (daysSinceTrial === trialLengthDays + 1) {
        if (await alreadyReceived(base44, u.id, 'sendTrialDay8Email')) {
          templateCounts.skipped_already_sent++;
          continue;
        }
        await base44.asServiceRole.functions.invoke('sendTrialDay8Email', payload);
        await recordEmailSent(base44, u, 'sendTrialDay8Email', { daysSinceTrial, trialLengthDays });
        templateCounts.day8++;
      }

      // Small delay between users to avoid rate limits
      await new Promise(r => setTimeout(r, 100));

    } catch (e) {
      console.error(`[trialEmailScheduler] Error processing ${u.id} (${u.email}):`, e.message);
      errors.push({ user_id: u.id, error_message: e.message });
    }
  }

  const durationMs = Date.now() - startTime;
  const totalSent = templateCounts.day5_new_model + templateCounts.day5_legacy +
    templateCounts.day6_payment + templateCounts.day6_parent + templateCounts.day7 + templateCounts.day8;

  // Write SchedulerRun summary record
  try {
    await base44.asServiceRole.entities.SchedulerRun.create({
      automation_name: 'trialEmailScheduler',
      run_at: runAt,
      users_scanned: trialUsers.length,
      actions_taken: totalSent,
      errors,
      duration_ms: durationMs,
      details: { ...templateCounts, skipped_invalid_records: skippedInvalid },
    });
  } catch (e) {
    console.error('[trialEmailScheduler] Failed to write SchedulerRun:', e.message);
  }

  console.log(`[trialEmailScheduler] Done. sent=${totalSent}, skipped=${templateCounts.skipped_already_sent}, invalid=${templateCounts.skipped_invalid_trial_length}, errors=${errors.length}, duration=${durationMs}ms`, templateCounts);
  return Response.json({
    success: true,
    users_scanned: trialUsers.length,
    emails_sent: totalSent,
    template_breakdown: templateCounts,
    skipped_invalid: skippedInvalid,
    errors,
    duration_ms: durationMs,
  });
});