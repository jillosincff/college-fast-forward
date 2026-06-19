/**
 * Shared FastIQ access check — single source of truth.
 * Import this everywhere instead of inline !! checks.
 */
export const checkIsFastIQ = (user) => {
  if (!user) return false;

  // Paid / founding access — always premium
  if (
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.is_founding_member === true ||
    user.fastiq_active === true ||
    user.is_fastiq === true
  ) return true;

  // Active trial access
  if (
    user.trial_status === 'active' ||
    user.fastiq_trial_active === true ||
    user.membership_tier === 'fastiq_trial'
  ) return true;

  // Legacy setup flag — does NOT grant access once the trial has explicitly expired
  if (user.fastiq_setup_complete && user.trial_status !== 'expired') return true;

  return false;
};

/** True when the user's premium trial ended and they haven't upgraded. */
export const checkIsTrialExpired = (user) =>
  !!user && user.trial_status === 'expired' && !checkIsFastIQ(user);