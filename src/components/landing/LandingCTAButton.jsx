import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const ARROW = (
  <svg className="lcta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 0.15s ease' }}>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PrimaryCTA({ text, onClick, fullWidth }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#d44e14';
        e.currentTarget.style.transform = 'translateY(-1px)';
        const arrow = e.currentTarget.querySelector('.lcta-arrow');
        if (arrow) arrow.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#E85D20';
        e.currentTarget.style.transform = 'translateY(0)';
        const arrow = e.currentTarget.querySelector('.lcta-arrow');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 16,
        fontWeight: 500,
        color: '#fff',
        background: '#E85D20',
        border: 'none',
        borderRadius: 100,
        padding: '16px 40px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        minHeight: 'auto',
        minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {text}
      {ARROW}
    </button>
  );
}

export function SecondaryCTA({ text, onClick, fullWidth }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        const arrow = e.currentTarget.querySelector('.lcta-arrow');
        if (arrow) arrow.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        const arrow = e.currentTarget.querySelector('.lcta-arrow');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 16,
        fontWeight: 500,
        color: '#f4f0e8',
        background: 'rgba(255,255,255,0.08)',
        border: '0.5px solid rgba(255,255,255,0.15)',
        borderRadius: 100,
        padding: '16px 40px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        minHeight: 'auto',
        minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {text}
      {ARROW}
    </button>
  );
}