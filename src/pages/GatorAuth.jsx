import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [authAttempted, setAuthAttempted] = React.useState(false);

  useEffect(() => {
    const handleParentInviteFlow = async () => {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      if (pendingRole === 'parent' && user) {
        console.log('👨‍👩‍👧 [GatorAuth] Setting parent role in user record');
        try {
          await base44.auth.updateMe({ 
            persona: 'parent',
            roles: ['parent']
          });
          console.log('✅ [GatorAuth] Parent role set, navigating to welcome');
          sessionStorage.setItem('selected_role', 'parent');
          navigate('GatorWelcome');
        } catch (error) {
          console.error('❌ Failed to set parent role:', error);
          sessionStorage.setItem('selected_role', 'parent');
          navigate('GatorWelcome');
        }
      } else {
        console.log('🎓 [GatorAuth] Navigating to role selection');
        navigate('GatorRoleSelection');
      }
    };

    // Check if returning from OAuth with tokens
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') || urlParams.has('access_token')) {
      console.log('🔄 [GatorAuth] OAuth callback detected, tokens present');
      // Wait for auth check to complete
      if (!isLoading && user) {
        console.log('✅ [GatorAuth] Auth successful');
        handleParentInviteFlow();
      }
      return;
    }

    if (!isLoading) {
      if (user) {
        console.log('✅ [GatorAuth] User authenticated');
        handleParentInviteFlow();
      } else if (!authAttempted) {
        console.log('🔐 [GatorAuth] Redirecting to Base44 login...');
        setAuthAttempted(true);
        // Callback to GatorAuth so we can handle the flow after OAuth
        const callbackUrl = `${window.location.origin}/#GatorAuth`;
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