const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Compact visual progress timeline for one application
export default function AppTimeline({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, margin: '10px 0' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontFamily: dm, fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
            color: s.terminal ? '#dc2626' : s.done ? '#059669' : '#9ca3af',
            background: s.terminal ? '#fef2f2' : s.done ? '#ecfdf5' : '#f3f4f6',
            border: `1px solid ${s.terminal ? '#fecaca' : s.done ? '#a7f3d0' : '#e5e7eb'}`,
            borderRadius: 100, padding: '2px 8px',
          }}>
            {s.label}{s.done && !s.terminal ? ' ✓' : ''}
          </span>
          {i < steps.length - 1 && <span style={{ color: '#d1d5db', fontSize: 10 }}>—</span>}
        </div>
      ))}
    </div>
  );
}