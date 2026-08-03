import { useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

/**
 * There is ONE student onboarding flow — the full question funnel hosted in
 * GatorAuth. The old 3-screen shortcut ("Flow B") is gone; this route only
 * exists so old links and bookmarks land in the right place.
 */
export default function StudentOnboarding() {
  useEffect(() => { navigate('/GatorAuth'); }, []);
  return null;
}