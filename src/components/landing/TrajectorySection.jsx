import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const PATH = ['Marketing Intern', 'Marketing Coordinator', 'Assistant Brand Manager', 'Brand Manager'];

export default function TrajectorySection() {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal><div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Career Trajectory</span>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 42px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 14px' }}>
          You don't have to qualify for your{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>dream job today.</span>
        </h2>
        <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: '#475569', margin: '0 auto clamp(28px, 7vw, 40px)', maxWidth: 520, lineHeight: 1.65 }}>
          CLIFF helps you identify the strongest next step — not just the final destination.
        </p>

        <div style={{ background: '#faf9ff', border: '1px solid rgba(109,40,217,0.16)', borderRadius: 20, padding: 'clamp(24px, 5vw, 36px)', maxWidth: 440, margin: '0 auto', boxShadow: '0 4px 16px rgba(109,40,217,0.10)', textAlign: 'left' }}>
          <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Goal</p>
          <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.02em' }}>Brand Manager</p>
          <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>One possible path</p>
          {PATH.map((step, i) => (
            <div key={step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: i === PATH.length - 1 ? 'linear-gradient(135deg, #6d28d9, #7c3aed)' : '#fff', border: i === PATH.length - 1 ? 'none' : '2px solid rgba(109,40,217,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: i === PATH.length - 1 ? '#fff' : '#6d28d9' }}>{i === PATH.length - 1 ? '🎯' : i + 1}</span>
                </div>
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: i === PATH.length - 1 ? 900 : 700, color: '#0f172a', margin: 0 }}>{step}</p>
                {i === 0 && <span style={{ marginLeft: 'auto', fontFamily: SF, fontSize: 10.5, fontWeight: 800, color: '#16a34a', background: '#dcfce7', borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' }}>You start here</span>}
              </div>
              {i < PATH.length - 1 && <div style={{ width: 2, height: 20, background: 'rgba(109,40,217,0.25)', marginLeft: 14 }} />}
            </div>
          ))}
        </div>
      </div></Reveal>
    </div>
  );
}