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
    <div className="landing-trust-bar"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 32,
        background: 'linear-gradient(to bottom, #0821A5 0%, #0d1117 100%)',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        padding: '16px 40px',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-trust-bar {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 16px 24px !important;
          }
          .landing-trust-bar .trust-sep { display: none !important; }
          .landing-trust-bar .trust-text { font-size: 12px !important; }
        }
      `}</style>
      {ITEMS.map((text, i) => (
        <React.Fragment key={text}>
          {i > 0 && (
            <div className="trust-sep"
              style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20', opacity: 0.7, flexShrink: 0 }} />
            <span className="trust-text"
              style={{
                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                fontSize: 13,
                fontWeight: 300,
                color: 'rgba(244,240,232,0.35)',
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