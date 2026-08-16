// Shared soft-wall entitlement check for gated CLIFF features (Section 5).
// Free users may run a gated feature ONLY during the one-time Magic Moment;
// every subsequent call returns a paywall signal. Pro users always pass.

export function isProUser(user: any): boolean {
  if (!user) return false;
  return user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.is_founding_member === true ||
    user.fastiq_active === true ||
    user.is_fastiq === true ||
    user.trial_status === 'active' ||
    user.fastiq_trial_active === true ||
    user.membership_tier === 'fastiq_trial' ||
    (user.fastiq_setup_complete && user.trial_status !== 'expired');
}

// `magicMomentFlag` is the client's declaration that this call is part of the
// one-time free Magic Moment cycle. The server verifies it against the user's
// UserAccessPlan.magic_moment_status — once the cycle is completed, the flag
// no longer bypasses the gate.
export async function canRunGated(base44: any, user: any, magicMomentFlag: any): Promise<boolean> {
  if (isProUser(user)) return true;
  if (!magicMomentFlag) return false; // dashboard / repeat use by a free user → paywall
  try {
    const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
    const plan = plans?.[0];
    if (!plan) return true; // first-time free cycle, no plan record yet
    return plan.magic_moment_status !== 'completed';
  } catch (e) {
    return true; // don't break the magic moment on a transient read error
  }
}

export const SOFT_WALL_MESSAGE = "You've used your free cycle. Upgrade to CLIFF Pro to keep running the plan.";