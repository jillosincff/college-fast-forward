import { useState, useEffect } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const CARD = '#ffffff';
const BG = '#f8f9ff';

const CLIFF_WORDS = [
  { letters: ['C', 'areer'], color: INDIGO },
  { letters: ['L', 'inked'], color: INDIGO },
  { letters: ['I', 'ntelligence &'], color: INDIGO },
  { letters: ['F', 'orward'], color: INDIGO },
  { letters: ['F', 'inder'], color: INDIGO },
];

const CAPABILITIES = [
  { icon: '🎯', text: 'Scanning your career profile for insider opportunities' },
  { icon: '🧠', text: 'Mapping alumni connections at your target companies' },
  { icon: '📄', text: 'Preparing your personalized 14-day action plan' },
  { icon: '🚀', text: 'Configuring your custom job scout feed' },
];

export default function CliffRevealScreen({ onNext, firstName }) {
  const [step, setStep] = useState(0); // 0=intro, 1=acronym, 2=caps, 3=cta
  const [visibleLines, setVisibleLines] = useState(0);
  const [capIdx, setCapIdx] = useState(0);
  const [canContinue, setCanContinue] = useState(false);

  // Auto-advance through animation steps
  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStep(1), 600));
    timers.push(setTimeout(() => setStep(2), 1400));
    timers.push(setTimeout(() => setStep(3), 2800));
    timers.push(setTimeout(() => setCanContinue(true), 3600));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Reveal acronym lines one by one
  useEffect(() => {
    if (step < 2) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= CLIFF_WORDS.length) clearInterval(interval);
    }, 220);
    return () => clearInterval(interval);
  }, [step]);

  // Cycle capability badges
  useEffect(() => {
    if (step < 3) return;
    const interval = setInterval(() => {
      setCapIdx(i => (i + 1) % CAPABILITIES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div style={{
      textAlign: 'center', maxWidth: 560, width: '100%',
      animation: 'fadeUp 0.4s ease',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lineIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes capFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Top badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)',
        borderRadius: 100, padding: '6px 18px', marginBottom: 32,
      }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Your Agent is Activating
        </span>
      </div>

      {/* Main headline */}
      {step >= 1 && (
        <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: 8 }}>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>
            Meet your career agent
          </p>
          <h1 style={{
            fontFamily: FONT, fontSize: 'clamp(56px, 10vw, 88px)',
            fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1,
            background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            CLiFF
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, margin: '0 0 28px', letterSpacing: '0.04em' }}>
            Powered by College Fast Forward
          </p>
        </div>
      )}

      {/* Acronym reveal */}
      {step >= 2 && (
        <div style={{
          background: CARD, border: '1px solid #E8EAF6',
          borderRadius: 16, padding: '24px 28px', marginBottom: 28,
          boxShadow: '0 4px 24px rgba(109,40,217,0.08)',
          textAlign: 'left',
        }}>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 16px' }}>
            The engine behind your results
          </p>
          {CLIFF_WORDS.map((word, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 0, marginBottom: 6,
                opacity: i < visibleLines ? 1 : 0,
                animation: i < visibleLines ? 'lineIn 0.3s ease' : 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              {/* Highlighted letter */}
              <span style={{
                fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 900, color: INDIGO, letterSpacing: '-0.02em',
                minWidth: 28, lineHeight: 1.2,
              }}>
                {word.letters[0]}
              </span>
              {/* Rest of word */}
              <span style={{
                fontFamily: FONT, fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontWeight: 600, color: TEXT2, letterSpacing: '-0.01em', lineHeight: 1.2,
              }}>
                {word.letters[1]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Live capability ticker */}
      {step >= 3 && (
        <div style={{
          background: 'rgba(109,40,217,0.04)', border: '1px solid rgba(109,40,217,0.12)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
          minHeight: 52,
        }}>
          <div style={{ width: 18, height: 18, border: '2px solid rgba(109,40,217,0.3)', borderTop: `2px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <div key={capIdx} style={{ animation: 'capFade 0.3s ease', flex: 1, textAlign: 'left' }}>
            <span style={{ fontSize: 14, marginRight: 8 }}>{CAPABILITIES[capIdx].icon}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, fontWeight: 500 }}>{CAPABILITIES[capIdx].text}</span>
          </div>
        </div>
      )}

      {/* Personal note if we have a name */}
      {step >= 3 && firstName && (
        <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
          {firstName}, CLiFF just received your career data and is building your personalized strategy in real time.
        </p>
      )}
      {step >= 3 && !firstName && (
        <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
          CLiFF just received your career data and is building your personalized strategy in real time.
        </p>
      )}

      {/* CTA */}
      {step >= 3 && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <button
            onClick={onNext}
            disabled={!canContinue}
            style={{
              display: 'block', width: '100%', maxWidth: 400, margin: '0 auto',
              fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff',
              background: canContinue ? GRAD_INDIGO : '#CBD5E1',
              border: 'none', borderRadius: 12, padding: '20px 40px',
              cursor: canContinue ? 'pointer' : 'default', minHeight: 'auto',
              boxShadow: canContinue ? '0 10px 28px rgba(109,40,217,0.30)' : 'none',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { if (canContinue) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(109,40,217,0.40)'; }}}
            onMouseLeave={e => { if (canContinue) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(109,40,217,0.30)'; }}}
          >
            {canContinue ? 'See What CLiFF Built For You →' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                CLiFF is activating…
              </span>
            )}
          </button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, marginTop: 12, fontStyle: 'italic' }}>
            Your personalized results are ready on the next screen.
          </p>
        </div>
      )}
    </div>
  );
}