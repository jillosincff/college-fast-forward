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

    // Check OAuth callback indicators
    const wasOAuthCallback = sessionStorage.getItem('oauth_callback_detected') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const hashFragment = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashFragment.includes('?') ? hashFragment.split('?')[1] : '');
    const hasAccessToken = urlParams.has('access_token') || hashParams.has('access_token');
    const hasError = urlParams.has('error') || hashParams.has('error');
    
    // Check for magic_token in URL (new direct flow - skips MagicLogin page)
    const magicToken = hashParams.get('magic_token') || urlParams.get('magic_token');
    const magicRole = hashParams.get('role') || urlParams.get('role');

    // Get pending role from localStorage
    const pendingRole = localStorage.getItem('pending_invite_role');
    
    // Check for POST-MAGIC LINK context (user verified via magic link, now completing OAuth)
    const postMagicVerified = localStorage.getItem('post_magic_verified') === 'true';
    const postMagicEmail = localStorage.getItem('post_magic_email');
    const postMagicRole = localStorage.getItem('post_magic_role');
    const postMagicTimestamp = parseInt(localStorage.getItem('post_magic_timestamp') || '0');
    const magicLinkExpired = postMagicTimestamp && (Date.now() - postMagicTimestamp > 10 * 60 * 1000); // 10 min expiry

    addLog(`🔍 State: user=${user?.email || 'none'}, currentUser=${currentUser?.email || 'none'}, oauth=${wasOAuthCallback}, token=${hasAccessToken}, role=${pendingRole}`);
    addLog(`📧 Magic link: verified=${postMagicVerified}, email=${postMagicEmail}, role=${postMagicRole}`);
    addLog(`🔗 URL magic_token: ${magicToken ? 'present' : 'none'}, role=${magicRole}`);

    // Handle OAuth errors
    if (hasError) {
      const errorMsg = hashParams.get('error') || urlParams.get('error');
      addLog(`🚨 OAuth error: ${errorMsg}`);
      setErrorDetails({ type: 'oauth_error', message: errorMsg || 'Authentication failed' });
      return;
    }

    // CASE -1: DIRECT MAGIC TOKEN IN URL - verify and start OAuth
    // This is the new simplified flow: email link → GatorAuth?magic_token=xxx → verify → OAuth → done
    if (magicToken && !processingRef.current) {
      processingRef.current = true;
      setProcessing(true);
      setAuthProgress('Verifying your email...');
      addLog(`🔐 Magic token detected: ${magicToken.substring(0, 10)}...`);
      
      (async () => {
        try {
          // Verify the magic token via backend
          const verifyRes = await base44.functions.invoke('verifyMagicLink', { token: magicToken });
          
          if (verifyRes?.data?.success) {
            const verifiedEmail = verifyRes.data.email;
            addLog(`✅ Magic link verified for: ${verifiedEmail}`);
            
            // Store context for after OAuth completes
            localStorage.setItem('post_magic_verified', 'true');
            localStorage.setItem('post_magic_email', verifiedEmail);
            localStorage.setItem('post_magic_role', magicRole || 'parent');
            localStorage.setItem('post_magic_timestamp', Date.now().toString());
            localStorage.setItem('pending_invite_role', magicRole || 'parent');
            
            // Clean URL and start OAuth
            const cleanUrl = window.location.origin + '/#GatorAuth';
            window.history.replaceState(null, '', cleanUrl);
            
            addLog('🚀 Starting Google OAuth...');
            setAuthProgress('Connecting to Google...');
            
            // Small delay then redirect to Google OAuth
            setTimeout(() => {
              base44.auth.redirectToLogin(cleanUrl);
            }, 500);
          } else {
            throw new Error(verifyRes?.data?.error || 'Invalid or expired link');
          }
        } catch (err) {
          addLog(`❌ Magic link verification failed: ${err.message}`);
          processingRef.current = false;
          setProcessing(false);
          setErrorDetails({
            type: 'magic_link_invalid',
            message: 'This sign-in link is invalid or expired. Please request a new one.'
          });
        }
      })();
      
      return;
    }

    // Clear expired magic link context
    if (magicLinkExpired) {
      addLog('⏰ Magic link context expired, clearing...');
      localStorage.removeItem('post_magic_verified');
      localStorage.removeItem('post_magic_email');
      localStorage.removeItem('post_magic_role');
      localStorage.removeItem('post_magic_timestamp');
      localStorage.removeItem('post_magic_needs_onboarding');
    }
    
    // CASE 0: POST-MAGIC LINK FLOW - user verified email, now has OAuth session
    // This is the key integration point for magic link users
    if (postMagicVerified && !magicLinkExpired && user) {
      addLog(`🔮 Post-magic link flow detected for: ${postMagicEmail}`);
      
      // Helper to clear post-magic context
      const clearPostMagicContext = () => {
        localStorage.removeItem('post_magic_verified');
        localStorage.removeItem('post_magic_email');
        localStorage.removeItem('post_magic_role');
        localStorage.removeItem('post_magic_timestamp');
        localStorage.removeItem('post_magic_needs_onboarding');
      };
      
      // Verify email match (security check)
      if (user.email?.toLowerCase() !== postMagicEmail?.toLowerCase()) {
        addLog(`⚠️ Email mismatch! Magic: ${postMagicEmail}, OAuth: ${user.email}`);
        clearPostMagicContext();
        
        setErrorDetails({
          type: 'email_mismatch',
          message: `Please sign in with ${postMagicEmail} to continue. You signed in with ${user.email}.`
        });
        return;
      }
      
      const targetRole = postMagicRole || 'parent';
      
      // SUCCESS: User persona is already set correctly - navigate now!
      if (user.persona === targetRole) {
        addLog(`✅ Persona already matches in state: ${user.persona} - navigating`);
        clearPostMagicContext();
        navigate('GatorWelcome');
        return;
      }
      
      // Update if not processing
      if (!processingRef.current) {
        processingRef.current = true;
        setProcessing(true);
        setAuthProgress('Finalizing your role...');
        
        addLog(`📝 Updating persona to "${targetRole}"`);
        
        (async () => {
          try {
            await base44.auth.updateMe({
              persona: targetRole,
              roles: [targetRole],
              onboarding_completed: false,
              is_new_signup: true,
              magic_link_verified: true
            });
            
            addLog('✅ Update sent to server');
            
            // Force refresh and wait
            await refreshUser();
            
            // Double-check with manual me() call - don't rely on context
            addLog('🔍 Verifying with direct me() call...');
            const freshUser = await base44.auth.me();
            
            if (freshUser.persona === targetRole) {
              addLog(`✅ Persona CONFIRMED via me(): ${freshUser.persona}`);
              clearPostMagicContext();
              navigate('GatorWelcome');
            } else {
              addLog(`⚠️ Persona still "${freshUser.persona}", trying double refresh...`);
              // Double-call refreshUser to force cache bust
              await refreshUser();
              
              // Final check
              const finalUser = await base44.auth.me();
              if (finalUser.persona === targetRole) {
                addLog(`✅ Persona confirmed after double refresh: ${finalUser.persona}`);
                clearPostMagicContext();
                navigate('GatorWelcome');
              } else {
                addLog(`❌ Persona update not propagating. Expected "${targetRole}", got "${finalUser.persona}"`);
                // Navigate anyway - the persona should be set server-side
                clearPostMagicContext();
                navigate('GatorWelcome');
              }
            }
            
          } catch (err) {
            addLog(`❌ Update failed: ${err.message}`);
            clearPostMagicContext();
            setErrorDetails({ 
              type: 'setup_failed',
              message: 'Setup failed. Try refreshing or signing in again.' 
            });
          } finally {
            processingRef.current = false;
            setProcessing(false);
          }
        })();
      }
      
      return; // Don't navigate here - async block handles it
    }

    // CASE 1: No auth at all - show login options instead of auto-redirect
    if (!user && !hasAccessToken && !wasOAuthCallback) {
      addLog('🔐 No auth detected, showing login options...');
      addLog(`📋 Pending role: ${pendingRole}`);
      
      if (isMountedRef.current) {
        setShowLoginOptions(true);
      }
      return;
    }

    // CASE 2: OAuth callback - poll for session with timeout
    if (wasOAuthCallback && !currentUser) {
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

  // Pre-fill email from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    if (urlEmail) {
      setMagicLinkEmail(urlEmail);
      setShowMagicLink(true);
    }
  }, []);

  // Magic link handler - uses backend function to send via SendGrid
  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!magicLinkEmail.trim()) {
      setMagicLinkStatus('error');
      setMagicLinkMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setMagicLinkStatus('loading');
    setMagicLinkMessage('Sending your secure login link...');

    const emailLower = magicLinkEmail.toLowerCase().trim();

    try {
      // Use our backend function to send magic link via SendGrid
      const res = await sendMagicLinkEmail({ email: emailLower });
      
      if (res?.data?.success) {
        console.log('✅ Magic link sent');
        setMagicLinkStatus('sent');
        setMagicLinkMessage('Check your email for a sign-in link (valid for 15 minutes).');
      } else {
        throw new Error(res?.data?.error || 'Failed to send link.');
      }
    } catch (err) {
      console.error('❌ Magic link error:', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to send link. Please try again.';
      setMagicLinkStatus('error');
      setMagicLinkMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    const callbackUrl = window.location.origin + '/#GatorAuth';
    base44.auth.redirectToLogin(callbackUrl);
  };

  // Login options screen (Google + Magic Link)
  if (showLoginOptions && !showMagicLink) {
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

          {/* Auth buttons */}
          <div className="space-y-3">
            {/* Google button */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500">or</span>
              </div>
            </div>

            {/* Magic link button */}
            <Button
              onClick={() => setShowMagicLink(true)}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            >
              <Mail className="w-5 h-5 mr-3 text-slate-600" />
              Sign in with Email
            </Button>
          </div>

          {/* Hint for UF students */}
          <p className="text-xs text-slate-500 text-center mt-6">
            💡 <strong>UF Students:</strong> Sign in with your @ufl.edu email for instant access
          </p>
        </div>
      </div>
    );
  }

  // Magic link UI
  if (showMagicLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616] p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🐊</div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in with Email</h1>
            <p className="text-white/80 text-sm">We'll send you a secure login link</p>
          </div>

          {magicLinkStatus === 'input' && (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                className="h-12 text-lg bg-white/90 border-0 placeholder:text-slate-500"
                autoFocus
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#FA4616] hover:bg-orange-600 text-white font-semibold text-lg rounded-xl disabled:opacity-50"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Magic Link
              </Button>
            </form>
          )}

          {magicLinkStatus === 'loading' && (
            <div className="text-center text-white py-8">
              <Loader2 className="w-10 h-10 mx-auto animate-spin mb-4" />
              <p>{magicLinkMessage}</p>
            </div>
          )}

          {magicLinkStatus === 'sent' && (
            <div className="text-center text-white py-4">
              <div className="w-12 h-12 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Check Your Email!</h2>
              <p className="text-white/80 mb-6">{magicLinkMessage}</p>
              <Button
                onClick={() => { setMagicLinkStatus('input'); setMagicLinkEmail(''); }}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Use a different email
              </Button>
            </div>
          )}

          {magicLinkStatus === 'error' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl">!</span>
              </div>
              <p className="text-white/80 mb-4">{magicLinkMessage}</p>
              <Button
                onClick={() => setMagicLinkStatus('input')}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button
              onClick={() => { setShowMagicLink(false); setMagicLinkStatus('input'); setMagicLinkEmail(''); }}
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login options
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with magic link option
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0021A5] to-[#FA4616]">
      <div className="text-center max-w-md px-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold mb-2">
          {user ? 'Setting up your account...' : authProgress}
        </p>
        <p className="text-white/80 text-sm mb-6">
          {user ? 'Almost done...' : 'This may take a few moments on mobile'}
        </p>
        
        {/* Magic link alternative */}
        {!user && (
          <button
            onClick={() => setShowMagicLink(true)}
            className="text-white/70 hover:text-white text-sm underline underline-offset-2 transition-colors"
          >
            Having trouble? Sign in with email instead
          </button>
        )}
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;