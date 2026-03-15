import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const AVATAR_COLORS = ['#E85D20', '#0821A5', '#6A2A60', '#2e7d32', '#D32737'];

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncate(text, maxLen = 60) {
  if (!text) return '';
  const clean = text.replace(/\n/g, ' ').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen).trim() + '…' : clean;
}

function getRecipientName(msg) {
  // Try to extract a name from the subject or use email
  const email = msg.recipient_email || '';
  const name = email.split('@')[0] || 'Student';
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getInitial(name) {
  return (name || 'S').charAt(0).toUpperCase();
}

function ActivityRow({ activity, index }) {
  const name = activity.recipientName || getRecipientName(activity);
  const initial = getInitial(name);
  const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const topic = activity.post_title || activity.subject || '';
  const questionPreview = truncate(activity.body);
  const time = formatTimeAgo(activity.created_date);
  const hasReply = activity.hasReply;

  return (
    <div
      onClick={() => navigate('MyMessages')}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
        flexShrink: 0, marginTop: 2,
      }}>{initial}</div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
            {name}
          </span>
          {topic && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 400,
              background: 'rgba(0,0,0,0.05)', color: '#666',
              borderRadius: 100, padding: '1px 8px',
            }}>{truncate(topic, 30)}</span>
          )}
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888',
          lineHeight: 1.5, margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{questionPreview}</p>
      </div>

      {/* Right: timestamp + status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa' }}>{time}</span>
        {hasReply ? (
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 500,
            background: 'rgba(76,175,80,0.1)', color: '#2e7d32',
            borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap',
          }}>Replied ✓</span>
        ) : (
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 400,
            background: 'rgba(0,0,0,0.04)', color: '#999',
            borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap',
          }}>Awaiting reply</span>
        )}
      </div>
    </div>
  );
}

export default function ParentRecentActivitySection({ sentMessages }) {
  if (!sentMessages || sentMessages.length === 0) return null;

  const display = sentMessages.slice(0, 3);

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#1a1a1a', marginBottom: 2 }}>
          Your Recent Activity
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
          Conversations you've started on Ask the Network
        </p>
      </div>

      {/* Activity rows */}
      <div style={{ padding: '4px 20px 0' }}>
        {display.map((msg, i) => (
          <ActivityRow key={msg.id} activity={msg} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 20px 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('MyMessages')}
          style={{
            background: 'none', border: 'none', fontFamily: dmSans,
            fontSize: 12, fontWeight: 500, color: orange,
            cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto',
          }}
        >
          See All Activity →
        </button>
      </div>
    </div>
  );
}