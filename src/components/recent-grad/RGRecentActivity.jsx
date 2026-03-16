import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function normalizeDisplayName(input) {
  if (!input) return 'Member';
  let name = input.trim();
  if (name.includes('@')) name = name.split('@')[0];
  if (!name.includes(' ') && (name.includes('.') || name.includes('_'))) {
    const parts = name.split(/[._]+/).filter(Boolean);
    name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  if (!name.includes(' ')) return name.charAt(0).toUpperCase() + name.slice(1);
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

function getInitials(name) {
  const normalized = normalizeDisplayName(name);
  const parts = normalized.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#2563eb'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ActivityRow({ entry }) {
  const name = normalizeDisplayName(entry.recipientName || 'Member');
  const initials = getInitials(entry.recipientName || 'Member');
  const color = getAvatarColor(name);
  const preview = entry.preview || '';
  const hasReply = entry.hasReply;

  return (
    <div
      onClick={() => navigate('MyMessages')}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
        borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            {name}
          </span>
          {entry.helpTag && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 600, color: '#E85D20',
              background: 'rgba(232,93,32,0.08)', borderRadius: 999, padding: '2px 6px',
            }}>{entry.helpTag}</span>
          )}
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 13, color: '#888', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{preview}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, color: '#aaa', marginBottom: 4 }}>
          {formatTime(entry.date)}
        </p>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 600, borderRadius: 999,
          padding: '3px 8px',
          background: hasReply ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.04)',
          color: hasReply ? '#22c55e' : '#aaa',
        }}>
          {hasReply ? 'Replied ✓' : 'Awaiting reply'}
        </span>
      </div>
    </div>
  );
}

export default function RGRecentActivity({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px 20px',
      border: '1px solid #e5e7eb',
    }}>
      <h3 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 4,
      }}>Your Recent Activity</h3>
      <p style={{
        fontFamily: dmSans, fontSize: 13, color: '#888', marginBottom: 16,
      }}>Conversations you've started</p>

      {activities.slice(0, 3).map((entry, i) => (
        <ActivityRow key={i} entry={entry} />
      ))}

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <button
          onClick={() => navigate('MyMessages')}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            minHeight: 'auto', width: 'auto',
          }}
        >
          See All Activity →
        </button>
      </div>
    </div>
  );
}