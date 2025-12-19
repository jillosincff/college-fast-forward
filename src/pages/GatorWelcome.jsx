import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight } from 'lucide-react';
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
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  
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

    // No user - redirect to auth
    if (!user) {
      console.log('❌ [GatorWelcome] No user, redirecting to GatorAuth');
      navigate('GatorAuth');
      return;
    }

    // Already fully onboarded - redirect to dashboard
    if (user.onboarding_completed && !user.is_new_signup) {
      console.log('✅ [GatorWelcome] Already onboarded, redirecting to dashboard');
      const destination = user.persona === 'parent' ? 'ParentDashboard' : 'Dashboard';
      navigate(destination);
      return;
    }

    // STEP 1: Determine the intended role
    // Read fresh from localStorage inside effect to avoid stale closures
    // Priority: localStorage (set by GatorAuth after OAuth) > user.persona (database)
    const pendingRole = localStorage.getItem('pending_invite_role');
    
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

  const handleGetStarted = () => {
    console.log('🚀 [GatorWelcome] Starting onboarding for role:', role);
    trackEvent('onboarding_started', { role });

    if (role === 'gator') {
      navigate('StudentOnboarding');
    } else if (role === 'parent' || role === 'alumni') {
      navigate('Onboarding');
    } else {
      // Unexpected role - log warning and fallback
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

          <div className="inline-flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-full px-6 py-3 mb-10">
            <span className="text-orange-800 font-semibold text-sm">
              ✨ Takes just 2 minutes
            </span>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="h-14 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: role === 'gator' ? '#0021A5' : '#FA4616' }}
          >
            Let's Get Started
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}