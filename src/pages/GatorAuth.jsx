import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

/**
 * Centralized routing logic - single source of truth
 */
function determineNextRoute(user, pendingRole) {
  // Highest priority: pending invite flow (new signup)
  if (pendingRole) {
    return 'GatorWelcome';
  }

  // No user - need to authenticate
  if (!user) {
    return null; // Will trigger OAuth
  }

  // Returning user with completed onboarding
  if (user.persona && user.onboarding_completed && !user.is_new_signup) {
    return user.persona === 'parent' ? 'ParentDashboard' : 'Dashboard';
  }

  // User with persona but incomplete onboarding
  if (user.persona) {
    return 'GatorWelcome';
  }

  // No persona anywhere - needs role selection
  return 'GatorRoleSelection';
}

/**
 * Update persona with verification and retry
 */
async function updatePersonaWithRetry(updateData, maxAttempts = 2) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await base44.auth.updateMe(updateData);
      
      // Wait for DB propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify update
      const currentUser = await base44.auth.me();
      
      if (currentUser.persona === updateData.persona) {
        return { success: true, user: currentUser };
      }
      
      console.warn(`⚠️ Verification failed attempt ${attempt}: got ${currentUser.persona}, expected ${updateData.persona}`);
      
      // Log mismatch (non-blocking)
      base44.functions.invoke('logPersonaMismatch', {
        user_id: currentUser.id,
        email: currentUser.email,
        expected: updateData.persona,
        actual: currentUser.persona,
        attempt,
        location: 'GatorAuth'
      }).catch(() => {});
      
    } catch (err) {
      console.error(`❌ Update attempt ${attempt} failed:`, err);
    }
  }
  
  return { success: false };
}

export default function GatorAuth() {
  const { user, isLoading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Fresh user from polling
  const [authProgress, setAuthProgress] = useState('Connecting to Google...');
  const [errorDetails, setErrorDetails] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  
  // Prevent double execution
  const processingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      processingRef.current = false;
    };
  }, []);

  // Progress messages
  useEffect(() => {
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
    if (isLoading || processingRef.current) return;

    const addLog = (msg) => {
      console.log(msg);
      if (isMountedRef.current) {
        setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
      }
    };

    // Check OAuth callback indicators
    const wasOAuthCallback = sessionStorage.getItem('oauth_callback_detected') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    const hasAccessToken = urlParams.has('access_token') || hashParams.has('access_token');
    const hasError = urlParams.has('error') || hashParams.has('error');

    // Get pending role from localStorage
    const pendingRole = localStorage.getItem('pending_invite_role');

    addLog(`🔍 State: user=${user?.email || 'none'}, oauth=${wasOAuthCallback}, token=${hasAccessToken}, role=${pendingRole}`);

    // Handle OAuth errors
    if (hasError) {
      const errorMsg = hashParams.get('error') || urlParams.get('error');
      addLog(`🚨 OAuth error: ${errorMsg}`);
      setErrorDetails({ type: 'oauth_error', message: errorMsg || 'Authentication failed' });
      return;
    }

    // CASE 1: No user and not returning from OAuth - initiate login
    if (!user && !hasAccessToken && !wasOAuthCallback) {
      addLog('🔐 No auth detected, initiating OAuth login...');
      addLog(`📋 Pending role: ${pendingRole}`);
      
      const callbackUrl = window.location.origin + '/#GatorAuth';
      base44.auth.redirectToLogin(callbackUrl);
      return;
    }

    // CASE 2: Returning from OAuth callback - process authentication
    if (wasOAuthCallback && !processing) {
      processingRef.current = true;
      setProcessing(true);
      
      // Clear session storage
      sessionStorage.removeItem('oauth_callback_detected');
      
      addLog(`🔐 OAuth callback detected. Pending role: ${pendingRole}`);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const waitTime = isMobile ? 3000 : 1500;
      
      setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        addLog('✅ SDK initialized, polling for authentication...');
        
        // Poll for authentication
        const maxAuthWait = 15000;
        const pollInterval = 500;
        let elapsed = 0;
        let currentUser = null;
        
        while (elapsed < maxAuthWait) {
          try {
            currentUser = await base44.auth.me();
            if (currentUser?.email) {
              addLog(`✅ Authenticated: ${currentUser.email} (${Math.round(elapsed/1000)}s)`);
              break;
            }
          } catch (e) {
            // Keep polling
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          elapsed += pollInterval;
          
          if (elapsed % 3000 === 0) {
            addLog(`⏳ Still waiting... ${Math.round(elapsed/1000)}s / 15s`);
          }
        }
        
        if (!currentUser?.email) {
          addLog('❌ Auth timeout after 15s');
          if (isMountedRef.current) {
            setErrorDetails({ 
              type: 'auth_timeout', 
              message: 'Authentication timed out. Please try again.'
            });
          }
          return;
        }
        
        // Determine next route
        const nextRoute = determineNextRoute(currentUser, pendingRole);
        addLog(`📋 Next route: ${nextRoute} (persona: ${currentUser.persona}, pendingRole: ${pendingRole})`);
        
        // If new signup with pending role, update persona first
        if (pendingRole && currentUser.persona !== pendingRole) {
          addLog(`📝 Updating persona to: ${pendingRole}`);
          
          const updateData = {
            persona: pendingRole,
            roles: [pendingRole],
            onboarding_completed: false,
            is_new_signup: true
          };
          
          const inviteCode = localStorage.getItem('pending_invite_code');
          const referralCode = localStorage.getItem('pending_referral_code');
          if (inviteCode) updateData.invite_code_used = inviteCode;
          if (referralCode) updateData.referral_code = referralCode;
          
          const result = await updatePersonaWithRetry(updateData);
          
          if (result.success) {
            addLog('✅ Persona set and verified');
            // Clear localStorage after successful update
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            localStorage.removeItem('pending_referral_code');
          } else {
            addLog('⚠️ Persona verification failed, but continuing (GatorWelcome will retry)');
            // Keep localStorage - GatorWelcome will handle the update
          }
        }
        
        // Navigate using helper (preserves React context)
        addLog(`🎯 Navigating to: ${nextRoute}`);
        sessionStorage.setItem('oauth_redirect_in_progress', 'true');
        navigate(nextRoute);
        
      }, waitTime);
      return;
    }

    // CASE 3: User already authenticated (no OAuth callback)
    if (user && !hasAccessToken && !wasOAuthCallback && !processing) {
      addLog(`✅ User authenticated: ${user.email}, persona: ${user.persona}, onboarded: ${user.onboarding_completed}`);
      
      const nextRoute = determineNextRoute(user, pendingRole);
      addLog(`🎯 Routing to: ${nextRoute}`);
      
      navigate(nextRoute);
    }
  }, [user, isLoading, processing]);

  // Error state
  if (errorDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center max-w-2xl bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Error</h2>
          <p className="text-slate-600 mb-4 font-semibold">{errorDetails.message}</p>
          
          {/* Debug logs */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto text-left">
            <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
              {debugLogs.join('\n')}
            </p>
          </div>
          
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
                navigate('LandingPage');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                const logs = debugLogs.join('\n') + '\n\nError: ' + JSON.stringify(errorDetails, null, 2);
                navigator.clipboard.writeText(logs);
                alert('Logs copied to clipboard!');
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

  // Loading state
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