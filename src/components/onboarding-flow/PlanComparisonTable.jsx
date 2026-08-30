const dm = "'DM Sans', system-ui, sans-serif";

export default function PlanComparisonTable({ networkCount = 0 }) {
  const rows = [
    ['Daily job matches', '3 per day', 'Unlimited'],
    ['Warm connections', '1 unlocked', networkCount > 1 ? `All ${networkCount} + AI scout` : 'Unlimited + AI scout'],
    ['Resume tailoring', '1 instant, then 24h queue', 'Always instant'],
    ['AI outreach drafts', 'Drafts included', 'Drafts + automatic follow-ups'],
    ['Overnight prep', '—', 'Every night while you sleep'],
    ['Application tracker', 'Included', 'Included'],
  ];

  const cell = { fontFamily: dm, fontSize: 12, padding: '12px 14px', margin: 0 };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', borderBottom: '1.5px solid #e5e7eb' }}>
        <div style={{ ...cell }} />
        <p style={{ ...cell, fontWeight: 700, color: '#374151', textAlign: 'center' }}>Free</p>
        <p style={{ ...cell, fontWeight: 800, color: '#6d28d9', textAlign: 'center', background: '#f5f3ff' }}>
          Premium · $4.99/week — billed monthly at $19.96
        </p>
      </div>
      {rows.map(([feature, free, premium], i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
          <p style={{ ...cell, fontWeight: 700, color: '#111827' }}>{feature}</p>
          <p style={{ ...cell, color: free === '—' ? '#cbd5e1' : '#6b7280', textAlign: 'center' }}>{free}</p>
          <p style={{ ...cell, fontWeight: 700, color: '#6d28d9', textAlign: 'center', background: '#f5f3ff' }}>{premium}</p>
        </div>
      ))}
    </div>
  );
}