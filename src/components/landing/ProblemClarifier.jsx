const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const OUTCOMES = [
  { icon: '🔎', text: 'Fewer jobs to sort through' },
  { icon: '📄', text: 'Stronger applications' },
  { icon: '✅', text: 'One clear next move' },
];

export default function ProblemClarifier() {
  return (
    <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: 'clamp(36px, 8vw, 56px) clamp(20px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 24px)', fontWeight: 800, color: TEXT, lineHeight: 1.45, letterSpacing: '-0.02em', margin: '0 0 clamp(20px, 5vw, 28px)' }}>
          The internet gives students thousands of jobs.{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            CLIFF tells them which opportunities are actually worth their time.
          </span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px, 3vw, 16px)', flexWrap: 'wrap' }}>
          {OUTCOMES.map(o => (
            <div key={o.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f8f9ff', border: '1px solid rgba(109,40,217,0.16)', borderRadius: 100, padding: '10px 18px' }}>
              <span style={{ fontSize: 14 }}>{o.icon}</span>
              <span style={{ fontFamily: SF, fontSize: 'clamp(12px, 3.2vw, 14px)', fontWeight: 700, color: TEXT2 }}>{o.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}