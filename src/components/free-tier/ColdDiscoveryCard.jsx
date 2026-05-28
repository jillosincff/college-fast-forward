/**
 * ColdDiscoveryCard
 * The final card in the MatchFlashCarousel track.
 * Appears after all warm match cards and gives users a conscious opt-in
 * to expand their search into cold/connectionless roles.
 */
const dm = "'DM Sans', system-ui, sans-serif";

export default function ColdDiscoveryCard({ firstName, onOptIn }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 'calc(100vw - 56px)',
        maxWidth: 480,
        scrollSnapAlign: 'start',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: 18,
        border: '1.5px solid rgba(139,92,246,0.3)',
        boxShadow: '0 2px 16px rgba(124,58,237,0.12)',
        padding: '22px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🔍</span>
        <div>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>
            Want to explore further{firstName ? `, ${firstName}` : ''}?
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            CLIFF has mapped your best warm backdoor paths above. There may be more open roles where we don't yet have an active alumni or parent contact.
          </p>
        </div>
      </div>

      {/* Distinction notice */}
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
          ⚠️ These will be clearly labelled <strong style={{ color: '#fbbf24' }}>Cold Roles</strong> — no backdoor channel, traditional application or cold outreach required.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onOptIn}
        style={{
          fontFamily: dm,
          fontSize: 13,
          fontWeight: 800,
          color: '#fff',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          border: 'none',
          borderRadius: 12,
          padding: '13px 0',
          cursor: 'pointer',
          width: '100%',
          minHeight: 'auto',
          letterSpacing: '0.01em',
          boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
        }}
      >
        Yes, show me cold roles →
      </button>
      <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
        Warm paths always shown first · Cold roles separated below
      </p>
    </div>
  );
}