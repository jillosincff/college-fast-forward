import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const STACK = [
  { emoji: '🧠', name: 'Career Intelligence', line: 'Knows what you should be doing.' },
  { emoji: '🔭', name: 'Opportunity Intelligence', line: 'Finds the opportunities worth pursuing.' },
  { emoji: '🪜', name: 'Trajectory Intelligence', line: 'Knows which roles move you forward.' },
  { emoji: '📄', name: 'Execution Intelligence', line: 'Prepares your applications.' },
  { emoji: '🤝', name: 'Networking Intelligence', line: 'Uses warm connections only when they help.' },
];

export default function IntelligenceStackSection() {
  return (
    <div id="how-cliff-works" style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#f8f9ff', borderTop: '1px solid #f1f5f9', scrollMarginTop: 80 }}>
      <Reveal><div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>How CLIFF Works</span>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 7vw, 44px)' }}>
          One AI Agent.{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Five kinds of intelligence.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, textAlign: 'left' }}>
          {STACK.map((s) => (
            <div key={s.name} style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 4vw, 26px)', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.20)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,40,217,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.emoji}</div>
              <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: '#0f172a', margin: '0 0 5px', letterSpacing: '-0.02em' }}>{s.name}</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 500, color: '#475569', margin: 0, lineHeight: 1.5 }}>{s.line}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: '#0f172a', margin: 'clamp(24px, 6vw, 32px) 0 0' }}>
          You don't choose the tools.{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF chooses the best path.</span>
        </p>
      </div></Reveal>
    </div>
  );
}