import { base44 } from '@/api/base44Client';

/**
 * Attempt to activate a 7-day FastIQ trial for the current user.
 * Safe to call multiple times — server checks eligibility.
 * Pass refreshUser to update local auth state after activation.
 */
export async function maybeActivateTrial(user, refreshUser) {
  if (!user) return false;

  // Already has FastIQ access — no trial needed
  const hasFastIQ = !!(
    user.fastiq_setup_complete ||
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.fastiq_trial_active ||
    user.trial_status === 'active' ||
    user.membership_tier === 'fastiq_trial'
  );
  if (hasFastIQ) return false;

  try {
    const res = await base44.functions.invoke('activateFastIQTrial', {});
    const data = res?.data || res;
    if (data?.success && refreshUser) {
      await refreshUser().catch(() => {});
    }
    return !!data?.success;
  } catch (e) {
    console.error('[trialActivation] Failed:', e);
    return false;
  }
}