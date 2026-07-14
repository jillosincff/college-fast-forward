const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const FREE_ITEMS = [
  'See personalized opportunities',
  "Get Today's Best Moves",
  'Track applications',
  'Use limited CLIFF guidance',
  'Start future work manually',
];

const PRO_ITEMS = [
  'Prepare every worthwhile application',
  'Keep opportunities re-ranked',
  'Get proactive follow-ups and interview prep',
  'Find useful networking advantages',
  'Let CLIFF bring you back only when something matters',
];

// Step 3: the contextual Pro offer — continuation of momentum, Free path never hidden.
export default function ProOfferStep({ onKeepWorking, onContinueFree }) {
  return (
    <div>
      <h2 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
        Keep CLIFF working.
      </h2>
      <p style={{ fontFamily: dm, fontSize: 13.5, color: '#4b5563', margin: '0 0 18px', lineHeight: 1.6 }}>
        Your first CLIFF-powered application was free. CLIFF Pro prepares every opportunity worth pursuing and keeps your plan moving while you're away.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: '1 1 200px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Continue with Free</p>
          {FREE_ITEMS.map((t, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 6px', lineHeight: 1.5 }}>• {t}</p>
          ))}
        </div>
        <div style={{ flex: '1 1 200px', background: '#faf9ff', border: '1.5px solid #c4b5fd', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Turn on CLIFF Pro</p>
          {PRO_ITEMS.map((t, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>• {t}</p>
          ))}
        </div>
      </div>

      <button
        onClick={onKeepWorking}
        style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '13px 28px', cursor: 'pointer', width: '100%', marginBottom: 10, boxShadow: '0 6px 20px rgba(109,40,217,0.28)' }}
      >
        Keep CLIFF Working
      </button>
      <button
        onClick={onContinueFree}
        style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 999, padding: '12px 28px', cursor: 'pointer', width: '100%' }}
      >
        Continue with Free
      </button>
      <p style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '12px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
        Everything you've completed stays yours either way.
      </p>
    </div>
  );
}