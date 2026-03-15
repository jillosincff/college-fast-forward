import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

function PersonSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke={orange} strokeWidth="1.5"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={orange} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function ParentProfileBanner({ user, profilePercent }) {
  if (profilePercent >= 100) return null;

  return (
    <div
      onClick={() => navigate('ProfileEdit')}
      style={{
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,93,32,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}><PersonSVG /></div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>
          Complete your profile to get matched with more student questions
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
          Add your LinkedIn URL and a short bio — takes 2 minutes
        </p>
        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${profilePercent}%`, background: orange, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
      </div>
      <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: orange, flexShrink: 0 }}>
        {profilePercent}%
      </span>
    </div>
  );
}