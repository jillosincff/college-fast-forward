import { useEffect } from 'react';

/**
 * Parent-invite onboarding entry. Triggered via invite link:
 *   #StudentInvitedOnboarding?email=...&parent=...&school=...
 *
 * Redirects to the unified V2 flow with `entry=invited` so the welcome screen
 * shows the parent-invited copy instead of the cold-open framing.
 */
export default function StudentInvitedOnboarding() {
  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    params.set('entry', 'invited');
    const next = `${window.location.origin}/#/StudentOnboardingV2?${params.toString()}`;
    window.location.replace(next);
  }, []);

  return null;
}
