import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const expiredTrialUsers = await base44.asServiceRole.entities.User.filter({
    trial_status: 'active',
    trial_end_date: { $lt: new Date().toISOString() },
  });

  const results = { processed: 0, errors: [] };

  for (const u of expiredTrialUsers) {
    try {
      await base44.asServiceRole.entities.User.update(u.id, {
        trial_status: 'expired',
        fastiq_trial_active: false,
        membership_tier: 'free',
        subscription_status: 'inactive',
      });

      await base44.asServiceRole.entities.AnalyticsEvent.create({
        event_name: 'trial_ended',
        user_id: u.id,
        user_email: u.email,
        school_code: u.school_name || u.school || '',
        properties: { persona: u.persona || '', trial_end_date: u.trial_end_date || '' },
      }).catch(() => {});

      results.processed++;
    } catch (e) {
      results.errors.push({ userId: u.id, error: e.message });
    }
  }

  return Response.json({
    success: true,
    ...results,
    message: `Expired ${results.processed} trial(s).`,
  });
});