import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
  const { user, isLoading, refreshUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Fresh user from polling
  const [authProgress, setAuthProgress] = useState('Connecting to Google...');
  const [errorDetails, setErrorDetails] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  
  const [showLoginOptions, setShowLoginOptions] = useState(false); // Show login screen instead of auto-redirect
  
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
    if (isLoading || processing) return;

    const addLog = (msg) => {
      console.log(msg);
      if (isMountedRef.current) {
        setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
      }
    };

    // Check OAuth callback indicators - check both URL params and hash
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    
    // Parse hash params more robustly - handle #GatorAuth?access_token=... or #access_token=... format
    let hashParams = new URLSearchParams();
    if (hashFragment.includes('access_token') || hashFragment.includes('error')) {
      // Token might be directly in hash or after ? 
      const hashQueryPart = hashFragment.includes('?') ? hashFragment.split('?')[1] : hashFragment.replace('GatorAuth', '').replace(/^&/, '');
      hashParams = new URLSearchParams(hashQueryPart);
    }
    
    const hasAccessToken = urlParams.has('access_token') || hashParams.has('access_token') || hashFragment.includes('access_token=');
    const hasError = urlParams.has('error') || hashParams.has('error') || hashFragment.includes('error=');
    const wasOAuthCallback = sessionStorage.getItem('oauth_callback_detected') === 'true';
    
    // Detect fresh OAuth callback (token in URL but not yet processed)
    const isFreshOAuthCallback = hasAccessToken && !currentUser && !wasOAuthCallback;
    
    // Get pending role from localStorage
    const pendingRole = localStorage.getItem('pending_invite_role');

    addLog(`🔍 State: user=${user?.email || 'none'}, currentUser=${currentUser?.email || 'none'}, oauth=${wasOAuthCallback}, freshOAuth=${isFreshOAuthCallback}, token=${hasAccessToken}, role=${pendingRole}`);

    // Handle OAuth errors
    if (hasError) {
      const errorMsg = hashParams.get('error') || urlParams.get('error');
      addLog(`🚨 OAuth error: ${errorMsg}`);
      setErrorDetails({ type: 'oauth_error', message: errorMsg || 'Authentication failed' });
      return;
    }

    // CASE 1: No auth at all - show login options instead of auto-redirect
    if (!user && !hasAccessToken && !wasOAuthCallback && !isFreshOAuthCallback) {
      addLog('🔐 No auth detected, showing login options...');
      addLog(`📋 Pending role: ${pendingRole}`);
      
      if (isMountedRef.current) {
        setShowLoginOptions(true);
      }
      return;
    }

    // CASE 2: Fresh OAuth callback (access_token in URL) - mark it and start polling
    if (isFreshOAuthCallback) {
      addLog('🔐 Fresh OAuth callback detected with access_token in URL');
      sessionStorage.setItem('oauth_callback_detected', 'true');
      
      // Clean URL - remove tokens from hash for security
      const cleanHash = '#GatorAuth';
      if (window.location.hash !== cleanHash) {
        window.history.replaceState(null, '', window.location.origin + cleanHash);
        addLog('🧹 Cleaned URL, starting session polling...');
      }
      
      // Fall through to polling logic below
    }

    // CASE 3: OAuth callback - poll for session with timeout
    if ((wasOAuthCallback || isFreshOAuthCallback) && !currentUser) {
      processingRef.current = true;
      setProcessing(true);
      
      // Clear session storage
      sessionStorage.removeItem('oauth_callback_detected');
      
      addLog(`🔐 OAuth callback detected. Polling for session...`);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const initialWait = isMobile ? 2000 : 1000;
      
      setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        addLog('✅ SDK initialized, polling for authentication...');
        
        // Poll for authentication with timeout
        const maxAuthWait = 15000;
        const pollInterval = 500;
        let elapsed = 0;
        let polledUser = null;
        
        while (elapsed < maxAuthWait) {
          try {
            polledUser = await base44.auth.me();
            if (polledUser?.email) {
              addLog(`✅ Session acquired: ${polledUser.email} (${Math.round(elapsed/1000)}s)`);
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
        
        if (!polledUser?.email) {
          addLog('⏰ OAuth callback timed out waiting for session');
          if (isMountedRef.current) {
            setErrorDetails({ 
              type: 'auth_timeout', 
              message: 'Login taking longer than expected. Please try again.'
            });
            processingRef.current = false;
            setProcessing(false);
          }
          return;
        }
        
        // Store polled user and let next effect cycle handle routing
        if (isMountedRef.current) {
          setCurrentUser(polledUser);
          // Don't reset processing yet - let the routing logic handle it
        }
      }, initialWait);
      return;
    }

    // CASE 3: New signup via invite (OAuth callback completed, have currentUser and pendingRole)
    if (currentUser && pendingRole) {
      addLog(`📝 New signup: updating persona to ${pendingRole}`);
      
      (async () => {
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
          localStorage.removeItem('pending_invite_role');
          localStorage.removeItem('pending_invite_code');
          localStorage.removeItem('pending_referral_code');
        } else {
          addLog('⚠️ Persona verification failed - GatorWelcome will retry');
          // Keep localStorage for GatorWelcome to handle
        }
        
        addLog('🎯 Navigating to GatorWelcome');
        navigate('GatorWelcome');
      })();
      return;
    }

    // CASE 4: Normal routing (new or returning user)
    const reliableUser = currentUser || user;
    if (reliableUser && !wasOAuthCallback) {
      addLog(`✅ Reliable user: ${reliableUser.email}, persona: ${reliableUser.persona}, onboarded: ${reliableUser.onboarding_completed}`);
      
      const nextRoute = determineNextRoute(reliableUser, pendingRole);
      addLog(`🎯 Routing to: ${nextRoute}`);
      
      navigate(nextRoute);
    }
    
    // CASE 5: Have currentUser from OAuth polling, no pendingRole - route based on user state
    if (currentUser && !pendingRole) {
      const nextRoute = determineNextRoute(currentUser, null);
      addLog(`🎯 OAuth complete, routing to: ${nextRoute}`);
      navigate(nextRoute);
    }
  }, [user, currentUser, isLoading, processing]);

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

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    const callbackUrl = window.location.origin + '/#GatorAuth';
    base44.auth.redirectToLogin(callbackUrl);
  };

  // Login options screen (Google only)
  if (showLoginOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                alt="College Fast Forward"
                className="w-20 h-20 object-contain rounded-full"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to College Fast Forward
            </h1>
            <p className="text-slate-600">Sign in to continue</p>
          </div>

          {/* Auth button */}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-14 text-base font-medium border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google (any email works)
          </Button>

          {/* Helper text */}
          <p className="text-sm text-slate-600 text-center mt-4 leading-relaxed">
            Don't have Gmail? No problem — Google sign-in works with <strong>any email address</strong>. Just click and follow the quick setup if needed.
          </p>

          {/* Hint for UF students */}
          <p className="text-xs text-slate-500 text-center mt-4 pt-4 border-t border-slate-100">
            💡 <strong>UF Students:</strong> Sign in with your @ufl.edu email for instant access
          </p>
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