import React from 'react';

const ITEMS = [
  'Nearly 1,000 UF families joined',
  'Alumni at Amazon, Google, Nike, TikTok',
  '10+ universities',
  'Warm intros within 48 hours',
  'Parent Pledge network',
];

export default function LandingTrustBar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 32,
        background: 'rgba(255,255,255,0.03)',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        padding: '16px 40px',
      }}
    >
      {ITEMS.map((text, i) => (
        <React.Fragment key={text}>
          {i > 0 && (
            <div
              style={{
                width: 1,
                height: 16,
                background: 'rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#E85D20',
                opacity: 0.7,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: 'rgba(244,240,232,0.4)',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}