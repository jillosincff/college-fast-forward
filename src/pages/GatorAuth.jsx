import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // Check if we're returning from OAuth (has access_token in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAccessToken = hashParams.has('access_token');

    // No user and no token - trigger login
    if (!user && !hasAccessToken) {
      if (!redirecting) {
        console.log('🔐 [GatorAuth] Redirecting to Google login...');
        setRedirecting(true);
        sessionStorage.setItem('oauth_flow_active', 'true');
        base44.auth.redirectToLogin(`${window.location.origin}/#GatorAuth`);
      }
      return;
    }

    // Returning from OAuth - wait for SDK to process token
    if (hasAccessToken && !processing) {
      console.log('🔐 [GatorAuth] OAuth callback detected, waiting for SDK...');
      setProcessing(true);
      
      setTimeout(() => {
        console.log('✅ [GatorAuth] SDK ready, redirecting to role selection');
        window.location.href = window.location.origin + '/#GatorRoleSelection';
      }, 6000);
      return;
    }

    // User is authenticated and no token in URL - send to role selection
    if (user && !hasAccessToken) {
      console.log('✅ [GatorAuth] User authenticated, going to GatorRoleSelection');
      window.location.hash = 'GatorRoleSelection';
    }
  }, [user, isLoading, redirecting, processing]);

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