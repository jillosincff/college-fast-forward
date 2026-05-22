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
  { letters: ['C', 'areer'] },
  { letters: ['L', 'inked'] },
  { letters: ['I', 'ntelligence &'] },
  { letters: ['F', 'orward'] },
  { letters: ['F', 'inder'] },
];

// Normal mode: parsed profile capabilities ticker
const CAPABILITIES = [
  { icon: '🎯', text: 'Scanning your career profile for insider opportunities' },
  { icon: '🧠', text: 'Mapping alumni connections at your target companies' },
  { icon: '📄', text: 'Preparing your personalized 14-day action plan' },
  { icon: '🚀', text: 'Configuring your custom job scout feed' },
];

export default function CliffRevealScreen({
  onNext,
  firstName,
  skipped = false,
  targetRoles = [],
  locationCity = '',
  locationPref = '',
  seeking = '',
  selectedIndustries = [],
}) {
  const [step, setStep] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [capIdx, setCapIdx] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [logLines, setLogLines] = useState([]);

  // Build the status log lines for manual/skipped mode
  const roleLabel = targetRoles.length > 0
    ? targetRoles.slice(0, 2).join(' & ')
    : seeking ? seeking.replace('_', ' ') : 'Your target roles';

  const locationLabel = locationPref === 'remote'
    ? 'Remote'
    : locationPref === 'hybrid'
    ? 'Hybrid / Flexible'
    : locationCity || 'Your target market';

  const industryLabel = selectedIndustries.length > 0
    ? selectedIndustries.slice(0, 2).join(' & ')
    : null;

  const MANUAL_LOG = [
    { icon: '🟢', text: `Target Roles Loaded: ${roleLabel}` },
    { icon: '🟢', text: `Location Matrix Set: ${locationLabel}` },
    ...(industryLabel ? [{ icon: '🟢', text: `Industry Focus: ${industryLabel}` }] : []),
    { icon: '⚡', text: 'Building empty profile shell…' },
    { icon: '🔒', text: 'Deploying baseline network trackers…' },
  ];

  // Auto-advance animation steps
  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setStep(1), 600));
    timers.push(setTimeout(() => setStep(2), 1400));
    timers.push(setTimeout(() => setStep(3), 2600));
    timers.push(setTimeout(() => setCanContinue(true), 4000));
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
    }, 200);
    return () => clearInterval(interval);
  }, [step]);

  // Reveal manual log lines one by one (skipped mode)
  useEffect(() => {
    if (!skipped || step < 3) return;
    setLogLines([]);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogLines(MANUAL_LOG.slice(0, i));
      if (i >= MANUAL_LOG.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [skipped, step]);

  // Cycle capability ticker (normal mode)
  useEffect(() => {
    if (skipped || step < 3) return;
    const interval = setInterval(() => {
      setCapIdx(i => (i + 1) % CAPABILITIES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [skipped, step]);

  return (
    <div style={{ width: '100%', maxWidth: skipped ? 860 : 560, animation: 'fadeUp 0.4s ease' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lineIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes logIn  { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes capFade{ from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {skipped ? (
        /* ── MANUAL BLUEPRINT LAYOUT (two-column) ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'flex-start' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ fontSize: 13 }}>⚡</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: INDIGO, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Manual Blueprint Initialization</span>
            </div>

            {/* CLiFF name */}
            {step >= 1 && (
              <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: 16 }}>
                <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px' }}>Meet your career agent</p>
                <h1 style={{ fontFamily: FONT, fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 2px', lineHeight: 1, background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLiFF</h1>
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 20px' }}>Powered by College Fast Forward</p>
              </div>
            )}

            {/* Headline copy */}
            {step >= 3 && (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <h2 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.2 }}>
                  Generating your<br />manual blueprint.
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: INDIGO, margin: '0 0 14px' }}>
                  CLiFF is ready to deploy on your terms.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, lineHeight: 1.7, margin: '0 0 28px' }}>
                  You skipped the profile upload, but we already have your targets. CLiFF is configuring your agent right now based strictly on your goals. You can drop in your LinkedIn or resume anytime from your dashboard to unlock advanced matching.
                </p>

                <button
                  onClick={onNext}
                  disabled={!canContinue}
                  style={{ display: 'block', width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: canContinue ? GRAD_INDIGO : '#CBD5E1', border: 'none', borderRadius: 12, padding: '18px 32px', cursor: canContinue ? 'pointer' : 'default', minHeight: 'auto', boxShadow: canContinue ? '0 10px 28px rgba(109,40,217,0.28)' : 'none', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { if (canContinue) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(109,40,217,0.40)'; }}}
                  onMouseLeave={e => { if (canContinue) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(109,40,217,0.28)'; }}}
                >
                  {canContinue ? 'Activate My Agent →' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Blueprint initializing…
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Status log */}
          <div style={{ background: '#0F172A', borderRadius: 16, padding: '28px 24px', minHeight: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 20px' }}>
              CLiFF · AGENT INIT LOG
            </p>

            {/* Acronym */}
            {step >= 2 && (
              <div style={{ marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                {CLIFF_WORDS.map((word, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', opacity: i < visibleLines ? 1 : 0, animation: i < visibleLines ? 'lineIn 0.3s ease' : 'none', marginBottom: 2 }}>
                    <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 900, color: '#a78bfa', minWidth: 20, lineHeight: 1.3 }}>{word.letters[0]}</span>
                    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)', lineHeight: 1.3 }}>{word.letters[1]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Dynamic log lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logLines.map((line, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, animation: 'logIn 0.3s ease' }}>
                  <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1.5 }}>{line.icon}</span>
                  <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: line.icon === '🔒' ? 'rgba(255,255,255,0.4)' : line.icon === '⚡' ? '#a78bfa' : '#4ade80', margin: 0, lineHeight: 1.5 }}>{line.text}</p>
                </div>
              ))}
              {/* Blinking cursor */}
              {step >= 3 && !canContinue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>_</span>
                  <div style={{ width: 8, height: 14, background: '#a78bfa', borderRadius: 1, animation: 'capFade 0.8s ease infinite alternate' }} />
                </div>
              )}
              {canContinue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, animation: 'fadeUp 0.4s ease' }}>
                  <span style={{ fontSize: 13 }}>✅</span>
                  <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: '#4ade80', margin: 0 }}>Agent ready.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* ── NORMAL MODE (parsed profile) — centered layout ── */
        <div style={{ textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '6px 18px', marginBottom: 32 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Your Agent is Activating</span>
          </div>

          {step >= 1 && (
            <div style={{ animation: 'fadeUp 0.4s ease', marginBottom: 8 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>Meet your career agent</p>
              <h1 style={{ fontFamily: FONT, fontSize: 'clamp(56px, 10vw, 88px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1, background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLiFF</h1>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, margin: '0 0 28px', letterSpacing: '0.04em' }}>Powered by College Fast Forward</p>
            </div>
          )}

          {step >= 2 && (
            <div style={{ background: CARD, border: '1px solid #E8EAF6', borderRadius: 16, padding: '24px 28px', marginBottom: 28, boxShadow: '0 4px 24px rgba(109,40,217,0.08)', textAlign: 'left' }}>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 16px' }}>The engine behind your results</p>
              {CLIFF_WORDS.map((word, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', marginBottom: 6, opacity: i < visibleLines ? 1 : 0, animation: i < visibleLines ? 'lineIn 0.3s ease' : 'none', transition: 'opacity 0.2s ease' }}>
                  <span style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: INDIGO, minWidth: 28, lineHeight: 1.2 }}>{word.letters[0]}</span>
                  <span style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 600, color: TEXT2, lineHeight: 1.2 }}>{word.letters[1]}</span>
                </div>
              ))}
            </div>
          )}

          {step >= 3 && (
            <div style={{ background: 'rgba(109,40,217,0.04)', border: '1px solid rgba(109,40,217,0.12)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, minHeight: 52 }}>
              <div style={{ width: 18, height: 18, border: '2px solid rgba(109,40,217,0.3)', borderTop: `2px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <div key={capIdx} style={{ animation: 'capFade 0.3s ease', flex: 1, textAlign: 'left' }}>
                <span style={{ fontSize: 14, marginRight: 8 }}>{CAPABILITIES[capIdx].icon}</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, fontWeight: 500 }}>{CAPABILITIES[capIdx].text}</span>
              </div>
            </div>
          )}

          {step >= 3 && (
            <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
              {firstName ? `${firstName}, CLiFF` : 'CLiFF'} just received your career data and is building your personalized strategy in real time.
            </p>
          )}

          {step >= 3 && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <button
                onClick={onNext}
                disabled={!canContinue}
                style={{ display: 'block', width: '100%', maxWidth: 400, margin: '0 auto', fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', background: canContinue ? GRAD_INDIGO : '#CBD5E1', border: 'none', borderRadius: 12, padding: '20px 40px', cursor: canContinue ? 'pointer' : 'default', minHeight: 'auto', boxShadow: canContinue ? '0 10px 28px rgba(109,40,217,0.30)' : 'none', transition: 'all 0.25s ease' }}
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
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, marginTop: 12, fontStyle: 'italic' }}>Your personalized results are ready on the next screen.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}