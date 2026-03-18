import React from 'react';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const AVATAR_COLORS = ['#1e3a5f', '#2a4a3a', '#4a3a6a', '#8b3a2a', '#3a5a6a', '#5a4a2a'];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const m = moment(dateStr);
  const now = moment();
  if (m.isSame(now, 'day')) return 'Today';
  if (m.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday';
  if (m.isSame(now, 'year')) return m.format('MMM D');
  return m.format('MMM D, YYYY');
}

function resolveDisplayName(contactName, contactData, contactEmail) {
  // Priority 1: full_name from user record
  if (contactData?.full_name && !contactData.full_name.includes('@')) {
    const name = contactData.full_name.trim();
    if (name.includes(',')) {
      const [last, rest] = name.split(',').map(s => s.trim());
      const first = rest?.split(/\s+/)[0] || '';
      if (first && last) return `${first} ${last}`;
    }
    return name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // Priority 2: first + last from user record
  if (contactData?.first_name && contactData?.last_name) {
    return `${contactData.first_name} ${contactData.last_name}`;
  }

  // Priority 3: contactName from message sender_name
  if (contactName && contactName !== 'Unknown' && !contactName.includes('@')) {
    const cleaned = contactName.trim();
    if (cleaned.includes(',')) {
      const [last, rest] = cleaned.split(',').map(s => s.trim());
      const first = rest?.split(/\s+/)[0] || '';
      if (first && last) return `${first} ${last}`;
    }
    return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // Priority 4: email-based fallback (NEVER "Unknown")
  if (contactEmail) return contactEmail;
  return 'No name';
}

function getInitials(name, email) {
  if (name && name !== 'Unknown' && !name.includes('@')) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

function getRoleLabel(contactData) {
  if (!contactData) return null;
  const persona = contactData.persona || contactData.roles?.[0];
  const company = contactData.current_company || contactData.company || '';
  const university = contactData.university || contactData.school || '';

  if (persona === 'gator' || persona === 'student') {
    return `Student${university ? ` · ${university}` : ''}`;
  }
  if (persona === 'parent') {
    return `Parent${company ? ` · ${company}` : ''}`;
  }
  if (persona === 'alumni') {
    return `Alumni${company ? ` · ${company}` : ''}`;
  }
  return company || null;
}

export default function ParentThreadCard({ thread, currentUserEmail, index, onClick, isIntro }) {
  const { contactEmail, contactName, contactData, lastMessage, lastMessageAt, unreadCount, isSentByMe } = thread;

  const displayName = resolveDisplayName(contactName, contactData, contactEmail);
  const initials = getInitials(displayName, contactEmail);
  const avatarColor = AVATAR_COLORS[hashStr(contactEmail || '') % AVATAR_COLORS.length];
  const roleLabel = isIntro ? `Introduction · ${contactData?.current_company || contactData?.company || ''}` : getRoleLabel(contactData);
  const isUnread = unreadCount > 0;

  let preview = (lastMessage?.body || '').replace(/^(Re:|Fwd:|Message from )[^\n]*/i, '').trim();
  preview = preview.slice(0, 80) + (preview.length > 80 ? '…' : '');
  const senderTag = isSentByMe ? 'You: ' : '';

  return (
    <div onClick={onClick} style={{
      background: isUnread ? '#242424' : '#1A1A1A',
      border: '1px solid #2A2A2A',
      borderLeft: isUnread ? `3px solid ${ORANGE}` : '1px solid #2A2A2A',
      borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', transition: 'all 0.2s',
      animation: `pmsgFadeUp 0.35s ease ${0.08 + index * 0.04}s both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#242424'; e.currentTarget.style.borderColor = '#3A3A3A'; }}
      onMouseLeave={e => { e.currentTarget.style.background = isUnread ? '#242424' : '#1A1A1A'; e.currentTarget.style.borderColor = '#2A2A2A'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: avatarColor, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
      }}>{initials}</div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: isUnread ? 600 : 500,
            color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{displayName}</span>
        </div>
        {roleLabel && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888',
            display: 'block', marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>{roleLabel}</span>
        )}
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300,
          color: isUnread ? '#aaa' : '#666', margin: 0,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {senderTag && <span style={{ color: '#888' }}>{senderTag}</span>}
          {preview || 'No message preview'}
        </p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#666', whiteSpace: 'nowrap' }}>
          {formatTimestamp(lastMessageAt)}
        </span>
        {isUnread && (
          <span style={{
            minWidth: 20, height: 20, borderRadius: 10, background: ORANGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 10, fontWeight: 600, color: '#fff',
            padding: '0 5px',
          }}>{unreadCount}</span>
        )}
      </div>
    </div>
  );
}