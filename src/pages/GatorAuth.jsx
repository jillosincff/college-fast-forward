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
  
  const [step, setStep] = useState(null); // null = determining, 'welcome', 'role-select', 'processing'
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);

  // Main routing logic
  useEffect(() => {
    if (isLoading) return;

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

      // Has persona → Continue onboarding
      if (user.persona) {
        navigate('GatorWelcome');
        return;
      }

      // UFL student without persona → Show role selection (don't auto-assign)
      // This allows UFL students to choose their role, then we auto-approve gator role
      if (isUFLStudent && !user.persona) {
        console.log('🎓 [GatorAuth] UFL student without persona, showing role selection');
        setStep('role-select');
        return;
      }

      // Has pending role → Apply it
      if (pendingRole && !user.persona) {
        if (processingRef.current) return;
        processingRef.current = true;
        setStep('processing');
        
        (async () => {
          try {
            console.log('🔄 [GatorAuth] Applying pending role:', pendingRole);
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
              navigate('GatorWelcome');
            } else {
              console.warn('⚠️ [GatorAuth] Role update not reflected, retrying...');
              // One more attempt
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
              navigate('GatorWelcome');
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

      // No persona → Show role selection
      setStep('role-select');
    } else {
      // Not authenticated → Show welcome
      setStep('welcome');
    }
  }, [user, isLoading, refreshUser]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    
    // CRITICAL: Ensure we use the app's actual origin, not any redirect URL
    // On mobile, window.location can sometimes get confused during OAuth
    const appOrigin = window.location.origin;
    const callbackUrl = appOrigin + '/#GatorAuth';
    
    console.log('🔐 [GatorAuth] Starting Google sign-in');
    console.log('🔐 [GatorAuth] App origin:', appOrigin);
    console.log('🔐 [GatorAuth] Callback URL:', callbackUrl);
    
    // Validate that the origin is our app, not an external site
    if (appOrigin.includes('ufl.edu') || appOrigin.includes('google.com')) {
      console.error('❌ [GatorAuth] Invalid origin detected:', appOrigin);
      setLoading(false);
      return;
    }
    
    base44.auth.redirectToLogin(callbackUrl);
  };

  const handleRoleSelect = async () => {
    if (!selectedRole || !user) return;
    
    setLoading(true);
    
    const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
    
    // UFL Students can proceed directly (no invite code needed)
    if (selectedRole === 'gator' && isUFLStudent) {
      try {
        console.log('🎓 [GatorAuth] UFL student selecting gator role, proceeding directly');
        await base44.auth.updateMe({
          persona: 'gator',
          roles: ['gator'],
          onboarding_completed: false,
          is_new_signup: true
        });
        if (refreshUser) await refreshUser();
        navigate('GatorWelcome');
      } catch (err) {
        console.error('Failed to set role:', err);
        setLoading(false);
      }
    } else if (selectedRole === 'gator' && !isUFLStudent) {
      // Non-UFL students also need invite code
      console.log('📝 [GatorAuth] Non-UFL student needs invite code');
      localStorage.setItem('pending_invite_role', 'gator');
      navigate('GatorInviteCode');
    } else {
      // Parents and Alumni need an invite code - redirect to invite code page
      console.log('📝 [GatorAuth] Parent/Alumni needs invite code');
      localStorage.setItem('pending_invite_role', selectedRole);
      navigate('GatorInviteCode');
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
  // WELCOME SCREEN (not authenticated)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'welcome') {
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
            Welcome to Gator Network 🐊
          </h1>
          <p className="text-white/85 text-lg mb-8">
            Connect with UF students, parents, and alumni
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

          <p className="text-white/70 text-sm mb-8">
            Works with any email — Gmail, UFL, Outlook, etc.
          </p>

          <div className="bg-white/10 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-amber-300 text-sm font-medium">
              🎓 <strong>UF Students:</strong> Use your @ufl.edu email for instant access
            </p>
          </div>

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
  // ROLE SELECTION (authenticated but no persona)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'role-select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                One more step! 🎉
              </h1>
              <p className="text-slate-600">
                Tell us who you are so we can personalize your experience
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