import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function ParentAllSet() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const [copied, setCopied] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Check */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)',
          border: '2px solid #22C55E',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 32,
          margin: '0 auto 32px',
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
        }}>
          ✓
        </div>

        {/* Label */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: '#E85D20', margin: '0 0 16px',
        }}>
          YOU'RE ALL SET
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 700, color: '#fff',
          margin: '0 0 20px', lineHeight: 1.3,
        }}>
          You're live in the network, {firstName}.
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 16px',
        }}>
          Your profile is now visible to students across 
          the College Fast Forward network.
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 48px',
        }}>
          The moment a student reaches out —
          we'll let you know immediately.
          Until then, you don't need to do a thing.
        </p>

        {/* Share box */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 24px',
          marginBottom: 32,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, color: 'rgba(255,255,255,0.6)',
            margin: '0 0 16px', lineHeight: 1.6,
          }}>
            Know another parent who'd want to help?
            Every parent makes the network stronger
            for everyone's kids.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://collegefastforward.com');
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            style={{
              background: 'none',
              border: '1px solid rgba(232,93,32,0.4)',
              borderRadius: 8, padding: '10px 20px',
              fontSize: 13, fontWeight: 600,
              color: '#E85D20', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%',
            }}
          >
            {copied ? '✓ Link copied!' : 'Share College Fast Forward →'}
          </button>
        </div>

        {/* Closing line */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic', margin: 0,
          lineHeight: 1.6,
        }}>
          Thank you for being part of something new.
        </p>

      </div>
    </div>
  );
}