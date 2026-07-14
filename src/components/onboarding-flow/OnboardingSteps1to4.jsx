import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW, SHADOW_MD, R, BLUE, BLUE_LIGHT, BLUE_BORDER,
  GREEN, GREEN_LIGHT, GREEN_BORDER, SEEKING_OPTIONS, Screen2Experts, Nav,
} from './onboardingShared';

/**
 * Onboarding screens 1–4 — extracted verbatim from OnboardingFlow.
 * All state + handlers are passed in as props from the shell. No logic changed.
 */
export default function OnboardingSteps1to4({
  screen, next, back,
  h1style, substyle, card,
  // screen 2
  hoveredExpert, setHoveredExpert, selectedExpert, setSelectedExpert, blockers,
  // screen 3
  frustration, setFrustration, analyzingFrustration, setAnalyzingFrustration,
  // screen 4
  seeking, setSeeking,
}) {
  return (
    <>
      {/* ── SCREEN 1: Welcome ── */}
      {screen === 1 && (
        <div style={{ ...card, position: 'relative', overflow: 'visible', minHeight: 400 }}>
          {/* Teaser background ghost cards */}
          <div style={{ position: 'absolute', left: '-18%', top: '8%', width: 160, height: 100, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', opacity: 0.07, transform: 'rotate(-6deg)', pointerEvents: 'none', padding: '10px 14px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: 8, background: '#0066FF', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: '90%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '75%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '80%', height: 5, background: '#CBD5E1', borderRadius: 3 }} />
          </div>
          <div style={{ position: 'absolute', right: '-15%', top: '20%', width: 150, height: 90, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', opacity: 0.07, transform: 'rotate(5deg)', pointerEvents: 'none', padding: '10px 14px', overflow: 'hidden' }}>
            <div style={{ width: '50%', height: 8, background: '#10B981', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ width: '85%', height: 5, background: '#CBD5E1', borderRadius: 3, marginBottom: 4 }} />
            <div style={{ width: '70%', height: 5, background: '#CBD5E1', borderRadius: 3 }} />
          </div>

          <style>{`
            @keyframes boltPop {
              0%   { transform: scale(0.5) rotate(-15deg); opacity: 0; }
              60%  { transform: scale(1.3) rotate(8deg);  opacity: 1; }
              80%  { transform: scale(0.92) rotate(-4deg); }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes boltGlow {
              0%, 100% { text-shadow: 0 0 0px rgba(0,102,255,0); }
              50%       { text-shadow: 0 0 12px rgba(0,102,255,0.5); }
            }
          `}</style>

          {/* Badge pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ fontSize: 14, display: 'inline-block', animation: 'boltPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both, boltGlow 2s ease-in-out 0.8s infinite' }}>⚡</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Career Agent</span>
          </div>

          {/* Headline — a promise, not a question */}
          <h1 style={{ fontFamily: FONT, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 14px', fontSize: 'clamp(34px, 6vw, 52px)', color: TEXT }}>
            Meet{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF.</span>
          </h1>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#334155', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 480, fontWeight: 600 }}>
            I'm your AI Career Agent. Here's what I'm going to do for you:
          </p>

          {/* The promises */}
          <div style={{ background: CARD, border: '1px solid #E8EAF6', borderRadius: 16, padding: '20px 24px', margin: '0 auto 24px', maxWidth: 440, textAlign: 'left', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
            {[
              'Find the opportunities actually worth your time',
              'Prepare your applications',
              'Explain every recommendation I make',
              'Keep you moving until you get hired',
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', color: INDIGO, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>✓</span>
                <p style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.5 }}>{line}</p>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 16px' }}>Let's build your plan.</p>

          {/* CTA button with glow */}
          <button
            onClick={next}
            className="onb-btn-primary"
            style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 28px', fontFamily: FONT, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '20px 52px', cursor: 'pointer', minHeight: 56, boxShadow: '0 10px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(109,40,217,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(109,40,217,0.28)'; }}
          >Let's Go →</button>

          {/* Social proof trust bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
              ].map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', marginLeft: i === 0 ? 0 : -8, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }} onError={e => { e.target.style.display = 'none'; }} />
              ))}
            </div>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
              Join <strong style={{ color: TEXT }}>2,400+ students</strong> from top campuses who stopped guessing and started landing opportunities.
            </p>
          </div>
        </div>
      )}

      {/* ── SCREEN 2: Built by Experts ── */}
      {screen === 2 && (
        <Screen2Experts
          FONT={FONT} CARD={CARD} R={R} SHADOW={SHADOW} SHADOW_MD={SHADOW_MD}
          BLUE={BLUE} BLUE_LIGHT={BLUE_LIGHT} BLUE_BORDER={BLUE_BORDER}
          GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} GREEN_BORDER={GREEN_BORDER}
          TEXT={TEXT} TEXT2={TEXT2} TEXT3={TEXT3}
          h1style={h1style} substyle={substyle}
          hoveredExpert={hoveredExpert} setHoveredExpert={setHoveredExpert}
          selectedExpert={selectedExpert} setSelectedExpert={setSelectedExpert}
          blockers={blockers}
          onBack={back} onNext={next}
        />
      )}

      {/* ── SCREEN 4: CLIFF's Mission ── */}
      {screen === 4 && (
        <div style={{ ...card, maxWidth: 520 }}>
          {/* Agent framing badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F0FDF4', border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11 }}>🎯</span>
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Giving CLIFF its mission</span>
          </div>

          <h1 style={h1style}>What do you want CLIFF to help you get?</h1>
          <p style={{ ...substyle, marginBottom: 28 }}>This is CLIFF's mission. Every job it finds, every intro it surfaces, and every material it builds starts with this answer.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4, textAlign: 'left' }} className="blocker-card-list">
            {SEEKING_OPTIONS.map(opt => {
              const isActive = seeking === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSeeking(opt.key)}
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
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = INDIGO_BORDER; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E8EFF6'; } }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isActive ? BLUE_BORDER : '#E2E8F0'}` }}>{opt.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isActive ? BLUE : TEXT, margin: '0 0 2px' }}>{opt.label}</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: isActive ? '#3B82F6' : TEXT2, margin: '0 0 2px' }}>{opt.sub}</p>
                    {isActive && (
                      <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>
                        → {opt.hint}
                      </p>
                    )}
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isActive ? BLUE : '#CBD5E1'}`, background: isActive ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, transition: 'all 0.18s ease' }}>
                    {isActive && '✓'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant mirroring after selection */}
          {seeking && (() => {
            const selected = SEEKING_OPTIONS.find(o => o.key === seeking);
            const mirrorMap = {
              internship: 'short-term roles and return-offer internships',
              fulltime: 'full-time pipelines and long-term networking',
              both: 'a flexible dual-track of internships and full-time roles',
              exploring: 'options that help you discover the best fit first',
            };
            return (
              <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '14px 18px', marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeUp 0.25s ease' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.6 }}>
                  <strong>Perfect. I'll focus on {selected?.label?.toLowerCase()} first.</strong><br />
                  I'm now prioritizing <em>{mirrorMap[seeking]}</em>. Next question.
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