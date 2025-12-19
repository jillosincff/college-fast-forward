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

    // Extract state token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    
    const stateToken = urlParams.get('state') || hashParams.get('state');
    const hasAccessToken = hashParams.has('access_token');
    const hasError = hashParams.has('error');
    
    console.log('🔍 [GatorAuth] Detected:', { stateToken, hasAccessToken, hasError });

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

    // Returning from OAuth - wait for SDK then retrieve state from DB
    if (hasAccessToken && stateToken && !processing) {
      console.log('🔐 [GatorAuth] OAuth callback detected with state token:', stateToken);
      setProcessing(true);
      
      // Mobile needs more time for SDK initialization
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 10000 : 6000;
      
      console.log(`⏱️ [GatorAuth] Waiting ${waitTime}ms for SDK (mobile: ${isMobile})`);
      
      setTimeout(async () => {
        console.log('✅ [GatorAuth] SDK initialized, waiting for authentication...');
        
        // Poll for authentication (access token processed)
        const authStartTime = Date.now();
        const maxAuthWait = 15000;
        let authenticated = false;
        
        while (Date.now() - authStartTime < maxAuthWait) {
          try {
            const currentUser = await base44.auth.me();
            if (currentUser?.email) {
              console.log('✅ [GatorAuth] User authenticated:', currentUser.email);
              authenticated = true;
              break;
            }
          } catch (e) {
            console.log('⏳ [GatorAuth] Waiting for auth... elapsed:', (Date.now() - authStartTime) + 'ms');
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!authenticated) {
          console.error('❌ [GatorAuth] Auth timeout after 15s');
          alert('Authentication timed out. Please try again.');
          window.location.href = window.location.origin + '/#LandingPage';
          return;
        }
        
        console.log('✅ [GatorAuth] Auth complete, retrieving state...');
        
        try {
          console.log('🔍 [GatorAuth] Calling retrieveOAuthState with token:', stateToken);
          
          // Use backend function to retrieve OAuth state (bypasses auth check)
          const response = await base44.functions.invoke('retrieveOAuthState', { 
            token: stateToken 
          });
          
          console.log('📦 [GatorAuth] Full response:', response);
          
          const result = response.data || response;
          
          console.log('📋 [GatorAuth] Parsed result:', result);
          
          if (!result || !result.success || !result.role) {
            console.error('❌ [GatorAuth] Invalid state result:', result);
            alert(`Login session error: ${result?.error || 'Invalid state'}. Please try again.`);
            window.location.href = window.location.origin + '/#LandingPage';
            return;
          }
          
          console.log('✅ [GatorAuth] Retrieved state:', result);
          
          // CRITICAL: Set user role IMMEDIATELY after auth (before redirect)
          try {
            console.log('📝 [GatorAuth] Setting role:', result.role);
            const currentUser = await base44.auth.me();
            
            const updateData = {
              persona: result.role,
              roles: [result.role]
            };
            
            // Store invite code if present
            if (result.invite_code) {
              updateData.invite_code_used = result.invite_code;
            }
            
            await base44.auth.updateMe(updateData);
            console.log('✅ [GatorAuth] Role set successfully:', result.role);
          } catch (roleError) {
            console.error('⚠️ [GatorAuth] Failed to set role:', roleError);
            // Continue anyway - GatorWelcome will handle it
          }
          
          // Build redirect URL with retrieved parameters
          let redirectUrl = `${window.location.origin}/#GatorWelcome`;
          const params = new URLSearchParams();
          if (result.role) params.set('role', result.role);
          if (result.invite_code) params.set('code', result.invite_code);
          if (result.email) params.set('email', result.email);
          if (result.referral_code) params.set('ref', result.referral_code);
          
          if (params.toString()) {
            redirectUrl += '?' + params.toString();
          }
          
          console.log('🎯 [GatorAuth] Final redirect URL:', redirectUrl);
          console.log('📍 [GatorAuth] Parameters:', {
            role: result.role,
            code: result.invite_code,
            email: result.email,
            ref: result.referral_code
          });
          
          window.location.href = redirectUrl;
        } catch (error) {
          console.error('❌ [GatorAuth] Exception caught:', error);
          console.error('❌ [GatorAuth] Error message:', error.message);
          console.error('❌ [GatorAuth] Error stack:', error.stack);
          alert(`Login failed: ${error.message}. Please try again.`);
          window.location.href = window.location.origin + '/#LandingPage';
        }
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