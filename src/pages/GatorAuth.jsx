import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [setupComplete, setSetupComplete] = React.useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthTokens = urlParams.has('token') || urlParams.has('access_token');

    console.log('🔄 [GatorAuth] State:', { 
      hasUser: !!user, 
      isLoading, 
      hasOAuthTokens,
      setupComplete,
      pendingRole: sessionStorage.getItem('pending_invite_role')
    });

    // If OAuth callback, wait for auth to complete
    if (hasOAuthTokens && isLoading) {
      console.log('⏳ [GatorAuth] OAuth callback - waiting for auth...');
      return;
    }

    // Once authenticated, check for parent invite flow
    if (user && !isLoading && !setupComplete) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Parent invite flow detected, setting up account...');
        setSetupComplete(true);
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: true,
          invite_code_used: pendingCode || 'direct'
        })
        .then(() => {
          console.log('✅ [GatorAuth] Parent role set, refreshing user...');
          return refreshUser();
        })
        .then(() => {
          console.log('✅ [GatorAuth] User refreshed, cleaning up...');
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Small delay then navigate
          setTimeout(() => {
            console.log('✅ [GatorAuth] Navigating to ParentDashboard');
            navigate('ParentDashboard');
          }, 500);
        })
        .catch(error => {
          console.error('❌ Failed to set parent role:', error);
          // Navigate anyway
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          navigate('ParentDashboard');
        });
      } else {
        // No pending role, go to role selection
        console.log('✅ [GatorAuth] No pending invite, navigating to role selection');
        navigate('GatorRoleSelection');
      }
      return;
    }

    // No user and not loading - redirect to login
    if (!isLoading && !user && !hasOAuthTokens) {
      console.log('🔐 [GatorAuth] Redirecting to Google OAuth...');
      const callbackUrl = `${window.location.origin}/#GatorAuth`;
      base44.auth.redirectToLogin(callbackUrl);
    }
  }, [user, isLoading, setupComplete, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center max-w-md px-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold mb-2">
          {user ? 'Setting up your account...' : 'Redirecting to Google...'}
        </p>
        <p className="text-white/80 text-sm">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;