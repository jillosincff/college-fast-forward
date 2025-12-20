import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight, Crown, Star, Check, Loader2 } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';

/**
 * GatorWelcome - Bulletproof welcome page
 * 
 * FLOW:
 * 1. Determine the intended role (from localStorage > user.persona)
 * 2. If user.persona doesn't match intended role, update it
 * 3. Show welcome message and button
 * 4. Navigate to correct onboarding
 */

// Helper to clear all pending invite data from storage
const clearPendingInviteData = () => {
  localStorage.removeItem('pending_invite_role');
  localStorage.removeItem('pending_invite_code');
  sessionStorage.removeItem('pending_invite_role');
  sessionStorage.removeItem('pending_invite_code');
};

export default function GatorWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'payment_required'
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  
  // Track if update is in progress to prevent duplicate calls
  const updateInProgressRef = useRef(false);
  // Track if component is mounted for safe async updates
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Clear OAuth tracking on mount
  useEffect(() => {
    localStorage.removeItem('oauth_attempt_count');
    localStorage.removeItem('oauth_start_time');
    sessionStorage.removeItem('oauth_callback_detected');
    sessionStorage.removeItem('oauth_state_token');
    sessionStorage.removeItem('oauth_redirect_in_progress');
  }, []);

  // Main setup effect
  useEffect(() => {
    if (isLoading) return;

    // No user - wait a bit then redirect (session might still be loading)
    if (!user) {
      console.log('⏳ [GatorWelcome] No user yet, waiting for session...');
      
      // Poll for user session before giving up
      let attempts = 0;
      const checkSession = async () => {
        while (attempts < 10) {
          attempts++;
          await new Promise(r => setTimeout(r, 500));
          try {
            const freshUser = await base44.auth.me();
            if (freshUser?.email) {
              console.log('✅ [GatorWelcome] Session found after polling:', freshUser.email);
              refreshUser(); // Trigger AuthContext update
              return; // Effect will re-run with user
            }
          } catch (e) {
            // Keep polling
          }
        }
        // After 5 seconds, redirect to auth
        console.log('❌ [GatorWelcome] No session after polling, redirecting to GatorAuth');
        navigate('GatorAuth');
      };
      
      checkSession();
      return;
    }

    // Check if there's a pending invite role - if so, this is a NEW user flow, don't redirect
    const pendingRole = localStorage.getItem('pending_invite_role');
    
    // Already fully onboarded AND no pending role - redirect to dashboard
    // CRITICAL: Only redirect if onboarding is EXPLICITLY true AND there's no pending role
    if (user.onboarding_completed === true && !pendingRole) {
      console.log('✅ [GatorWelcome] Already onboarded, redirecting to dashboard');
      const destination = user.persona === 'parent' || user.persona === 'alumni' ? 'ParentDashboard' : 'Dashboard';
      navigate(destination);
      return;
    }

    // STEP 1: Determine the intended role
    // Priority: localStorage (set by GatorAuth after OAuth) > user.persona (database)
    // (pendingRole already read above for redirect check)
    
    // CRITICAL: For new signups, ALWAYS trust localStorage over user.persona
    // This handles the case where user.persona hasn't been updated yet due to propagation delay
    // or where user had a stale persona from a previous incomplete signup
    const intendedRole = pendingRole || user.persona;

    console.log('🔍 [GatorWelcome] Role determination:', {
      pendingRole,
      userPersona: user.persona,
      intendedRole,
      updateInProgress: updateInProgressRef.current,
      isNewSignup: user.is_new_signup
    });

    // No role anywhere - redirect to role selection
    if (!intendedRole) {
      console.log('⚠️ [GatorWelcome] No role found, redirecting to role selection');
      navigate('GatorRoleSelection');
      return;
    }

    // Set role for display immediately (optimistic UI)
    setRole(intendedRole);

    // STEP 2: Check if we need to update the database
    const needsUpdate = user.persona !== intendedRole;

    if (needsUpdate && !updateInProgressRef.current) {
      console.log('🔄 [GatorWelcome] Updating persona from', user.persona, 'to', intendedRole);
      updateInProgressRef.current = true;
      
      const updateData = {
        persona: intendedRole,
        roles: [intendedRole],
        onboarding_completed: false,
        is_new_signup: true
      };
      
      const MAX_VERIFY_ATTEMPTS = 2;
      
      base44.auth.updateMe(updateData)
        .then(async () => {
          // Only update state if still mounted
          if (!isMountedRef.current) return;
          
          // CRITICAL: Verify the update with retry loop (max 2 attempts)
          let verified = false;
          let attempts = 0;
          let currentUser;
          
          while (attempts < MAX_VERIFY_ATTEMPTS && !verified) {
            attempts++;
            
            // Small delay before verification to allow DB propagation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            currentUser = await base44.auth.me();
            
            if (currentUser.persona === intendedRole) {
              verified = true;
              console.log(`✅ [GatorWelcome] VERIFIED on attempt ${attempts}: persona = ${currentUser.persona}`);
            } else {
              console.warn(`⚠️ [GatorWelcome] VERIFICATION FAILED on attempt ${attempts}: got ${currentUser.persona}, expected ${intendedRole}`);
              
              // Log mismatch to backend for monitoring (non-blocking)
              base44.functions.invoke('logPersonaMismatch', {
                user_id: currentUser.id,
                email: currentUser.email,
                expected: intendedRole,
                actual: currentUser.persona,
                attempt: attempts,
                location: 'GatorWelcome'
              }).catch(() => {});
              
              if (attempts < MAX_VERIFY_ATTEMPTS) {
                console.log('🔄 [GatorWelcome] Retrying update...');
                await base44.auth.updateMe(updateData);
              }
            }
          }
          
          if (verified) {
            clearPendingInviteData();
            refreshUser();
            setStatus('ready');
            updateInProgressRef.current = false;
            
            // Non-blocking notifications
            base44.functions.invoke('incrementUserCount', { user_id: user.id }).catch(() => {});
            base44.functions.invoke('notifyNewUserJoined', {
              user_email: user.email,
              user_name: user.full_name,
              user_persona: intendedRole,
              user_id: user.id
            }).catch(() => {});
          } else {
            console.error(`❌ [GatorWelcome] FINAL VERIFICATION FAILED after ${MAX_VERIFY_ATTEMPTS} attempts`);
            setError('Failed to save your role. Please refresh and try again.');
            setStatus('error');
            updateInProgressRef.current = false;
            
            // Log final failure to backend for monitoring
            base44.functions.invoke('logPersonaMismatch', {
              user_id: currentUser?.id,
              email: currentUser?.email,
              expected: intendedRole,
              actual: currentUser?.persona,
              attempt: 'final_failure',
              location: 'GatorWelcome'
            }).catch(() => {});
          }
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          
          console.error('❌ [GatorWelcome] Failed to update persona:', err);
          setError(err.message || 'Failed to set up your account');
          setStatus('error');
          updateInProgressRef.current = false;
        });
    } else if (!needsUpdate) {
      // Persona already correct
      console.log('✅ [GatorWelcome] Persona already correct:', intendedRole);
      clearPendingInviteData();
      setStatus('ready');
    }
    // If needsUpdate && updateInProgressRef.current, do nothing (update already in flight)
    
  }, [user, isLoading, refreshUser]);

  // Load pricing info on mount
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await base44.functions.invoke('getPricingTierForSignup', {});
        if (response.data?.success) {
          setPricingInfo(response.data);
        }
      } catch (err) {
        console.error('Failed to load pricing info:', err);
      }
    };
    loadPricing();
  }, []);

  const handleGetStarted = async () => {
    console.log('🚀 [GatorWelcome] Starting onboarding for role:', role);
    trackEvent('onboarding_started', { role, tier: pricingInfo?.tier });

    // For founding members, go straight to onboarding
    if (!pricingInfo || pricingInfo.tier === 'founding' || !pricingInfo.requires_payment) {
      proceedToOnboarding();
      return;
    }

    // For paid tiers, create family and redirect to Stripe
    setIsCreatingFamily(true);
    try {
      const response = await base44.functions.invoke('createFamilyAndCheckout', {
        successUrl: `${window.location.origin}/#${role === 'gator' ? 'StudentOnboarding' : 'Onboarding'}?payment=success`,
        cancelUrl: `${window.location.origin}/#GatorWelcome?payment=cancelled`
      });

      if (response.data?.requires_payment && response.data?.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else if (response.data?.success) {
        // No payment required (edge case - became founding during signup)
        proceedToOnboarding();
      } else {
        throw new Error(response.data?.error || 'Failed to create checkout');
      }
    } catch (err) {
      console.error('Failed to create checkout:', err);
      setError(err.message || 'Failed to start subscription');
      setIsCreatingFamily(false);
    }
  };

  const proceedToOnboarding = () => {
    if (role === 'gator') {
      navigate('StudentOnboarding');
    } else if (role === 'parent' || role === 'alumni') {
      navigate('Onboarding');
    } else {
      console.warn('⚠️ [GatorWelcome] Unexpected role, falling back to Dashboard:', role);
      navigate('Dashboard');
    }
  };

  // Loading state
  if (isLoading || !user || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 mx-auto mb-6 flex items-center justify-center shadow-xl">
            <span className="text-4xl">🐊</span>
          </div>
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Setup Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 relative overflow-hidden">
        <CardContent className="pt-16 pb-12 px-8 text-center">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 w-full" />
          </div>

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <span className="text-6xl">🐊</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Welcome to<br />College Fast Forward! 🎉
          </h1>

          <p className="text-lg text-slate-600 mb-3 max-w-xl mx-auto">
            {role === 'gator'
              ? "You're joining a vibrant network of Gators, parents, and alumni accelerating your college success."
              : "You're joining a powerful network of parents helping Gators get hired."
            }
          </p>
          
          <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto">
            {role === 'gator'
              ? "Let's set up your profile to unlock opportunities."
              : "Let's set up your profile so you can start making an impact."
            }
          </p>

          {/* Pricing Tier Display */}
          {pricingInfo && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              pricingInfo.tier === 'founding' 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                : pricingInfo.tier === 'early_adopter'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                {pricingInfo.tier === 'founding' ? (
                  <Crown className="w-6 h-6 text-yellow-600" />
                ) : pricingInfo.tier === 'early_adopter' ? (
                  <Star className="w-6 h-6 text-blue-600" />
                ) : (
                  <Check className="w-6 h-6 text-slate-600" />
                )}
                <span className={`font-bold text-lg ${
                  pricingInfo.tier === 'founding' ? 'text-yellow-800' :
                  pricingInfo.tier === 'early_adopter' ? 'text-blue-800' : 'text-slate-800'
                }`}>
                  {pricingInfo.badge_type}
                </span>
              </div>
              <p className={`text-center font-semibold ${
                pricingInfo.tier === 'founding' ? 'text-yellow-700' :
                pricingInfo.tier === 'early_adopter' ? 'text-blue-700' : 'text-slate-700'
              }`}>
                {pricingInfo.locked_price_display}
                {pricingInfo.tier !== 'founding' && ' • 7-day free trial'}
              </p>
              {pricingInfo.spots_remaining && pricingInfo.tier !== 'standard' && (
                <p className="text-center text-sm mt-1 opacity-80">
                  Only {pricingInfo.spots_remaining} {pricingInfo.tier === 'founding' ? 'free' : '$9'} spots left!
                </p>
              )}
            </div>
          )}

          <div className="inline-flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-full px-6 py-3 mb-10">
            <span className="text-orange-800 font-semibold text-sm">
              ✨ Takes just 2 minutes
            </span>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            disabled={isCreatingFamily}
            className="h-14 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
            style={{ backgroundColor: role === 'gator' ? '#0021A5' : '#FA4616' }}
          >
            {isCreatingFamily ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                {pricingInfo?.tier === 'founding' 
                  ? "Let's Get Started" 
                  : `Start ${pricingInfo?.trial_days || 7}-Day Free Trial`}
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
          
          {pricingInfo?.tier !== 'founding' && (
            <p className="text-sm text-slate-500 mt-4">
              No charge today. Cancel anytime during your trial.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}