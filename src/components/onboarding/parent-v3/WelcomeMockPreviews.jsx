import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

export function MockNotification() {
  return (
    <div style={{
      marginTop: 16, background: '#111', borderLeft: `3px solid ${ORANGE}`,
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: '#ccc', lineHeight: 1.6, marginBottom: 10 }}>
        📩 "A student is targeting Goldman Sachs. You work in finance. Want to make an intro?"
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#fff',
          background: ORANGE, borderRadius: 100, padding: '5px 14px',
        }}>Yes, I can help →</span>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#888',
          background: 'transparent', border: '1px solid #333',
          borderRadius: 100, padding: '5px 14px',
        }}>Not this time</span>
      </div>
    </div>
  );
}

export function MockWeeklyUpdate({ studentName }) {
  const name = studentName || 'Your student';
  return (
    <div style={{
      marginTop: 16, background: '#111',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>
        📬 Weekly Update: {name}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[
          '✓ 12 alumni identified at target companies',
          '✓ 6 personalized messages sent',
          '✓ 2 responses received',
        ].map((line, i) => (
          <p key={i} style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa', margin: 0 }}>{line}</p>
        ))}
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#ccc', marginTop: 8 }}>
        {name} is making real progress! 🎉
      </p>
    </div>
  );
}