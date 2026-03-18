import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

export default function ParentVisibilityCard({ user }) {
  const { refreshUser } = useAuth();
  const visible = user?.visible_in_directory !== false;

  const handleToggle = async () => {
    const newValue = !visible;
    await base44.auth.updateMe({ visible_in_directory: newValue, directory_consent_given: true });
    if (refreshUser) await refreshUser();
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 16 }}>Directory Visibility</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#fff', lineHeight: 1.5 }}>
          Make my profile visible to students and parents in the network
        </span>
        <button onClick={handleToggle} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: visible ? ORANGE : '#444', position: 'relative',
          transition: 'background 0.2s', flexShrink: 0, minHeight: 'auto', minWidth: 44,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, left: visible ? 23 : 3,
            transition: 'left 0.2s',
          }} />
        </button>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888', marginTop: 8, lineHeight: 1.5 }}>
        {visible
          ? "Visible by default — students targeting your industry can find and contact you. Toggle off to stay hidden."
          : "Your profile is hidden — you won't appear in search results or receive intro requests."}
      </p>
    </div>
  );
}