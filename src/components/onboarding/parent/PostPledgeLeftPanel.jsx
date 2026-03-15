import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

function LightningSVG({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarburstSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4l3.5 6.5L30 8l-2.5 7L35 18l-7 1 2 7.5L24 23l-4 7-4-7-6 3.5 2-7.5-7-3 7.5-3L10 8l6.5 2.5L20 4z" stroke={orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <style>{`
        @keyframes ppq-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.06); } }
      `}</style>
      <animateTransform attributeName="transform" type="scale" values="1;1.06;1" dur="2.5s" repeatCount="indefinite" additive="sum" />
    </svg>
  );
}

export default function PostPledgeLeftPanel() {
  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 70%, #0821A5 100%)',
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      boxSizing: 'border-box',
    }}>
      {/* Radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Starburst icon */}
        <div style={{ marginBottom: 24, animation: 'ppq-pulse 2.5s ease-in-out infinite' }}>
          <StarburstSVG />
        </div>

        {/* Headline */}
        <h2 style={{ marginBottom: 16, lineHeight: 1.2 }}>
          <span style={{
            fontFamily: dmSans, fontWeight: 600,
            fontSize: 'clamp(24px, 3vw, 30px)',
            color: '#f4f0e8', display: 'block',
          }}>
            Make your
          </span>
          <span style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(24px, 3vw, 30px)',
            color: orange, display: 'block',
          }}>
            first impact.
          </span>
        </h2>

        {/* Subhead */}
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300,
          color: 'rgba(244,240,232,0.65)', lineHeight: 1.7, marginBottom: 24,
        }}>
          A student posted a question that matches your background. Your answer could change their trajectory.
        </p>

        {/* Karma callout */}
        <div style={{
          background: 'rgba(232,93,32,0.1)',
          border: '0.5px solid rgba(232,93,32,0.25)',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <LightningSVG size={14} />
          </div>
          <p style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 300,
            color: 'rgba(244,240,232,0.7)', lineHeight: 1.6, margin: 0,
          }}>
            <span style={{ fontWeight: 600, color: orange }}>+15 karma</span> for answering — and your student gets a visibility boost immediately.
          </p>
        </div>
      </div>
    </div>
  );
}