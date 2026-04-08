import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check eligibility
    const alreadyPaying = user.subscription_status === 'active';
    const alreadyTrialing = user.trial_status === 'active' || user.fastiq_trial_active;
    const hadTrialBefore = !!user.trial_start_date;

    if (alreadyPaying || alreadyTrialing || hadTrialBefore) {
      return Response.json({ 
        success: false, 
        reason: alreadyPaying ? 'already_subscribed' : alreadyTrialing ? 'already_in_trial' : 'trial_already_used',
        already_active: alreadyPaying || alreadyTrialing,
      });
    }

    // Activate trial
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    await base44.auth.updateMe({
      trial_start_date: start.toISOString(),
      trial_end_date: end.toISOString(),
      trial_status: 'active',
      fastiq_trial_active: true,
      membership_tier: 'fastiq_trial',
      subscription_status: 'trial',
    });

    // Log analytics event (fire-and-forget)
    base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name: 'fastiq_trial_started',
      user_id: user.id,
      user_email: user.email,
      school_code: user.school_name || user.school || user.university || '',
      properties: { trial_end_date: end.toISOString(), persona: user.persona || '' },
    }).catch(() => {});

    return Response.json({ 
      success: true, 
      trial_end_date: end.toISOString(),
    });
  } catch (error) {
    console.error('[activateFastIQTrial] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});