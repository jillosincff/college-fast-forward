import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

const steps = [
  'Finding alumni at your target companies...',
  'Identifying your best opportunities...',
  'Preparing your personalized plan...',
];

/**
 * FastIQ activation animation screen (Flow A, Screen 3).
 * Shows for ~3s then calls onComplete.
 */
export default function FastIQActivatingScreen({ onComplete }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 200);
    const t2 = setTimeout(() => setSubVisible(true), 700);
    const t3 = setTimeout(() => setVisibleSteps(1), 1200);
    const t4 = setTimeout(() => setVisibleSteps(2), 1800);
    const t5 = setTimeout(() => setVisibleSteps(3), 2400);
    const t6 = setTimeout(() => onComplete(), 3200);
    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {/* Lightning bolt icon */}
        <div style={{
          width: 64, height: 64, margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fiqPulse 1.5s ease-in-out infinite',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Header */}
        <h1 style={{
          fontFamily: dmSans, fontWeight: 700, fontSize: 'clamp(24px, 4vw, 32px)',
          color: '#fff', lineHeight: 1.3, marginBottom: 12,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          FastIQ is activating for you.
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(18px, 3vw, 22px)', color: ORANGE, marginBottom: 40,
          opacity: subVisible ? 1 : 0,
          transform: subVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          Your career plan is being built.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', maxWidth: 360, margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: visibleSteps > i ? 1 : 0,
              transform: visibleSteps > i ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
              <span style={{ color: ORANGE, fontSize: 16, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fiqPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}