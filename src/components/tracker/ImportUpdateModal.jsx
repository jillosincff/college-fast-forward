import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

export default function ImportUpdateModal({ notification, onViewDetails, onDismiss }) {
  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, padding: 28,
          maxWidth: 400, width: '100%', animation: 'fadeIn 0.25s ease',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, marginBottom: 16,
        }}>
          📬
        </div>

        <h2 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Application Update Detected
        </h2>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.5, fontFamily: dm }}>
          We found a new email for your <strong>{notification.company} {notification.jobTitle}</strong> application.
        </p>

        {/* Details imported */}
        <div style={{
          background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0',
          padding: 16, marginBottom: 20,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px', fontFamily: dm }}>
            Details Imported
          </p>
          {notification.details.map((detail, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < notification.details.length - 1 ? 6 : 0, alignItems: 'flex-start', fontFamily: dm }}>
              <span style={{ color: '#10B981', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: '#1A1A1A' }}>{detail}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            onClick={onViewDetails}
            style={{
              background: '#E85D20', color: '#fff', border: 'none', borderRadius: 10,
              padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: dm, minHeight: 'auto',
            }}
          >
            View Full Details
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: 'none', color: '#888', border: 'none', borderRadius: 10,
              padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}