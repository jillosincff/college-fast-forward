import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

// Marketing illustration of the in-product "While you were away" surface.
// (In the product itself, only truthful, real updates are shown.)
const EXAMPLES = [
  '✓ Found 2 better opportunities',
  '✓ Removed 4 expired jobs',
  '✓ Re-ranked your priorities',
  '✓ Interview tomorrow',
  '✓ Nothing else needs your attention today',
];

export default function WhileAwaySection() {
  return (
    <div style={{ padding: 'clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 42px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 10px' }}>
            While you were{' '}
            <span style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>away…</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: '#475569', margin: '0 0 clamp(24px, 6vw, 32px)', lineHeight: 1.6 }}>
            Every time you open CLIFF, the work is already done.
          </p>

          <div style={{ background: '#f8f9ff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 20, padding: 'clamp(20px, 5vw, 28px)', textAlign: 'left', boxShadow: '0 4px 16px rgba(109,40,217,0.08)', maxWidth: 460, margin: '0 auto' }}>
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>While you were away…</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {EXAMPLES.map((t, i) => (
                <p key={i} style={{ fontFamily: SF, fontSize: 'clamp(13.5px, 3.8vw, 15px)', fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.5 }}>{t}</p>
              ))}
            </div>
          </div>

          <p style={{ fontFamily: SF, fontSize: 12.5, color: '#94a3b8', margin: '18px 0 0', lineHeight: 1.6 }}>
            You live your life. CLIFF stays on top of your career.
          </p>
        </div>
      </Reveal>
    </div>
  );
}