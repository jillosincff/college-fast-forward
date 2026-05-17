import { useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

export default function OnboardingQuestions() {
  useEffect(() => {
    // Old dark-themed flow — replaced by the new OnboardingFlow funnel in GatorAuth.
    navigate('/GatorAuth');
  }, []);

  return null;
}

OnboardingQuestions.isPublic = false;