import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div style={{ fontSize: 48, marginBottom: 24 }}>📬</div>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 32, fontWeight: 700,
          color: '#fff', margin: '0 0 16px',
          letterSpacing: '-0.02em',
        }}>
          Check your email
        </h1>
        <p style={{
          fontFamily: dmSans,
          fontSize: 15, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.7, margin: '0 0 8px',
        }}>
          We sent a verification link to
        </p>
        <p style={{
          fontFamily: dmSans,
          fontSize: 15, fontWeight: 700,
          color: '#E85D20', margin: '0 0 32px',
        }}>
          {email}
        </p>
        <p style={{
          fontFamily: dmSans,
          fontSize: 14, color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.6, margin: '0 0 40px',
        }}>
          Click the link in the email to verify your account and get started. It may take a minute or two to arrive — check your spam folder if you don't see it.
        </p>
        <button
          onClick={() => window.location.hash = '#GetStarted'}
          style={{
            fontFamily: dmSans,
            fontSize: 14, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '12px 24px',
            cursor: 'pointer', minHeight: 'auto',
          }}
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}

RegistrationSuccess.isPublic = true;