import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

function ChainSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5l3-3M4.5 8L3 9.5a2.12 2.12 0 003 3L7.5 11M8.5 5L10 3.5a2.12 2.12 0 013 3L11.5 8" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function LightningSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const VALUE_PROPS = [
  { icon: <ChainSVG />, text: "Every time you help a student, YOUR student's questions move up in the feed" },
  { icon: <LightningSVG />, text: 'More Karma = higher boost multiplier = more visibility' },
];

export default function ParentStep3LeftPanel() {
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
        }}>Step 3 of 4</p>

        <h2 style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: dmSans, fontWeight: 600, fontSize: 'clamp(22px, 3vw, 26px)', color: '#f4f0e8', lineHeight: 1.2, display: 'block' }}>
            Link your
          </span>
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 26px)', color: '#E85D20', lineHeight: 1.2, display: 'block' }}>
            student.
          </span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {VALUE_PROPS.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(232,93,32,0.12)', border: '0.5px solid rgba(232,93,32,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{v.icon}</div>
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{v.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}