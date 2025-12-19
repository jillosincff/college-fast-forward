import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';

export default function GatorWelcome() {
  const { user, refreshUser, isLoading } = useAuth();
  const params = useParams();
  const [roleSetupComplete, setRoleSetupComplete] = React.useState(false);
  const [displayRole, setDisplayRole] = React.useState(null);
  
  // Clear OAuth tracking state on successful arrival
  useEffect(() => {
    localStorage.removeItem('oauth_attempt_count');
    localStorage.removeItem('oauth_start_time');
    sessionStorage.removeItem('oauth_callback_detected');
    sessionStorage.removeItem('oauth_state_token');
    sessionStorage.removeItem('oauth_redirect_in_progress');
    console.log('✅ [OAuth] Success - cleared attempt tracking');
    
    // Only redirect if user is FULLY onboarded (not in active signup flow)
    // The is_new_signup flag indicates they're going through fresh signup
    if (user?.persona && user?.onboarding_completed && !user?.is_new_signup) {
      console.log('✅ [GatorWelcome] User already onboarded, redirecting to dashboard');
      if (user.persona === 'gator') {
        navigate('Dashboard');
      } else if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('ParentDashboard');
      } else if (user.roles?.includes('admin')) {
        navigate('AdminDashboard');
      } else {
        navigate('Dashboard');
      }
    }
  }, [user, navigate]);
  
  // CRITICAL: For users in active signup flow (onboarding not completed), 
  // prioritize the pending role from current flow over stale database persona
  // This fixes the bug where a returning user with old persona gets wrong welcome screen
  const pendingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
  const calculatedRole = (!user?.onboarding_completed && pendingRole) 
    ? pendingRole 
    : (user?.persona || pendingRole || params.role);
  
  // Use displayRole for UI (set after we confirm the correct role), fallback to calculated
  const role = displayRole || calculatedRole;

  useEffect(() => {
    // Extract parameters from hash fragment (hash-based routing)
    const hashFragment = window.location.hash.substring(1);
    const hashParts = hashFragment.split('?');
    const queryString = hashParts[1] || '';
    const urlParams = new URLSearchParams(queryString);
    const hasOAuthParams = urlParams.has('role') || urlParams.has('code');
    
    console.log('🔍 [GatorWelcome] State check:', {
      isLoading,
      hasUser: !!user,
      hash: window.location.hash,
      queryString,
      hasOAuthParams,
      role: urlParams.get('role'),
      code: urlParams.get('code')
    });
    
    if (isLoading) {
      console.log('⏳ [GatorWelcome] Still loading user...');
      return;
    }
    
    if (!user) {
      // If we have OAuth params, wait for SDK to finish authentication
      if (hasOAuthParams) {
        console.log('⏳ [GatorWelcome] OAuth params detected, waiting for authentication...');
        
        // Poll for user every 500ms for up to 15 seconds
        const startTime = Date.now();
        const maxWait = 15000;
        
        const pollInterval = setInterval(async () => {
          const elapsed = Date.now() - startTime;
          
          if (elapsed > maxWait) {
            console.error('❌ [GatorWelcome] Timeout - user not authenticated after 15s');
            clearInterval(pollInterval);
            // Store params and redirect to auth to try again
            localStorage.setItem('pending_invite_role', urlParams.get('role'));
            if (urlParams.get('code')) {
              localStorage.setItem('pending_invite_code', urlParams.get('code'));
            }
            navigate('GatorAuth');
            return;
          }
          
          // Check if user became available
          try {
            const currentUser = await base44.auth.me();
            if (currentUser) {
              console.log('✅ [GatorWelcome] User authenticated:', currentUser.email);
              clearInterval(pollInterval);
              // Trigger refresh by updating state
              refreshUser();
            }
          } catch (e) {
            console.log('⏳ [GatorWelcome] Still waiting for auth... elapsed:', elapsed + 'ms');
          }
        }, 500);
        
        return () => clearInterval(pollInterval);
      }
      
      console.log('❌ [GatorWelcome] No user and no OAuth params, redirecting to auth');
      navigate('GatorAuth');
      return;
    }
    
    // Extract parameters from URL (more reliable than storage)
    const urlRole = urlParams.get('role');
    const urlCode = urlParams.get('code');
    const urlEmail = urlParams.get('email');
    const urlRef = urlParams.get('ref');
    
    console.log('🎯 [GatorWelcome] URL params:', { role: urlRole, code: urlCode, email: urlEmail, ref: urlRef });
    
    // Store params in localStorage as backup
    if (urlRole) localStorage.setItem('pending_invite_role', urlRole);
    if (urlCode) localStorage.setItem('pending_invite_code', urlCode);
    if (urlEmail) localStorage.setItem('pending_student_email', urlEmail);
    if (urlRef) localStorage.setItem('pending_referral_code', urlRef);
    
    // CRITICAL: For new signups, prioritize the CURRENT flow's role over stale database persona
    // This ensures a student signing up doesn't get stuck with old parent persona
    const storedPendingRole = urlRole || localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
    const pendingRoleResolved = (!user.onboarding_completed && storedPendingRole) 
      ? storedPendingRole 
      : (user.persona || storedPendingRole);
    const pendingCode = urlCode || localStorage.getItem('pending_invite_code');
    
    console.log('🔍 [GatorWelcome] Debug state:', {
      userEmail: user.email,
      userPersona: user.persona,
      storedPendingRole,
      pendingRoleResolved,
      pendingCode,
      roleSetupComplete,
      onboarding_completed: user.onboarding_completed
    });
    
    // CRITICAL FIX: Only skip setup if persona MATCHES the intended role
    // If user has stale persona that differs from pending role, we MUST update it
    const personaMatchesIntendedRole = user.persona && user.persona === pendingRoleResolved;
    
    if (user.persona && user.persona.trim() && personaMatchesIntendedRole) {
      console.log('✅ [GatorWelcome] Role already correctly set:', user.persona);
      setDisplayRole(user.persona); // Set display role for UI
      setRoleSetupComplete(true);
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');
      return;
    }
    
    // Log if we need to correct a mismatched persona
    if (user.persona && !personaMatchesIntendedRole && pendingRoleResolved) {
      console.log('⚠️ [GatorWelcome] Persona mismatch detected! Current:', user.persona, 'Intended:', pendingRoleResolved);
    }
    
    console.log('✅ User on welcome page:', user.email, 'role:', role);
    
    const isUFL = user.email?.toLowerCase().endsWith('@ufl.edu');
    
    // If student without code and UFL email, auto-verify
    if (pendingRoleResolved === 'gator' && !pendingCode && isUFL && !roleSetupComplete) {
      console.log('✅ [GatorWelcome] UFL student - auto-verifying');
      setDisplayRole('gator'); // Set display role IMMEDIATELY for UI
      base44.auth.updateMe({
        persona: 'gator',
        roles: ['gator'],
        onboarding_completed: false,
        is_new_signup: true
      }).then(async () => {
        console.log('✅ [GatorWelcome] UFL student role set');
        await refreshUser();
        setRoleSetupComplete(true);
        
        // Increment user counter (non-blocking)
        base44.functions.invoke('incrementUserCount', { user_id: user.id })
          .catch(e => console.log('incrementUserCount failed:', e.message));
        
        // Notify admin of new user (non-blocking)
        base44.functions.invoke('notifyNewUserJoined', {
          user_email: user.email,
          user_name: user.full_name,
          user_persona: 'gator',
          user_id: user.id
        }).catch(e => console.log('notifyNewUserJoined failed:', e.message));
      }).catch(err => {
        console.error('❌ [GatorWelcome] Failed to set student role:', err);
        setRoleSetupComplete(true); // Enable button even on error
      });
    }
    // If parent with invite code, set persona first then process invite
    // CRITICAL: Also check if current persona doesn't match pendingRole (fixes wrong persona from previous attempts)
    else if (pendingRoleResolved === 'parent' && pendingCode && user.persona !== 'parent') {
        console.log('🔄 [GatorWelcome] Setting parent persona first, then processing invite code:', pendingCode);
        setDisplayRole('parent'); // Set display role IMMEDIATELY for UI
        
        const processParentFlow = async () => {
          try {
            // CRITICAL: Set persona to parent FIRST
            await base44.auth.updateMe({
              persona: 'parent',
              roles: ['parent'],
              onboarding_completed: false,
              is_new_signup: true
            });
            console.log('✅ [GatorWelcome] Parent persona set');
            
            // Increment user counter (non-blocking)
            base44.functions.invoke('incrementUserCount', { user_id: user.id })
              .catch(e => console.log('incrementUserCount failed:', e.message));
            
            // Notify admin of new user (non-blocking)
            base44.functions.invoke('notifyNewUserJoined', {
              user_email: user.email,
              user_name: user.full_name,
              user_persona: 'parent',
              user_id: user.id
            }).catch(e => console.log('notifyNewUserJoined failed:', e.message));
            
            // Then process the invite code to link to student
            const response = await base44.functions.invoke('processParentInviteCode', { 
              invite_code: pendingCode 
            });
            
            console.log('✅ [GatorWelcome] Full response:', response);
            const result = response.data || response;
            console.log('✅ [GatorWelcome] Invite code result:', result);
            
            if (result.success) {
              console.log('✅ [GatorWelcome] Parent linked successfully:', result);
              await refreshUser();
              setRoleSetupComplete(true);
              
              // Show success message
              if (result.student_name) {
                alert(`🎉 Success! You're now connected to ${result.student_name}. Let's set up your profile!`);
              } else {
                alert(`🎉 Success! Your parent account is ready. Let's set up your profile!`);
              }
              
              trackEvent('parent_linked_via_code', { 
                student_email: result.student_email,
                parent_slot: result.parent_slot 
              });
            } else {
              console.error('❌ [GatorWelcome] Failed to link:', result.error);
              await refreshUser();
              setRoleSetupComplete(true);
              alert(`❌ ${result.error || 'Unable to process invite code'}. You can connect to your student later from your dashboard.`);
            }
          } catch (error) {
            console.error('❌ [GatorWelcome] Error details:', {
              message: error.message,
              stack: error.stack,
              response: error.response,
              data: error.data,
              status: error.status,
              fullError: error
            });
            await refreshUser();
            setRoleSetupComplete(true);
            alert(`❌ Error processing invite code: ${error.message || 'Unknown error'}. You can connect to your student from the dashboard.`);
          }
        };
        
      processParentFlow();
    }
    // Otherwise just set role (or correct wrong persona)
    // CRITICAL: This handles both new users AND users with mismatched personas
    else if (pendingRoleResolved && user.persona !== pendingRoleResolved && !roleSetupComplete) {
        console.log('🔄 [GatorWelcome] Setting/correcting role to:', pendingRoleResolved, '(was:', user.persona || 'none', ')');
        setDisplayRole(pendingRoleResolved); // Set display role IMMEDIATELY for UI
        base44.auth.updateMe({
          persona: pendingRoleResolved,
          roles: [pendingRoleResolved],
          onboarding_completed: false,
          is_new_signup: true
        }).then(async () => {
          console.log('✅ [GatorWelcome] Role set/corrected successfully to:', pendingRoleResolved);
          await refreshUser();
          setRoleSetupComplete(true);
          
          // Clear storage after successful update
          localStorage.removeItem('pending_invite_role');
          localStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_role');
          sessionStorage.removeItem('pending_invite_code');
          
          // Increment user counter (non-blocking)
          base44.functions.invoke('incrementUserCount', { user_id: user.id })
            .catch(e => console.log('incrementUserCount failed:', e.message));
          
          // Notify admin of new user (non-blocking)
          base44.functions.invoke('notifyNewUserJoined', {
            user_email: user.email,
            user_name: user.full_name,
            user_persona: pendingRoleResolved,
            user_id: user.id
          }).catch(e => console.log('notifyNewUserJoined failed:', e.message));
      }).catch(err => {
        console.error('❌ [GatorWelcome] Failed to set role:', err);
        setRoleSetupComplete(true); // Set to true even on error to allow button click
      });
    }
    // Handle case where no pending role but user has no persona (shouldn't happen but safety net)
    else if (!user.persona && !pendingRoleResolved && !roleSetupComplete) {
      console.log('⚠️ [GatorWelcome] No persona and no pending role - redirecting to role selection');
      navigate('GatorRoleSelection');
      return;
    }
  }, [user, roleSetupComplete, isLoading]);

  useEffect(() => {
    // Confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      if (window.confetti) {
        window.confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FA4616', '#0021A5', '#FFD700']
        }));
        window.confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FA4616', '#0021A5', '#FFD700']
        }));
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    console.log('🚀 Starting onboarding for role:', role);
    trackEvent('onboarding_started', { role });
    
    // Preserve referral code for onboarding to process
    const referralCode = sessionStorage.getItem('pending_referral_code');
    console.log('🎟️ [GatorWelcome] Preserving referral code for onboarding:', referralCode);
    
    // Clear pending flags from both storage types
    localStorage.removeItem('pending_invite_role');
    localStorage.removeItem('pending_invite_code');
    sessionStorage.removeItem('pending_invite_role');
    sessionStorage.removeItem('pending_invite_code');
    sessionStorage.removeItem('selected_role');
    // Don't remove pending_referral_code yet - StudentOnboarding needs it
    
    if (role === 'gator') {
      console.log('➡️ Going to StudentOnboarding');
      navigate('StudentOnboarding');
    } else if (role === 'parent' || role === 'alumni') {
      console.log('➡️ Going to Onboarding');
      navigate('Onboarding');
    } else {
      console.log('➡️ Going to Dashboard (fallback)');
      navigate('Dashboard');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-orange-400 opacity-30" />
          </div>
        ))}
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-0 relative">
        <CardContent className="pt-16 pb-12 px-8 text-center">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000"
              style={{ width: '100%' }}
            />
          </div>

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 mx-auto mb-8 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-6xl">🐊</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Welcome to<br />College Fast Forward! 🎉
          </h1>

          <p className="text-lg text-slate-600 mb-3 max-w-xl mx-auto">
            {role === 'gator'
              ? "You're joining a vibrant network of Gators, parents, and alumni accelerating your college success."
              : role === 'parent'
                ? "You're joining a powerful network of parents, students, and alumni empowering Gators to succeed."
                : role === 'alumni'
                  ? "Welcome! As a Gator alum, you're joining a network of students, parents, and fellow alumni."
                  : "You're joining a powerful network of parents helping Gators get hired."
            }
          </p>
          
          <p className="text-base text-slate-600 mb-8 max-w-lg mx-auto">
            {role === 'gator'
              ? "Let's set up your profile to unlock opportunities."
              : role === 'parent'
                ? "Let's set up your profile so you can start supporting your student."
                : role === 'alumni'
                  ? "Let's set up your profile to start networking."
                  : "Let's set up your profile so you can start making an impact."
            }
          </p>

          <div className="inline-flex items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-full px-6 py-3 mb-10">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-orange-800 font-semibold text-sm">
              ✨ Takes just 2 minutes
            </span>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            disabled={!roleSetupComplete}
            className="h-14 px-12 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: role === 'gator' ? '#0021A5' : '#FA4616' }}
          >
            {roleSetupComplete ? (
              <>
                Let's Get Started
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            ) : (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Setting up your account...
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}