import React, { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function CliFFOutreachModal({ isOpen, onClose, initialData, onGenerate }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    title: initialData?.title || '',
    company: initialData?.company || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 70000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          maxWidth: 480,
          width: '100%',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #f1f5f9',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              ⚡ CLiFF
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#7c3aed',
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: 100,
                padding: '3px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Outreach Hub
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              minHeight: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#64748b')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontFamily: dm,
              fontSize: 18,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Confirm Insider Outreach
          </h3>
          <p
            style={{
              fontFamily: dm,
              fontSize: 12,
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Let's review the targeting details for your draft.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              👤 Insider Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                fontFamily: dm,
                fontSize: 13,
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>

          {/* Title Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              💼 Position / Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                fontFamily: dm,
                fontSize: 13,
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>

          {/* Company Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontFamily: dm,
                fontSize: 9,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              🏢 Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              style={{
                fontFamily: dm,
                fontSize: 13,
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.background = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              fontFamily: dm,
              fontSize: 12,
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              borderRadius: 14,
              padding: '14px 20px',
              cursor: 'pointer',
              marginTop: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              transition: 'all 0.2s',
              minHeight: 'auto',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #6d28d9)';
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)';
            }}
          >
            ⚡ Generate Un-Cringe Message
          </button>
        </form>
      </div>
    </div>
  );
}