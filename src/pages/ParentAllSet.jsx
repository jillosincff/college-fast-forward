import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

// ── Brand tokens (matched to StudentLandingPage) ──
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const BG = '#f8f9ff';
const CARD = '#ffffff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

export default function ParentAllSet() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || '';
  const schoolName = user?.school_name || user?.school || 'the network';
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!document.getElementById('pas-satoshi')) {
      const l = document.createElement('link');
      l.id = 'pas-satoshi'; l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: BG, fontFamily: SF,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Check */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: GRAD_INDIGO,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 12px 32px rgba(109,40,217,0.32)',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Label */}
        <p style={{
          fontFamily: SF, fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.10em',
          color: INDIGO, margin: '0 0 14px',
        }}>
          You're all set
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: SF, fontSize: 'clamp(28px, 7vw, 40px)',
          fontWeight: 900, color: TEXT, letterSpacing: '-0.03em',
          margin: '0 0 20px', lineHeight: 1.15,
        }}>
          You're live in the network{firstName ? `, ${firstName}` : ''}.
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: TEXT2,
          lineHeight: 1.7, margin: '0 0 16px',
        }}>
          Your profile is now visible to students across the {schoolName} network.
        </p>

        <p style={{
          fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: TEXT2,
          lineHeight: 1.7, margin: '0 0 40px',
        }}>
          The moment a student reaches out — we'll let you know immediately. Until then, you don't need to do a thing.
        </p>

        {/* Share box */}
        <div style={{
          background: CARD, border: `1px solid ${INDIGO_BORDER}`,
          borderRadius: 18, padding: 'clamp(20px, 5vw, 28px)',
          boxShadow: SHADOW_LG, marginBottom: 28,
        }}>
          <p style={{
            fontFamily: SF, fontSize: 14, color: TEXT2,
            margin: '0 0 18px', lineHeight: 1.6, fontWeight: 500,
          }}>
            Know another parent who'd want to help? Every parent makes the network stronger for everyone's kids.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://collegefastforward.com');
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            style={{
              width: '100%', fontFamily: SF, fontSize: 15, fontWeight: 700,
              color: '#fff', background: GRAD_INDIGO, border: 'none',
              borderRadius: 12, padding: '14px 20px', cursor: 'pointer',
              minHeight: 52, boxShadow: '0 8px 24px rgba(109,40,217,0.30)',
              transition: 'all 0.2s ease', touchAction: 'manipulation',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {copied ? '✓ Link copied!' : 'Share College Fast Forward →'}
          </button>
        </div>

        {/* Student dashboard link — josinoff@gmail.com only */}
        {user?.email === 'josinoff@gmail.com' && (
        <a
          href="#/FreeTierDashboard"
          style={{
            display: 'inline-block', fontFamily: SF, fontSize: 15, fontWeight: 700,
            color: INDIGO, background: 'transparent',
            border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12,
            padding: '13px 24px', textDecoration: 'none', cursor: 'pointer',
            minHeight: 50, marginBottom: 28, transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          Go to my dashboard →
        </a>
        )}

        {/* Admin dashboard link — admin only */}
        {user?.role === 'admin' && (
        <a
          href="#/admin"
          style={{
            display: 'inline-block', fontFamily: SF, fontSize: 14, fontWeight: 600,
            color: TEXT3, background: 'transparent',
            border: 'none', borderRadius: 12,
            padding: '8px 24px', textDecoration: 'none', cursor: 'pointer',
            marginBottom: 28, transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = INDIGO; }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT3; }}
        >
          Admin dashboard →
        </a>
        )}

        {/* Closing line */}
        <p style={{
          fontFamily: SF, fontSize: 15, color: TEXT3,
          margin: 0, lineHeight: 1.6, fontWeight: 500,
        }}>
          Thank you for being part of something new.
        </p>

      </div>
    </div>
  );
}