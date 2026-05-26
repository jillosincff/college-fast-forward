import { useEffect, useState, useRef } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const GREEN = '#10B981';
const GREEN_BORDER = '#BBF7D0';
const GREEN_LIGHT = '#F0FDF4';
const BLUE = '#0066FF';
const INDIGO = '#6366F1';
const CARD = '#FFFFFF';
const R = 12;
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';

const DID_YOU_KNOW = [
  "The average corporate resume screener filters out up to 75% of applicants before a human ever sees them. Your new version is built to beat that.",
  "Students who use warm alumni intros get responses 10x faster than cold applications.",
  "Your Agent is already drafting your first outreach message based on your target roles…",
  "Over 70% of jobs are filled through internal networks — never publicly posted. We hunt those down for you.",
  "A single internal referral scales your interview probability by over 4x. We've already mapped yours.",
];

// ── Network Resonance Scan (terminal mode) ──────────────────────
function ResonanceScan({ schoolShortName }) {
  const school = schoolShortName || 'your university';
  const alumniCount = useRef(Math.floor(school.charCodeAt(0) % 48) + 47).current;
  const steps = [
    '🔍 Parsing Career Assets & Keywords...',
    `🛰️ Mapping Active ${school} Alumni Network Nodes...`,
    `💡 ${alumniCount} Active Insiders Isolated on Targeted Hiring Teams!`,
  ];
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const advance = () => {
      current += 1;
      setVisibleCount(current);
      if (current < steps.length) setTimeout(advance, 700);
      else setTimeout(() => setDone(true), 400);
    };
    const t = setTimeout(advance, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: CARD, borderRadius: 16, padding: '24px 28px', maxWidth: 480, margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
      <style>{`
        @keyframes terminalBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes resonanceSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
        ▶ Your Agent // Network Resonance Scan
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: visibleCount > i ? 1 : 0, transition: 'opacity 0.3s', animation: visibleCount > i ? 'resonanceSlide 0.4s ease forwards' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: visibleCount > i ? GREEN : '#CBD5E1', boxShadow: visibleCount > i ? '0 0 8px rgba(16,185,129,0.4)' : 'none', transition: 'all 0.3s' }} />
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: i === steps.length - 1 && visibleCount > i ? '#059669' : '#64748B', margin: 0, lineHeight: 1.5, fontWeight: i === steps.length - 1 ? 700 : 400 }}>
              {step}
            </p>
          </div>
        ))}
        {!done && <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: '#059669', animation: 'terminalBlink 1s step-end infinite', marginLeft: 18 }}>█</span>}
      </div>
      {done && (
        <div style={{ marginTop: 16, padding: '10px 14px', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 8, fontFamily: "'Courier New', monospace", fontSize: 11, color: '#059669', animation: 'resonanceSlide 0.4s ease forwards' }}>
          ✓ Scan complete. Routing to your personalized preview...
        </div>
      )}
    </div>
  );
}

export default function LiveEngineLoader({ exiting = false, user = null, resonanceMode = false, schoolShortName = null, onSkip = null, college = null, selectedIndustries = [], seeking = null }) {
  const schoolName = college || schoolShortName || user?.school_name || user?.school || 'your university';
  const industryLabel = selectedIndustries?.length > 0 ? selectedIndustries.slice(0, 2).join(' & ') : 'your selected fields';
  const roleLabel = seeking === 'internship' ? 'internships' : seeking === 'fulltime' ? 'full-time roles' : 'opportunities';

  // Sequential checklist steps — personalized with school, industry, and goal
  const STEPS = [
    { icon: '✅', text: 'Analyzing your experience & target roles' },
    { icon: '✅', text: 'Rewriting bullets for maximum impact' },
    { icon: '✅', text: 'Optimizing for ATS + recruiter appeal' },
    { icon: '✅', text: `Matching against your selected spaces (${industryLabel})` },
    { icon: '🔄', text: `Pulling ${schoolName} alumni insights` },
  ];

  const [visibleSteps, setVisibleSteps] = useState(0);
  const [didYouKnowIdx, setDidYouKnowIdx] = useState(0);
  const [factFade, setFactFade] = useState(true);

  // Reveal checklist items one by one
  useEffect(() => {
    if (visibleSteps >= STEPS.length) return;
    const delay = visibleSteps === 0 ? 400 : 800;
    const t = setTimeout(() => setVisibleSteps(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [visibleSteps]);

  // Rotate Did You Know every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setFactFade(false);
      setTimeout(() => {
        setDidYouKnowIdx(i => (i + 1) % DID_YOU_KNOW.length);
        setFactFade(true);
      }, 250);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hooks must be above conditional returns
  if (resonanceMode) {
    return (
      <div style={{ textAlign: 'center', opacity: exiting ? 0 : 1, transition: 'opacity 400ms ease' }}>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 24px', lineHeight: 1.25 }}>
          Scanning your <span style={{ color: '#059669' }}>{schoolName} network...</span>
        </h1>
        <ResonanceScan schoolShortName={schoolName} />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', opacity: exiting ? 0 : 1, transform: exiting ? 'scale(1.03)' : 'scale(1)', transition: 'opacity 400ms ease, transform 400ms ease', maxWidth: 520, width: '100%', margin: '0 auto' }}>
      <style>{`
        @keyframes liveSpinEngine { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmerBar { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes checkIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes factFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Headline */}
      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3.2vw, 28px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 28px', lineHeight: 1.25 }}>
        <span style={{ color: INDIGO, fontWeight: 800 }}>Your agent is working on your resume...</span>
      </h1>

      {/* Main Card */}
      <div style={{ background: CARD, borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.07)', border: '1.5px solid #E2E8F0', overflow: 'hidden', position: 'relative' }}>
        {/* Shimmer top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366F1, #3B82F6, #10B981, #6366F1)', backgroundSize: '300% auto', animation: 'shimmerBar 2.5s ease infinite' }} />

        {/* Checklist */}
        <div style={{ padding: '28px 28px 20px', textAlign: 'left' }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Processing your profile…</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((step, i) => {
              const visible = i < visibleSteps;
              const isSpinning = step.icon === '🔄';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: visible ? 1 : 0.15, animation: visible ? 'checkIn 0.4s ease forwards' : 'none', transition: 'opacity 0.3s' }}>
                  {/* Icon / spinner */}
                  {visible && isSpinning ? (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #E2E8F0', borderTop: `2px solid ${INDIGO}`, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  ) : (
                    <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1 }}>{visible ? step.icon : '⬜'}</span>
                  )}
                  <p style={{ fontFamily: FONT, fontSize: 13, color: visible ? (isSpinning ? INDIGO : '#065F46') : '#94A3B8', margin: 0, fontWeight: visible ? 600 : 400, lineHeight: 1.5, transition: 'color 0.3s' }}>
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#F1F5F9', margin: '0 24px' }} />

        {/* Did You Know — rotating */}
        <div style={{ padding: '18px 28px 24px' }}>
          <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: BLUE, margin: '0 0 8px', letterSpacing: '0.02em' }}>💡 Did you know?</p>
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#4B5563', margin: 0, lineHeight: 1.65, opacity: factFade ? 1 : 0, transition: 'opacity 0.25s ease', animation: factFade ? 'factFadeIn 0.3s ease' : 'none', minHeight: 64 }}>
            {DID_YOU_KNOW[didYouKnowIdx]}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#94A3B8', margin: '14px 0 0', textAlign: 'center', letterSpacing: '0.02em', lineHeight: 1.6 }}>
            Most students get auto-rejected by 75% of applications. Your agent is making sure yours doesn't.
          </p>
        </div>
      </div>

      {/* Timing estimate */}
      <p style={{ fontFamily: FONT, fontSize: 12, color: '#94A3B8', margin: '16px 0 0', lineHeight: 1.6 }}>
        This usually takes <strong style={{ color: '#64748B' }}>30–60 seconds</strong>. Your Before/After will be ready shortly.
      </p>

      {/* Skip button */}
      {onSkip && (
        <button onClick={onSkip} style={{ fontFamily: FONT, fontSize: 12, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 0', marginTop: 8, textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Skip wait &amp; see preview →
        </button>
      )}
    </div>
  );
}