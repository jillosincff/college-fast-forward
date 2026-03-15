import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function ChainSVG() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 11l4-4M5 9L3.5 10.5a2.5 2.5 0 003.5 3.5L8.5 12.5M9.5 5.5L11 4a2.5 2.5 0 013.5 3.5L13 9" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckSVG() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#2e7d32" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function ParentLinkStudentCard({ linkedStudent, onLinkClick }) {
  if (linkedStudent) {
    const fn = linkedStudent.full_name || linkedStudent.email?.split('@')[0] || 'Student';
    const major = linkedStudent.major || '';
    const year = linkedStudent.graduation_year || linkedStudent.year || '';

    return (
      <div style={{
        background: 'rgba(76,175,80,0.04)', border: '0.5px solid rgba(76,175,80,0.2)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <CheckSVG />
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#2e7d32' }}>Student Linked</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888' }}>
          {fn}{major ? ` · ${major}` : ''}{year ? ` · Class of ${year}` : ''}
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(76,175,80,0.8)', marginTop: 4 }}>
          Boosts active — every answer you give helps their visibility
        </p>
        <button
          onClick={() => navigate('PublicProfile', { email: linkedStudent.email })}
          style={{
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, fontWeight: 400,
            color: orange, cursor: 'pointer', marginTop: 8, padding: 0, minHeight: 'auto', width: 'auto',
          }}
        >
          View {fn.split(' ')[0]}'s profile →
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.15)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(232,93,32,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><ChainSVG /></div>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
          Link Your Student to Unlock Boosts
        </span>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
        Every time you help a student in the network, your own student's questions move up in the feed. More karma = higher boost multiplier = more visibility for them.
      </p>
      <button
        onClick={onLinkClick}
        style={{
          width: '100%', padding: 11, borderRadius: 100, border: 'none',
          background: orange, color: '#fff',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = orangeHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = orange; }}
      >
        Find &amp; Link Your Student →
      </button>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', textAlign: 'center', marginTop: 8 }}>
        Search by name or email. If they haven't signed up yet, we'll connect you when they join.
      </p>
    </div>
  );
}