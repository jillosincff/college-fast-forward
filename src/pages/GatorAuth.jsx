import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [authAttempted, setAuthAttempted] = React.useState(false);

  useEffect(() => {
    // Check if returning from OAuth with tokens
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') || urlParams.has('access_token')) {
      console.log('🔄 [GatorAuth] OAuth callback detected, tokens present');
      // Wait for auth check to complete
      if (!isLoading && user) {
        console.log('✅ [GatorAuth] Auth successful');
        
        // Check if user has a pending invite role (parent)
        const pendingRole = sessionStorage.getItem('pending_invite_role');
        if (pendingRole === 'parent') {
          console.log('👨‍👩‍👧 [GatorAuth] Parent invite detected, skipping role selection');
          sessionStorage.setItem('selected_role', 'parent');
          navigate('GatorWelcome');
        } else {
          console.log('🎓 [GatorAuth] Navigating to role selection');
          navigate('GatorRoleSelection');
        }
      }
      return;
    }

    if (!isLoading) {
      if (user) {
        console.log('✅ [GatorAuth] User authenticated');
        
        // Check if user has a pending invite role (parent)
        const pendingRole = sessionStorage.getItem('pending_invite_role');
        if (pendingRole === 'parent') {
          console.log('👨‍👩‍👧 [GatorAuth] Parent invite detected, skipping role selection');
          sessionStorage.setItem('selected_role', 'parent');
          navigate('GatorWelcome');
        } else {
          console.log('🎓 [GatorAuth] Navigating to role selection');
          navigate('GatorRoleSelection');
        }
      } else if (!authAttempted) {
        console.log('🔐 [GatorAuth] Redirecting to Base44 login...');
        setAuthAttempted(true);
        // Use clean callback URL without hash - Base44 needs this
        const callbackUrl = `${window.location.origin}/`;
        console.log('📍 [GatorAuth] Callback URL:', callbackUrl);
        
        base44.auth.redirectToLogin(callbackUrl);
      }
    }
  }, [user, isLoading, authAttempted]);

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