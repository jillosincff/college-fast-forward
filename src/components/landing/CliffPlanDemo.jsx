import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

const STEPS = [
  'Reviewed 42 opportunities',
  'Filtered out sales jobs',
  'Found 3 worth pursuing',
  'Resume improvements ready',
  'Networking advantage available',
];

// One complete CLIFF experience: student states a goal → CLIFF works → one clear next move.
export default function CliffPlanDemo({ onContinue }) {
  const [visible, setVisible] = useState(0); // how many steps revealed

  useEffect(() => {
    if (visible >= STEPS.length + 1) return; // +1 = best-move card
    const t = setTimeout(() => setVisible(v => v + 1), visible === 0 ? 800 : 550);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, boxShadow: '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(109,40,217,0.12)', padding: '20px 20px 22px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
        <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>CLIFF</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SF, fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulseGreen 2s infinite' }} />
          working
        </span>
      </div>

      {/* Student message */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '85%' }}>
          <p style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 600, margin: 0, lineHeight: 1.45 }}>I want a marketing internship in Florida.</p>
        </div>
      </div>

      {/* CLIFF working checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: visible > i ? 1 : 0.18, transform: visible > i ? 'translateY(0)' : 'translateY(4px)', transition: 'all 0.4s ease' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: visible > i ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 900 }}>✓</span>
            </div>
            <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#334155' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Today's Best Move */}
      <div style={{ background: '#faf9ff', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 14, padding: '14px 16px', opacity: visible > STEPS.length ? 1 : 0.15, transform: visible > STEPS.length ? 'translateY(0)' : 'translateY(6px)', transition: 'all 0.45s ease' }}>
        <p style={{ fontFamily: SF, fontSize: 10.5, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 5px' }}>Today's Best Move</p>
        <p style={{ fontFamily: SF, fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.4 }}>Prepare Johnson &amp; Johnson Marketing Internship</p>
        <button onClick={onContinue} style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: 'none', borderRadius: 999, padding: '10px 22px', cursor: 'pointer', minHeight: 44, boxShadow: '0 6px 18px rgba(109,40,217,0.30)' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}