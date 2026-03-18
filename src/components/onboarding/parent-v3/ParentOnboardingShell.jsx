import React, { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

export { dmSans, playfair, ORANGE };

export function OnboardingShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes poFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .po3-field:focus { border-color: rgba(232,93,32,0.5) !important; outline: none; box-shadow: 0 0 0 2px rgba(232,93,32,0.1); }
        .po3-field::placeholder { color: rgba(244,240,232,0.25); }
        .po3-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(244,240,232,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
      `}</style>
      <div style={{
        maxWidth: 520, width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '40px 36px',
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
          background: i === current ? ORANGE : 'rgba(255,255,255,0.15)',
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
      color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em',
      marginBottom: 8,
    }}>
      {children}
      {required && <span style={{ color: ORANGE, marginLeft: 3 }}>*</span>}
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
        width: '100%', background: 'rgba(255,255,255,0.06)',
        border: `0.5px solid ${error ? 'rgba(229,57,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, padding: '12px 16px',
        fontFamily: dmSans, fontSize: 14, fontWeight: 300,
        color: '#f4f0e8', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
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
        width: '100%', background: 'rgba(255,255,255,0.06)',
        border: `0.5px solid ${error ? 'rgba(229,57,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, padding: '12px 16px', paddingRight: 36,
        fontFamily: dmSans, fontSize: 14, fontWeight: 300,
        color: value ? '#f4f0e8' : 'rgba(244,240,232,0.25)',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
    >
      <option value="" style={{ color: '#888', background: '#1a1a2e' }}>{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt} style={{ color: '#f4f0e8', background: '#1a1a2e' }}>{opt}</option>
      ))}
    </select>
  );
}

export function HelperText({ children, error }) {
  return (
    <p style={{
      fontFamily: dmSans, fontSize: 11, fontWeight: 300,
      color: error ? 'rgba(229,57,53,0.7)' : 'rgba(244,240,232,0.3)',
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
        width: '100%', padding: 14, borderRadius: 100, border: 'none',
        background: disabled ? 'rgba(232,93,32,0.4)' : (hovered ? '#d44e14' : ORANGE),
        color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', minHeight: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.6 : 1,
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
        fontFamily: dmSans, fontSize: 12, fontWeight: 300,
        color: hovered ? 'rgba(244,240,232,0.5)' : 'rgba(244,240,232,0.3)',
        cursor: 'pointer', transition: 'color 0.2s', minHeight: 'auto',
      }}
    >
      ← Back
    </button>
  );
}