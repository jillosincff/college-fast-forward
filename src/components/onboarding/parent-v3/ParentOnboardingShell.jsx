import React, { useState } from 'react';

// ── Brand tokens — purple/Satoshi system (matches ParentLandingPage / ParentAllSet) ──
const dmSans = "'Satoshi', 'Inter', system-ui, sans-serif";
const playfair = "'Satoshi', 'Inter', system-ui, sans-serif";
const ORANGE = '#6d28d9'; // kept name for backward-compat; now the brand indigo

const INDIGO = '#6d28d9';
const INDIGO_HOVER = '#5b21b6';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

export { dmSans, playfair, ORANGE };

export function OnboardingShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes poFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .po3-field:focus { border-color: ${INDIGO} !important; outline: none; background: #fff !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.1); }
        .po3-field::placeholder { color: #94a3b8; }
        .po3-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
      `}</style>
      <div style={{
        maxWidth: 520, width: '100%',
        background: '#ffffff',
        border: '1px solid rgba(109,40,217,0.18)',
        borderRadius: 24, padding: '40px 36px',
        boxShadow: '0 24px 48px rgba(109,40,217,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        animation: 'poFadeUp 0.5s ease both',
      }}>
        {children}
      </div>
    </div>
  );
}

export function ProgressDots({ current, total }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i === current ? INDIGO : 'rgba(15,23,42,0.12)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block', fontFamily: dmSans, fontSize: 12, fontWeight: 600,
      color: TEXT2, letterSpacing: '0.03em',
      marginBottom: 8,
    }}>
      {children}
      {required && <span style={{ color: INDIGO, marginLeft: 3 }}>*</span>}
    </label>
  );
}

export function FieldInput({ value, onChange, placeholder, type = 'text', error, ...rest }) {
  return (
    <input
      className="po3-field"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', background: '#F8FAFC',
        border: `1.5px solid ${error ? 'rgba(244,63,94,0.6)' : '#E2E8F0'}`,
        borderRadius: 12, padding: '14px 16px',
        fontFamily: dmSans, fontSize: 15, fontWeight: 400,
        color: TEXT, boxSizing: 'border-box',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      {...rest}
    />
  );
}

export function FieldSelect({ value, onChange, placeholder, options, error }) {
  return (
    <select
      className="po3-field po3-select"
      value={value}
      onChange={onChange}
      style={{
        width: '100%', background: '#F8FAFC',
        border: `1.5px solid ${error ? 'rgba(244,63,94,0.6)' : '#E2E8F0'}`,
        borderRadius: 12, padding: '14px 16px', paddingRight: 36,
        fontFamily: dmSans, fontSize: 15, fontWeight: 400,
        color: value ? TEXT : '#94a3b8',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
    >
      <option value="" style={{ color: '#94a3b8', background: '#fff' }}>{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt} style={{ color: TEXT, background: '#fff' }}>{opt}</option>
      ))}
    </select>
  );
}

export function HelperText({ children, error }) {
  return (
    <p style={{
      fontFamily: dmSans, fontSize: 12, fontWeight: 400,
      color: error ? '#e11d48' : TEXT3,
      marginTop: 6, lineHeight: 1.5,
    }}>
      {children}
    </p>
  );
}

export function PrimaryButton({ children, onClick, disabled, loading }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: 16, borderRadius: 14, border: 'none',
        background: disabled ? '#94A3B8' : GRAD,
        color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', minHeight: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: disabled ? 'none' : '0 8px 28px rgba(109,40,217,0.30)',
        transform: hovered && !disabled ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  );
}

export function BackLink({ onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block', width: '100%', marginTop: 24, textAlign: 'center',
        background: 'none', border: 'none',
        fontFamily: dmSans, fontSize: 13, fontWeight: 500,
        color: hovered ? TEXT2 : TEXT3,
        cursor: 'pointer', transition: 'color 0.2s', minHeight: 'auto',
      }}
    >
      ← Back
    </button>
  );
}