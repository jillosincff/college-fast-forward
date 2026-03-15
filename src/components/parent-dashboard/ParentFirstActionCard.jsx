import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function LightningSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function ParentFirstActionCard({ user, answersGiven }) {
  const [dismissed, setDismissed] = useState(user?.firstActionCardDismissed || false);

  if (dismissed || (answersGiven && answersGiven > 0)) return null;

  const handleDismiss = async () => {
    setDismissed(true);
    try { await base44.auth.updateMe({ firstActionCardDismissed: true }); } catch {}
  };

  return (
    <div style={{
      background: 'rgba(232,93,32,0.06)', border: '0.5px solid rgba(232,93,32,0.2)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
    }}>
      {/* Dismiss */}
      <button onClick={handleDismiss} style={{
        position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', width: 'auto',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>

      <div style={{
        width: 36, height: 36, borderRadius: 10, background: 'rgba(232,93,32,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}><LightningSVG /></div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
          Complete your first action — answer a student question
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888' }}>
          Earn 15 karma points and start boosting your student's visibility in the network
        </p>
      </div>

      <button
        onClick={() => navigate('Connections')}
        style={{
          background: orange, color: '#fff', border: 'none', borderRadius: 100,
          padding: '8px 16px', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, minHeight: 'auto', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = orangeHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = orange; }}
      >
        Answer Now +15 karma →
      </button>
    </div>
  );
}