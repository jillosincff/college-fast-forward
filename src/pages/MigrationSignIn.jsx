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

  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    const token = params.get('token');
    if (!token) return;

    setIsLoading(true);
    verifyMagicLink({ token })
      .then(({ data }) => {
        if (data?.success) {
          setTokenVerified(true);
          // Store verified email so GatorAuth can pre-fill and show a welcome message
          if (data.email) {
            sessionStorage.setItem('migration_verified_email', data.email);
          }
          setInfo(`Identity verified! Redirecting you to sign in with Google...`);
          // Base44 sessions are Google OAuth only — redirect to complete sign-in
          setTimeout(() => {
            base44.auth.redirectToLogin(window.location.origin + '/#FreeTierDashboard');
          }, 1800);
        } else {
          setError(data?.error || 'This link is invalid or has expired. Please request a new one.');
        }
      })
      .catch(() => setError('This link is invalid or has expired. Please request a new one.'))
      .finally(() => setIsLoading(false));
  }, []);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0d1117', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(79,140,255,0.04), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>COLLEGE FAST FORWARD</h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Your network. Your career. Let's go.</p>
        </div>

        <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 28, fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, textAlign: 'center' }}>
          👋 Welcome to the new College Fast Forward.<br/>
          Enter your email below and we'll send you a one-time login link — no password needed.
        </div>
        <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', fontSize: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontFamily: dmSans, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={isLoading} style={{ background: isLoading ? '#ccc' : '#E85D20', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}>
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>We'll email you a secure link. No password needed.</p>
        </form>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p></div>}
        {info && !error && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#22C55E', margin: 0 }}>{info}</p></div>}
      </div>
    </div>
  );
}

MigrationSignIn.isPublic = true;