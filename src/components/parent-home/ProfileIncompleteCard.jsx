import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, ORANGE, CARD_BG, BORDER, MUTED } from './constants';

export default function ProfileIncompleteCard({ profileScore, profileTotal, profileNudge }) {
  if (!profileNudge) return null;

  const pct = Math.round((profileScore / profileTotal) * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
        YOUR PROFILE
      </p>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>Profile completion</span>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: '#333', borderRadius: 3, marginBottom: 16 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: ORANGE, borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#ccc', lineHeight: 1.6, margin: '0 0 16px' }}>
          {profileNudge.text}
        </p>

        <button onClick={() => navigate('Profile')} style={{
          width: '100%', padding: '12px 20px', borderRadius: 100,
          background: 'transparent', border: `1.5px solid ${ORANGE}`, color: ORANGE,
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto',
        }}>
          Complete My Profile →
        </button>
      </div>
    </div>
  );
}