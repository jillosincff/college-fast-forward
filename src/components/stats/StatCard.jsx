const dm = "'DM Sans', system-ui, sans-serif";

/**
 * A single metric tile for the public Stats page.
 * Matches the app's analytics design language (white card, accent top border).
 */
export default function StatCard({ label, value, sub, accent = '#6366f1', icon }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 6,
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>}
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          {label}
        </p>
      </div>
      <span style={{ fontFamily: dm, fontSize: 36, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </span>
      {sub && <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>{sub}</p>}
    </div>
  );
}