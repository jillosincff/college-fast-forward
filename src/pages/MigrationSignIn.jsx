import { useState, useEffect } from 'react';
import EmailPasswordAuth from '@/components/auth/EmailPasswordAuth';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function MigrationSignIn() {
  const [defaultTab, setDefaultTab] = useState('magic');

  useEffect(() => {
    // Auto-select Magic Link tab for migration users
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('migration') === 'true') {
      setDefaultTab('magic');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          background: 'radial-gradient(ellipse at center, rgba(79,140,255,0.04), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Welcome message for migration users */}
        <div style={{
          marginBottom: 24,
          padding: '16px',
          background: 'rgba(232,93,32,0.08)',
          border: '1px solid rgba(232,93,32,0.2)',
          borderRadius: 12,
          fontFamily: dmSans,
          fontSize: 14,
          color: '#1a1a1a',
          lineHeight: 1.6,
          maxWidth: 500,
          textAlign: 'center',
        }}>
          👋 Welcome to the new College Fast Forward. Enter your email below and we'll send you a one-time login link — no password needed.
        </div>

        {/* Auth component */}
        <EmailPasswordAuth defaultTab={defaultTab} />
      </div>
    </div>
  );
}

MigrationSignIn.isPublic = true;