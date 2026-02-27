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
      bg: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 50%, #60A5FA 100%)', 
      text: '#1E40AF', 
      iconBg: '#93C5FD',
      border: '#60A5FA'
    }, // Active Family
    2: { 
      bg: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 50%, #A78BFA 100%)', 
      text: '#5B21B6', 
      iconBg: '#C4B5FD',
      border: '#A78BFA'
    }, // Engaged Family
    3: { 
      bg: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 50%, #F59E0B 100%)', 
      text: '#92400E', 
      iconBg: '#FCD34D',
      border: '#F59E0B'
    }, // Priority Family
    5: { 
      bg: 'linear-gradient(135deg, #FFEDD5 0%, #FB923C 50%, #F97316 100%)', 
      text: '#9A3412', 
      iconBg: '#FB923C',
      border: '#F97316'
    }  // Champion Family
  };
  
  const keys = Object.keys(levelStyles).map(Number).filter(k => k <= boostLevel);
  const style = levelStyles[boostLevel] || (keys.length > 0 ? levelStyles[Math.max(...keys)] : levelStyles[1]);
  const levelName = boostLevel >= 5 ? 'Champion Family' : boostLevel >= 3 ? 'Priority Family' : boostLevel >= 2 ? 'Engaged Family' : 'Active Family';
  
  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${className}`}
        style={{ 
          background: style.bg, 
          color: style.text,
          border: `1px solid ${style.border}`
        }}
        title={`Boosted by ${levelName} - ${timeRemaining}`}
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
          ⚡ {levelName} Boost
        </span>
        <span className="text-[10px] opacity-75" style={{ color: style.text }}>
          Pinned to Top • {timeRemaining}
        </span>
      </div>
    </div>
  );
}