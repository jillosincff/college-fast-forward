import { useState, useEffect } from 'react';

const dm = "'DM Sans', sans-serif";

/**
 * Nudges students to connect their Gmail so CliFF can auto-detect
 * replies from outreach contacts. Hidden once connected or dismissed.
 */
export default function GmailConnectNudge({ user }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(`cff_gmail_nudge_dismissed_${user?.id}`) === '1');
    } catch {
      setDismissed(false);
    }
  }, [user?.id]);

  if (!user || user.is_email_synced || dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(`cff_gmail_nudge_dismissed_${user?.id}`, '1'); } catch {}
    setDismissed(true);
  };

  return (
    <div style={{
      background: 'linear-gradient(to right, #F0FDF4, #ECFDF5)',
      border: '1px solid #86EFAC',
      borderRadius: 12,
      padding: '14px 20px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#14532D', margin: '0 0 2px' }}>
          Never miss a reply — connect your Gmail
        </p>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.5 }}>
          CliFF will automatically detect when a contact replies to your outreach, move them to "Replied" in your pipeline, and alert you so you can respond while it's warm.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <a
          href="#/EmailConnectionSettings"
          style={{
            fontFamily: dm, fontSize: 12, fontWeight: 700,
            color: '#fff', background: '#16A34A',
            borderRadius: 10, padding: '10px 18px',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          Connect Gmail →
        </a>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', color: '#86EFAC',
            fontSize: 18, cursor: 'pointer', padding: 0,
            minHeight: 'auto', minWidth: 'auto', lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}