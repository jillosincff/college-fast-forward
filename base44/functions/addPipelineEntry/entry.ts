import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FREE_LIMIT = 5;

function checkIsFastIQ(user) {
  if (!user) return false;
  if (
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.is_founding_member === true
  ) return true;
  if (
    user.trial_status === 'active' ||
    user.fastiq_trial_active === true ||
    user.membership_tier === 'fastiq_trial'
  ) return true;
  if (user.fastiq_setup_complete && user.trial_status !== 'expired') return true;
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Premium users bypass the cap entirely
    if (!checkIsFastIQ(user)) {
      const existing = await base44.entities.NetworkingPipeline.filter({ user_email: user.email });
      if (existing.length >= FREE_LIMIT) {
        return Response.json({
          error: 'free_limit_reached',
          message: `Free accounts are limited to ${FREE_LIMIT} pipeline entries. Upgrade to CLiFF Premium for unlimited tracking.`,
          count: existing.length,
          limit: FREE_LIMIT,
        }, { status: 403 });
      }
    }

    // Create the entry
    const record = await base44.entities.NetworkingPipeline.create({
      ...data,
      user_email: user.email,
    });

    return Response.json({ success: true, record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});