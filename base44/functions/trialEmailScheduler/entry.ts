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

  const results = { day5: 0, day7: 0, day8: 0, errors: [] };
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

  for (const u of trialUsers) {
    const daysSinceTrial = Math.floor(
      (Date.now() - new Date(u.trial_start_date).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const firstName = u.full_name?.split(' ')[0] || 'there';

    // Use trial_end_date if set, otherwise derive from trial_start_date
    const trialEndDateTime = u.trial_end_date
      ? new Date(u.trial_end_date)
      : new Date(new Date(u.trial_start_date).getTime() + 7 * 24 * 60 * 60 * 1000);

    const daysLeft = Math.max(0, Math.ceil((trialEndDateTime - new Date()) / (1000 * 60 * 60 * 24)));

    const trialEndDate = trialEndDateTime.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });

    const upgradeUrl = `${appBaseUrl}/#FastIQDashboard`;

    // Day 5 trigger: trial_end_date is exactly 2 days away
    const isDay5 = daysLeft === 2;

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
    };

    // Day 6 parent nudge: trial ends tomorrow AND was gifted by a parent
    const isDay6ParentNudge = daysLeft === 1 && !!u.gifted_by_parent_email;

    try {
      if (isDay5) {
        const sentToday = u.last_day5_email_sent_at &&
          new Date(u.last_day5_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day5_email_sent_at: new Date().toISOString() });
          results.day5++;
        }
      } else if (isDay6ParentNudge) {
        const sentToday = u.last_parent_nudge_email_sent_at &&
          new Date(u.last_parent_nudge_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          // Look up the parent's name
          let parentFirstName = u.linked_parent_name || null;
          if (!parentFirstName) {
            try {
              const parents = await base44.asServiceRole.entities.User.filter({ email: u.gifted_by_parent_email });
              parentFirstName = parents?.[0]?.full_name?.split(' ')[0] || null;
            } catch (_) {}
          }
          await base44.asServiceRole.functions.invoke('sendParentTrialEndingEmail', {
            parentEmail: u.gifted_by_parent_email,
            parentName: parentFirstName,
            studentName: firstName,
            upgradeUrl: `${appBaseUrl}/#ParentHome`,
          });
          await base44.asServiceRole.entities.User.update(u.id, { last_parent_nudge_email_sent_at: new Date().toISOString() });
        }
      } else if (daysSinceTrial === 7) {
        const sentToday = u.last_day7_email_sent_at &&
          new Date(u.last_day7_email_sent_at).toDateString() === new Date().toDateString();
        if (!sentToday) {
          await base44.asServiceRole.functions.invoke('sendTrialDay7Email', payload);
          await base44.asServiceRole.entities.User.update(u.id, { last_day7_email_sent_at: new Date().toISOString() });
          results.day7++;
        }
      } else if (daysSinceTrial === 8) {
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
  return Response.json({ success: true, results });
});