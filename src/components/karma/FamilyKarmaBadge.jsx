import React from 'react';

const TIER_CONFIG = {
  none: null,
  active: { icon: '⭐', label: 'Active Family', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  engaged: { icon: '⭐⭐', label: 'Engaged Family', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  priority: { icon: '🌟', label: 'Priority Family', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  champion: { icon: '🏆', label: 'Champion Family', bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50', textColor: 'text-orange-700' }
};

export default function FamilyKarmaBadge({ karma, tier, showPoints = false, size = 'default' }) {
  // Determine tier from karma if not provided
  let effectiveTier = tier;
  if (!effectiveTier && karma !== undefined) {
    if (karma >= 1000) effectiveTier = 'champion';
    else if (karma >= 500) effectiveTier = 'priority';
    else if (karma >= 300) effectiveTier = 'engaged';
    else if (karma >= 100) effectiveTier = 'active';
    else effectiveTier = 'none';
  }
  
  const config = TIER_CONFIG[effectiveTier];
  
  // Don't show badge for 'none' tier
  if (!config) return null;
  
  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-0.5 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} rounded-full font-medium ${config.bgColor} ${config.textColor}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showPoints && karma !== undefined && (
        <span className="text-gray-400">· {karma}</span>
      )}
    </span>
  );
}