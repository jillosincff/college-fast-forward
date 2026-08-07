import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, GRAD_INDIGO } from './onboardingShared';

const inputStyle = {
  width: '100%', fontSize: 14, padding: '12px 14px',
  border: '1px solid #E2E8F0', background: '#fff',
  borderRadius: 10, color: TEXT, fontFamily: FONT,
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT3, display: 'block', marginBottom: 5 };

/**
 * Fallback signup path for students who don't want to (or can't) use Google —
 * without this, the only way to finish the value-first onboarding funnel was
 * Google OAuth, silently capping conversions for anyone who prefers email.
 */
export default function EmailSignupFallback({ defaultFirstName = '', onAuthed }) {
  const [mode, setMode] = useState('collapsed'); // 'collapsed' | 'form'
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingOtpPassword, setPendingOtpPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await base44.auth.register({ email: cleanEmail, password, full_name: fullName });
      try {
        const res = await base44.auth.loginViaEmailPassword(cleanEmail, password);
        const token = res?.access_token || res?.data?.access_token;
        if (token) {
          base44.auth.setToken(token);
          setLoading(false);
          onAuthed();
          return;
        }
      } catch (loginErr) {
        // Account created but not verified yet — fall through to OTP step.
      }
      setPendingOtpPassword(password);
      setPendingOtpEmail(cleanEmail);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || '';
      setError(/already|exist|registered/i.test(detail) ? 'An account with this email already exists.' : (detail || 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (pendingOtpEmail) {
    return (
      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, textAlign: 'center', margin: '0 0 14px' }}>Verify your email to continue.</p>
        <OtpVerifyForm email={pendingOtpEmail} password={pendingOtpPassword} onVerified={onAuthed} />
      </div>
    );
  }

  if (mode === 'collapsed') {
    return (
      <button
        onClick={() => setMode('form')}
        style={{ background: 'none', border: 'none', fontFamily: FONT, fontSize: 13, color: TEXT3, cursor: 'pointer', minHeight: 'auto', padding: '4px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        Or sign up with email instead
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
      </div>
      {error && <p style={{ fontFamily: FONT, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{ background: loading ? '#cbd5e1' : GRAD_INDIGO, border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT, minHeight: 'auto' }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <button
        type="button"
        onClick={() => { setMode('collapsed'); setError(''); }}
        style={{ background: 'none', border: 'none', fontFamily: FONT, fontSize: 13, color: TEXT3, cursor: 'pointer', minHeight: 'auto', padding: 0, textAlign: 'center' }}
      >
        ← Use Google instead
      </button>
    </form>
  );
}