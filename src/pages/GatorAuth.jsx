import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loopDetected, setLoopDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState('Connecting to Google...');

  useEffect(() => {
    // Progress messages to show user the process is working
    const messages = [
      'Connecting to Google...',
      'Verifying your account...',
      'Almost there...',
      'Setting up your profile...'
    ];
    
    let i = 0;
    const progressInterval = setInterval(() => {
      i = (i + 1) % messages.length;
      setAuthProgress(messages[i]);
    }, 3000);
    
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Extract state token from sessionStorage (stored by Layout during OAuth callback)
    const stateToken = sessionStorage.getItem('oauth_state_token');
    const wasOAuthCallback = sessionStorage.getItem('oauth_callback_detected') === 'true';
    
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    
    const hasAccessToken = urlParams.has('access_token') || hashParams.has('access_token');
    const hasError = urlParams.has('error') || hashParams.has('error');
    
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
    if (wasOAuthCallback && stateToken && !processing) {
      console.log('🔐 [GatorAuth] OAuth callback detected with state token:', stateToken);
      setProcessing(true);
      
      // Clear session storage
      sessionStorage.removeItem('oauth_callback_detected');
      
      // Wait longer for SDK initialization and auth processing
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 20000 : 10000; // Increased: 20s mobile, 10s desktop
      
      console.log(`⏱️ [GatorAuth] Waiting ${waitTime}ms for SDK (mobile: ${isMobile})`);
      
      setTimeout(async () => {
        console.log('✅ [GatorAuth] SDK initialized, waiting for authentication...');
        
        // Poll for authentication with longer timeout
        const authStartTime = Date.now();
        const maxAuthWait = 30000; // Increased to 30 seconds
        let authenticated = false;
        let attempts = 0;
        
        while (Date.now() - authStartTime < maxAuthWait) {
          attempts++;
          try {
            const currentUser = await base44.auth.me();
            if (currentUser?.email) {
              console.log(`✅ [GatorAuth] User authenticated after ${attempts} attempts:`, currentUser.email);
              authenticated = true;
              break;
            }
          } catch (e) {
            const elapsed = Date.now() - authStartTime;
            console.log(`⏳ [GatorAuth] Attempt ${attempts}, waiting for auth... ${elapsed}ms / ${maxAuthWait}ms`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 1 second
        }
        
        if (!authenticated) {
          console.error('❌ [GatorAuth] Auth timeout after 30s');
          alert('Authentication is taking longer than expected. Please try refreshing the page or logging in again.');
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
          
          // CRITICAL: Set ALL user data from OAuthState immediately
          let stateId = null;
          try {
            console.log('📝 [GatorAuth] Setting user data from OAuthState:', result);
            stateId = result.id || result.state_id;
            
            const updateData = {
              persona: result.role,
              roles: [result.role],
              onboarding_completed: false
            };
            
            // Store all available data from OAuthState
            if (result.invite_code) updateData.invite_code_used = result.invite_code;
            if (result.email && result.role === 'gator') updateData.student_email_verified = result.email;
            if (result.referral_code) updateData.referral_code = result.referral_code;
            
            // Log current user state and update payload
            console.log('📝 [GatorAuth] About to call updateMe with:', JSON.stringify(updateData, null, 2));
            const currentUser = await base44.auth.me();
            console.log('📝 [GatorAuth] Current user state:', JSON.stringify(currentUser, null, 2));
            
            await base44.auth.updateMe(updateData);
            console.log('✅ [GatorAuth] User data saved to database');
            
            // Mark OAuthState as used to prevent reuse
            try {
              await base44.asServiceRole.entities.OAuthState.update(stateId, { used: true });
              console.log('✅ [GatorAuth] OAuthState marked as used');
            } catch (e) {
              console.warn('⚠️ [GatorAuth] Could not mark OAuthState as used:', e.message);
            }
          } catch (roleError) {
            console.error('❌ [GatorAuth] Failed to save user data:', roleError);
            console.error('❌ [GatorAuth] Error details:', {
              message: roleError.message,
              code: roleError.code,
              status: roleError.status,
              response: roleError.response
            });
            
            // Mark OAuthState as used even on failure to force fresh OAuth flow
            if (stateId) {
              try {
                await base44.asServiceRole.entities.OAuthState.update(stateId, { used: true });
              } catch (e) {
                console.warn('⚠️ [GatorAuth] Could not mark failed OAuthState as used:', e.message);
              }
            }
            
            alert('Failed to complete setup: ' + roleError.message);
            window.location.href = window.location.origin + '/#LandingPage';
            return;
          }
          
          // Set redirect flag to prevent routing race condition
          sessionStorage.setItem('oauth_redirect_in_progress', 'true');
          
          // Redirect to GatorWelcome (user data is now in database, no need for URL params or localStorage)
          const redirectUrl = `${window.location.origin}/#GatorWelcome`;
          console.log('🎯 [GatorAuth] Redirecting to:', redirectUrl);
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
          {user ? 'Setting up your account...' : authProgress}
        </p>
        <p className="text-white/80 text-sm">
          {user ? 'Almost done...' : 'This may take a few moments on mobile'}
        </p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;