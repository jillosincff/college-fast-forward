import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function RegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const email = urlParams.get('email') || 'your inbox';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: '#0d1117',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 32, fontWeight: 700,
          color: '#fff', margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>
          You're in!
        </h1>
        <p style={{
          fontFamily: dmSans,
          fontSize: 15, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.7, margin: '0 0 8px',
        }}>
          Welcome to College Fast Forward. We sent a verification email to
        </p>
        <p style={{
          fontFamily: dmSans,
          fontSize: 15, fontWeight: 700,
          color: '#E85D20', margin: '0 0 8px',
        }}>
          {email}
        </p>
        <p style={{
          fontFamily: dmSans,
          fontSize: 13, color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6, margin: '0 0 40px',
        }}>
          Click the link in that email to verify your account. Check your spam folder if you don't see it.
        </p>

        <p style={{
          fontFamily: dmSans,
          fontSize: 13, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)', margin: '0 0 16px',
        }}>
          While you wait
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => window.location.hash = '#ProfileEdit'}
            style={{
              fontFamily: dmSans,
              fontSize: 15, fontWeight: 600,
              color: '#fff',
              background: '#E85D20',
              border: 'none',
              borderRadius: 12, padding: '14px',
              cursor: 'pointer', minHeight: 'auto', width: '100%',
            }}
          >
            Edit My Profile →
          </button>
          <button
            onClick={() => window.location.hash = '#Profile'}
            style={{
              fontFamily: dmSans,
              fontSize: 15, fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '14px',
              cursor: 'pointer', minHeight: 'auto', width: '100%',
            }}
          >
            View My Profile
          </button>
        </div>

        <button
          onClick={() => window.location.hash = '#GetStarted'}
          style={{
            fontFamily: dmSans,
            fontSize: 13,
            color: 'rgba(255,255,255,0.3)',
            background: 'none',
            border: 'none',
            marginTop: 24,
            cursor: 'pointer', minHeight: 'auto',
            textDecoration: 'underline',
          }}
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}

RegistrationSuccess.isPublic = true;