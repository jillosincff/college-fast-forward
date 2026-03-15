import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function AlumniOnboardingComplete({ user, onDone }) {
  const [requesting, setRequesting] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleEnable = async () => {
    // Only trigger browser prompt when user explicitly clicks
    if (!('Notification' in window)) {
      onDone();
      return;
    }

    if (Notification.permission === 'denied') {
      setBlocked(true);
      return;
    }

    setRequesting(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'denied') setBlocked(true);
    } catch {}
    setRequesting(false);
    onDone();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      background: '#ffffff',
    }}>
      <span style={{ fontSize: 56, marginBottom: 16 }}>🎉</span>
      <h1 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#1a1a1a',
        textAlign: 'center', marginBottom: 8,
      }}>
        You're all set!
      </h1>
      <p style={{
        fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#888',
        textAlign: 'center', marginBottom: 32,
      }}>
        One more thing before you go...
      </p>

      {/* Notification card */}
      <div style={{
        width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '32px 28px', textAlign: 'center', marginBottom: 24,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,93,32,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Bell style={{ width: 28, height: 28, color: '#E85D20' }} />
        </div>

        <h3 style={{
          fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8,
        }}>
          🔔 Help students instantly
        </h3>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#666',
          lineHeight: 1.6, marginBottom: 24,
        }}>
          Get notified when a student needs your expertise — respond in one tap and make a real impact. Max 2-3 alerts per week.
        </p>

        <button
          onClick={handleEnable}
          disabled={requesting}
          style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, width: '100%', height: 52,
            borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff',
            cursor: 'pointer', marginBottom: 12,
          }}
        >
          {requesting ? 'Requesting...' : 'Enable Notifications'}
        </button>

        <button
          onClick={onDone}
          style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            minHeight: 'auto', width: 'auto',
          }}
        >
          Maybe later
        </button>

        {blocked && (
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa',
            marginTop: 12,
          }}>
            To enable notifications, update your browser settings.
          </p>
        )}
      </div>
    </div>
  );
}