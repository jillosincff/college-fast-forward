import { Clock, Target } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Step 2: what CLIFF is ready to do next — real move from the Decision Engine only.
export default function ContinuationStep({ move, onNext, onClose }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 20, color: '#9ca3af', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, lineHeight: 1 }}>×</button>
      </div>
      {move ? (
        <>
          <h2 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
            CLIFF already found your next move.
          </h2>
          <p style={{ fontFamily: dm, fontSize: 13.5, color: '#4b5563', margin: '0 0 18px', lineHeight: 1.6 }}>
            While you were finishing this application, I kept working. Here's the one thing I'd do next:
          </p>
          <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
            <p style={{ fontFamily: dm, fontSize: 15.5, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>{move.title}</p>
            {move.reason && <p style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 10px', lineHeight: 1.5 }}>{move.reason}</p>}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {move.time && (
                <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {move.time}
                </span>
              )}
              {move.outcome && (
                <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Target size={11} /> {move.outcome}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 8px', lineHeight: 1.2 }}>
            You're on track.
          </h2>
          <p style={{ fontFamily: dm, fontSize: 13.5, color: '#4b5563', margin: '0 0 20px', lineHeight: 1.6 }}>
            I'll keep helping you through Free. CLIFF Pro becomes most valuable when you're ready to pursue your next opportunity.
          </p>
        </>
      )}
      <button
        onClick={onNext}
        style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '13px 28px', cursor: 'pointer', width: '100%' }}
      >
        {move ? 'How do I keep this going? →' : 'Continue →'}
      </button>
    </div>
  );
}