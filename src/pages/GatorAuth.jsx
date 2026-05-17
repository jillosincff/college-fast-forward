import React, { useEffect, useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { registerUser } from '@/functions/registerUser';
import { signInWithPassword } from '@/functions/signInWithPassword';
import { sendMagicLink } from '@/functions/sendMagicLink';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';

console.log('🔵 [GatorAuth] Module loaded');

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";
const ACCENT = '#4F8CFF';

function AuthPageShell({ children }) {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
    document.head.appendChild(link);
  }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0d1117', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(79,140,255,0.04), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }}>{children}</div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function GatorAuth() {
  const { user, isLoadingAuth: isLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [isMigration] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('migration') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  // Sign in state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  
  // Sign up state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Magic link state
  const [magicEmail, setMagicEmail] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!signinEmail || !signinPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await signInWithPassword({ email: signinEmail, password: signinPassword });
      if (data?.success && data?.magicLink) {
        window.location.href = data.magicLink;
      } else {
        setError(data?.error || 'Sign in failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim() || !lastName.trim() || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields including first and last name.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser({ email: signupEmail, password: signupPassword, full_name: fullName });
      if (response.data?.success) {
        navigate('RegistrationSuccess', { email: signupEmail });
      } else {
        setError(response.data?.error || 'Registration failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Registration failed.';
      setError(msg.includes('duplicate') ? 'An account with this email already exists.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!magicEmail) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await sendMagicLink({ email: magicEmail });
      if (data?.success) {
        setInfo('Check your email for a secure sign-in link. It expires in 15 minutes.');
      } else {
        setError(data?.error || 'Could not send magic link. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Preserve any existing pending role (e.g. 'parent' from ParentLandingPage)
    // Always redirect back to GatorAuth — it smart-routes returning vs new users
    try {
      const existingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
      const role = existingRole || 'student';
      localStorage.setItem('pending_invite_role', role);
      sessionStorage.setItem('cff_onboarding_type', role);
    } catch (e) { /* private browsing */ }
    base44.auth.loginWithProvider('google', window.location.origin + '/#GatorAuth');
  };

  useEffect(() => {
    if (isLoading) return;

    // Not logged in — show the auth form
    if (!user) {
      setStep('auth');
      return;
    }

    // Check if they came from the new onboarding funnel (landing page "Get Hired" button)
    const cameFromFunnel = sessionStorage.getItem('cff_onboarding_type') === 'student';

    // If they came from the funnel, always show it — regardless of existing onboarding status
    if (cameFromFunnel) {
      setStep('onboarding');
      return;
    }

    // Fully onboarded returning user (no funnel flag) — send straight to dashboard
    if (user.persona && user.onboarding_completed) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('/ParentHome');
      } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
        navigate(user.alumni_intent === 'giving_help' ? '/AlumniHome' : '/FreeTierDashboard');
      } else {
        navigate('/FreeTierDashboard');
      }
      return;
    }

    // Has persona but hasn't finished onboarding
    if (user.persona && !user.onboarding_completed) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('/ParentOnboarding');
        return;
      } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
        navigate('/AlumniOnboarding');
        return;
      } else {
        // Student with incomplete onboarding → run them through the funnel
        setStep('onboarding');
        return;
      }
    }

    // Logged in but no persona yet — show the onboarding funnel
    if (user && !user.persona) {
      const pendingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');

      if (pendingRole === 'parent') {
        navigate('/ParentOnboarding');
        return;
      }

      // Show the white-background onboarding funnel (Screen 1: Welcome to CFF)
      setStep('onboarding');
      return;
    }
  }, [user, isLoading]);

  const inputStyle = {
    width: '100%', fontSize: 14, padding: '14px 16px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10, color: '#fff',
    fontFamily: dmSans, outline: 'none',
    boxSizing: 'border-box',
  };

  // New user — show the white-background onboarding funnel (postAuth=true since user is already signed in)
  if (step === 'onboarding') {
    const handleOnboardingComplete = async () => {
      // Clear funnel flags so returning visits don't re-trigger funnel
      try { sessionStorage.removeItem('cff_onboarding_type'); localStorage.removeItem('pending_invite_role'); } catch (e) {}
      // After funnel, set persona and go to dashboard
      try {
        await base44.auth.updateMe({ persona: 'student', roles: ['student'], onboarding_completed: true, is_new_signup: true });
        if (refreshUser) await refreshUser();
      } catch (e) {}
      navigate('/FreeTierDashboard');
    };
    return <OnboardingFlow postAuth={true} onClose={handleOnboardingComplete} onAlreadyAuthed={handleOnboardingComplete} />;
  }

  // While determining what to show, render a visible loading screen (not blank)
  if (step !== 'auth') {
    return (
      <AuthPageShell>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>Setting up your account...</p>
        </div>
      </AuthPageShell>
    );
  }

  if (step === 'auth') {
    return (
      <AuthPageShell>
        <div style={{ maxWidth: 500, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20, minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto 20px' }}>
              ← Back to home
            </button>
            <h1 style={{ fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              COLLEGE FAST FORWARD
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Your network. Your career. Let's go.
            </p>
          </div>

          {isMigration && (
            <div style={{
              background: 'rgba(232,93,32,0.08)',
              border: '1px solid rgba(232,93,32,0.2)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: dmSans,
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              👋 Welcome to the new College Fast Forward.<br/>
              Enter your email below and we'll send you a one-time login link — no password needed.
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, marginBottom: 28, display: 'flex', gap: 4 }}>
            {['signin', 'signup', 'magic'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); setInfo(''); }}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: activeTab === tab ? '#fff' : 'transparent',
                  color: activeTab === tab ? '#1a1a1a' : 'rgba(255,255,255,0.4)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: dmSans,
                  transition: 'all 0.2s', minHeight: 'auto',
                }}
              >
                {tab === 'signin' && 'Sign in'}
                {tab === 'signup' && 'Sign up'}
                {tab === 'magic' && 'Magic link'}
              </button>
            ))}
          </div>

          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => navigate('/MigrationSignIn?forgot=true')}
                  style={{ fontFamily: dmSans, fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
                >
                  Forgot your password?
                </button>
              </div>
              <button type="submit" disabled={loading} style={{ background: loading ? '#ccc' : '#E85D20', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ background: loading ? '#ccc' : '#E85D20', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {activeTab === 'magic' && (
            <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ background: loading ? '#ccc' : '#E85D20', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>We'll email you a secure link. No password needed.</p>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '8px 0 0' }}>
                Need to reset your password?{' '}
                <button type="button" onClick={() => navigate('/MigrationSignIn?forgot=true')} style={{ fontFamily: dmSans, fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'none' }}>Click here →</button>
              </p>
            </form>
          )}

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p></div>}
          {info && !error && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#22C55E', margin: 0 }}>{info}</p></div>}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Or continue with Google →</p>
          </div>
          <button onClick={handleGoogleSignIn} disabled={loading} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', opacity: loading ? 0.7 : 1, minHeight: 'auto' }}>
            <GoogleIcon /> Continue with Google
          </button>
        </div>
      </AuthPageShell>
    );
  }

}

GatorAuth.isPublic = true;