import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = ['#E85D20', '#b71c1c', '#1a237e', '#004d40', '#4a148c'];

function getDisplayName(fullName) {
  if (!fullName) return 'Student';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0)}.`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityRow({ activity, index }) {
  const name = getDisplayName(activity.recipientName);
  const preview = (activity.preview || '').slice(0, 60);

  return (
    <div
      onClick={() => navigate('MyMessages')}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: AVATAR_COLORS[index % AVATAR_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
      }}>
        {getInitials(activity.recipientName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
            {name}
          </span>
          {activity.helpTag && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: '#888',
              background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '2px 8px',
            }}>
              {activity.helpTag}
            </span>
          )}
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {preview || 'Conversation started'}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginBottom: 4 }}>
          {formatDate(activity.date)}
        </p>
        <span style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500,
          padding: '2px 8px', borderRadius: 100,
          ...(activity.hasReply
            ? { color: '#16a34a', background: 'rgba(22,163,74,0.08)' }
            : { color: '#999', background: 'rgba(0,0,0,0.04)' }
          ),
        }}>
          {activity.hasReply ? '✓ Replied' : 'Awaiting reply'}
        </span>
      </div>
    </div>
  );
}

export default function AlumniRecentActivity({ activities }) {
  if (!activities || activities.length === 0) return null;
  const display = activities.slice(0, 3);

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <h3 style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
        Your Recent Activity
      </h3>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 12 }}>
        Conversations you've started on Ask the Network
      </p>

      {display.map((a, i) => (
        <ActivityRow key={i} activity={a} index={i} />
      ))}

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <button
          onClick={() => navigate('MyMessages')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20',
            minHeight: 'auto', width: 'auto',
          }}
        >
          See All Activity →
        </button>
      </div>
    </div>
  );
}