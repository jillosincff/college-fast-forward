import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [authAttempted, setAuthAttempted] = React.useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthTokens = urlParams.has('token') || urlParams.has('access_token');

    // If OAuth callback, wait for auth to complete
    if (hasOAuthTokens) {
      console.log('🔄 [GatorAuth] OAuth callback detected, waiting for auth...');
      if (isLoading) {
        console.log('⏳ [GatorAuth] Still loading auth state...');
        return;
      }
      if (!user) {
        console.log('⚠️ [GatorAuth] Auth complete but no user - retrying...');
        return;
      }
    }

    // Handle authenticated user
    if (user && !isLoading) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Parent invite flow - setting role');
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: false
        }).then(() => {
          console.log('✅ [GatorAuth] Parent role set');
          return refreshUser();
        }).then(() => {
          console.log('✅ [GatorAuth] Navigating to parent onboarding');
          sessionStorage.setItem('selected_role', 'parent');
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          navigate('Onboarding');
        }).catch(error => {
          console.error('❌ Failed to set parent role:', error);
          sessionStorage.setItem('selected_role', 'parent');
          navigate('Onboarding');
        });
      } else {
        console.log('🎓 [GatorAuth] No pending role - going to role selection');
        navigate('GatorRoleSelection');
      }
      return;
    }

    // No user and not loading - need to authenticate
    if (!isLoading && !user && !authAttempted && !hasOAuthTokens) {
      console.log('🔐 [GatorAuth] No user - redirecting to login');
      setAuthAttempted(true);
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
    }
  }, [user, isLoading, authAttempted, refreshUser]);

  // Show loading spinner while checking auth or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Redirecting to login...</p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;