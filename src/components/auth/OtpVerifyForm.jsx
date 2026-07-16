import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const ACCENT = '#6d28d9';

/**
 * CFF-branded OTP entry step. After native register(), the platform emails a 6-digit code.
 * The user enters it here; verifyOtp() mints a real session, then onVerified() runs
 * (GatorAuth routing then sends new students to onboarding, returning users to dashboard).
 */
export default function OtpVerifyForm({ email, onVerified }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const inputStyle = {
    width: '100%', fontSize: 22, letterSpacing: '0.4em', textAlign: 'center',
    padding: '14px 16px', border: '1px solid #e2e8f0', background: '#fff',
    borderRadius: 10, color: '#0f172a', fontFamily: dmSans, outline: 'none', boxSizing: 'border-box',
  };
  const primaryBtn = (l) => ({ background: l ? '#cbd5e1' : GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: l ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto', boxShadow: l ? 'none' : '0 8px 24px rgba(109,40,217,0.28)' });

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    const otpCode = code.trim();
    if (otpCode.length < 4) { setError('Enter the code from your email.'); return; }
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode });
      const token = res?.access_token || res?.data?.access_token;
      if (token) base44.auth.setToken(token);
      // Whether or not a token came back, a verified account can now be routed.
      await onVerified();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || '';
      // If the account is already verified (e.g. the first attempt succeeded but the
      // screen didn't advance, then the user retried with a consumed code), don't
      // show a false "incorrect code" error — the account is good, move them on.
      if (/already.*verif|verif.*already/i.test(detail)) {
        await onVerified();
        return;
      }
      setError(detail || 'That code is incorrect or expired. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setInfo('');
    setResending(true);
    try {
      await base44.auth.resendOtp(email.trim().toLowerCase());
      setInfo('A new code is on its way to your inbox.');
    } catch (err) {
      setError('Could not resend the code. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, color: '#475569', margin: 0, lineHeight: 1.6 }}>
          We emailed a verification code to<br/><strong style={{ color: '#0f172a' }}>{email}</strong>.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#94a3b8', margin: '10px 0 0', lineHeight: 1.5 }}>
          Don't see it? Check your <strong style={{ color: '#64748b' }}>spam / junk</strong> folder. If you requested more than one code, enter the <strong style={{ color: '#64748b' }}>most recent</strong> one.
        </p>
      </div>
      <div>
        <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'block', marginBottom: 6 }}>Verification Code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
          placeholder="000000"
          style={inputStyle}
        />
      </div>
      <button type="submit" disabled={loading} style={primaryBtn(loading)}>
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>
      <button type="button" onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: ACCENT, cursor: resending ? 'default' : 'pointer', textDecoration: 'underline', minHeight: 'auto' }}>
        {resending ? 'Sending...' : 'Resend code'}
      </button>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px' }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p></div>}
      {info && !error && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px' }}><p style={{ fontFamily: dmSans, fontSize: 13, color: '#22C55E', margin: 0 }}>{info}</p></div>}
    </form>
  );
}