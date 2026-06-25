import React, { useEffect } from 'react';
import { MailCheck } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ACCENT = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

export default function RegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const email = urlParams.get('email') || '';

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.08), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 460, width: '100%', textAlign: 'center' }}>

        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(109,40,217,0.08)',
          border: '1px solid rgba(109,40,217,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <MailCheck className="w-8 h-8" style={{ color: ACCENT }} />
        </div>

        <h1 style={{
          fontFamily: dmSans,
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 800, color: '#0f172a',
          margin: '0 0 16px', lineHeight: 1.2,
          letterSpacing: '-0.03em',
        }}>
          Check your email to finish signing up
        </h1>

        <p style={{
          fontFamily: dmSans,
          fontSize: 16, color: '#64748b',
          lineHeight: 1.7, margin: '0 0 8px',
        }}>
          We just sent a verification link{email ? ' to' : ''}
          {email && <strong style={{ color: '#0f172a' }}> {email}</strong>}.
          Click it to confirm your account — then we'll walk you through setting up your profile.
        </p>

        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14, padding: '20px 24px',
          margin: '28px 0 0',
          textAlign: 'left',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#94a3b8', margin: '0 0 14px',
          }}>
            What happens next
          </p>
          {[
            'Click the verification link in your email',
            'Set up your profile in a few quick steps',
            "Start connecting with your network",
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: 999,
                background: 'rgba(109,40,217,0.1)', color: ACCENT,
                fontFamily: dmSans, fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {line}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13,
          color: '#94a3b8',
          margin: '24px 0 0', lineHeight: 1.6,
        }}>
          Didn't get it? Check your spam folder, or{' '}
          <button
            onClick={() => window.location.hash = '#/GatorAuth'}
            style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: ACCENT, background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'underline',
            }}
          >
            try signing up again
          </button>.
        </p>

      </div>
    </div>
  );
}

RegistrationSuccess.isPublic = true;