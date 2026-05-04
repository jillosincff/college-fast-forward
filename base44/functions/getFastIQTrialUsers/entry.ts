import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

  const now = new Date();

  const fastiqUsers = allUsers.filter(u =>
    u.fastiq_trial_active === true ||
    u.trial_status === 'active' ||
    u.subscription_status === 'trialing' ||
    u.subscription_status === 'active' ||
    u.membership_tier === 'fastiq_trial' ||
    u.membership_tier === 'fastiq'
  );

  const paying = fastiqUsers.filter(u => u.subscription_status === 'active');
  const trialing = fastiqUsers.filter(u =>
    u.subscription_status === 'trialing' ||
    ((u.fastiq_trial_active === true || u.trial_status === 'active') && u.subscription_status !== 'active')
  );
  const expired = fastiqUsers.filter(u => {
    if (u.subscription_status === 'active') return false;
    if (u.trial_end_date && new Date(u.trial_end_date) <= now) return true;
    return false;
  });
  const activeTotal = fastiqUsers.filter(u => {
    if (u.subscription_status === 'active' || u.subscription_status === 'trialing') return true;
    if (u.fastiq_trial_active === true || u.trial_status === 'active') {
      if (u.trial_end_date) return new Date(u.trial_end_date) > now;
      return true;
    }
    return false;
  });

  // Return full user list with key fields only
  const userList = fastiqUsers.map(u => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    persona: u.persona,
    school_code: u.school_code || u.school_name,
    subscription_status: u.subscription_status,
    trial_status: u.trial_status,
    fastiq_trial_active: u.fastiq_trial_active,
    membership_tier: u.membership_tier,
    trial_end_date: u.trial_end_date,
    trial_start_date: u.trial_start_date,
  }));

  return Response.json({
    summary: {
      paying: paying.length,
      trialing: trialing.length,
      expired: expired.length,
      active_total: activeTotal.length,
    },
    users: userList,
  });
});