import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loopDetected, setLoopDetected] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // LOOP DETECTION - prevent infinite redirects
    const authAttempts = parseInt(localStorage.getItem('auth_attempts') || '0');
    const lastAttempt = parseInt(localStorage.getItem('last_auth_attempt') || '0');
    const now = Date.now();
    
    // Reset counter if last attempt was >5 minutes ago
    if (now - lastAttempt > 300000) {
      localStorage.setItem('auth_attempts', '0');
    }
    
    // More lenient on mobile - allow 5 attempts instead of 3
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const maxAttempts = isMobile ? 5 : 3;
    
    // If more than max attempts in 5 minutes, show error
    if (authAttempts > maxAttempts) {
      console.error('🚨 [GatorAuth] Auth loop detected!');
      setLoopDetected(true);
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAccessToken = hashParams.has('access_token');
    const hasError = hashParams.has('error');

    // Handle OAuth errors
    if (hasError) {
      console.error('🚨 [GatorAuth] OAuth error:', hashParams.get('error'));
      alert('Authentication was cancelled or failed. Please try again.');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_role');
      window.location.href = window.location.origin + '/#LandingPage';
      return;
    }

    // No user and no token - trigger login
    if (!user && !hasAccessToken) {
      if (!redirecting) {
        console.log('🔐 [GatorAuth] Redirecting to Google login...');
        setRedirecting(true);
        
        // Use localStorage instead of sessionStorage (survives redirects better)
        const pendingRole = localStorage.getItem('pending_invite_role');
        const pendingCode = localStorage.getItem('pending_invite_code');
        
        console.log('📦 [GatorAuth] Preserving:', { pendingRole, pendingCode });
        
        // Track attempt
        localStorage.setItem('auth_attempts', String(authAttempts + 1));
        localStorage.setItem('last_auth_attempt', String(now));
        
        base44.auth.redirectToLogin(`${window.location.origin}/#GatorAuth`);
      }
      return;
    }

    // Returning from OAuth - wait for SDK
    if (hasAccessToken && !processing) {
      console.log('🔐 [GatorAuth] OAuth callback detected, waiting for SDK...');
      setProcessing(true);
      
      // Clear auth loop tracking on success
      localStorage.setItem('auth_attempts', '0');
      
      // Mobile needs more time for SDK initialization
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 10000 : 6000;
      
      console.log(`⏱️ [GatorAuth] Waiting ${waitTime}ms (mobile: ${isMobile})`);
      
      setTimeout(() => {
        const pendingRole = localStorage.getItem('pending_invite_role');
        const pendingCode = localStorage.getItem('pending_invite_code');
        
        console.log('✅ [GatorAuth] SDK ready, role:', pendingRole, 'hasCode:', !!pendingCode);
        
        if (pendingRole === 'gator') {
          window.location.href = window.location.origin + '/#GatorWelcome?role=gator';
        } else if (pendingRole === 'parent') {
          window.location.href = window.location.origin + '/#GatorWelcome?role=parent';
        } else {
          window.location.href = window.location.origin + '/#GatorRoleSelection';
        }
      }, waitTime);
      return;
    }

    // User authenticated - go to role selection
    if (user && !hasAccessToken) {
      console.log('✅ [GatorAuth] User authenticated, going to role selection');
      localStorage.setItem('auth_attempts', '0');
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