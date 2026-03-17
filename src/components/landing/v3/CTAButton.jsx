import React from 'react';
import { dmSans } from './LandingConstants';

export default function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isTeal = variant === 'teal';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isPrimary = !isTeal && !isOutline && !isGhost;

  const accentColor = isTeal ? '#06B6D4' : '#E85D20';
  const accentDark = isTeal ? '#0891B2' : '#d44e14';
  const accentLight = isTeal ? '#22D3EE' : '#FF6B2B';
  const glowColor = isTeal ? 'rgba(6,182,212,0.3)' : 'rgba(232,93,32,0.3)';

  const bg = isOutline || isGhost ? 'transparent' : `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`;
  const bgHover = isOutline || isGhost ? 'rgba(232,93,32,0.1)' : `linear-gradient(135deg, ${accentLight} 0%, ${accentColor} 100%)`;
  const border = isOutline ? `2px solid ${accentColor}` : isGhost ? '2px solid rgba(255,255,255,0.2)' : 'none';

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bgHover;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 6px 32px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bg;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = isPrimary || isTeal ? `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 15, fontWeight: 600, color: '#fff',
        background: bg, border, borderRadius: 100,
        padding: '16px 34px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: isPrimary || isTeal ? `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
        lineHeight: 1.35, textAlign: 'center',
        backdropFilter: isOutline || isGhost ? 'blur(12px)' : 'none',
      }}
    >
      {text}
    </button>
  );
}