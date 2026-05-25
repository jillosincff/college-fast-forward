import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { sendMagicLink } from '@/functions/sendMagicLink';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";

export default function AuthGate({ onClose }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const hasAt = email.includes('@') && email.includes('.');
  const showButton = hasAt;

  const handleGoogle = () => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
    } catch (e) { /* private browsing */ }
    base44.auth.redirectToLogin(window.location.origin + '/#GatorAuth');
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!hasAt || sending) return;
    setSending(true);
    try {
      await sendMagicLink({ email });
      setSent(true);
    } catch {
      setSent(true); // show success regardless to avoid enumeration
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: FONT,
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        width: 36, height: 36, minHeight: 'auto', borderRadius: '50%',
        background: '#F8FAFC', border: '1px solid #E2E8F0',
        color: '#64748B', fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
          College <span style={{ color: '#0066FF' }}>Fast Forward</span>
        </p>
        <div style={{ width: 40, height: 2, background: '#10B981', borderRadius: 2, margin: '0 auto' }} />
      </div>

      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)',
          border: '1px solid #BFDBFE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 28px',
          boxShadow: '0 4px 16px rgba(0,102,255,0.08)',
        }}>⚡</div>

        <h1 style={{
          fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 30px)',
          fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em',
          lineHeight: 1.2, margin: '0 0 12px',
        }}>
          Let's secure your<br />backdoor advantage.
        </h1>

        <p style={{
          fontFamily: FONT, fontSize: 15, color: '#64748B',
          lineHeight: 1.7, margin: '0 0 32px',
        }}>
          Connect your account to launch your automated Career Agent.
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, fontFamily: FONT, fontSize: 15, fontWeight: 600, color: '#1F2937',
            background: '#FFFFFF', border: '1.5px solid #D1D5DB',
            borderRadius: 10, padding: '14px 24px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          <span style={{ fontFamily: FONT, fontSize: 13, color: '#9CA3AF', fontWeight: 400 }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        </div>

        {/* Magic Link section */}
        {sent ? (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 10, padding: '20px 24px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: FONT, fontSize: 15, color: '#065F46', margin: 0, lineHeight: 1.6 }}>
              ✨ Check your inbox. We sent a secure link to log you in instantly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter your email..."
              style={{
                width: '100%', height: 48, fontFamily: FONT, fontSize: 15,
                color: '#0F172A', background: '#F9FAFB',
                border: `1px solid ${focused ? '#0066FF' : '#E5E7EB'}`,
                borderRadius: 6, padding: '0 16px',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
            />
            <button
              type="submit"
              disabled={!hasAt || sending}
              style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 600,
                color: '#0066FF', background: 'none', border: 'none',
                cursor: hasAt ? 'pointer' : 'default',
                padding: '10px 0 0', textAlign: 'right',
                opacity: showButton ? 1 : 0,
                transform: showButton ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                minHeight: 'auto',
                pointerEvents: showButton ? 'auto' : 'none',
              }}
            >
              {sending ? 'Sending...' : 'Send Magic Link →'}
            </button>
          </form>
        )}

        <p style={{ fontFamily: FONT, fontSize: 12, color: '#94A3B8', margin: '20px 0 0', lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}