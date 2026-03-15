import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

function KeySVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3a4 4 0 11-4 4 4 4 0 014-4zM6.5 10.5l-4 4" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PeopleSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="#E85D20" strokeWidth="1.5"/>
      <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 7c1.7 0 3 1.3 3 3" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

function LightningSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const VALUE_PROPS = [
  { icon: <KeySVG />, text: 'Skip the resume black hole' },
  { icon: <PeopleSVG />, text: 'Get warm intros to decision-makers' },
  { icon: <LightningSVG />, text: 'Access nearly 1,000 UF parent & alumni connections' },
];

export default function StudentStep1LeftPanel() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 70%, #0821A5 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '48px 44px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Section */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* CFF wordmark */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>C</span>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#E85D20' }}>FF</span>
        </div>

        {/* Eyebrow */}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.5)', marginBottom: 10,
        }}>
          For UF Students
        </p>

        {/* Headline */}
        <h2 style={{ marginBottom: 4 }}>
          <span style={{
            fontFamily: dmSans, fontWeight: 600,
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: '#f4f0e8', lineHeight: 1.2, display: 'block',
          }}>
            You've discovered the secret:
          </span>
          <span style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: '#E85D20', lineHeight: 1.2, display: 'block',
          }}>
            access beats resumes.
          </span>
        </h2>

        {/* Stat accent bar */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderLeft: '3px solid #E85D20',
          borderRadius: '0 10px 10px 0',
          padding: '12px 16px',
          margin: '20px 0',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 300,
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0,
          }}>
            <span style={{ fontWeight: 500, color: '#f4f0e8' }}>70–80% of jobs are filled through referrals.</span>{' '}
            But your network is full of people your own age — not hiring managers.
          </p>
        </div>

        {/* Body */}
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300,
          color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
          margin: '16px 0 24px',
        }}>
          College Fast Forward gives you an{' '}
          <span style={{ fontWeight: 500, color: '#f4f0e8' }}>unfair advantage</span>{' '}
          — a community of UF parents and alumni who are{' '}
          <span style={{ fontWeight: 500, color: '#f4f0e8' }}>ready to open doors for you.</span>
        </p>

        {/* Value props */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {VALUE_PROPS.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {v.icon}
              </div>
              <span style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 400,
                color: 'rgba(255,255,255,0.8)',
              }}>
                {v.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section — quote */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0,
        }}>
          "Think of College Fast Forward as a master key to a neighborhood of closed doors. Instead of standing on the sidewalk hoping someone notices your resume, you now have neighbors ready to walk you inside."
        </p>
      </div>
    </div>
  );
}