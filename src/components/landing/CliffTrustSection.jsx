import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const PRINCIPLES = [
  { icon: '💬', text: 'I explain every recommendation.', sub: 'You always know why CLIFF is pointing you somewhere — never blind trust.' },
  { icon: '🧠', text: 'I remember your career goals.', sub: 'Your preferences, targets, and progress shape everything CLIFF does next.' },
  { icon: '🔕', text: 'I only interrupt you when something actually matters.', sub: 'No noise, no busywork. If CLIFF pings you, it\u2019s worth your time.' },
];

// Three simple principles, in CLIFF's own voice
export default function CliffTrustSection() {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#f8f9ff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal><div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Three simple principles</span>
        </div>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 7vw, 44px)', textAlign: 'center' }}>
          Why students{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>trust CLIFF.</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620, margin: '0 auto' }}>
          {PRINCIPLES.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: '#fff', border: '1px solid #eef0f5', borderRadius: 18, padding: 'clamp(18px, 4vw, 24px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(109,40,217,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
              <div>
                <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em', lineHeight: 1.4 }}>"{p.text}"</p>
                <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: '#64748b', margin: 0, lineHeight: 1.55 }}>{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div></Reveal>
    </div>
  );
}