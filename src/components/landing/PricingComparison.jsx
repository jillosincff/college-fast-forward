const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';

const ROWS = [
  ['Warm connection matches', '1 free match', 'Full network'],
  ['Resume tailoring', '1 instant, then 24h queue', 'Always instant'],
  ['AI outreach drafts', 'Included', '+ auto follow-ups'],
  ['Smart reminders & interview prep', '—', 'Included'],
  ['AI career agent', 'Limited', 'Unlimited'],
];

export default function PricingComparison() {
  const cell = { fontFamily: SF, fontSize: 12.5, padding: '10px 8px', lineHeight: 1.4 };
  return (
    <div style={{ border: '1px solid #ede9fe', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', background: '#f5f3ff' }}>
        <span style={cell} />
        <span style={{ ...cell, fontWeight: 800, color: '#334155', textAlign: 'center' }}>Free</span>
        <span style={{ ...cell, fontWeight: 800, color: INDIGO, textAlign: 'center' }}>CLIFF Pro</span>
      </div>
      {ROWS.map(([feature, free, premium], i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ ...cell, fontWeight: 600, color: '#0f172a' }}>{feature}</span>
          <span style={{ ...cell, color: '#64748b', textAlign: 'center' }}>{free}</span>
          <span style={{ ...cell, color: INDIGO, fontWeight: 700, textAlign: 'center', background: 'rgba(109,40,217,0.04)' }}>{premium}</span>
        </div>
      ))}
    </div>
  );
}