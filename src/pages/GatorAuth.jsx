import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthTokens = urlParams.has('token') || urlParams.has('access_token');

    console.log('🔄 [GatorAuth] State:', { 
      hasUser: !!user, 
      isLoading, 
      hasOAuthTokens,
      pendingRole: sessionStorage.getItem('pending_invite_role')
    });

    // If OAuth callback, wait for auth to complete
    if (hasOAuthTokens && isLoading) {
      console.log('⏳ [GatorAuth] OAuth callback - waiting for auth...');
      return;
    }

    // Handle authenticated user
    if (user && !isLoading) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Setting parent role and navigating to onboarding');
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: false
        }).then(() => {
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('Onboarding');
        }).catch(error => {
          console.error('❌ Failed to set parent role:', error);
          navigate('Onboarding');
        });
      } else {
        console.log('🎓 [GatorAuth] No pending role - going to role selection');
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
  }, [user, isLoading]);

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