import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const MOMENTS = [
  { icon: '☀️', time: 'Morning', text: 'CLIFF found 3 opportunities.', sub: 'Ranked and ready before your first class.' },
  { icon: '🌤️', time: 'Afternoon', text: 'Resume already tailored.', sub: 'Every application prepared while you were busy.' },
  { icon: '🌙', time: 'Evening', text: 'Interview tomorrow. Practice for five minutes.', sub: 'One small rep tonight — sharper answers tomorrow.' },
];

// CLIFF keeps working while the student isn't
export default function DayWithCliff() {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal><div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>A day with CLIFF</span>
        </div>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 7vw, 44px)', textAlign: 'center' }}>
          CLIFF keeps working{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>while you're in class.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {MOMENTS.map((m, i) => (
            <div key={i} style={{ background: '#f8f9ff', border: '1px solid #eef0f5', borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#eef0f5'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>{m.time}</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.35 }}>{m.text}</p>
              <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: '#64748b', margin: 0, lineHeight: 1.55 }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div></Reveal>
    </div>
  );
}