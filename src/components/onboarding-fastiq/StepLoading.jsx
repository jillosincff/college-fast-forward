import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const STEPS = [
  { text: 'Identifying target companies', icon: '🎯' },
  { text: 'Finding relevant alumni', icon: '👥' },
  { text: 'Building your outreach strategy', icon: '✉️' },
  { text: 'Creating your plan', icon: '✅' },
];

export default function StepLoading({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setActiveStep(i + 1);
        if (i === STEPS.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, (i + 1) * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 400, margin: '0 auto' }}>
      {/* Pulsing orb */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,140,255,0.25), rgba(79,140,255,0.05))',
        margin: '0 auto 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'orbPulse 1.5s ease-in-out infinite',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: '#4F8CFF',
          boxShadow: '0 0 20px rgba(79,140,255,0.5)',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' }}>
        {STEPS.map((step, i) => {
          const done = activeStep > i;
          const active = activeStep === i;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: activeStep >= i ? 1 : 0.2,
              transform: activeStep >= i ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'all 0.4s ease',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
              <span style={{
                fontFamily: dmSans, fontSize: 16, fontWeight: done ? 500 : 400,
                color: done ? '#fff' : active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.3s',
              }}>
                {step.text}
                {active && !done && (
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span className="loading-dots">...</span>
                  </span>
                )}
              </span>
              {done && (
                <span style={{ marginLeft: 'auto', color: '#34D399', fontSize: 16 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{
        height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
        marginTop: 36, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #4F8CFF, #34D399)',
          width: `${(activeStep / STEPS.length) * 100}%`,
          transition: 'width 0.8s ease',
        }} />
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes dotBlink { 0%,20%{opacity:0} 40%{opacity:1} }
        .loading-dots span { animation: dotBlink 1.4s infinite; }
      `}</style>
    </div>
  );
}