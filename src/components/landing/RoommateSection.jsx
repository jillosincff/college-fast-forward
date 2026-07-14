import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const ROOMMATE = ['37 tabs open', 'Same resume everywhere', 'No follow-up plan', 'No clue what matters'];
const YOU = ['Three vetted opportunities', 'Application prepared', 'Next move waiting', 'Done for today'];

// Campaign section — student-facing only. Do not reuse on parent/institutional pages.
export default function RoommateSection({ go }) {
  return (
    <div style={{ padding: 'clamp(48px, 10vw, 88px) clamp(20px, 5vw, 40px)', background: '#f8f9ff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 12px' }}>
            Your roommate is still job searching.<br />
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>You're CLIFFing.</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: '#475569', margin: '0 auto clamp(28px, 7vw, 36px)', maxWidth: 480, lineHeight: 1.6 }}>
            They're scrolling through hundreds of listings. You already know your three best moves today.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, textAlign: 'left' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 'clamp(20px, 5vw, 26px)' }}>
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Your roommate 😩</p>
              {ROOMMATE.map((t, i) => (
                <p key={i} style={{ fontFamily: SF, fontSize: 14, fontWeight: 500, color: '#64748b', margin: '0 0 9px', lineHeight: 1.5 }}>• {t}</p>
              ))}
            </div>
            <div style={{ background: '#fff', border: '2px solid #6d28d9', borderRadius: 20, padding: 'clamp(20px, 5vw, 26px)', boxShadow: '0 8px 28px rgba(109,40,217,0.14)' }}>
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>You 😎</p>
              {YOU.map((t, i) => (
                <p key={i} style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 9px', lineHeight: 1.5 }}>✓ {t}</p>
              ))}
            </div>
          </div>

          <button onClick={go} style={{ marginTop: 'clamp(28px, 7vw, 36px)', fontFamily: SF, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD, border: 'none', borderRadius: 999, padding: '16px 44px', cursor: 'pointer', minHeight: 52, boxShadow: '0 8px 28px rgba(109,40,217,0.30)' }}>
            Start CLIFFing
          </button>
        </div>
      </Reveal>
    </div>
  );
}