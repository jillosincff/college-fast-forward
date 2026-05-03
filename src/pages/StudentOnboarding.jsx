import { useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

/**
 * Self-signup onboarding entry point. Redirects to the V2 narrative flow.
 * Kept as a thin wrapper so existing landing-page links and OAuth callback
 * URLs that point at #/StudentOnboarding continue to work.
 */
export default function StudentOnboarding() {
  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const search = hashPart ? `?${hashPart}` : '';
    window.location.replace(`${window.location.origin}/#/StudentOnboardingV2${search}`);
  }, []);

  // Render nothing — the redirect fires on mount.
  return null;
}

// Helper retained for any direct callers in the codebase.
export const goToStudentOnboarding = () => navigate('StudentOnboardingV2');
