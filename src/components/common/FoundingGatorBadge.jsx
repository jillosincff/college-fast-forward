import React from 'react';
import { Crown } from 'lucide-react';

export default function FoundingGatorBadge({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizes[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FA4616 0%, #0021A5 100%)',
        color: '#FFD700',
        boxShadow: '0 2px 8px rgba(250, 70, 22, 0.3)'
      }}
    >
      <Crown className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
      <span style={{ color: 'white' }}>Founding Gator Family</span>
    </div>
  );
}