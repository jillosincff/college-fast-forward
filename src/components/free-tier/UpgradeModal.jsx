const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';

export default function UpgradeModal({ featureName, onClose, onUpgrade }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'fadeUp 0.25s ease' }}
      >
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

        <div style={{ width: 56, height: 56, borderRadius: 18, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px' }}>⚡</div>

        <h2 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: '#111827', textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Unlock {featureName || 'the 3-Day Job Sprint'}
        </h2>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>
          The AI execution engine that finds backdoor leads, drafts outreach, and tracks your pipeline automatically — so you spend less time searching and more time interviewing.
        </p>

        {/* Feature bullets */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          {[
            '⚡ Backdoor lead signals before they go public',
            '✉️ AI-drafted alumni outreach scripts',
            '📄 1-click Resume Wow rewrite tool',
            '💬 Hiring Expert Chat — AI + human guidance',
            '🗂️ Unlimited application tracking',
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 4 ? 10 : 0 }}>
              <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.5 }}>{line}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <button
            onClick={onUpgrade}
            style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
          >
            <div>
              <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>$4.99 / week</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>Cancel anytime</p>
            </div>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '3px 10px' }}>Flexible</span>
          </button>

          <button
            onClick={onUpgrade}
            style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #15803d)`, border: `2px solid ${GREEN}`, borderRadius: 14, padding: '18px 20px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div>
              <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>$19 for 30 days</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#d1fae5', margin: '3px 0 0' }}>Best value · Most students choose this</p>
            </div>
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#000', background: '#fff', borderRadius: 100, padding: '4px 10px', position: 'absolute', top: -10, right: 12 }}>POPULAR</span>
          </button>
        </div>

        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', textAlign: 'center', margin: '0 0 16px' }}>🎁 Invite a friend and your first week is on us.</p>

        <button
          onClick={onClose}
          style={{ width: '100%', fontFamily: dm, fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}