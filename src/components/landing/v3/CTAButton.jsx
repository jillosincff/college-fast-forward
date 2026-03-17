import React from 'react';
import { dmSans } from './LandingConstants';

export default function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isPrimary = !isOutline && !isGhost;

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        if (isPrimary) e.currentTarget.style.filter = 'brightness(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        if (isPrimary) e.currentTarget.style.filter = 'brightness(1)';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 15, fontWeight: 600, color: '#fff',
        background: isPrimary ? 'var(--accent-primary, #D4A843)' : 'transparent',
        border: isOutline ? '1.5px solid var(--accent-primary, #D4A843)' : isGhost ? '1px solid rgba(255,255,255,0.15)' : 'none',
        borderRadius: 100,
        padding: '16px 34px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.3s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: isPrimary ? '0 4px 24px var(--accent-glow, rgba(212,168,67,0.25)), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
        lineHeight: 1.35, textAlign: 'center',
        backdropFilter: isOutline || isGhost ? 'blur(12px)' : 'none',
        filter: 'brightness(1)',
      }}
    >
      {text}
    </button>
  );
}