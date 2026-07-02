const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

// One-time nudge shown when a student picks the free path on the plan screen.
// Outcome-framed: reminds them what they're leaving behind, then lets them go.
export default function FreeExitNudge({ networkCount, onUpgrade, onContinueFree, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✋</div>
        <h3 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          Before you go the slow route…
        </h3>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#4b5563', lineHeight: 1.65, margin: '0 0 20px' }}>
          Referred candidates are far more likely to land interviews than cold applicants.{' '}
          {networkCount > 0
            ? <>You have <strong style={{ color: '#6d28d9' }}>{networkCount} verified warm connection{networkCount === 1 ? '' : 's'}</strong> waiting — the free plan keeps all but one locked.</>
            : <>Premium arms CLiFF's alumni scout to find insiders at every company you target.</>}
        </p>
        <button
          onClick={onUpgrade}
          style={{ width: '100%', fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 12, padding: '16px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(109,40,217,0.35)', marginBottom: 10 }}
        >
          Unlock My Warm Intros — $4.99 →
        </button>
        <button
          onClick={onContinueFree}
          style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '10px' }}
        >
          No thanks, continue with free
        </button>
      </div>
    </div>
  );
}