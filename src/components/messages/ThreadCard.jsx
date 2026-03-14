import React from 'react';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";
const AVATAR_COLORS = ['#0d1117', '#2a4a8a', '#3a5a3a', '#4a3a6a', '#c62828', '#5a4a2a'];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatName(raw) {
  if (!raw) return 'Unknown';
  const s = raw.trim();
  // "Last, First M." → "First Last"
  if (s.includes(',')) {
    const [last, rest] = s.split(',').map(p => p.trim());
    const first = rest?.split(/\s+/)[0] || '';
    return `${first} ${last}`.trim();
  }
  // Already "First Last"
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getInitials(name) {
  const parts = formatName(name).split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '??';
}

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const m = moment(dateStr);
  const now = moment();
  if (m.isSame(now, 'day')) return 'Today';
  if (m.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (m.isSame(moment(), 'year')) return m.format('MMM D');
  return m.format('MMM D, YYYY');
}

function getRole(userData) {
  if (!userData) return null;
  const p = userData.persona || (userData.roles?.[0]);
  if (p === 'parent') return 'Parent';
  if (p === 'alumni') return 'Alumni';
  if (p === 'gator') return 'Student';
  return null;
}

export default function ThreadCard({ thread, currentUserEmail, index, onClick }) {
  const { contactEmail, contactName, contactData, lastMessage, lastMessageAt, unreadCount, isSentByMe } = thread;

  const displayName = formatName(contactName);
  const initials = getInitials(contactName);
  const avatarColor = AVATAR_COLORS[hashStr(contactEmail || '') % AVATAR_COLORS.length];
  const role = getRole(contactData);
  const company = contactData?.current_company || contactData?.company || '';
  const isUnread = unreadCount > 0;

  // Clean preview — strip subject-line patterns, use body only
  let preview = (lastMessage?.body || '').replace(/^(Re:|Fwd:|Message from )[^\n]*/i, '').trim();
  preview = preview.slice(0, 80) + (preview.length > 80 ? '...' : '');

  const senderTag = isSentByMe ? 'You: ' : `${formatName(contactName).split(' ')[0]}: `;

  return (
    <div onClick={onClick} style={{
      background: isUnread ? 'rgba(232,93,32,0.02)' : '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderLeft: isUnread ? '3px solid #E85D20' : '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: isUnread ? '0 14px 14px 0' : 14,
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', transition: 'all 0.2s',
      animation: `msgFadeUp 0.4s ease ${0.1 + index * 0.05}s both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: '50%', background: avatarColor, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff',
      }}>{initials}</div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{displayName}</span>
          {(role || company) && (
            <span className="msg-source-tag" style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', opacity: 0.5, flexShrink: 0 }} />
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[role, company].filter(Boolean).join(' · ')}
              </span>
            </span>
          )}
        </div>
        {/* Preview */}
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: isUnread ? 400 : 300,
          color: isUnread ? '#555' : '#888', margin: 0, marginTop: 4,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: isSentByMe ? 400 : 500, color: isSentByMe ? '#aaa' : '#E85D20' }}>{senderTag}</span>
          {preview || 'No message preview'}
        </p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', whiteSpace: 'nowrap' }}>
          {formatTimestamp(lastMessageAt)}
        </span>
        {isUnread && (
          <span style={{
            width: 20, height: 20, borderRadius: '50%', background: '#E85D20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 10, fontWeight: 600, color: '#fff',
          }}>{unreadCount}</span>
        )}
      </div>

      <style>{`
        @media(max-width:768px) {
          .msg-source-tag { max-width: 120px !important; }
        }
      `}</style>
    </div>
  );
}