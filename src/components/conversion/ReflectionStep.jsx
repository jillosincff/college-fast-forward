const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Step 1: "Look what you just accomplished." — only real completed work.
export default function ReflectionStep({ data, onNext, onClose }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 20, color: '#9ca3af', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        Your first CLIFF-powered application
      </p>
      <h2 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 6px', lineHeight: 1.2 }}>
        Look what you just accomplished.
      </h2>
      {data.company_name && (
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>
          {data.role_title ? `${data.role_title} at ` : ''}{data.company_name}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0 20px' }}>
        {data.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{it.icon}</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>{it.label}</p>
              {it.detail && <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{it.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      {data.elapsed_minutes && (
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#15803d', margin: '0 0 20px' }}>
          You moved this application forward in {data.elapsed_minutes} minute{data.elapsed_minutes !== 1 ? 's' : ''}.
        </p>
      )}
      <button
        onClick={onNext}
        style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '13px 28px', cursor: 'pointer', width: '100%' }}
      >
        What's next? →
      </button>
    </div>
  );
}