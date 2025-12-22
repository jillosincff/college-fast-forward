import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, GraduationCap, Heart, ArrowRight, Award } from 'lucide-react';

/**
 * UNIFIED AUTH FLOW - Single page handles:
 * 1. Welcome screen with Google sign-in (unauthenticated users)
 * 2. Role selection (authenticated users without persona)
 * 3. Auto-routing (authenticated users with persona)
 */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function GatorAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  
  // NEW FLOW: Role selection FIRST, then OAuth
  // Steps: null (determining) → 'role-select' (pick role) → 'oauth' (sign in) → 'processing' (applying role)
  const [step, setStep] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);

  // Main routing logic
  useEffect(() => {
    if (isLoading) return;

    // CRITICAL: Detect if we somehow ended up on wrong domain (mobile OAuth bug)
    const currentHost = window.location.hostname;
    console.log('🔍 [GatorAuth] Current hostname:', currentHost);
    
    if (currentHost.includes('ufl.edu') || currentHost.includes('google.com') || currentHost.includes('accounts.google')) {
      console.error('❌ [GatorAuth] WRONG DOMAIN DETECTED! This should not happen.');
      // Can't redirect from wrong domain - just log the error
      return;
    }

    // Handle OAuth callback token extraction
    const hashFragment = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessToken = hashFragment.includes('access_token=') || urlParams.has('access_token');
    const isNewUser = urlParams.has('is_new_user');

    if (hasAccessToken && !user) {
      const tokenMatch = hashFragment.match(/access_token=([^&]+)/);
      const urlToken = urlParams.get('access_token');
      const extractedToken = tokenMatch?.[1] || urlToken;
      
      if (extractedToken && base44.auth.setToken) {
        console.log('🔑 Setting token from OAuth callback');
        try {
          base44.auth.setToken(extractedToken);
        } catch (e) {
          console.error('Failed to set token:', e);
        }
        window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
        // Add small delay before refresh for Edge/slower browsers
        setTimeout(() => {
          if (refreshUser) refreshUser();
        }, 100);
        return;
      }
    }

    // Clean URL
    if (isNewUser || hasAccessToken) {
      window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
    }

    // ROUTING LOGIC
    if (user) {
      console.log('🔍 User:', user.email, 'persona:', user.persona);
      
      const pendingRole = localStorage.getItem('pending_invite_role');
      const pendingCode = localStorage.getItem('pending_invite_code');
      const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');

      // Already onboarded → Dashboard
      if (user.persona && user.onboarding_completed) {
        navigate(user.persona === 'parent' ? 'ParentDashboard' : 'Dashboard');
        return;
      }

      // Has pending role from BEFORE OAuth → Apply it and continue
      if (pendingRole && !user.persona) {
        if (processingRef.current) return;
        processingRef.current = true;
        setStep('processing');
        
        (async () => {
          try {
            console.log('🔄 [GatorAuth] Applying pending role:', pendingRole);
            
            // For UFL students with gator role, apply directly
            // For others, they should have gone through invite code first
            if (pendingRole === 'gator' && isUFLStudent) {
              await base44.auth.updateMe({
                persona: 'gator',
                roles: ['gator'],
                onboarding_completed: false,
                is_new_signup: true,
                invite_code_used: 'ufl_direct'
              });
              localStorage.removeItem('pending_invite_role');
              if (refreshUser) await refreshUser();
              navigate('StudentOnboarding');
              return;
            }
            
            // For non-UFL gators or parent/alumni, check for invite code
            if (!pendingCode && !isUFLStudent) {
              console.log('🚫 [GatorAuth] No invite code, redirecting to invite code page');
              navigate('GatorInviteCode');
              processingRef.current = false;
              return;
            }
            
            await base44.auth.updateMe({
              persona: pendingRole,
              roles: [pendingRole],
              onboarding_completed: false,
              is_new_signup: true,
              invite_code_used: pendingCode || 'direct'
            });
            
            // Verify update succeeded before navigating
            await new Promise(r => setTimeout(r, 300));
            const updatedUser = await base44.auth.me();
            
            if (updatedUser?.persona === pendingRole) {
              console.log('✅ [GatorAuth] Pending role applied successfully');
              localStorage.removeItem('pending_invite_role');
              localStorage.removeItem('pending_invite_code');
              if (refreshUser) await refreshUser();
              
              // Route to correct onboarding
              if (pendingRole === 'gator') {
                navigate('StudentOnboarding');
              } else {
                navigate('Onboarding');
              }
            } else {
              console.warn('⚠️ [GatorAuth] Role update not reflected, retrying...');
              await base44.auth.updateMe({
                persona: pendingRole,
                roles: [pendingRole],
                onboarding_completed: false,
                is_new_signup: true
              });
              await new Promise(r => setTimeout(r, 500));
              localStorage.removeItem('pending_invite_role');
              localStorage.removeItem('pending_invite_code');
              if (refreshUser) await refreshUser();
              
              if (pendingRole === 'gator') {
                navigate('StudentOnboarding');
              } else {
                navigate('Onboarding');
              }
            }
          } catch (err) {
            console.error('Failed to apply pending role:', err);
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            setStep('role-select');
            processingRef.current = false;
          }
        })();
        return;
      }

      // Has persona already (returning user mid-onboarding) → Continue onboarding
      if (user.persona && !user.onboarding_completed) {
        console.log('🔄 [GatorAuth] Returning user mid-onboarding, continuing...');
        if (user.persona === 'gator') {
          navigate('StudentOnboarding');
        } else {
          navigate('Onboarding');
        }
        return;
      }

      // No persona AND no pending role → Show role selection
      console.log('🎯 [GatorAuth] No role found, showing role selection');
      setStep('role-select');
    } else {
      // Not authenticated → Show role selection FIRST (before OAuth)
      // This ensures role is set in localStorage BEFORE OAuth redirect
      setStep('role-select');
    }
  }, [user, isLoading, refreshUser]);

  const handleGoogleSignIn = () => {
    // CRITICAL: Role must be selected BEFORE OAuth
    if (!selectedRole) {
      console.error('❌ [GatorAuth] No role selected before OAuth!');
      return;
    }
    
    setLoading(true);
    
    // Save role to localStorage BEFORE OAuth redirect
    // This survives the OAuth redirect (mobile browsers may clear sessionStorage)
    localStorage.setItem('pending_invite_role', selectedRole);
    localStorage.setItem('pending_invite_timestamp', Date.now().toString());
    console.log('💾 [GatorAuth] Saved pending role to localStorage:', selectedRole);
    
    // CRITICAL: Ensure we use the app's actual origin, not any redirect URL
    const appOrigin = window.location.origin;
    const callbackUrl = appOrigin + '/#GatorAuth';
    
    console.log('🔐 [GatorAuth] Starting Google sign-in');
    console.log('🔐 [GatorAuth] App origin:', appOrigin);
    console.log('🔐 [GatorAuth] Callback URL:', callbackUrl);
    console.log('🔐 [GatorAuth] Selected role:', selectedRole);
    
    // Validate that the origin is our app, not an external site
    if (appOrigin.includes('ufl.edu') || appOrigin.includes('google.com')) {
      console.error('❌ [GatorAuth] Invalid origin detected:', appOrigin);
      setLoading(false);
      return;
    }
    
    base44.auth.redirectToLogin(callbackUrl);
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    
    // Save role FIRST (before anything else)
    localStorage.setItem('pending_invite_role', selectedRole);
    localStorage.setItem('pending_invite_timestamp', Date.now().toString());
    console.log('💾 [GatorAuth] Role selected and saved:', selectedRole);
    
    // If user is NOT authenticated yet, show OAuth button
    if (!user) {
      console.log('🔐 [GatorAuth] User not authenticated, showing OAuth');
      setStep('oauth');
      return;
    }
    
    // User IS authenticated - check if they need invite code
    setLoading(true);
    const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
    const hasInviteCode = localStorage.getItem('pending_invite_code');
    
    // UFL Students selecting gator can proceed directly (no invite code needed)
    if (selectedRole === 'gator' && isUFLStudent) {
      try {
        console.log('🎓 [GatorAuth] UFL student selecting gator role, proceeding directly');
        await base44.auth.updateMe({
          persona: 'gator',
          roles: ['gator'],
          onboarding_completed: false,
          is_new_signup: true,
          invite_code_used: 'ufl_direct'
        });
        localStorage.removeItem('pending_invite_role');
        if (refreshUser) await refreshUser();
        navigate('StudentOnboarding');
      } catch (err) {
        console.error('Failed to set role:', err);
        setLoading(false);
      }
      return;
    }
    
    // Non-UFL students need invite code
    if (selectedRole === 'gator' && !isUFLStudent && !hasInviteCode) {
      console.log('📝 [GatorAuth] Non-UFL student needs invite code');
      navigate('GatorInviteCode');
      return;
    }
    
    // Parents and Alumni need invite code
    if ((selectedRole === 'parent' || selectedRole === 'alumni') && !hasInviteCode) {
      console.log('📝 [GatorAuth] Parent/Alumni needs invite code');
      navigate('GatorInviteCode');
      return;
    }
    
    // Has invite code - apply role and continue
    try {
      await base44.auth.updateMe({
        persona: selectedRole,
        roles: [selectedRole],
        onboarding_completed: false,
        is_new_signup: true,
        invite_code_used: hasInviteCode || 'direct'
      });
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      if (refreshUser) await refreshUser();
      
      if (selectedRole === 'gator') {
        navigate('StudentOnboarding');
      } else {
        navigate('Onboarding');
      }
    } catch (err) {
      console.error('Failed to set role:', err);
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // LOADING / PROCESSING STATE
  // ═══════════════════════════════════════════════════════════
  
  if (step === null || step === 'processing' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // OAUTH SCREEN (role selected, need to sign in)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'oauth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-lg text-center">
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-xl flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                alt="Gator Network"
                className="w-20 h-20 object-contain rounded-full"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Almost there! 🐊
          </h1>
          <p className="text-white/85 text-lg mb-8">
            Sign in to continue as {selectedRole === 'gator' ? 'a Student' : selectedRole === 'parent' ? 'a Parent' : 'an Alumni'}
          </p>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full max-w-sm mx-auto h-14 text-base font-semibold bg-white text-slate-800 hover:bg-slate-50 shadow-lg mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-white/70 text-sm mb-6">
            Works with any email — Gmail, UFL, Outlook, etc.
          </p>

          {selectedRole === 'gator' && (
            <div className="bg-white/10 rounded-xl p-4 max-w-sm mx-auto mb-6">
              <p className="text-amber-300 text-sm font-medium">
                🎓 <strong>UF Students:</strong> Use your @ufl.edu email for instant access
              </p>
            </div>
          )}

          <button
            onClick={() => setStep('role-select')}
            className="text-white/60 text-sm hover:text-white/80 underline"
          >
            ← Back to role selection
          </button>

          <p className="text-white/50 text-xs mt-8 max-w-xs mx-auto">
            By continuing, you agree to our{' '}
            <a href="#Terms" className="text-white/70 underline">Terms</a> and{' '}
            <a href="#Privacy" className="text-white/70 underline">Privacy Policy</a>
          </p>

        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ROLE SELECTION (FIRST STEP - before OAuth)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'role-select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg flex items-center justify-center">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                  alt="Gator Network"
                  className="w-16 h-16 object-contain rounded-full"
                />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome to Gator Network 🐊
              </h1>
              <p className="text-slate-600">
                Tell us who you are to get started
              </p>
            </div>

            <div className="space-y-4 mb-8">
              
              {/* Student Option */}
              <button
                onClick={() => setSelectedRole('gator')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'gator'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">I'm a UF Student</h3>
                    <p className="text-sm text-slate-600">Find jobs, internships & roommates</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedRole === 'gator' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {selectedRole === 'gator' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Parent Option */}
                <button
                  onClick={() => setSelectedRole('parent')}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    selectedRole === 'parent'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">I'm a UF Parent</h3>
                      <p className="text-sm text-slate-600">Support your Gator's career journey</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedRole === 'parent' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {selectedRole === 'parent' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Alumni Option */}
                <button
                  onClick={() => setSelectedRole('alumni')}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    selectedRole === 'alumni'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">I'm a UF Alumni</h3>
                      <p className="text-sm text-slate-600">Give back & help Gators get hired</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedRole === 'alumni' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {selectedRole === 'alumni' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>

            </div>

            <Button
              onClick={handleRoleSelect}
              disabled={!selectedRole || loading}
              className="w-full h-12 text-base font-semibold"
              style={{ 
                backgroundColor: selectedRole ? '#0021A5' : undefined 
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-slate-400 text-xs mt-6 text-center">
              By continuing, you agree to our{' '}
              <a href="#Terms" className="text-slate-500 underline">Terms</a> and{' '}
              <a href="#Privacy" className="text-slate-500 underline">Privacy Policy</a>
            </p>

          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
    }}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

GatorAuth.isPublic = true;