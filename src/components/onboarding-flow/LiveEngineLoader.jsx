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
  "🐊 Calibrating your university network multipliers...",
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

// Pick one insight randomly per mount (stable via ref)
function useRandomInsight() {
  const ref = useRef(INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)]);
  return ref.current;
}

export default function LiveEngineLoader({ exiting = false }) {
  const [actionIdx, setActionIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const insight = useRandomInsight();

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

  return (
    <div style={{
      textAlign: 'center',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.03)' : 'scale(1)',
      transition: 'opacity 400ms ease, transform 400ms ease',
    }}>
      {/* Header */}
      <h1 style={{
        fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 32px)',
        fontWeight: 800, color: '#1F2937', letterSpacing: '-0.03em',
        margin: '0 0 28px', lineHeight: 1.2,
      }}>
        Agent is deploying...
      </h1>

      {/* Main Card */}
      <div style={{
        background: CARD, borderRadius: R,
        boxShadow: SHADOW_MD, overflow: 'hidden',
        border: `1.5px solid ${GREEN_BORDER}`,
        maxWidth: 480, margin: '0 auto',
      }}>
        {/* Live Status Section */}
        <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* SVG Spinner with gradient */}
          <div style={{ flexShrink: 0 }}>
            <svg width={32} height={32} viewBox="0 0 32 32">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
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
                style={{
                  transformOrigin: '16px 16px',
                  animation: 'liveSpinEngine 0.75s linear infinite',
                }}
              />
            </svg>
          </div>

          {/* Live action text */}
          <p style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            color: GREEN, margin: 0, textAlign: 'left', lineHeight: 1.5,
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}>
            {ACTIONS[actionIdx]}
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
        </div>
      </div>

      {/* CSS keyframe for spinner */}
      <style>{`
        @keyframes liveSpinEngine {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}