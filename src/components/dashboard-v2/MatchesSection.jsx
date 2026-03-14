import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const AVATAR_COLORS = ['#0d1117', '#2a4a8a', '#3a5a3a', '#5a3a3a'];

function MatchCard({ match, index, onMessage }) {
  const [hovered, setHovered] = React.useState(false);
  const name = match.parent_name || match.peer_name || 'UF Professional';
  const firstName = name.split(/\s+/)[0];
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const role = match.parent_role || match.peer_major || '';
  const company = match.parent_company || '';
  const detail = match.parent_industry || match.parent_years_experience
    ? [match.parent_industry, match.parent_years_experience ? `${match.parent_years_experience} yrs` : ''].filter(Boolean).join(' · ')
    : '';
  const isTop = index === 0;
  const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  // Hide incomplete profiles
  if (name === 'UF Professional') return null;

  return (
    <div
      onClick={() => onMessage(match)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff', border: `0.5px solid ${hovered ? 'rgba(232,93,32,0.3)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 14, padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hovered ? 'translateY(-1px)' : 'none',
        marginBottom: 8,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
      }}>
        {initials}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{name}</span>
          {isTop ? (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '2px 8px',
              borderRadius: 100,
              background: 'rgba(232,93,32,0.1)', color: '#E85D20',
              border: '0.5px solid rgba(232,93,32,0.25)',
            }}>Top Match</span>
          ) : (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '2px 8px',
              borderRadius: 100,
              background: 'rgba(76,175,80,0.08)', color: '#2e7d32',
              border: '0.5px solid rgba(76,175,80,0.2)',
            }}>Strong Match</span>
          )}
        </div>
        <div style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {[role, company].filter(Boolean).join(' · ') || 'UF Community Member'}
        </div>
        {detail && (
          <div className="match-detail-line" style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginTop: 2,
          }}>
            {detail}
          </div>
        )}
      </div>
      {/* CTA */}
      <button onClick={e => { e.stopPropagation(); onMessage(match); }} style={{
        background: '#0d1117', color: '#fff',
        fontFamily: dmSans, fontSize: 12, fontWeight: 500,
        borderRadius: 100, padding: '8px 16px', border: 'none',
        cursor: 'pointer', transition: 'background 0.2s',
        whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto', width: 'auto',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#E85D20'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#0d1117'; }}
      >
        Message {firstName}
      </button>
    </div>
  );
}

export default function MatchesSectionV2({ matches, user, onMessageMatch }) {
  const messagesSentCount = (matches || []).filter(m =>
    m.status === 'student_connected' || m.status === 'intro_made'
  ).length;

  // Filter out current user and incomplete profiles, deduplicate, limit to 3
  const userEmail = user?.email?.toLowerCase();
  const userId = user?.id;
  const seen = new Set();
  const visible = (matches || [])
    .filter(m => {
      // Exclude self-matches
      if (m.parent_email?.toLowerCase() === userEmail || m.peer_email?.toLowerCase() === userEmail) return false;
      if (m.parent_id === userId || m.peer_id === userId) return false;
      // Exclude incomplete profiles
      const name = m.parent_name || m.peer_name;
      if (!name || name === 'UF Professional') return false;
      // Deduplicate by email
      const key = (m.parent_email || m.peer_email || m.id)?.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  // Count all valid (non-self) matches for the header
  const totalValid = (matches || []).filter(m => {
    if (m.parent_email?.toLowerCase() === userEmail || m.peer_email?.toLowerCase() === userEmail) return false;
    if (m.parent_id === userId || m.peer_id === userId) return false;
    const name = m.parent_name || m.peer_name;
    return name && name !== 'UF Professional';
  }).length;

  if (visible.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>
          {totalValid} people ready to help you
        </span>
        <button onClick={() => navigate('MyMatches')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
          minHeight: 'auto', width: 'auto', padding: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          View all →
        </button>
      </div>

      {/* Tip bar */}
      <div style={{
        background: 'rgba(232,93,32,0.06)', border: '0.5px solid rgba(232,93,32,0.15)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 10,
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(26,26,26,0.6)' }}>
          Tip: Students who message 3+ people get responses 80% faster. You've messaged{' '}
          <strong style={{ color: '#E85D20', fontWeight: 500 }}>{messagesSentCount}</strong>.
        </span>
      </div>

      {/* Cards */}
      {visible.map((m, i) => (
        <MatchCard key={m.id} match={m} index={i} onMessage={onMessageMatch} />
      ))}

      <style>{`
        @media(max-width:480px) {
          .match-detail-line { display: none !important; }
        }
      `}</style>
    </section>
  );
}