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
          {/* SVG Spinner with gradient */}
          <div style={{ flexShrink: 0 }}>
            <svg width={32} height={32} viewBox="0 0 32 32">
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
                style={{
                  transformOrigin: '16px 16px',
                  animation: 'liveSpinEngine 0.75s linear infinite',
                }}
              />
            </svg>
          </div>

          {/* Live action text — key forces re-trigger of entry animation */}
          <p key={actionIdx} style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            color: '#374151', margin: 0, textAlign: 'left', lineHeight: 1.5,
            animation: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
      `}</style>
    </div>
  );
}