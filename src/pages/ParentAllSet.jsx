import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { normalizeSchool } from '@/lib/schoolNames';
import InviteStudentCard from '@/components/parent-allset/InviteStudentCard';
import GiftProCard from '@/components/parent-allset/GiftProCard';

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
  // Resolve the full school name from whatever the parent record stores —
  // school_name ("University of Florida"), school_code ("uf"), or a fallback.
  const rawSchool = user?.school_name || user?.school || '';
  const schoolName = normalizeSchool(rawSchool) || rawSchool || 'the network';
  const [copied, setCopied] = useState(false);

  // Show a thank-you confirmation when returning from a successful FastIQ checkout
  const [showUpgradeThanks, setShowUpgradeThanks] = useState(false);
  // Show a gift confirmation when returning from a successful CLIFF Pro gift checkout
  const [showGiftThanks, setShowGiftThanks] = useState(false);
  useEffect(() => {
    const hashQuery = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashQuery);
    if (params.get('upgraded') === 'true') {
      setShowUpgradeThanks(true);
      // Clean the param so a refresh doesn't re-trigger the banner
      window.history.replaceState({}, '', window.location.origin + '/#/ParentAllSet');
    }
    if (params.get('gift') === 'success') {
      setShowGiftThanks(true);
      window.history.replaceState({}, '', window.location.origin + '/#/ParentAllSet');
    }
  }, []);

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

        {showUpgradeThanks && (
          <div style={{
            background: GRAD_INDIGO, color: '#fff',
            borderRadius: 16, padding: '18px 22px', marginBottom: 24,
            boxShadow: '0 12px 32px rgba(109,40,217,0.32)',
          }}>
            <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>
              Your student's FastIQ is active. ⚡
            </p>
            <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.5 }}>
              We sent them an email with instructions to log in and start. Thank you for investing in their search.
            </p>
          </div>
        )}

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
          lineHeight: 1.7, margin: '0 0 32px',
        }}>
          The moment a student reaches out — we'll let you know immediately. There's nothing you need to do to be found — but if you want to speed things up, the fastest move is getting your own student on here.
        </p>

        {showGiftThanks && (
          <div style={{
            background: GRAD_INDIGO, color: '#fff',
            borderRadius: 16, padding: '18px 22px', marginBottom: 24,
            boxShadow: '0 12px 32px rgba(109,40,217,0.32)',
          }}>
            <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>
              Your student's CLIFF Pro is on its way. 🎁
            </p>
            <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.5 }}>
              We've emailed them the good news. If they haven't signed up yet, Pro activates the moment they do.
            </p>
          </div>
        )}

        {/* Primary share — invite your own student (lowest-friction first step) */}
        <InviteStudentCard parentFirstName={firstName} />

        {/* Optional upsell — gift CLIFF Pro once their student has the link */}
        {!showGiftThanks && <GiftProCard />}

        {/* Secondary share — other parents */}
        <div style={{
          background: 'transparent', border: `1px solid ${INDIGO_BORDER}`,
          borderRadius: 14, padding: '16px 18px', marginBottom: 28,
        }}>
          <p style={{
            fontFamily: SF, fontSize: 13.5, color: TEXT2,
            margin: '0 0 10px', lineHeight: 1.6, fontWeight: 500,
          }}>
            Know another parent who'd want to help? Every parent makes the network stronger.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://collegefastforward.com');
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            style={{
              fontFamily: SF, fontSize: 13.5, fontWeight: 700,
              color: INDIGO, background: 'transparent', border: 'none',
              padding: 0, cursor: 'pointer', minHeight: 'auto',
              touchAction: 'manipulation',
            }}
          >
            {copied ? '✓ Link copied!' : 'Share with other parents →'}
          </button>
        </div>

        {/* Edit profile link — all parents */}
        <a
          href="#/ParentProfileEdit"
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
          Edit my profile →
        </a>

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