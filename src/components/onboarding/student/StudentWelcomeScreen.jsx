import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

/**
 * Flow B welcome screen. Shows for 2s then calls onComplete.
 */
export default function StudentWelcomeScreen({ firstName, onComplete }) {
  const [h1Visible, setH1Visible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setH1Visible(true), 200);
    const t2 = setTimeout(() => setSubVisible(true), 700);
    const t3 = setTimeout(() => setLineVisible(true), 1200);
    const t4 = setTimeout(() => onComplete(), 2200);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: dmSans, fontWeight: 700, fontSize: 'clamp(24px, 4.5vw, 34px)',
          color: '#fff', lineHeight: 1.3, marginBottom: 16,
          opacity: h1Visible ? 1 : 0,
          transform: h1Visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          Welcome to College Fast Forward, {firstName || 'there'}.
        </h1>

        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(18px, 3vw, 24px)', color: ORANGE, marginBottom: 24,
          opacity: subVisible ? 1 : 0,
          transform: subVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          Your network is waiting.
        </p>

        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888',
          opacity: lineVisible ? 1 : 0,
          transform: lineVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}>
          {"Let's show you what's inside."}
        </p>
      </div>
    </div>
  );
}