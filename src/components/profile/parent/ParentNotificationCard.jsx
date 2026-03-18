import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{label}</p>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888', margin: '2px 0 0' }}>{description}</p>
      </div>
      <button onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? ORANGE : '#444', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0, minHeight: 'auto',
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

export default function ParentNotificationCard({ user }) {
  const pushEnabled = user?.push_notifications_enabled === true;
  const [emailIntros, setEmailIntros] = useState(user?.email_notify_intros !== false);
  const [emailWeekly, setEmailWeekly] = useState(user?.email_notify_weekly !== false);
  const [emailPlatform, setEmailPlatform] = useState(user?.email_notify_platform === true);

  const save = (field, value) => {
    base44.auth.updateMe({ [field]: value });
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await base44.auth.updateMe({ push_notifications_enabled: true });
    }
  };

  const handleDisablePush = async () => {
    await base44.auth.updateMe({ push_notifications_enabled: false });
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 16 }}>Notification Settings</p>

      {/* Push */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pushEnabled ? '#4CAF50' : '#888' }} />
            <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>
              Push notifications {pushEnabled ? 'enabled' : 'disabled'}
            </span>
          </div>
        </div>
        {pushEnabled ? (
          <button onClick={handleDisablePush} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#888',
            background: 'transparent', border: '1px solid #444', borderRadius: 100,
            padding: '6px 16px', cursor: 'pointer', minHeight: 'auto',
          }}>Disable</button>
        ) : (
          <button onClick={handleEnablePush} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '6px 16px', cursor: 'pointer', minHeight: 'auto',
          }}>Enable</button>
        )}
      </div>

      {/* Info box */}
      <div style={{
        background: '#111', borderLeft: `3px solid ${ORANGE}`,
        borderRadius: 8, padding: '12px 16px', marginBottom: 20,
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#ccc', lineHeight: 1.6, margin: 0 }}>
          We send a maximum of 3 push notifications per week to prevent notification fatigue. You'll only be notified about students who match your expertise.
        </p>
      </div>

      {/* Email */}
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>Email Notifications</p>

      <Toggle
        label="Intro requests"
        description="Notify me when a student needs my network"
        checked={emailIntros}
        onChange={(v) => { setEmailIntros(v); save('email_notify_intros', v); }}
      />
      <Toggle
        label="Weekly student updates"
        description="Send me weekly progress updates on my student"
        checked={emailWeekly}
        onChange={(v) => { setEmailWeekly(v); save('email_notify_weekly', v); }}
      />
      <Toggle
        label="Platform updates"
        description="Send me occasional updates from College Fast Forward"
        checked={emailPlatform}
        onChange={(v) => { setEmailPlatform(v); save('email_notify_platform', v); }}
      />
    </div>
  );
}