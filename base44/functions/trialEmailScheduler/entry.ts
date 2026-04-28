import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  // Allow scheduled (no user) or admin manual calls
  let callerUser = null;
  try { callerUser = await base44.auth.me(); } catch (_) {}
  if (callerUser && callerUser.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allUsers = await base44.asServiceRole.entities.User.filter({});

  const trialUsers = allUsers.filter(u =>
    u.trial_start_date &&
    u.subscription_status !== 'active' &&
    u.fastiq_setup_complete !== true
  );

  // NEW MODEL (trials from 2026-04-29+): 5-day trial, CC required, auto-converts at end of day 5.
  // Day 5 email fires when daysLeft === 1 (1 day before auto-charge).
  // No Day 7/8 emails — the trial auto-converts so there's nothing to manually nudge after day 5.
  // GRANDFATHERED (trials started before 2026-04-29): old 7-day model, keep Day 7/8 emails.
  const NEW_TRIAL_CUTOFF = new Date('2026-04-29T00:00:00Z');

  const results = { day4: 0, day5: 0, day6_payment: 0, day7: 0, day8: 0, errors: [] };
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

  for (const u of trialUsers) {
    const daysSinceTrial = Math.floor(
      (Date.now() - new Date(u.trial_start_date).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const firstName = u.full_name?.split(' ')[0] || 'there';

    // Determine if this user is on the new 5-day model or grandfathered 7-day model
    const isNewModel = new Date(u.trial_start_date) >= NEW_TRIAL_CUTOFF;
    const trialDays = isNewModel ? 5 : 7;

    // Use trial_end_date if set, otherwise derive from trial_start_date
    const trialEndDateTime = u.trial_end_date
      ? new Date(u.trial_end_date)
      : new Date(new Date(u.trial_start_date).getTime() + trialDays * 24 * 60 * 60 * 1000);

    const daysLeft = Math.max(0, Math.ceil((trialEndDateTime - new Date()) / (1000 * 60 * 60 * 24)));

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

    // NEW MODEL (5-day auto-convert): Day 4 email fires 1 day before auto-charge (daysLeft===1).
    // There are no Day 7/8 emails because the trial auto-converts — no manual upgrade needed.
    //
    // LEGACY MODEL (7-day, grandfathered): Day 5 fires at daysLeft===2, Day 6 nudges, Day 7/8 upgrade prompts.

    const isDay4NewModel = isNewModel && daysLeft === 1;
    const isDay5LegacyModel = !isNewModel && daysLeft === 2;

    // Parent nudge (both models): trial ends tomorrow AND was gifted by a parent
    const isDayBeforeEndParentNudge = daysLeft === 1 && !!u.gifted_by_parent_email;

    // Legacy Day 6 payment method nudge: only for old model, Stripe-based, not parent-gifted
    const isDay6PaymentNudge = !isNewModel && daysLeft === 1 && !!u.stripe_customer_id && !u.gifted_by_parent_email;

    try {
      if (isDay4NewModel && !u.gifted_by_parent_email) {
        // New model self-signup: 1 day before auto-charge — heads-up email
        const sentToday = u.last_day5_email_sent_at &&
          new Date(u.last_day5_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day5_email_sent_at: new Date().toISOString() });
          results.day4++;
        }
      } else if (isDay5LegacyModel) {
        // Legacy model: Day 5 = 2 days left warning
        const sentToday = u.last_day5_email_sent_at &&
          new Date(u.last_day5_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day5_email_sent_at: new Date().toISOString() });
          results.day5++;
        }
      } else if (isDay6PaymentNudge) {
        // Legacy only: Day 6 payment method nudge
        const sentToday = u.last_day6_payment_email_sent_at &&
          new Date(u.last_day6_payment_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
          let portalUrl = `${appBaseUrl}/#FastIQDashboard`;
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
          await base44.asServiceRole.entities.User.update(u.id, { last_day6_payment_email_sent_at: new Date().toISOString() });
          results.day6_payment++;
        }
      } else if (isDayBeforeEndParentNudge) {
        // Both models: notify parent 1 day before student trial ends
        let parentRecord = null;
        try {
          const parents = await base44.asServiceRole.entities.User.filter({ email: u.gifted_by_parent_email });
          parentRecord = parents?.[0] || null;
        } catch (_) {}

        const alreadySentToday = parentRecord?.last_parent_day6_email_sent_at &&
          new Date(parentRecord.last_parent_day6_email_sent_at).toDateString() === new Date().toDateString();

        if (!alreadySentToday && parentRecord) {
          const parentFirstName = parentRecord.full_name?.split(' ')[0] || u.linked_parent_name || null;
          await base44.asServiceRole.functions.invoke('sendParentTrialEndingEmail', {
            parentEmail: u.gifted_by_parent_email,
            parentName: parentFirstName,
            studentName: firstName,
            upgradeUrl: `${appBaseUrl}/#ParentHome`,
          });
          await base44.asServiceRole.entities.User.update(parentRecord.id, { last_parent_day6_email_sent_at: new Date().toISOString() });
        }
      } else if (!isNewModel && daysSinceTrial === 7) {
        // Legacy only: Day 7 upgrade prompt
        const sentToday = u.last_day7_email_sent_at &&
          new Date(u.last_day7_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay7Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day7_email_sent_at: new Date().toISOString() });
          results.day7++;
        }
      } else if (!isNewModel && daysSinceTrial === 8) {
        // Legacy only: Day 8 final prompt
        const sentToday = u.last_day8_email_sent_at &&
          new Date(u.last_day8_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay8Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day8_email_sent_at: new Date().toISOString() });
          results.day8++;
        }
      }
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      results.errors.push({ email: u.email, error: e.message });
    }
  }

  console.log('Trial scheduler complete:', results);
  return Response.json({ success: true, results, note: 'day4=new_model_1_day_before_autocharge, day5=legacy_model_2_days_left' });
});