import { useEffect } from 'react';
import { getUniversityBrand } from '@/lib/universityBrand';
import { base44 } from '@/api/base44Client';

let _trackUserId = 'anon';
const track = (event, props = {}) => {
  base44.entities.AnalyticsEvent.create({ event_name: event, user_id: _trackUserId, properties: props }).catch(() => {});
};

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

/**
 * PremiumPaywallModal
 *
 * Props:
 *   user              – { full_name, school_code, school } or raw onboarding data
 *   firstName         – string (overrides user.full_name if provided)
 *   schoolName        – string (overrides brand lookup if provided)
 *   isDownsell        – boolean — if true shows $2.49/wk 50%-off session offer
 *   isTokenDepleted   – boolean — if true shows weekly token limit reached state
 *   onClose           – () => void
 *   onPay             – () => void
 */
export default function PremiumPaywallModal({
  user,
  firstName,
  schoolName,
  isDownsell = false,
  isTokenDepleted = false,
  onClose,
  onPay,
}) {
  useEffect(() => {
    if (user?.id) _trackUserId = user.id;
    track(isDownsell ? 'downsell_modal_shown' : 'paywall_shown', { school: user?.school_code });
  }, []);

  const brand = getUniversityBrand(user?.school_code || user?.school);
  const resolvedSchool = schoolName || brand.shortName || brand.fullName || 'your school';
  const resolvedFirst = firstName || user?.full_name?.split(' ')[0] || 'You';

  const price = isDownsell ? '$2.49' : '$4.99';
  const priceLabel = isDownsell ? '$2.49/wk — 50% Off (Today Only)' : '$4.99/wk · Cancel anytime in 1-click';
  const headerLine = isTokenDepleted
    ? 'Weekly Outreach Limit Reached!'
    : isDownsell
    ? `${resolvedFirst}, here's your last chance offer.`
    : `${resolvedFirst}, don't leave your ${resolvedSchool} network behind!`;

  const handlePay = () => {
    track(isDownsell ? 'downsell_converted' : 'paywall_converted', { price: isDownsell ? 2.49 : 4.99 });
    onPay?.();
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
              background: isTokenDepleted ? '#fef2f2' : isDownsell ? '#fff7ed' : '#eef2ff',
              border: `1px solid ${isTokenDepleted ? '#fecaca' : isDownsell ? '#fed7aa' : '#c7d2fe'}`,
              borderRadius: 100, padding: '4px 14px', marginBottom: 12,
            }}>
              <span style={{ fontSize: 12 }}>{isTokenDepleted ? '⏳' : isDownsell ? '🔥' : '🤖'}</span>
              <span style={{
                fontFamily: dm, fontSize: 10, fontWeight: 800,
                color: isTokenDepleted ? '#dc2626' : isDownsell ? '#c2410c' : '#4338ca',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {isTokenDepleted ? 'Weekly Token Limit Reached' : isDownsell ? 'Session-Only Offer — 50% Off' : 'CLiFF Premium Access'}
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
              {isTokenDepleted
                ? `You've deployed all 3 of your premium campus routes for this cycle. Don't let your momentum stall while these roles are fresh.`
                : isDownsell
                ? `We're offering you 50% off right now — this price disappears when you leave this page.`
                : `Your ${resolvedSchool} alumni network and hidden job signals are ready. One step to unlock them.`}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />

          {/* ── Token Depletion Action Grid ── */}
          {isTokenDepleted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {/* Option 1 — Buy add-on tokens */}
              <button
                onClick={handlePay}
                style={{
                  width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  border: 'none', borderRadius: 16, padding: '16px 20px',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.28)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>🔑 Buy 2 More Routing Tokens — $2.99</span>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, opacity: 0.85 }}>Instant unlock · No subscription required</span>
              </button>

              {/* Option 2 — Upgrade to Pro */}
              <button
                onClick={handlePay}
                style={{
                  width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none', borderRadius: 16, padding: '16px 20px',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.28)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>🚀 Upgrade to Pro — $9.99/wk (Includes 10 Tokens)</span>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, opacity: 0.85 }}>Unlimited outreach · Cancel anytime</span>
              </button>
            </div>
          ) : (
          /* ── Standard / Downsell Action ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <button
              onClick={handlePay}
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
          </div>
          )}

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