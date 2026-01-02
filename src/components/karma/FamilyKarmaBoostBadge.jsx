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
  
  // Badge colors based on boost level
  const levelStyles = {
    1: { bg: 'bg-gradient-to-r from-gray-100 to-gray-200', text: 'text-gray-700', icon: 'text-gray-500' }, // Silver
    2: { bg: 'bg-gradient-to-r from-yellow-100 to-amber-200', text: 'text-amber-800', icon: 'text-amber-600' }, // Gold
    3: { bg: 'bg-gradient-to-r from-purple-100 to-indigo-200', text: 'text-purple-800', icon: 'text-purple-600' }  // Platinum
  };
  
  const style = levelStyles[boostLevel] || levelStyles[1];
  const levelName = boostLevel >= 3 ? 'Platinum' : boostLevel >= 2 ? 'Gold' : 'Silver';
  
  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} ${className}`}
        title={`Boosted by Family Karma (${levelName}) - ${timeRemaining}`}
      >
        <Zap className={`w-3 h-3 ${style.icon}`} />
        Boosted
      </span>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${style.bg} ${className}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-white/50`}>
        <Zap className={`w-4 h-4 ${style.icon}`} />
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-bold ${style.text}`}>
          ⚡ Boosted by Family Karma
        </span>
        <span className={`text-[10px] ${style.text} opacity-75`}>
          {levelName} • {timeRemaining}
        </span>
      </div>
    </div>
  );
}