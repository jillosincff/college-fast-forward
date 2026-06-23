import React from 'react';

export default function ExitConfirmModal({ onSaveQuit, onDiscardQuit, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18, padding: '32px 28px',
          maxWidth: 420, width: '100%', textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif", boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>✋</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Leave the assessment?
        </h2>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 28px', lineHeight: 1.6 }}>
          You haven't finished yet. Save your progress so you can pick up right where you left off, or discard it and start fresh next time.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onSaveQuit}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%' }}
          >
            Save progress & quit
          </button>
          <button
            onClick={onDiscardQuit}
            style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 500, color: '#EF4444', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%' }}
          >
            Discard & quit
          </button>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#AAAAAA', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '8px', minHeight: 'auto' }}
          >
            Keep going
          </button>
        </div>
      </div>
    </div>
  );
}