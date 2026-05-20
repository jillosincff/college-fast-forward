import { useState } from 'react';
import { getUniversityBrand } from '@/lib/universityBrand';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

/**
 * PremiumPaywallModal
 *
 * Props:
 *   user          – { full_name, school_code, school } or raw onboarding data
 *   firstName     – string (overrides user.full_name if provided)
 *   schoolName    – string (overrides brand lookup if provided)
 *   isDownsell    – boolean — if true shows $2.49/wk 50%-off session offer
 *   onClose       – () => void
 *   onPay         – () => void
 *   onReferral    – () => void
 */
export default function PremiumPaywallModal({
  user,
  firstName,
  schoolName,
  isDownsell = false,
  onClose,
  onPay,
  onReferral,
}) {
  const [referralClicked, setReferralClicked] = useState(false);

  const brand = getUniversityBrand(user?.school_code || user?.school);
  const resolvedSchool = schoolName || brand.shortName || brand.fullName || 'your school';
  const resolvedFirst = firstName || user?.full_name?.split(' ')[0] || 'You';

  const price = isDownsell ? '$2.49' : '$4.99';
  const priceLabel = isDownsell ? '$2.49/wk — 50% Off (Today Only)' : '$4.99/wk · Cancel anytime in 1-click';
  const headerLine = isDownsell
    ? `${resolvedFirst}, here's your last chance offer.`
    : `${resolvedFirst}, don't leave your ${resolvedSchool} network behind!`;

  const handleReferral = () => {
    setReferralClicked(true);
    onReferral?.();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(2,6,23,0.72)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 30000, padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 28,
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.22)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'pwModalIn 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <style>{`
          @keyframes pwModalIn {
            from { opacity: 0; transform: translateY(22px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Top accent bar */}
        <div style={{
          height: 5,
          background: isDownsell
            ? 'linear-gradient(to right, #f59e0b, #ef4444, #f59e0b)'
            : 'linear-gradient(to right, #6366f1, #3b82f6, #6366f1)',
        }} />

        <div style={{ padding: '28px 28px 24px' }}>

          {/* Dismiss */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              fontFamily: dm, fontSize: 18, fontWeight: 500, color: '#94a3b8',
              background: 'none', border: 'none', cursor: 'pointer',
              minHeight: 'auto', minWidth: 'auto', padding: '2px 6px', lineHeight: 1,
            }}
          >✕</button>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isDownsell ? '#fff7ed' : '#eef2ff',
              border: `1px solid ${isDownsell ? '#fed7aa' : '#c7d2fe'}`,
              borderRadius: 100, padding: '4px 14px', marginBottom: 12,
            }}>
              <span style={{ fontSize: 12 }}>{isDownsell ? '🔥' : '🤖'}</span>
              <span style={{
                fontFamily: dm, fontSize: 10, fontWeight: 800,
                color: isDownsell ? '#c2410c' : '#4338ca',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {isDownsell ? 'Session-Only Offer — 50% Off' : 'CLiFF Premium Access'}
              </span>
            </div>

            {/* Headline */}
            <h3 style={{
              fontFamily: sat, fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: 900, color: '#0f172a',
              margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2,
            }}>
              {headerLine}
            </h3>
            <p style={{
              fontFamily: dm, fontSize: 12, color: '#64748b',
              margin: 0, lineHeight: 1.65,
            }}>
              {isDownsell
                ? `We're offering you 50% off right now — this price disappears when you leave this page.`
                : `Your ${resolvedSchool} alumni network and hidden job signals are ready. One step to unlock them.`}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />

          {/* ── Dual Action Grid ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>

            {/* Option A — Pay */}
            <button
              onClick={onPay}
              style={{
                width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                background: isDownsell
                  ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #15803d 100%)',
                border: 'none', borderRadius: 16, padding: '18px 20px',
                cursor: 'pointer', minHeight: 'auto',
                boxShadow: isDownsell
                  ? '0 8px 24px rgba(239,68,68,0.28)'
                  : '0 8px 24px rgba(5,150,105,0.28)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: 15 }}>
                {isDownsell ? `🔥 Claim 50% Off — ${price}/wk →` : `⚡ Unlock Everything — ${price}/wk →`}
              </span>
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, opacity: 0.85 }}>
                {isDownsell ? `${price}/wk today only · Cancel anytime` : 'Cancel anytime in one click · Secured by Stripe'}
              </span>
            </button>

            {/* Divider with OR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Option B — Referral */}
            <button
              onClick={handleReferral}
              style={{
                width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#1e3a8a',
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: 16, padding: '16px 20px',
                cursor: 'pointer', minHeight: 'auto',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
            >
              <span style={{ fontSize: 15 }}>
                {referralClicked ? '✅ Referral Link Copied!' : '🔗 Text 3 Classmates to Unlock Free Access'}
              </span>
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: '#3b82f6' }}>
                Share your link · 3 sign-ups = free premium access
              </span>
            </button>
          </div>

          {/* Trust line */}
          <p style={{
            fontFamily: dm, fontSize: 10, color: '#94a3b8',
            textAlign: 'center', margin: 0,
          }}>
            🔒 Secured and processed natively by Stripe. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}