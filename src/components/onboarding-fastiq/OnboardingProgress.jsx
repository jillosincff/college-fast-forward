import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function OnboardingProgress({ current, total }) {
  return (
    <div style={{ padding: '0 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i < current ? '#4F8CFF' : 'rgba(255,255,255,0.08)',
            transition: 'background 0.4s ease',
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 400,
        color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: 8,
      }}>
        {current} of {total}
      </p>
    </div>
  );
}