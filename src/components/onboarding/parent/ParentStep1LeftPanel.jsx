import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

function TargetSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E85D20" strokeWidth="1.5"/><circle cx="8" cy="8" r="3" stroke="#E85D20" strokeWidth="1.5"/><circle cx="8" cy="8" r="0.5" fill="#E85D20"/></svg>;
}
function LightningSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function HeartSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13s-6-4-6-7.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0C16 9 8 13 8 13z" stroke="#E85D20" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

const VALUE_PROPS = [
  { icon: <TargetSVG />, text: "You're matched with students in your industry" },
  { icon: <LightningSVG />, text: 'Every intro you make earns karma' },
  { icon: <HeartSVG />, text: 'Your network becomes their opportunity' },
];

export default function ParentStep1LeftPanel() {
  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 70%, #0821A5 100%)',
      position: 'relative', overflow: 'hidden',
      padding: '48px 44px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>College Fast</span>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#E85D20', marginLeft: 4 }}>F</span>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>orward</span>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.5)', marginBottom: 10,
        }}>
          For UF Parents &amp; Alumni
        </p>

        <h2 style={{ marginBottom: 4 }}>
          <span style={{
            fontFamily: dmSans, fontWeight: 600,
            fontSize: 'clamp(22px, 3vw, 28px)',
            color: '#f4f0e8', lineHeight: 1.2, display: 'block',
          }}>
            Let's set up your profile so students can
          </span>
          <span style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(22px, 3vw, 28px)',
            color: '#E85D20', lineHeight: 1.2, display: 'block',
          }}>
            find you.
          </span>
        </h2>

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
            Your single introduction could change a student's entire career trajectory.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
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

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0,
        }}>
          "I joined because someone helped my daughter — now I've helped 4 students I've never met. That's the deal."
        </p>
      </div>
    </div>
  );
}