import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function EmailSyncBanner({ user, onSyncClick, onDismiss }) {
  // Check if user previously dismissed
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(`cff_email_dismissed_${user?.id}`) === '1';
    } catch {
      return false;
    }
  });

  // If they are already synced or previously dismissed, don't show the setup prompt
  if (user?.is_email_synced || dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(`cff_email_dismissed_${user?.id}`, '1');
    } catch {}
    if (onDismiss) onDismiss();
    setDismissed(true);
  };

  return (
    <div style={{
      background: 'linear-gradient(to right, #eef2ff, #f0f9ff)',
      border: '1px solid #c7d2fe',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>📨</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
            Automate Your Application Pipeline
          </h4>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.6, maxWidth: 640 }}>
            Connect your Gmail or Outlook. CliFF will automatically parse incoming interview invites, applications, and updates so your tracker stays completely up to date with zero typing.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 18,
            cursor: 'pointer',
            minHeight: 'auto',
            minWidth: 'auto',
            padding: 0,
            lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={onSyncClick}
          style={{
            fontFamily: dm,
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            background: '#0f172a',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            cursor: 'pointer',
            minHeight: 'auto',
            transition: 'background 0.15s',
            boxShadow: '0 2px 8px rgba(15,23,42,0.2)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
          onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
        >
          Sync My Inbox →
        </button>
        <button
          onClick={handleDismiss}
          style={{
            fontFamily: dm,
            fontSize: 11,
            fontWeight: 500,
            color: '#64748b',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '10px 16px',
            cursor: 'pointer',
            minHeight: 'auto',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          Not now
        </button>
      </div>
    </div>
  );
}