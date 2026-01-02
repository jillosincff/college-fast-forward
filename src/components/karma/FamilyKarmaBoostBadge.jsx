import React from 'react';
import { Zap, Star } from 'lucide-react';

/**
 * Badge to display on boosted student requests/profiles
 * Shows "Boosted by Family Karma" with visual indicator
 */
export default function FamilyKarmaBoostBadge({ 
  boostLevel = 0, 
  boostExpiresAt = null,
  compact = false,
  className = ''
}) {
  // Check if boost is active
  const now = new Date();
  const expiresAt = boostExpiresAt ? new Date(boostExpiresAt) : null;
  const isActive = boostLevel > 0 && (!expiresAt || expiresAt > now);
  
  if (!isActive) return null;
  
  // Calculate time remaining
  let timeRemaining = '';
  if (expiresAt) {
    const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
    if (hoursLeft > 24) {
      timeRemaining = `${Math.floor(hoursLeft / 24)}d left`;
    } else if (hoursLeft > 0) {
      timeRemaining = `${hoursLeft}h left`;
    } else {
      timeRemaining = 'Expiring soon';
    }
  }
  
  // Badge colors based on boost level - using actual metal colors
  // Silver: #C0C0C0, Gold: #FFD700, Platinum: #E5E4E2
  const levelStyles = {
    1: { 
      bg: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)', 
      text: '#4A4A4A', 
      iconBg: '#C0C0C0',
      border: '#B0B0B0'
    }, // Silver
    2: { 
      bg: 'linear-gradient(135deg, #FFE066 0%, #FFD700 50%, #DAA520 100%)', 
      text: '#6B4D00', 
      iconBg: '#FFD700',
      border: '#DAA520'
    }, // Gold
    3: { 
      bg: 'linear-gradient(135deg, #F5F5F5 0%, #E5E4E2 50%, #D4D4D4 100%)', 
      text: '#4A4A4A', 
      iconBg: '#E5E4E2',
      border: '#C0C0C0'
    }  // Platinum
  };
  
  const style = levelStyles[boostLevel] || levelStyles[1];
  const levelName = boostLevel >= 3 ? 'Platinum' : boostLevel >= 2 ? 'Gold' : 'Silver';
  
  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${className}`}
        style={{ 
          background: style.bg, 
          color: style.text,
          border: `1px solid ${style.border}`
        }}
        title={`Boosted by Family Karma (${levelName}) - ${timeRemaining}`}
      >
        <Zap className="w-3 h-3" style={{ color: style.text }} />
        {levelName}
      </span>
    );
  }
  
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-md ${className}`}
      style={{ 
        background: style.bg,
        border: `2px solid ${style.border}`
      }}
    >
      <div 
        className="flex items-center justify-center w-6 h-6 rounded-full shadow-inner"
        style={{ background: style.iconBg }}
      >
        <Zap className="w-4 h-4" style={{ color: style.text }} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold" style={{ color: style.text }}>
          ⚡ {levelName} Family Boost
        </span>
        <span className="text-[10px] opacity-75" style={{ color: style.text }}>
          Pinned to Top • {timeRemaining}
        </span>
      </div>
    </div>
  );
}