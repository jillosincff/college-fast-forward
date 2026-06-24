import React from 'react';
import { MailCheck } from 'lucide-react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function RegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const email = urlParams.get('email') || '';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(160deg, #0d1117 0%, #0a0f1a 100%)',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(232,93,32,0.1)',
          border: '1px solid rgba(232,93,32,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <MailCheck className="w-8 h-8" style={{ color: '#E85D20' }} />
        </div>

        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(26px, 5vw, 36px)',
          fontWeight: 700, color: '#fff',
          margin: '0 0 16px', lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>
          Check your email to<br />
          <span style={{ color: '#E85D20', fontStyle: 'italic' }}>finish signing up.</span>
        </h1>

        <p style={{
          fontFamily: dmSans,
          fontSize: 16, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.7, margin: '0 0 8px',
        }}>
          We just sent a verification link{email ? ' to' : ''}
          {email && <strong style={{ color: 'rgba(255,255,255,0.85)' }}> {email}</strong>}.
          Click it to confirm your account — then we'll walk you through setting up your profile.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 24px',
          margin: '28px 0 0',
          textAlign: 'left',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)', margin: '0 0 14px',
          }}>
            What happens next
          </p>
          {[
            'Click the verification link in your email',
            'Set up your profile in a few quick steps',
            'Meet FastIQ — your personal AI career agent',
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: 999,
                background: 'rgba(232,93,32,0.15)', color: '#E85D20',
                fontFamily: dmSans, fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
                {line}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13,
          color: 'rgba(255,255,255,0.3)',
          margin: '24px 0 0', lineHeight: 1.6,
        }}>
          Didn't get it? Check your spam folder, or{' '}
          <button
            onClick={() => window.location.hash = '#GatorAuth'}
            style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: '#E85D20', background: 'none', border: 'none',
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