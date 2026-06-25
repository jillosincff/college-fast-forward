import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { registerUser } from '@/functions/registerUser';
import { signInWithPassword } from '@/functions/signInWithPassword';
import { sendMagicLink } from '@/functions/sendMagicLink';
import { verifyMagicLink } from '@/functions/verifyMagicLink';
import { sendPasswordReset } from '@/functions/sendPasswordReset';
import { base44 } from '@/api/base44Client';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function MigrationSignIn() {
  const [activeTab, setActiveTab] = useState('magic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    const token = params.get('token');
    if (!token) return;

    setChecking(true);
    verifyMagicLink({ token })
      .then(({ data }) => {
      if (data?.success) {
        setTokenVerified(true);
        if (data.email) sessionStorage.setItem('migration_verified_email', data.email);
        setInfo('Identity verified! Redirecting you in...');
        setTimeout(() => {
          // The session is already created by verifyMagicLink. Go STRAIGHT to GatorAuth
          // (whose routing logic sends new students to onboarding, returning users to the
          // dashboard). Do NOT call redirectToLogin — it round-trips through Base44's hosted
          // login page (the "black gator" screen) and can land back on a blank page.
          window.location.href = window.location.origin + '/#/GatorAuth';
          window.location.reload();
        }, 1500);
      } else {
        setError(data?.error || 'This link is invalid or has expired. Please request a new one.');
        setTimeout(() => { window.location.hash = '#/MigrationSignIn?migration=true'; }, 2500);
      }
      })
      .catch(() => {
      setError('This link is invalid or has expired. Please request a new one.');
      setTimeout(() => { window.location.hash = '#/MigrationSignIn?migration=true'; }, 2500);
      })
      .finally(() => setChecking(false));
  }, []);
  const [forgotMode, setForgotMode] = useState(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    return new URLSearchParams(hashPart).get('forgot') === 'true';
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!signinEmail || !signinPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!fullName || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields.');
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
    setIsLoading(true);
    try {
      const response = await registerUser({ email: signupEmail, password: signupPassword, full_name: fullName });
      if (response.data?.success) {
        // Immediately sign the new student in so they go straight into the 13-step onboarding.
        try {
          const { data } = await signInWithPassword({ email: signupEmail, password: signupPassword });
          if (data?.success && data?.magicLink) {
            window.location.href = data.magicLink;
            return;
          }
        } catch (signinErr) { /* fall through to verify-email page below */ }
        navigate('RegistrationSuccess', { email: signupEmail });
      } else {
        setError(response.data?.error || 'Registration failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Registration failed.';
      setError(msg.includes('duplicate') ? 'An account with this email already exists.' : msg);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)', flexDirection: 'column', gap: 12 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(109,40,217,0.25)', borderTop: '2px solid #6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: dmSans, fontSize: 14, color: '#64748b', margin: 0 }}>Signing you in...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: dmSans, fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.03em' }}>College <span style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span></h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: '#64748b', margin: 0 }}>Your network. Your career. Let's go.</p>
        </div>

        <div style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 28, fontFamily: dmSans, fontSize: 13, color: '#475569', lineHeight: 1.6, textAlign: 'center' }}>
          👋 Welcome to the new College Fast Forward.<br/>
          Enter your email below and we'll send you a one-time login link — no password needed.
        </div>
        {forgotMode ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError(''); setInfo('');
            if (!forgotEmail) { setError('Please enter your email.'); return; }
            setIsLoading(true);
            try {
              const { data } = await sendPasswordReset({ email: forgotEmail });
              if (data?.success) setInfo('If an account exists, a reset link has been sent. Check your inbox.');
              else setError(data?.error || 'Could not send reset email.');
            } catch { setError('Could not send reset email. Please try again.'); }
            finally { setIsLoading(false); }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'block', marginBottom: 6 }}>Your Email</label>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', fontSize: 14, padding: '14px 16px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 10, color: '#0f172a', fontFamily: dmSans, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={isLoading} style={{ background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto', boxShadow: isLoading ? 'none' : '0 8px 24px rgba(109,40,217,0.28)' }}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setForgotMode(false); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto' }}>← Back to sign in</button>
          </form>
        ) : (
        <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', fontSize: 14, padding: '14px 16px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 10, color: '#0f172a', fontFamily: dmSans, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={isLoading} style={{ background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto', boxShadow: isLoading ? 'none' : '0 8px 24px rgba(109,40,217,0.28)' }}>
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>We'll email you a secure link. No password needed.</p>
          <button type="button" onClick={() => { setForgotMode(true); setForgotEmail(magicEmail); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto' }}>Forgot your password?</button>
        </form>
        )}

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p></div>}
        {info && !error && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#22C55E', margin: 0 }}>{info}</p></div>}
      </div>
    </div>
  );
}

MigrationSignIn.isPublic = true;