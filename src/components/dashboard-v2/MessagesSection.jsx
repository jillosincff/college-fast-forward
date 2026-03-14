import React from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";

function MessageCard({ msg }) {
  const [hovered, setHovered] = React.useState(false);
  const isUnread = !msg.is_read;
  const senderName = msg.sender_name || msg.sender_email?.split('@')[0] || 'Someone';
  const initials = senderName.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const preview = msg.body?.replace(/<[^>]+>/g, '').slice(0, 80) || msg.subject || '';
  const timeAgo = moment(msg.created_date).fromNow(true);

  return (
    <div
      onClick={() => navigate('MyMessages')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: `0.5px solid ${hovered ? 'rgba(232,93,32,0.3)' : 'rgba(0,0,0,0.08)'}`,
        borderLeft: isUnread ? '3px solid #E85D20' : undefined,
        borderRadius: isUnread ? '0 14px 14px 0' : 14,
        padding: '16px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        cursor: 'pointer', transition: 'border-color 0.2s',
        position: 'relative', marginBottom: 8,
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: '#E85D20',
          position: 'absolute', top: 18, right: 18,
        }} />
      )}
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: '#E85D20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
      }}>
        {initials}
      </div>
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>
          {senderName}
        </div>
        <div style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {preview}
        </div>
      </div>
      {/* Time */}
      <span style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {timeAgo}
      </span>
    </div>
  );
}

export default function MessagesSectionV2({ messages }) {
  const recentMessages = (messages || []).slice(0, 3);

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>Messages</span>
        <button onClick={() => navigate('MyMessages')} style={{
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

      {recentMessages.length > 0 ? (
        recentMessages.map(m => <MessageCard key={m.id} msg={m} />)
      ) : (
        <div style={{
          background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 14, padding: '16px 20px',
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa' }}>
            No other messages yet. Message a match above to get started.
          </span>
        </div>
      )}
    </section>
  );
}