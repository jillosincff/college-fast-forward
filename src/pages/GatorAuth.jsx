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

    // Extract parameters from URL (role, code, email, ref)
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    
    // Try URL params first, then fall back to storage (Base44 SSO strips URL params)
    let role = urlParams.get('role') || hashParams.get('role');
    let code = urlParams.get('code') || hashParams.get('code');
    let email = urlParams.get('email') || hashParams.get('email');
    let ref = urlParams.get('ref') || hashParams.get('ref');
    
    // If no URL params, check storage (sessionStorage first, then localStorage)
    if (!role && !code && !email) {
      console.log('🔍 [GatorAuth] No URL params, checking storage...');
      const sessionData = sessionStorage.getItem('pending_auth_data');
      const localData = localStorage.getItem('pending_auth_data');
      const authDataStr = sessionData || localData;
      
      if (authDataStr) {
        try {
          const authData = JSON.parse(authDataStr);
          console.log('✅ [GatorAuth] Retrieved from storage:', authData);
          role = authData.role;
          code = authData.code;
          email = authData.email;
          ref = authData.ref;
        } catch (e) {
          console.error('❌ [GatorAuth] Failed to parse auth data:', e);
        }
      }
    }
    
    const hasAccessToken = hashParams.has('access_token');
    const hasError = hashParams.has('error');
    
    console.log('🔍 [GatorAuth] Final params:', { role, code, email, ref, hasAccessToken, hasError });

    // Handle OAuth errors
    if (hasError) {
      console.error('🚨 [GatorAuth] OAuth error:', hashParams.get('error'));
      alert('Authentication was cancelled or failed. Please try again.');
      window.location.href = window.location.origin + '/#LandingPage';
      return;
    }

    // No user and no token - shouldn't happen (user should come with params)
    if (!user && !hasAccessToken) {
      console.log('🔐 [GatorAuth] No auth detected, redirecting to landing...');
      window.location.href = window.location.origin + '/#LandingPage';
      return;
    }

    // Returning from OAuth - wait for SDK
    if (hasAccessToken && !processing) {
      console.log('🔐 [GatorAuth] OAuth callback detected');
      console.log('📦 [GatorAuth] Params:', { role, code, email, ref });
      setProcessing(true);
      
      // Clear auth data from storage after retrieval
      sessionStorage.removeItem('pending_auth_data');
      localStorage.removeItem('pending_auth_data');
      
      // Mobile needs more time for SDK initialization
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 10000 : 6000;
      
      console.log(`⏱️ [GatorAuth] Waiting ${waitTime}ms (mobile: ${isMobile})`);
      
      setTimeout(() => {
        console.log('✅ [GatorAuth] SDK ready, redirecting...');
        
        // Build redirect URL with parameters
        let redirectUrl = `${window.location.origin}/#GatorWelcome`;
        const params = new URLSearchParams();
        if (role) params.set('role', role);
        if (code) params.set('code', code);
        if (email) params.set('email', email);
        if (ref) params.set('ref', ref);
        
        if (params.toString()) {
          redirectUrl += '?' + params.toString();
        }
        
        console.log('🎯 [GatorAuth] Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      }, waitTime);
      return;
    }

    // User authenticated without OAuth callback - go to role selection
    if (user && !hasAccessToken) {
      console.log('✅ [GatorAuth] User authenticated, going to role selection');
      window.location.hash = 'GatorRoleSelection';
    }
  }, [user, isLoading, processing]);

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
              localStorage.clear();
              sessionStorage.clear();
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