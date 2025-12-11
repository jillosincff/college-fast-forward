import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  const [authAttempted, setAuthAttempted] = React.useState(false);
  const [processingAuth, setProcessingAuth] = React.useState(false);
  const [redirectError, setRedirectError] = React.useState(false);

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
    if (user && !isLoading && !processingAuth) {
      const pendingRole = sessionStorage.getItem('pending_invite_role');
      
      if (pendingRole === 'parent') {
        console.log('👨‍👩‍👧 [GatorAuth] Parent invite flow - setting role');
        setProcessingAuth(true);
        
        base44.auth.updateMe({ 
          persona: 'parent',
          roles: ['parent'],
          onboarding_completed: false
        }).then(() => {
          console.log('✅ [GatorAuth] Parent role set, refreshing user');
          return refreshUser();
        }).then(() => {
          console.log('✅ [GatorAuth] User refreshed, cleaning session');
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
          
          // Navigate to onboarding
          console.log('✅ [GatorAuth] Navigating to parent onboarding');
          setTimeout(() => navigate('Onboarding'), 100);
        }).catch(error => {
          console.error('❌ Failed to set parent role:', error);
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
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
      console.log('🔐 [GatorAuth] No user - initiating login redirect');
      setAuthAttempted(true);
      
      try {
        const callbackUrl = `${window.location.origin}/#GatorAuth`;
        console.log('🔗 [GatorAuth] Callback URL:', callbackUrl);
        
        // Force redirect using window.location as fallback
        setTimeout(() => {
          if (!redirectError) {
            console.log('⚠️ [GatorAuth] Redirect timeout - using fallback');
            window.location.href = `https://base44.app/auth/login?redirect=${encodeURIComponent(callbackUrl)}`;
          }
        }, 2000);
        
        base44.auth.redirectToLogin(callbackUrl);
      } catch (error) {
        console.error('❌ [GatorAuth] Redirect failed:', error);
        setRedirectError(true);
      }
    }
  }, [user, isLoading, authAttempted, refreshUser, processingAuth, redirectError]);

  // Show loading spinner while checking auth or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center max-w-md px-4">
        {!redirectError ? (
          <>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">
              {processingAuth ? 'Setting up your account...' : 'Redirecting to login...'}
            </p>
            <p className="text-white/80 text-sm">
              You'll be redirected to Google sign-in in a moment
            </p>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-white text-lg font-semibold mb-4">
              Redirect Issue
            </p>
            <p className="text-white/80 text-sm mb-4">
              If you're not redirected automatically, click below:
            </p>
            <button
              onClick={() => {
                const callbackUrl = `${window.location.origin}/#GatorAuth`;
                window.location.href = `https://base44.app/auth/login?redirect=${encodeURIComponent(callbackUrl)}`;
              }}
              className="bg-white text-[#0021A5] font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;