/**
 * Shared FastIQ access check — single source of truth.
 * Import this everywhere instead of inline !! checks.
 */
export const checkIsFastIQ = (user) => !!(
  user?.fastiq_setup_complete ||
  user?.subscription_status === 'active' ||
  user?.membership_tier === 'fastiq' ||
  user?.trial_status === 'active' ||
  user?.fastiq_trial_active === true ||
  user?.is_founding_member === true ||
  user?.membership_tier === 'fastiq_trial'
);