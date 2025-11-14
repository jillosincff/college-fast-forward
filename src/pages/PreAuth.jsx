import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { User } from '@/entities/User';
import { Loader2 } from 'lucide-react';

export default function PreAuth() {
  const { user, isLoading } = useAuth();
  const redirectingRef = React.useRef(false);

  React.useEffect(() => {
    // If user is already authenticated, route them into the app
    if (user && !isLoading) {
      if (!user.persona) {
        navigate('WelcomeRole');
      } else if (user.onboarding_completed !== true) {
        if (user.persona === 'alumni') navigate('AlumniOnboarding');
        else if (user.persona === 'student') navigate('StudentOnboarding');
        else navigate('Onboarding');
      } else {
        navigate('Dashboard');
      }
      return;
    }

    // If unauthenticated and not loading, immediately go to the platform login
    if (!isLoading && !user && !redirectingRef.current) {
      redirectingRef.current = true;
      User.loginWithRedirect(window.location.href);
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