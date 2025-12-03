import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function PreAuth() {
  const { user, isLoading } = useAuth();
  const redirectingRef = React.useRef(false);

  React.useEffect(() => {
    // If user is already authenticated, route them into the app
    if (user && !isLoading) {
      console.log('🔐 PreAuth: User authenticated, routing...', { persona: user.persona, onboarding: user.onboarding_completed });
      
      if (!user.persona) {
        navigate('WelcomeRole');
      } else if (user.onboarding_completed !== true) {
        // Route to appropriate onboarding
        if (user.persona === 'gator' || user.persona === 'student' || user.persona === 'alumni') {
          navigate('StudentOnboarding');
        } else if (user.persona === 'parent') {
          navigate('Onboarding');
        } else {
          navigate('WelcomeRole');
        }
      } else {
        // Fully onboarded - go to dashboard
        if (user.persona === 'parent') {
          navigate('ParentDashboard');
        } else {
          navigate('Dashboard');
        }
      }
      return;
    }

    // If unauthenticated and not loading, immediately go to the platform login
    if (!isLoading && !user && !redirectingRef.current) {
      redirectingRef.current = true;
      console.log('🔐 PreAuth: Redirecting to login...');
      base44.auth.redirectToLogin(window.location.origin + '/#Dashboard');
    }
  }, [user, isLoading]);

  // Simple loader while redirecting or finalizing auth
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-orange-500 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/90">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Redirecting to secure sign-in…</span>
      </div>
    </div>
  );
}

// This page is public (entry point for sign-in)
PreAuth.isPublic = true;