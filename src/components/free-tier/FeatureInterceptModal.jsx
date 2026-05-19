const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

/**
 * High-converting Premium Gateway Intercept Modal.
 * Drop-in replacement for UpgradeModal — same prop signature.
 *
 * @param {string}   featureName  - Optional feature label shown in header.
 * @param {function} onClose      - Closes the modal.
 * @param {function} onUpgrade    - Fires the billing/checkout flow.
 */
export default function FeatureInterceptModal({ featureName, onClose, onUpgrade, user }) {
  const schoolName = user?.school_name || user?.schoolName || user?.school || 'your university';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 20000,
        background: 'rgba(2,6,23,0.65)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fi-backdrop 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 28,
          maxWidth: 420, width: '100%',
          padding: '32px 28px 28px',
          boxShadow: '0 32px 72px -12px rgba(0,0,0,0.18)',
          position: 'relative', overflow: 'hidden',
          animation: 'fi-modal 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <style>{`
          @keyframes fi-backdrop { from { opacity:0; } to { opacity:1; } }
          @keyframes fi-modal { from { opacity:0; transform:translateY(18px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        `}</style>

        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(to right, #6366f1, #3b82f6, #6366f1)',
        }} />

        {/* Dismiss */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute', top: 14, right: 14,
            fontFamily: dm, fontSize: 13, fontWeight: 600,
            color: '#94a3b8', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
            padding: '4px 6px', borderRadius: 6, lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#475569'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >✕</button>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#eef2ff', border: '1px solid #c7d2fe',
            borderRadius: 100, padding: '4px 14px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 12 }}>🤖</span>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#4338ca', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CLiFF Premium Feature
            </span>
          </div>

          <h3 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Unlock the Inside Track
          </h3>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.65, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
            Traditional job applications are a black hole. Let CLiFF bypass the filters and connect you directly.
          </p>
        </div>

        {/* ── Value checklist ── */}
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 16, padding: '16px 18px', marginBottom: 20,
        }}>
          {[
            { icon: '⚡', text: 'Unmask verified company profiles, roles, and hiring contacts.' },
            { icon: '🤝', text: 'Access 24/7 personalized, AI-generated email & LinkedIn scripts.' },
            { icon: '🧬', text: <>Map directly into the verified <strong style={{ color: '#0f172a' }}>{schoolName} Campus Ecosystem</strong>.</> },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 2 ? 12 : 0 }}>
              <span style={{ fontSize: 15, color: '#4f46e5', flexShrink: 0, marginTop: -1 }}>{icon}</span>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* ── Price + CTA ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontFamily: sat, fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>$4.99</span>
            <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>/ week</span>
          </div>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            ✨ Cancel anytime in one click. Skip a week whenever you want.
          </p>

          <button
            onClick={onUpgrade}
            style={{
              width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff',
              background: 'linear-gradient(135deg, #059669 0%, #15803d 100%)',
              border: 'none', borderRadius: 14, padding: '16px 20px',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 8px 24px rgba(5,150,105,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s', letterSpacing: '-0.01em',
              marginBottom: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(5,150,105,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.30)'; }}
          >
            Unlock Everything Instantly — $4.99/wk →
          </button>

          <p style={{ fontFamily: dm, fontSize: 10, color: '#94a3b8', fontWeight: 500, margin: 0 }}>
            Secured and processed natively by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}