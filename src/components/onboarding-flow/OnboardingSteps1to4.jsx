import {
  FONT, BG, CARD, TEXT, INDIGO, INDIGO_BORDER,
  GRAD_INDIGO, BLUE, BLUE_LIGHT, BLUE_BORDER,
  GREEN_LIGHT, GREEN_BORDER, SEEKING_OPTIONS, Nav,
} from './onboardingShared';

/**
 * Onboarding screens 1–2 of the agent-hiring flow:
 * 1 = Meet CLIFF · 2 = What are we working toward?
 */
export default function OnboardingSteps1to4({
  screen, next, back,
  h1style, substyle, card,
  seeking, setSeeking,
}) {
  return (
    <>
      {/* ── SCREEN 1: Meet CLIFF ── */}
      {screen === 1 && (
        <div style={{ ...card, position: 'relative', overflow: 'visible', minHeight: 400 }}>
          <style>{`
            @keyframes boltPop {
              0%   { transform: scale(0.5) rotate(-15deg); opacity: 0; }
              60%  { transform: scale(1.3) rotate(8deg);  opacity: 1; }
              80%  { transform: scale(0.92) rotate(-4deg); }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
          `}</style>

          {/* Badge pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ fontSize: 14, display: 'inline-block', animation: 'boltPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>⚡</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Career Agent</span>
          </div>

          <h1 style={{ fontFamily: FONT, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 14px', fontSize: 'clamp(34px, 6vw, 52px)', color: TEXT }}>
            Meet CLIFF.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your AI Career Agent.</span>
          </h1>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#334155', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: 480, fontWeight: 600 }}>
            Tell me where you want to go.<br />I'll build the plan and help you get there.
          </p>

          <button
            onClick={next}
            className="onb-btn-primary"
            style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 28px', fontFamily: FONT, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '20px 52px', cursor: 'pointer', minHeight: 56, boxShadow: '0 10px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(109,40,217,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(109,40,217,0.28)'; }}
          >Let's Build My Plan →</button>

          <p style={{ fontFamily: FONT, fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Join <strong style={{ color: TEXT }}>2,400+ students</strong> who stopped guessing and started landing opportunities.
          </p>
        </div>
      )}

      {/* ── SCREEN 2: What are we working toward? ── */}
      {screen === 2 && (
        <div style={{ ...card, maxWidth: 520 }}>
          <h1 style={h1style}>What are we working toward?</h1>
          <p style={{ ...substyle, marginBottom: 28 }}>Everything I find, prepare, and prioritize starts with this answer.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4, textAlign: 'left' }} className="blocker-card-list">
            {SEEKING_OPTIONS.map(opt => {
              const isActive = seeking === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSeeking(opt.key)}
                  className="onb-option-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                    background: isActive ? BLUE_LIGHT : CARD,
                    border: `2px solid ${isActive ? BLUE : '#E8EFF6'}`,
                    borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                    textAlign: 'left', minHeight: 'auto',
                    boxShadow: isActive
                      ? `0 0 0 3px ${INDIGO_BORDER}, 0 10px 24px rgba(109,40,217,0.10)`
                      : '0 4px 12px rgba(0,0,0,0.05)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isActive ? BLUE_BORDER : '#E2E8F0'}` }}>{opt.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: isActive ? BLUE : TEXT, margin: '0 0 2px' }}>{opt.label}</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: isActive ? '#7c3aed' : '#94a3b8', margin: 0 }}>{opt.sub}</p>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isActive ? BLUE : '#CBD5E1'}`, background: isActive ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, transition: 'all 0.18s ease' }}>
                    {isActive && '✓'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CLIFF responds naturally */}
          {seeking && (() => {
            const responseMap = {
              internship: { lead: 'Perfect.', follow: "We'll focus on internships." },
              fulltime: { lead: 'Great.', follow: "I'll help you launch your career." },
              exploring: { lead: 'No problem.', follow: "We'll figure it out together." },
            };
            const r = responseMap[seeking] || { lead: 'Got it.', follow: "I'll build your plan around that." };
            return (
              <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '14px 18px', marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.25s ease' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#065F46', margin: 0, lineHeight: 1.6 }}>
                  <strong>{r.lead}</strong><br />
                  {r.follow}
                </p>
              </div>
            );
          })()}

          <Nav onBack={back} onNext={next} nextDisabled={!seeking} />
        </div>
      )}
    </>
  );
}