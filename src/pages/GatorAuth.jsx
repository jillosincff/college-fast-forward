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
      hasOAuthTokens
    });

    // If OAuth callback, wait for auth to complete
    if (hasOAuthTokens && isLoading) {
      console.log('⏳ [GatorAuth] OAuth callback - waiting for auth...');
      return;
    }

    // Once authenticated, navigate to Dashboard and let Layout handle the routing
    if (user && !isLoading) {
      console.log('✅ [GatorAuth] User authenticated, navigating to Dashboard');
      navigate('Dashboard');
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