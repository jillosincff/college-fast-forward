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

          {/* Headline */}
          <h1 style={{ fontFamily: FONT, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 16px', fontSize: 'clamp(30px, 5.5vw, 48px)', color: TEXT }}>
            Welcome to<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>College Fast Forward.</span>
          </h1>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#334155', lineHeight: 1.6, margin: '0 auto 14px', maxWidth: 480, fontWeight: 600 }}>
            Your AI Career Agent is here to end the endless application black hole.
          </p>

          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 15px)', color: TEXT2, lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 460 }}>
            Most students are stuck spamming 100+ apps with almost no responses.{' '}
            <strong style={{ color: TEXT }}>We're different</strong> — we learn who you are, then use AI + real campus insiders to get you interviews fast.
          </p>

          {/* CTA button with glow */}
          <button
            onClick={next}
            className="onb-btn-primary"
            style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 12px', fontFamily: FONT, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 12, padding: '20px 52px', cursor: 'pointer', minHeight: 56, boxShadow: '0 10px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(109,40,217,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(109,40,217,0.28)'; }}
          >Let's Build Your Interview Edge →</button>

          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, marginBottom: 4, lineHeight: 1.6 }}>
            This guided setup takes about 5 minutes — you'll have your first personalized plan by the end.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: INDIGO, fontWeight: 700, margin: '0 0 28px' }}>✨ Your first warm intro or interview is closer than you think.</p>

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

      {/* ── SCREEN 3: Frustration Slider ── */}
      {screen === 3 && (() => {
        const frustEmoji = frustration <= 2 ? '😌' : frustration <= 4 ? '😐' : frustration <= 6 ? '😟' : frustration <= 8 ? '😰' : '🆘';
        const frustColor = frustration <= 3 ? GREEN : frustration <= 6 ? '#F59E0B' : '#EF4444';
        const glowColor = frustration <= 3 ? 'rgba(16,185,129,0.08)' : frustration <= 6 ? 'rgba(245,158,11,0.09)' : 'rgba(239,68,68,0.11)';
        const microCopy = frustration <= 3
          ? `You're at a ${frustration}/10 — staying calm. Smart move. We'll keep that momentum going and get you ahead of the curve before things heat up.`
          : frustration <= 5
          ? `You're at a ${frustration}/10 — feeling the pressure but still in control. Most students hit their breakthrough right at this stage. Your Agent is ready to tip the scales.`
          : frustration <= 7
          ? `You're at a ${frustration}/10 — right in the danger zone. Most students feel exactly like you do before they start seeing real traction. The good news? This is where your Career Agent starts turning things around.`
          : frustration <= 9
          ? `You're at a ${frustration}/10 — we hear you. The black hole is real, and it's exhausting. But students at this exact level see the biggest gains fastest once the Agent kicks in. Let's go.`
          : `You're at 10/10 — at breaking point. Let's fix this fast. Your Agent is built exactly for this moment.`;
        const handleContinue = () => {
          setAnalyzingFrustration(true);
          setTimeout(() => { setAnalyzingFrustration(false); next(); }, 700);
        };
        const analyzing = analyzingFrustration;
        const pct = ((frustration - 1) / 9) * 100;
        return (
          <div style={{ ...card, maxWidth: 520, paddingTop: 40 }}>
            <h1 style={{ ...h1style, marginBottom: 10 }}>How frustrated are you with your job search right now?</h1>
            <p style={{ ...substyle, marginBottom: 32 }}>Be honest — the more accurately you answer, the better your Agent can build a strategy around your exact roadblocks.</p>

            <div style={{ background: CARD, border: `1.5px solid ${frustColor}33`, borderRadius: R, padding: '32px 28px 28px', marginBottom: 12, boxShadow: `0 0 40px ${glowColor}, ${SHADOW}`, transition: 'box-shadow 0.4s ease, border-color 0.4s ease' }}>
              {/* Emoji indicator */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 40, lineHeight: 1, transition: 'all 0.2s ease', display: 'inline-block' }}>{frustEmoji}</span>
              </div>

              {/* Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, fontWeight: 600 }}>Not at all</span>
                <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, fontWeight: 600 }}>I'm losing my mind</span>
              </div>

              {/* Custom styled slider */}
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <style>{`
                  .frustration-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 100px; outline: none; cursor: pointer; background: linear-gradient(to right, ${frustColor} 0%, ${frustColor} ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%); transition: background 0.15s ease; }
                  .frustration-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.16); cursor: grab; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
                  .frustration-slider::-webkit-slider-thumb:active { cursor: grabbing; box-shadow: 0 4px 16px rgba(0,0,0,0.22); }
                  .frustration-slider::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.16); cursor: grab; }
                `}</style>
                <input
                  type="range" min="1" max="10" value={frustration}
                  onChange={e => setFrustration(Number(e.target.value))}
                  className="frustration-slider"
                />
              </div>

              {/* Score display */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <span style={{ fontFamily: FONT, fontSize: 64, fontWeight: 800, color: frustColor, lineHeight: 1, letterSpacing: '-0.04em', transition: 'color 0.3s ease' }}>{frustration}</span>
                <span style={{ fontFamily: FONT, fontSize: 18, color: TEXT3, marginLeft: 6 }}>/10</span>
                <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, marginTop: 14, lineHeight: 1.6, minHeight: 44, transition: 'all 0.2s ease' }}>
                  {microCopy}
                </p>
              </div>
            </div>

            {/* Emotional closer */}
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '16px 0 0', lineHeight: 1.65, fontStyle: 'italic', textAlign: 'center' }}>
              Every day you stay stuck in this loop is another day without interviews. Let's change that starting now.
            </p>

            {/* Continue CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 20 }}>
              <button
                onClick={handleContinue}
                disabled={analyzing}
                style={{ width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: analyzing ? '#7c3aed' : GRAD_INDIGO, border: 'none', borderRadius: 10, padding: '16px 32px', cursor: analyzing ? 'default' : 'pointer', minHeight: 'auto', boxShadow: '0 10px 20px rgba(109,40,217,0.2)', transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                         onMouseEnter={e => { if (!analyzing) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 28px rgba(109,40,217,0.32)'; }}}
                         onMouseLeave={e => { if (!analyzing) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(109,40,217,0.2)'; }}}
              >
                {analyzing ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    Agent analyzing your frustration level…
                  </>
                ) : 'Continue →'}
              </button>
              <button onClick={back} style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 8px', textDecoration: 'underline', textUnderlineOffset: 3 }}>← Back</button>
            </div>
          </div>
        );
      })()}

      {/* ── SCREEN 4: What Are You Looking For ── */}
      {screen === 4 && (
        <div style={{ ...card, maxWidth: 520 }}>
          {/* Agent framing badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F0FDF4', border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11 }}>🎯</span>
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Setting your career coordinates</span>
          </div>

          <h1 style={h1style}>What's your main focus right now?</h1>
          <p style={{ ...substyle, marginBottom: 28 }}>This is the first key coordinate your Career Agent needs to lock in so it can prioritize the right opportunities, insiders, and tailored materials for you.</p>

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
                  <strong>Got it — you're mainly targeting {selected?.label}.</strong><br />
                  Your Agent is now prioritizing <em>{mirrorMap[seeking]}</em> and will surface matching alumni insiders + resume tweaks tailored to that goal.
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