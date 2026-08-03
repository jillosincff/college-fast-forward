import Reveal from './Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const LINES = [
  { icon: '📄', text: 'Tailored your resume to the Marketing Intern role at Nike' },
  { icon: '🤝', text: 'Found Priya S. — UF alum, Brand Manager at Nike' },
  { icon: '✍️', text: 'Wrote your intro message to Priya' },
  { icon: '🎯', text: 'Ranked 4 new openings — 1 worth your time' },
];

/**
 * The wow moment, shown literally: the 7am email students wake up to.
 * Everything is finished before they open the app.
 */
export default function MorningBriefSection({ go }) {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              The 7 AM moment
            </span>
          </div>

          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 14px', textAlign: 'center' }}>
            You wake up.{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>It's already done.</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: TEXT2, margin: '0 auto clamp(28px, 6vw, 36px)', maxWidth: 520, lineHeight: 1.65, textAlign: 'center' }}>
            Every night CLIFF works while you sleep. This is the email waiting for you in the morning.
          </p>

          {/* The email */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 24px 48px rgba(109,40,217,0.14), 0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {/* Mail header */}
            <div style={{ padding: 'clamp(16px, 4vw, 20px) clamp(18px, 4vw, 24px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SF, fontSize: 15, fontWeight: 900, color: '#fff' }}>C</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0 }}>CLIFF</p>
                <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ☀️ Your application for Nike is ready
                </p>
              </div>
              <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 600, color: TEXT3, flexShrink: 0 }}>7:02 AM</span>
            </div>

            {/* Mail body */}
            <div style={{ padding: 'clamp(20px, 5vw, 28px) clamp(18px, 4vw, 24px)' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 15px)', color: TEXT2, margin: '0 0 18px', lineHeight: 1.65 }}>
                Good morning! While you slept, I was working on your search. Here's your overnight brief:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {LINES.map((l) => (
                  <div key={l.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(245,243,255,0.7)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
                    <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>{l.icon}</span>
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 600, color: '#3b2a6b', margin: 0, lineHeight: 1.55 }}>{l.text}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: TEXT2, margin: '0 0 20px', lineHeight: 1.65 }}>
                Everything's waiting on your dashboard. All you have to do is hit send.
              </p>

              <button onClick={go} style={{
                fontFamily: SF, fontSize: 'clamp(15px, 3.5vw, 16px)', fontWeight: 700, color: '#fff',
                background: GRAD_INDIGO, border: 'none', borderRadius: 999,
                padding: '15px 32px', cursor: 'pointer', minHeight: 52, width: '100%',
                boxShadow: '0 8px 28px rgba(109,40,217,0.30)', transition: 'all 0.2s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Get my first overnight brief →
              </button>
            </div>
          </div>

          <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: TEXT3, textAlign: 'center', margin: '18px 0 0', lineHeight: 1.6 }}>
            Your first overnight run is free — no card required.
          </p>
        </div>
      </Reveal>
    </div>
  );
}