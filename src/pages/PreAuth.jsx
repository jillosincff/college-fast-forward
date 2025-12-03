import React from 'react';
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
      console.log('🔐 PreAuth: User authenticated, routing...', { 
        email: user.email,
        persona: user.persona, 
        onboarding: user.onboarding_completed 
      });
      
      const userEmail = user.email?.toLowerCase() || '';
      const isUFLStudent = userEmail.endsWith('@ufl.edu');
      
      // No persona yet - go to role selection
      if (!user.persona && (!user.roles || user.roles.length === 0)) {
        console.log('➡️ PreAuth: No role, going to WelcomeRole');
        navigate('WelcomeRole');
        return;
      }
      
      // Has role but onboarding not complete
      if (user.onboarding_completed !== true) {
        if (user.persona === 'gator' || user.persona === 'student' || user.persona === 'alumni' || user.roles?.includes('gator')) {
          console.log('➡️ PreAuth: Gator needs onboarding');
          navigate('StudentOnboarding');
        } else if (user.persona === 'parent' || user.roles?.includes('parent')) {
          console.log('➡️ PreAuth: Parent needs onboarding');
          navigate('Onboarding');
        } else {
          console.log('➡️ PreAuth: Unknown role, going to WelcomeRole');
          navigate('WelcomeRole');
        }
        return;
      }
      
      // Fully onboarded - go to appropriate dashboard
      if (user.roles?.includes('admin')) {
        console.log('➡️ PreAuth: Admin → AdminDashboard');
        navigate('AdminDashboard');
      } else if (user.persona === 'parent' || user.roles?.includes('parent')) {
        console.log('➡️ PreAuth: Parent → ParentDashboard');
        navigate('ParentDashboard');
      } else {
        console.log('➡️ PreAuth: Gator → Dashboard');
        navigate('Dashboard');
      }
      return;
    }

    // If unauthenticated and not loading, immediately go to the platform login
    if (!isLoading && !user && !redirectingRef.current) {
      redirectingRef.current = true;
      console.log('🔐 PreAuth: Unauthenticated, redirecting to login...');
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