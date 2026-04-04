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

  for (const u of trialUsers) {
    const daysSinceTrial = Math.floor(
      (Date.now() - new Date(u.trial_start_date).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const firstName = u.full_name?.split(' ')[0] || 'there';
    const trialEndDate = new Date(
      new Date(u.trial_start_date).getTime() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const payload = {
      userEmail: u.email,
      firstName,
      school: u.school_name || 'your school',
      persona: u.persona,
      trialEndDate,
    };

    try {
      if (daysSinceTrial === 5) {
        await base44.asServiceRole.functions.invoke('sendTrialDay5Email', payload);
        results.day5++;
      } else if (daysSinceTrial === 7) {
        await base44.asServiceRole.functions.invoke('sendTrialDay7Email', payload);
        results.day7++;
      } else if (daysSinceTrial === 8) {
        await base44.asServiceRole.functions.invoke('sendTrialDay8Email', payload);
        results.day8++;
      }
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      results.errors.push({ email: u.email, error: e.message });
    }
  }

  console.log('Trial scheduler complete:', results);
  return Response.json({ success: true, results });
});