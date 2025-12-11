import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [processing, setProcessing] = React.useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthTokens = urlParams.has('token') || urlParams.has('access_token');

    console.log('🔄 [GatorAuth] State:', { 
      hasUser: !!user, 
      isLoading, 
      hasOAuthTokens,
      processing,
      pendingRole: sessionStorage.getItem('pending_invite_role'),
      pendingCode: sessionStorage.getItem('pending_invite_code')
    });

    // If OAuth callback, wait for auth to complete
    if (hasOAuthTokens && isLoading) {
      console.log('⏳ [GatorAuth] OAuth callback - waiting for auth...');
      return;
    }

    // Handle authenticated user - set parent role and go to dashboard
    if (user && !isLoading && !processing) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Setting parent role with invite code:', pendingCode);
        setProcessing(true);
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: true,
          invite_code_used: pendingCode || 'direct'
        }).then(() => {
          console.log('✅ [GatorAuth] Parent role set, cleaning up...');
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Force navigation with page reload to ensure Layout picks up new user state
          console.log('✅ [GatorAuth] Forcing navigation to ParentDashboard');
          window.location.hash = '#ParentDashboard';
          window.location.reload();
        }).catch(error => {
          console.error('❌ Failed to set parent role:', error);
          // Force navigation anyway
          window.location.hash = '#ParentDashboard';
          window.location.reload();
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
  }, [user, isLoading, processing, refreshUser]);

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