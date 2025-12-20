import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loopDetected, setLoopDetected] = useState(false);
  const [authProgress, setAuthProgress] = useState('Connecting to Google...');
  const [errorDetails, setErrorDetails] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);

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

    const addLog = (msg) => {
      console.log(msg);
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    // Extract state token from sessionStorage (stored by Layout during OAuth callback)
    const stateToken = sessionStorage.getItem('oauth_state_token');
    const wasOAuthCallback = sessionStorage.getItem('oauth_callback_detected') === 'true';
    
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    
    const hasAccessToken = urlParams.has('access_token') || hashParams.has('access_token');
    const hasError = urlParams.has('error') || hashParams.has('error');
    const stateFromUrl = urlParams.get('state') || hashParams.get('state');
    
    addLog(`🔍 Detected: token=${stateToken?.slice(0,10)}..., fromUrl=${stateFromUrl?.slice(0,10)}..., hasAccess=${hasAccessToken}, error=${hasError}`);

    // Handle OAuth errors
    if (hasError) {
      const errorMsg = hashParams.get('error');
      addLog(`🚨 OAuth error: ${errorMsg}`);
      setErrorDetails({ type: 'oauth_error', message: errorMsg });
      return;
    }

    // No user and no token - initiate OAuth login
    if (!user && !hasAccessToken && !wasOAuthCallback) {
      addLog('🔐 No auth detected, initiating OAuth login...');
      
      // Check if we have pending role/code from role selection flow
      const pendingRole = localStorage.getItem('pending_invite_role');
      const pendingCode = localStorage.getItem('pending_invite_code');
      addLog(`📋 Pending role: ${pendingRole}, code: ${pendingCode?.slice(0,5)}...`);
      
      // Redirect to Google OAuth via Base44 SDK
      const callbackUrl = window.location.origin + '/#GatorAuth';
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // Check localStorage for pending role (from role selection flow)
    const pendingRoleFromStorage = localStorage.getItem('pending_invite_role');
    
    // Use state from URL as fallback if sessionStorage is empty (mobile issue)
    const finalStateToken = stateToken || stateFromUrl;

    // Returning from OAuth - check localStorage for role (simpler flow)
    if (wasOAuthCallback && !processing) {
      const pendingRole = localStorage.getItem('pending_invite_role');
      const pendingCode = localStorage.getItem('pending_invite_code');
      
      addLog(`🔐 OAuth callback detected. Pending role: ${pendingRole}, code: ${pendingCode?.slice(0,5)}...`);
      setProcessing(true);
      
      // Clear session storage
      sessionStorage.removeItem('oauth_callback_detected');
      
      // Wait longer for SDK initialization and auth processing
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 20000 : 10000; // Increased: 20s mobile, 10s desktop
      
      console.log(`⏱️ [GatorAuth] Waiting ${waitTime}ms for SDK (mobile: ${isMobile})`);
      
      setTimeout(async () => {
        addLog('✅ SDK initialized, waiting for authentication...');
        
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
              addLog(`✅ User authenticated after ${attempts} attempts: ${currentUser.email}`);
              authenticated = true;
              break;
            }
          } catch (e) {
            const elapsed = Date.now() - authStartTime;
            if (attempts % 5 === 0) {
              addLog(`⏳ Attempt ${attempts}, waiting... ${Math.round(elapsed/1000)}s / 30s`);
            }
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 1 second
        }
        
        if (!authenticated) {
          addLog('❌ Auth timeout after 30s');
          setErrorDetails({ 
            type: 'auth_timeout', 
            message: 'Authentication timed out after 30 seconds',
            attempts 
          });
          return;
        }
        
        addLog('✅ Auth complete, processing role...');
        
        try {
          // Get role from localStorage (set during role selection flow)
          const role = localStorage.getItem('pending_invite_role');
          const inviteCode = localStorage.getItem('pending_invite_code');
          const referralCode = localStorage.getItem('pending_referral_code');
          
          addLog(`📋 Role from localStorage: ${role}, code: ${inviteCode?.slice(0,5)}...`);
          
          if (!role) {
            addLog(`❌ No pending role found in localStorage`);
            setErrorDetails({ 
              type: 'no_role', 
              message: 'No role selected. Please start over.',
            });
            return;
          }
          
          // Create result object matching expected format
          const result = {
            success: true,
            role: role,
            invite_code: inviteCode,
            referral_code: referralCode
          };
          
          addLog(`✅ Using role: ${result.role}`);
          
          // CRITICAL: Set ALL user data from OAuthState immediately
          // This MUST override any existing persona to handle re-signups correctly
          let stateId = null;
          try {
            stateId = result.id || result.state_id;
            addLog(`📝 Setting user data for role: ${result.role} (will override any existing persona)`);
            
            const updateData = {
              persona: result.role,
              roles: [result.role],
              onboarding_completed: false, // CRITICAL: Reset onboarding for new signup flow
              is_new_signup: true // Flag to indicate this is a fresh signup
            };
            
            // Store all available data from OAuthState
            if (result.invite_code) updateData.invite_code_used = result.invite_code;
            if (result.email && result.role === 'gator') updateData.student_email_verified = result.email;
            if (result.referral_code) updateData.referral_code = result.referral_code;
            
            // CRITICAL: Also store in localStorage as backup for GatorWelcome
            // This ensures role is available even if DB update hasn't propagated yet
            localStorage.setItem('pending_invite_role', result.role);
            if (result.invite_code) localStorage.setItem('pending_invite_code', result.invite_code);
            if (result.referral_code) localStorage.setItem('pending_referral_code', result.referral_code);
            addLog(`📝 Stored role in localStorage as backup: ${result.role}`);
            
            // Log current user state and update payload
            const preUpdateUser = await base44.auth.me();
            addLog(`📝 Current user: ${preUpdateUser.email}, updating with: ${JSON.stringify(updateData)}`);
            
            await base44.auth.updateMe(updateData);
            addLog('✅ User data saved to database');
            
            // CRITICAL: Verify the update with retry loop (max 2 attempts)
            let verified = false;
            let attempts = 0;
            let currentUser;
            const MAX_VERIFY_ATTEMPTS = 2;
            
            while (attempts < MAX_VERIFY_ATTEMPTS && !verified) {
              attempts++;
              
              // Small delay before verification to allow DB propagation
              await new Promise(resolve => setTimeout(resolve, 500));
              
              currentUser = await base44.auth.me();
              
              if (currentUser.persona === result.role) {
                verified = true;
                addLog(`✅ VERIFIED on attempt ${attempts}: persona = ${currentUser.persona}`);
              } else {
                addLog(`⚠️ VERIFICATION FAILED on attempt ${attempts}: got ${currentUser.persona}, expected ${result.role}`);
                
                // Log mismatch to backend for monitoring (non-blocking)
                base44.functions.invoke('logPersonaMismatch', {
                  user_id: currentUser.id,
                  email: currentUser.email,
                  expected: result.role,
                  actual: currentUser.persona,
                  attempt: attempts,
                  location: 'GatorAuth'
                }).catch(() => {});
                
                if (attempts < MAX_VERIFY_ATTEMPTS) {
                  addLog(`🔄 Retrying update...`);
                  await base44.auth.updateMe(updateData);
                }
              }
            }
            
            if (!verified) {
              addLog(`❌ FINAL VERIFICATION FAILED after ${MAX_VERIFY_ATTEMPTS} attempts`);
              // Don't proceed - show error to user
              setErrorDetails({
                type: 'persona_verification_failed',
                message: 'Failed to save your role after multiple attempts. Please try again.',
                expected: result.role,
                actual: currentUser?.persona,
                attempts: MAX_VERIFY_ATTEMPTS
              });
              return;
            }
            
            // Clean up localStorage
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            localStorage.removeItem('pending_referral_code');
            addLog('✅ Cleaned up localStorage');
          } catch (roleError) {
            addLog(`❌ Failed to save user data: ${roleError.message}`);
            
            setErrorDetails({
              type: 'update_failed',
              message: roleError.message,
              code: roleError.code,
              status: roleError.status,
              response: roleError.response
            });
            
            return;
          }
          
          // Set redirect flag to prevent routing race condition
          sessionStorage.setItem('oauth_redirect_in_progress', 'true');
          
          // Redirect to GatorWelcome (user data is now in database, no need for URL params or localStorage)
          const redirectUrl = `${window.location.origin}/#GatorWelcome`;
          addLog(`🎯 Redirecting to: ${redirectUrl}`);
          window.location.href = redirectUrl;
        } catch (error) {
          addLog(`❌ Exception: ${error.message}`);
          setErrorDetails({
            type: 'exception',
            message: error.message,
            stack: error.stack
          });
        }
      }, waitTime);
      return;
    }

    // User authenticated without OAuth callback - go to role selection
    if (user && !hasAccessToken && !wasOAuthCallback && !processing) {
      console.log('✅ [GatorAuth] User authenticated, going to role selection');
      
      // Check if user already has a persona set - if so, go to appropriate dashboard
      if (user.persona === 'gator' && user.onboarding_completed) {
        window.location.hash = 'Dashboard';
      } else if (user.persona === 'parent' && user.onboarding_completed) {
        window.location.hash = 'ParentDashboard';
      } else if (user.persona && !user.onboarding_completed) {
        // Has persona but needs onboarding
        window.location.hash = 'GatorWelcome';
      } else {
        // No persona - needs role selection
        window.location.hash = 'GatorRoleSelection';
      }
    }
  }, [user, isLoading, processing]);

  if (errorDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center max-w-2xl bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Error</h2>
          <p className="text-slate-600 mb-4 font-semibold">
            {errorDetails.message}
          </p>
          
          {/* Debug logs */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto text-left">
            <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
              {debugLogs.join('\n')}
            </p>
          </div>
          
          {/* Error details */}
          <details className="text-left mb-6">
            <summary className="cursor-pointer text-sm text-slate-600 mb-2">Technical Details</summary>
            <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = window.location.origin + '/#LandingPage';
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                const logs = debugLogs.join('\n') + '\n\nError: ' + JSON.stringify(errorDetails, null, 2);
                navigator.clipboard.writeText(logs);
                alert('Logs copied to clipboard! Please share these with support.');
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Copy Logs
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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