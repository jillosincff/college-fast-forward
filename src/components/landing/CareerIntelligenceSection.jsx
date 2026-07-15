import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const YEARS = [
  { year: 'Freshman', line: 'Build your foundation.', emoji: '🌱' },
  { year: 'Sophomore', line: 'Prepare before recruiting opens.', emoji: '🧭' },
  { year: 'Junior', line: 'Execute.', emoji: '⚡' },
  { year: 'Senior', line: 'Land your first job.', emoji: '🎓' },
];

export default function CareerIntelligenceSection() {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#f8f9ff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal><div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Career Intelligence</span>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 14px' }}>
          CLIFF knows{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>what matters now.</span>
        </h2>
        <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: '#475569', margin: '0 auto clamp(28px, 7vw, 44px)', maxWidth: 560, lineHeight: 1.65 }}>
          Every student shouldn't receive the same advice. CLIFF changes your plan based on your year, goals, and recruiting season.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, textAlign: 'left' }}>
          {YEARS.map((y) => (
            <div key={y.year} style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 4vw, 26px)', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.20)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,40,217,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{y.emoji}</div>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>{y.year}</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.35 }}>{y.line}</p>
            </div>
          ))}
        </div>
      </div></Reveal>
    </div>
  );
}