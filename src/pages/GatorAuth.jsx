import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * BULLETPROOF AUTH FLOW
 * 
 * Flow:
 * 1. Role Selection (Student / Parent / Alumni)
 * 2. Student → Google Auth (must be @ufl.edu)
 * 3. Parent/Alumni → Invite Code → Google Auth
 * 4. After auth → Role-specific onboarding
 */

// Google Icon Component
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
  
  // Step state: 'welcome' | 'request-access' | 'request-submitted' | 'processing'
  const [step, setStep] = useState('welcome');
  const [selectedRole, setSelectedRole] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Request access form
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    role: 'parent',
    studentName: '',
    gradYear: '',
    howHeard: ''
  });

  const processingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Check if this is an OAuth callback - show loading immediately
    const hashFragment = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessToken = hashFragment.includes('access_token=') || urlParams.has('access_token');
    const isNewUser = urlParams.has('is_new_user');
    const oauthDetected = sessionStorage.getItem('oauth_callback_detected');
    
    if (hasAccessToken || isNewUser || oauthDetected) {
      setIsOAuthCallback(true);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle OAuth callback and routing for authenticated users
  useEffect(() => {
    if (isLoading) return;

    // Check for OAuth callback
    const hashFragment = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.has('is_new_user');
    const hasAccessToken = hashFragment.includes('access_token=') || urlParams.has('access_token');

    // Extract token if present
    if (hasAccessToken && !user) {
      const tokenMatch = hashFragment.match(/access_token=([^&]+)/);
      const urlToken = urlParams.get('access_token');
      const extractedToken = tokenMatch?.[1] || urlToken;
      
      if (extractedToken && base44.auth.setToken) {
        console.log('🔑 Setting token from OAuth callback');
        base44.auth.setToken(extractedToken);
        window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
        if (refreshUser) refreshUser();
        return;
      }
    }

    // Clean URL if is_new_user param present
    if (isNewUser) {
      window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
    }

    // If user is authenticated, handle routing
    if (user) {
      console.log('🔍 Authenticated user:', user.email, 'persona:', user.persona);
      
      const pendingRole = localStorage.getItem('pending_invite_role');
      const pendingCode = localStorage.getItem('pending_invite_code');
      const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');

      // CASE 1: User has persona and completed onboarding → Dashboard
      if (user.persona && user.onboarding_completed) {
        console.log('✅ Fully onboarded user → Dashboard');
        navigate(user.persona === 'parent' ? 'ParentDashboard' : 'Dashboard');
        return;
      }

      // CASE 2: User has persona but not completed onboarding → Welcome
      if (user.persona) {
        console.log('➡️ User with persona → GatorWelcome');
        navigate('GatorWelcome');
        return;
      }

      // CASE 3: UFL student without persona → Auto-assign gator role
      if (isUFLStudent && !user.persona) {
        console.log('🎓 UFL student → Auto-assigning gator role');
        
        if (processingRef.current) return;
        processingRef.current = true;
        setStep('processing');
        
        (async () => {
          try {
            await base44.auth.updateMe({
              persona: 'gator',
              roles: ['gator'],
              onboarding_completed: false,
              is_new_signup: true
            });
            if (refreshUser) await refreshUser();
            navigate('GatorWelcome');
          } catch (err) {
            console.error('Failed to set gator role:', err);
            navigate('GatorRoleSelection');
          } finally {
            processingRef.current = false;
          }
        })();
        return;
      }

      // CASE 4: Pending role from invite code → Apply it
      if (pendingRole && !user.persona) {
        console.log('📝 Applying pending role:', pendingRole);
        
        if (processingRef.current) return;
        processingRef.current = true;
        setStep('processing');
        
        (async () => {
          try {
            await base44.auth.updateMe({
              persona: pendingRole,
              roles: [pendingRole],
              onboarding_completed: false,
              is_new_signup: true,
              invite_code_used: pendingCode || 'direct'
            });
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            if (refreshUser) await refreshUser();
            navigate('GatorWelcome');
          } catch (err) {
            console.error('Failed to apply pending role:', err);
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            navigate('GatorRoleSelection');
          } finally {
            processingRef.current = false;
          }
        })();
        return;
      }

      // CASE 5: Non-UFL user without persona → Role selection
      if (!user.persona) {
        console.log('➡️ User without persona → GatorRoleSelection');
        navigate('GatorRoleSelection');
        return;
      }
    }
  }, [user, isLoading, refreshUser]);

  // Handle Google sign in
  const handleGoogleSignIn = (forRole = null) => {
    // Store the role we're signing up for
    if (forRole) {
      localStorage.setItem('pending_invite_role', forRole);
    }
    
    const callbackUrl = window.location.origin + '/#GatorAuth';
    console.log('🔐 Starting OAuth with callback:', callbackUrl);
    base44.auth.redirectToLogin(callbackUrl);
  };

  // Handle student Google auth - validates @ufl.edu after
  const handleStudentGoogleAuth = () => {
    // For students, we'll validate the email AFTER OAuth completes
    // The useEffect will handle routing based on email domain
    localStorage.setItem('pending_invite_role', 'gator');
    localStorage.setItem('require_ufl_email', 'true');
    handleGoogleSignIn();
  };

  // Verify invite code
  const handleInviteCode = async () => {
    if (!inviteCode || inviteCode.length < 4) {
      setError('Please enter a valid invite code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await base44.functions.invoke('verifyInviteCode', { 
        code: inviteCode.toUpperCase() 
      });

      if (result.data?.valid) {
        // Store invite code and proceed to Google auth
        localStorage.setItem('pending_invite_code', inviteCode.toUpperCase());
        localStorage.setItem('pending_invite_role', selectedRole);
        setStep('google-auth');
      } else {
        setError(result.data?.error || 'Invalid invite code. Please check and try again.');
      }
    } catch (err) {
      console.error('Invite code verification error:', err);
      setError('Unable to verify invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle request access form submit
  const handleRequestAccess = async (e) => {
    e.preventDefault();
    
    if (!requestForm.name || !requestForm.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create invite request
      await base44.entities.InviteRequest.create({
        name: requestForm.name,
        email: requestForm.email,
        role: requestForm.role,
        student_name: requestForm.studentName,
        grad_year: requestForm.gradYear,
        how_heard: requestForm.howHeard,
        status: 'pending'
      });

      setStep('request-submitted');
    } catch (err) {
      console.error('Request access error:', err);
      setError('Unable to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle returning user sign in
  const handleSignIn = () => {
    handleGoogleSignIn();
  };

  // ═══════════════════════════════════════════════════════════
  // PROCESSING STATE
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'processing' || isLoading) {
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
  // UNIFIED WELCOME SCREEN - Single entry point for all users
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-lg text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-xl flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                alt="Gator Network"
                className="w-20 h-20 object-contain rounded-full"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to Gator Network 🐊
          </h1>
          <p className="text-white/85 text-lg mb-8">
            Connect with UF students, parents, <em>and alumni</em> for<br />
            career advice and opportunities
          </p>

          {/* Main Google Sign In Button */}
          <Button
            onClick={() => handleGoogleSignIn()}
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

          {/* New Here Info */}
          <p className="text-white/60 text-sm mb-2">New here?</p>
          <p className="text-white/80 text-sm mb-8">
            Just click above to get started! You'll choose your role<br />
            (Student, Parent, or Alumni) after signing in.
          </p>

          {/* UF Students Highlight */}
          <div className="bg-white/10 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-amber-300 text-sm font-medium">
              🎓 <strong>UF Students:</strong> Use your @ufl.edu email for instant access
            </p>
          </div>

          {/* Terms */}
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
  // REQUEST ACCESS FORM (kept for future use if needed)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'request-access') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <button 
            onClick={() => {
              setStep('welcome');
              setError(null);
            }}
            className="text-white/70 hover:text-white text-sm mb-6 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
              Request Access
            </h1>
            <p className="text-slate-600 text-center mb-6 text-sm">
              Tell us about yourself and we'll send you an invite
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRequestAccess} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name *
                </label>
                <Input
                  type="text"
                  value={requestForm.name}
                  onChange={(e) => setRequestForm({...requestForm, name: e.target.value})}
                  placeholder="Jane Smith"
                  required
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm({...requestForm, email: e.target.value})}
                  placeholder="jane@example.com"
                  required
                  className="h-12"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  I am a *
                </label>
                <select
                  value={requestForm.role}
                  onChange={(e) => setRequestForm({...requestForm, role: e.target.value})}
                  className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="parent">Parent of a UF Student</option>
                  <option value="alumni">UF Alumni</option>
                </select>
              </div>

              {/* Student Name (if parent) */}
              {requestForm.role === 'parent' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Student's Name
                  </label>
                  <Input
                    type="text"
                    value={requestForm.studentName}
                    onChange={(e) => setRequestForm({...requestForm, studentName: e.target.value})}
                    placeholder="Student's first and last name"
                    className="h-12"
                  />
                </div>
              )}

              {/* Graduation Year (if alumni) */}
              {requestForm.role === 'alumni' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Graduation Year
                  </label>
                  <Input
                    type="text"
                    value={requestForm.gradYear}
                    onChange={(e) => setRequestForm({...requestForm, gradYear: e.target.value})}
                    placeholder="2015"
                    className="h-12"
                  />
                </div>
              )}

              {/* How did you hear about us */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  How did you hear about us?
                </label>
                <Input
                  type="text"
                  value={requestForm.howHeard}
                  onChange={(e) => setRequestForm({...requestForm, howHeard: e.target.value})}
                  placeholder="Friend, social media, etc."
                  className="h-12"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0021A5] hover:bg-[#001580] text-white font-semibold mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Invite'
                )}
              </Button>

            </form>

          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // REQUEST SUBMITTED SUCCESS
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'request-submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)'
      }}>
        <div className="w-full max-w-md text-center">
          
          <div className="text-6xl mb-6">📬</div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Request Submitted!
          </h1>
          
          <p className="text-white/80 mb-8 leading-relaxed">
            Thanks for your interest in Gator Network! We'll review your request and send you an invite code within <strong className="text-white">24-48 hours</strong>.
          </p>

          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <p className="text-white/90 text-sm">
              Check your email at:<br />
              <strong className="text-white">{requestForm.email}</strong>
            </p>
          </div>

          <Button
            onClick={() => navigate('LandingPage')}
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white"
          >
            Return to Home
          </Button>

        </div>
      </div>
    );
  }

  // Default loading
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