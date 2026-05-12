import React, { useEffect } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function ImportToast({ notification, onView, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 999, animation: 'slideDown 0.3s ease',
      background: '#1A1A1A', color: '#fff', borderRadius: 12,
      padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 14,
      maxWidth: 420, width: 'calc(100vw - 32px)', fontFamily: dm,
    }}>
      {/* Green dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0,
        boxShadow: '0 0 0 3px rgba(16,185,129,0.25)',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#fff' }}>
          New update imported!
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {notification.company} {notification.jobTitle} → {notification.change}
        </p>
      </div>

      <button
        onClick={onView}
        style={{
          background: '#E85D20', color: '#fff', border: 'none', borderRadius: 7,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: dm, minHeight: 'auto', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        View Details
      </button>

      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: 18, cursor: 'pointer', padding: 0, minHeight: 'auto', lineHeight: 1, flexShrink: 0,
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}