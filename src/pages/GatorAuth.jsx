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

    // No user and no token - shouldn't happen (user should come with params)
    if (!user && !hasAccessToken) {
      addLog('🔐 No auth detected, redirecting to landing...');
      setTimeout(() => {
        window.location.href = window.location.origin + '/#LandingPage';
      }, 2000);
      return;
    }

    // Use state from URL as fallback if sessionStorage is empty (mobile issue)
    const finalStateToken = stateToken || stateFromUrl;
    
    if (!finalStateToken && hasAccessToken) {
      addLog('⚠️ No state token found - checking URL params');
      setErrorDetails({ 
        type: 'no_state_token', 
        message: 'State token missing from both sessionStorage and URL',
        stateToken,
        stateFromUrl,
        url: window.location.href
      });
      return;
    }

    // Returning from OAuth - wait for SDK then retrieve state from DB
    if (wasOAuthCallback && finalStateToken && !processing) {
      addLog(`🔐 OAuth callback detected with token: ${finalStateToken.slice(0,10)}...`);
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
        
        addLog('✅ Auth complete, retrieving state...');
        
        try {
          addLog(`🔍 Calling retrieveOAuthState with token: ${finalStateToken.slice(0,10)}...`);
          
          // Use backend function to retrieve OAuth state (bypasses auth check)
          const response = await base44.functions.invoke('retrieveOAuthState', { 
            token: finalStateToken 
          });
          
          addLog(`📦 Response received: ${JSON.stringify(response).slice(0, 100)}...`);
          
          const result = response.data || response;
          
          addLog(`📋 Parsed result - success: ${result?.success}, role: ${result?.role}`);
          
          if (!result || !result.success || !result.role) {
            addLog(`❌ Invalid state result: ${result?.error || 'No role found'}`);
            setErrorDetails({ 
              type: 'invalid_state', 
              message: result?.error || 'Invalid state or expired session',
              result: JSON.stringify(result),
              token: finalStateToken
            });
            return;
          }
          
          addLog(`✅ Retrieved state for role: ${result.role}`);
          
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
            
            // Log current user state and update payload
            const currentUser = await base44.auth.me();
            addLog(`📝 Current user: ${currentUser.email}, updating with: ${JSON.stringify(updateData)}`);
            
            await base44.auth.updateMe(updateData);
            addLog('✅ User data saved to database');
            
            // Mark OAuthState as used to prevent reuse
            try {
              await base44.asServiceRole.entities.OAuthState.update(stateId, { used: true });
              addLog('✅ OAuthState marked as used');
            } catch (e) {
              addLog(`⚠️ Could not mark OAuthState as used: ${e.message}`);
            }
          } catch (roleError) {
            addLog(`❌ Failed to save user data: ${roleError.message}`);
            
            setErrorDetails({
              type: 'update_failed',
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
                addLog(`⚠️ Could not mark failed OAuthState as used: ${e.message}`);
              }
            }
            
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
    if (user && !hasAccessToken) {
      console.log('✅ [GatorAuth] User authenticated, going to role selection');
      window.location.hash = 'GatorRoleSelection';
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