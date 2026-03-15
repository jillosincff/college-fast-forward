import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

function PeopleSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="#E85D20" strokeWidth="1.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 7c1.7 0 3 1.3 3 3" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/></svg>;
}
function KeySVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3a4 4 0 11-4 4 4 4 0 014-4zM6.5 10.5l-4 4" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

const VALUE_PROPS = [
  { icon: <PeopleSVG />, text: 'We match you with students in YOUR industry' },
  { icon: <KeySVG />, text: 'Your network is their opportunity' },
];

export default function ParentStep2LeftPanel() {
  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 70%, #0821A5 100%)',
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
      boxSizing: 'border-box',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)', width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.5)', marginBottom: 10,
        }}>Step 2 of 4</p>

        <h2 style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: dmSans, fontWeight: 600, fontSize: 'clamp(22px, 3vw, 28px)', color: '#f4f0e8', lineHeight: 1.2, display: 'block' }}>
            What's your
          </span>
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 28px)', color: '#E85D20', lineHeight: 1.2, display: 'block' }}>
            background?
          </span>
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '16px 0 24px' }}>
          This helps us match you with students who can benefit from your experience.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {VALUE_PROPS.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{v.icon}</div>
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>{v.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}