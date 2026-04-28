import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

  // Capture every distinct combination of trial/subscription fields seen
  const buckets = {
    subscription_status_trialing: [],
    trial_status_active: [],
    fastiq_trial_active_true: [],
    membership_tier_fastiq_trial: [],
    membership_tier_fastiq: [],
    subscription_status_active_fastiq: [],
    fastiq_setup_complete_true: [],
    nothing_matched: [],
  };

  for (const u of allUsers) {
    let matched = false;
    if (u.subscription_status === 'trialing') { buckets.subscription_status_trialing.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.trial_status === 'active') { buckets.trial_status_active.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.fastiq_trial_active === true) { buckets.fastiq_trial_active_true.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.membership_tier === 'fastiq_trial') { buckets.membership_tier_fastiq_trial.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.membership_tier === 'fastiq' && u.subscription_status !== 'active') { buckets.membership_tier_fastiq.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.subscription_status === 'active' && (u.membership_tier === 'fastiq' || u.fastiq_active)) { buckets.subscription_status_active_fastiq.push({ email: u.email, fields: summarize(u) }); matched = true; }
    if (u.fastiq_setup_complete === true && !matched) { buckets.fastiq_setup_complete_true.push({ email: u.email, fields: summarize(u) }); matched = true; }
  }

  return Response.json({
    total_users: allUsers.length,
    counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    samples: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.slice(0, 3)])),
  });
});

function summarize(u) {
  return {
    subscription_status: u.subscription_status,
    trial_status: u.trial_status,
    fastiq_trial_active: u.fastiq_trial_active,
    membership_tier: u.membership_tier,
    fastiq_active: u.fastiq_active,
    fastiq_setup_complete: u.fastiq_setup_complete,
    trial_start_date: u.trial_start_date,
    trial_end_date: u.trial_end_date,
    stripe_subscription_id: u.stripe_subscription_id ? '(set)' : null,
    stripe_customer_id: u.stripe_customer_id ? '(set)' : null,
  };
}