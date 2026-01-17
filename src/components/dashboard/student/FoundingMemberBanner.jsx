import React from 'react';

const UF_ORANGE = '#FA4616';

export default function FoundingMemberBanner({ spotsLeft = 774 }) {
  if (spotsLeft <= 0 || spotsLeft > 1000) return null;
  
  return (
    <div 
      className="text-white text-sm font-semibold px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2"
      style={{ backgroundColor: UF_ORANGE }}
    >
      <div className="flex items-center gap-2">
        <span>🎉</span>
        <span>You're a Founding Member!</span>
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">FREE FOREVER</span>
      </div>
      <span className="text-white/80">{spotsLeft} founding spots remaining</span>
    </div>
  );
}