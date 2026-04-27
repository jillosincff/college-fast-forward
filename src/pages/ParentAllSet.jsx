import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function ParentAllSet() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || '';
  const schoolName = user?.school_name || user?.school || 'the network';
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
          width: 80, height: 80, borderRadius: '50%',
          background: '#4ADE80',
          border: 'none',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 42,
          margin: '0 auto 32px',
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
          color: '#fff', fontWeight: 700, lineHeight: 1,
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
          You're live in the network{firstName ? `, ${firstName}` : ''}.
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 16px',
        }}>
          Your profile is now visible to students across 
          the {schoolName} network.
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

        {/* Profile CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
          <button onClick={() => navigate('ParentHome')} style={{
            background: '#E85D20', color: '#fff', border: 'none',
            borderRadius: 12, padding: '14px 32px',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            cursor: 'pointer', minHeight: 'auto', marginBottom: 12,
            width: '100%', maxWidth: 360,
          }}>
            View My Profile →
          </button>
          <button onClick={() => navigate('Profile')} style={{
            background: 'none', color: '#E85D20', border: 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            cursor: 'pointer', minHeight: 'auto', marginBottom: 8,
            padding: 0,
          }}>
            Edit my profile →
          </button>
          <button onClick={() => navigate('FastIQDashboard?gift=open')} style={{
            background: 'none', color: '#E85D20', border: 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            cursor: 'pointer', minHeight: 'auto', marginBottom: 32,
            padding: 0,
          }}>
            Gift FastIQ to my student →
          </button>
        </div>

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