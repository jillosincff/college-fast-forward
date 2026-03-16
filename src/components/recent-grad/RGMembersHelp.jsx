import React from 'react';
import { navigate } from '@/components/utils/navigation';
import formatDisplayName, { getInitialsFromUser } from '@/components/utils/formatDisplayName';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function getAvatarColor(name) {
  const colors = ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#2563eb'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function MemberRow({ member, onMessage }) {
  const name = formatDisplayName(member, 'Member');
  const initials = getInitialsFromUser(member, 'M');
  const color = getAvatarColor(member.full_name || member.displayName || '');
  const title = [member.jobTitle, member.company].filter(Boolean).join(' · ');
  const helpTag = (member.matchedCategories || [])[0]?.replace(/_/g, ' ') || '';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
      borderBottom: '1px solid #f5f5f5',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#1a1a1a',
          marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</p>
        {title && (
          <p style={{
            fontFamily: dmSans, fontSize: 12, color: '#888', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</p>
        )}
        {helpTag && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#E85D20',
            border: '1px solid rgba(232,93,32,0.25)', borderRadius: 999,
            padding: '2px 8px', display: 'inline-block', marginTop: 4,
          }}>Can help with: {helpTag}</span>
        )}
      </div>
      <button
        onClick={() => onMessage(member)}
        style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20',
          background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)',
          borderRadius: 10, padding: '8px 14px', cursor: 'pointer', flexShrink: 0,
          minHeight: 'auto', width: 'auto',
        }}
      >
        Message →
      </button>
    </div>
  );
}

export default function RGMembersHelp({ members, total, helpTags, onMessage, loading }) {
  // Always show section — with empty state if no members yet
  if ((!members || members.length === 0) && !loading) {
    return (
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 20px',
        border: '1px solid #e5e7eb', textAlign: 'center',
      }}>
        <h3 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8,
        }}>Members Who Can Help You</h3>
        <p style={{
          fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 0,
        }}>
          Post a request to get matched with parents and alumni who can help with your career goals.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px 20px',
      border: '1px solid #e5e7eb',
    }}>
      <h3 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 4,
      }}>
        {total} Members Can Help You
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>Based on your needs:</span>
        {(helpTags || []).slice(0, 4).map((tag, i) => (
          <span key={i} style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#E85D20',
            background: 'rgba(232,93,32,0.08)', borderRadius: 999, padding: '3px 10px',
          }}>{tag.replace(/_/g, ' ')}</span>
        ))}
      </div>

      {members.slice(0, 3).map((m, i) => (
        <MemberRow key={m.id || i} member={m} onMessage={onMessage} />
      ))}

      {total > 3 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => navigate('GatorDirectory')}
            style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#1a1a1a',
              background: '#fff', border: '2px solid #1a1a1a', borderRadius: 12,
              padding: '10px 32px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            }}
          >
            See All {total} Members →
          </button>
        </div>
      )}
    </div>
  );
}