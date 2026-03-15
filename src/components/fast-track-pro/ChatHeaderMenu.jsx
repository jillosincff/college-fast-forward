import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', sans-serif";

function getInitials(user) {
  if (!user) return '??';
  const name = user.full_name || '';
  if (name.includes(',')) {
    const parts = name.split(',');
    const last = (parts[0] || '').trim();
    const first = (parts[1] || '').trim();
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase();
  if (parts[0]) return parts[0].substring(0, 2).toUpperCase();
  const email = user.email || '';
  return email.substring(0, 2).toUpperCase() || '??';
}

export default function ChatHeaderMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const initials = getInitials(user);

  const menuItems = [
    { label: 'My Profile →', onClick: () => { setOpen(false); navigate('Profile'); } },
    { label: 'Settings →', onClick: () => { setOpen(false); navigate('ProfileEdit'); } },
    { type: 'divider' },
    { label: 'Log Out →', danger: true, onClick: () => { setOpen(false); base44.auth.logout(); } },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 32, height: 32, borderRadius: '50%', background: '#E85D20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none', padding: 0,
          minHeight: 'auto', minWidth: 'auto', flexShrink: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <span style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          color: '#fff', lineHeight: 1, userSelect: 'none',
        }}>{initials}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0, zIndex: 100,
          background: '#0d1117', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '8px 0', minWidth: 160,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {menuItems.map((item, i) =>
            item.type === 'divider' ? (
              <div key={i} style={{
                height: 0.5, background: 'rgba(255,255,255,0.08)', margin: '4px 0',
              }} />
            ) : (
              <button
                key={i}
                onClick={item.onClick}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                  color: item.danger ? 'rgba(229,57,53,0.7)' : 'rgba(244,240,232,0.7)',
                  padding: '10px 16px', cursor: 'pointer',
                  background: 'none', border: 'none', transition: 'all 0.15s',
                  minHeight: 'auto', minWidth: 'auto',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = item.danger ? 'rgba(229,57,53,0.06)' : 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = item.danger ? '#e53935' : '#f4f0e8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = item.danger ? 'rgba(229,57,53,0.7)' : 'rgba(244,240,232,0.7)';
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}