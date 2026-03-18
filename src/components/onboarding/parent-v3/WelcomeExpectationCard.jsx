import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';
const ORANGE = '#E85D20';

export default function WelcomeExpectationCard({ icon, title, body, children }) {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#aaa', lineHeight: 1.65, margin: 0 }}>{body}</p>
      {children}
    </div>
  );
}