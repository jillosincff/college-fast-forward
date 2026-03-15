import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const STEPS = [
  { label: 'Profile', num: 1 },
  { label: 'Background', num: 2 },
  { label: 'Link', num: 3 },
  { label: 'Pledge', num: 4 },
];

function CheckmarkSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ParentProgressBar({ currentStep = 1 }) {
  return (
    <div style={{
      width: '100%', height: 52,
      background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
    }}>
      {STEPS.map((s, i) => {
        const isCompleted = s.num < currentStep;
        const isActive = s.num <= currentStep;
        const isLineComplete = s.num < currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isActive ? '#E85D20' : 'rgba(255,255,255,0.08)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? <CheckmarkSVG /> : s.num}
              </div>
              <span style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 400,
                color: isActive ? '#f4f0e8' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.3s ease',
              }}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div style={{
                width: 48, height: 1, margin: '0 8px',
                background: isLineComplete ? '#E85D20' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}