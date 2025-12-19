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
        
        // Preserve pending data in session
        const pendingRole = sessionStorage.getItem('pending_invite_role');
        const pendingReferral = sessionStorage.getItem('pending_referral_code');
        console.log('📦 [GatorAuth] Preserving session:', { pendingRole, pendingReferral });
        
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
        const pendingRole = sessionStorage.getItem('pending_invite_role');
        console.log('✅ [GatorAuth] SDK ready, pendingRole:', pendingRole);
        
        // If student with pending role, go straight to welcome
        if (pendingRole === 'gator') {
          window.location.href = window.location.origin + '/#GatorWelcome?role=gator';
        } else {
          window.location.href = window.location.origin + '/#GatorRoleSelection';
        }
      }, 6000);
      return;
    }

    // User is authenticated and no token in URL - send to role selection
    if (user && !hasAccessToken) {
      console.log('✅ [GatorAuth] User authenticated, going to GatorRoleSelection');
      window.location.hash = 'GatorRoleSelection';
    }
  }, [user, isLoading, redirecting, processing]);

  if (loopDetected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Issue</h2>
          <p className="text-slate-600 mb-6">
            We detected a login loop. This usually happens if cookies are blocked or if there was a network issue.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('auth_attempts');
              localStorage.removeItem('last_auth_attempt');
              localStorage.removeItem('pending_invite_code');
              localStorage.removeItem('pending_invite_role');
              window.location.href = window.location.origin + '/#LandingPage';
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

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