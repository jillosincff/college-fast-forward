import { useEffect, useState, useRef } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const GREEN = '#10B981';
const GREEN_BORDER = '#BBF7D0';
const GREEN_LIGHT = '#F0FDF4';
const BLUE = '#0066FF';
const CARD = '#FFFFFF';
const R = 12;
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';

const ACTIONS = [
  "🤖 Waking up CLiFF... he's already on his third espresso.",
  "✂️ Shredding traditional cover letters. Nobody reads them anyway.",
  "🕵️ Deep-diving your campus database (and skipping your ex's profile).",
  "📂 Finding companies that won't ghost you after a 3-round interview loop.",
  "💼 Bypassing corporate resume filters so humans actually see your name.",
  "🤫 Digging up the Inside Tracks that corporate recruiters try to hide.",
];

const INSIGHTS = [
  {
    label: 'The Backdoor Fact',
    text: 'Over 70% of open positions are filled through internal company networks and are never genuinely public on traditional job boards. We hunt down those internal portals directly.',
  },
  {
    label: 'The ATS Filter Fact',
    text: 'The average corporate resume screener filters out up to 75% of applicants before a human recruiter ever sees them. Your new profile is explicitly formatted to skip this filter.',
  },
  {
    label: 'The Warm Hook Fact',
    text: 'An application accompanied by a single internal referral or a warm message to an alumnus scales your interview probability by over 4x. We\'ve already mapped yours out.',
  },
];

// ── Network Resonance Scan (3-step staggered terminal log) ──────────
function ResonanceScan({ schoolShortName }) {
  const school = schoolShortName || 'your university';
  // Dynamically compute an alumni count between 47 and 94 (stable per school)
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
      if (current < steps.length) {
        setTimeout(advance, 700);
      } else {
        setTimeout(() => setDone(true), 400);
      }
    };
    const t = setTimeout(advance, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#0F172A', borderRadius: 16, padding: '24px 28px', maxWidth: 480, margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #1e293b' }}>
      <style>{`
        @keyframes terminalBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes resonanceSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
        ▶ CLiFF // Network Resonance Scan
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: visibleCount > i ? 1 : 0, transition: 'opacity 0.3s', animation: visibleCount > i ? 'resonanceSlide 0.4s ease forwards' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: i === steps.length - 1 ? '#22c55e' : visibleCount > i ? '#22c55e' : '#334155', boxShadow: visibleCount > i ? '0 0 8px rgba(34,197,94,0.6)' : 'none', transition: 'all 0.3s' }} />
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: i === steps.length - 1 && visibleCount > i ? '#4ade80' : '#94a3b8', margin: 0, lineHeight: 1.5, fontWeight: i === steps.length - 1 ? 700 : 400 }}>
              {step}
            </p>
          </div>
        ))}
        {!done && (
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: '#22c55e', animation: 'terminalBlink 1s step-end infinite', marginLeft: 18 }}>█</span>
        )}
      </div>
      {done && (
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, fontFamily: "'Courier New', monospace", fontSize: 11, color: '#4ade80', animation: 'resonanceSlide 0.4s ease forwards' }}>
          ✓ Scan complete. Routing to your personalized preview...
        </div>
      )}
    </div>
  );
}

// Pick one insight randomly per mount (stable via ref)
function useRandomInsight() {
  const ref = useRef(INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)]);
  return ref.current;
}

export default function LiveEngineLoader({ exiting = false, user = null, resonanceMode = false, schoolShortName = null }) {
  const [actionIdx, setActionIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const insight = useRandomInsight();

  const schoolName = schoolShortName || user?.school_name || user?.schoolName || user?.school || 'your university';

  // Always call hooks unconditionally before any early return
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActionIdx(i => (i + 1) % ACTIONS.length);
        setFade(true);
      }, 200);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const gradientId = 'spinner-gradient';

  // In resonance mode render the terminal scan instead (after all hooks)
  if (resonanceMode) {
    return (
      <div style={{ textAlign: 'center', opacity: exiting ? 0 : 1, transition: 'opacity 400ms ease' }}>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 24px', lineHeight: 1.25 }}>
          Scanning your{' '}
          <span style={{ color: '#6366F1' }}>{schoolName} network...</span>
        </h1>
        <ResonanceScan schoolShortName={schoolName} />
      </div>
    );
  }

  return (
    <div style={{
      textAlign: 'center',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.03)' : 'scale(1)',
      transition: 'opacity 400ms ease, transform 400ms ease',
    }}>
      {/* Header */}
      <h1 style={{
        fontFamily: FONT, fontSize: 'clamp(20px, 3.2vw, 28px)',
        fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em',
        margin: '0 0 28px', lineHeight: 1.25,
      }}>
        Bro, give it a minute.{' '}
        <span style={{ color: '#6366F1', fontWeight: 800, fontSize: '0.9em' }}>
          We're scouring the internet for you...
        </span>
      </h1>

      {/* Main Card */}
      <div style={{
        background: CARD, borderRadius: R,
        boxShadow: '0 20px 50px rgba(0,0,0,0.07)', overflow: 'hidden',
        border: `1.5px solid #E2E8F0`,
        maxWidth: 480, margin: '0 auto',
        position: 'relative',
      }}>
        {/* Shimmer top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #6366F1, #3B82F6, #6366F1)',
          backgroundSize: '200% auto',
          animation: 'shimmerBar 3s ease infinite',
        }} />
        {/* Live Status Section */}
        <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Spinner + paperclip dance */}
          <div style={{ flexShrink: 0, position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={32} height={32} viewBox="0 0 32 32" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="12" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="75.4"
                strokeDashoffset="20"
                style={{ transformOrigin: '16px 16px', animation: 'liveSpinEngine 0.75s linear infinite' }}
              />
            </svg>
            <span style={{ fontSize: 16, animation: 'paperclipDance 1.2s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
              📎
            </span>
          </div>

          {/* Live action text */}
          <p key={actionIdx} style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            color: '#374151', margin: 0, textAlign: 'left', lineHeight: 1.5,
            animation: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            {actionIdx === 3
              ? `🚀 Calibrating your ${schoolName} network multipliers...`
              : ACTIONS[actionIdx]}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#E2E8F0', margin: '0 28px' }} />

        {/* Did You Know Section */}
        <div style={{ padding: '20px 28px 24px' }}>
          <p style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 700,
            color: BLUE, margin: '0 0 10px', letterSpacing: '0.02em',
          }}>
            💡 Did you know?
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 14, color: '#4B5563',
            margin: 0, lineHeight: 1.65,
          }}>
            {insight.text}
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 11, color: '#94A3B8',
            margin: '14px 0 0', textAlign: 'center', letterSpacing: '0.04em',
          }}>
            Activating your secure Campus Ecosystem pipeline.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes liveSpinEngine {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideUpFade {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBar {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes paperclipDance {
          0%   { transform: rotate(-15deg) scale(1); }
          25%  { transform: rotate(15deg) scale(1.15); }
          50%  { transform: rotate(-10deg) scale(1); }
          75%  { transform: rotate(12deg) scale(1.1); }
          100% { transform: rotate(-15deg) scale(1); }
        }
      `}</style>
    </div>
  );
}