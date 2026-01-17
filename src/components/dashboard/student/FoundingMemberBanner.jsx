import React from 'react';

export default function FoundingMemberBanner({ spotsLeft = 774 }) {
  if (spotsLeft <= 0 || spotsLeft > 800) return null;
  
  return (
    <div 
      className="text-white py-3 px-4"
      style={{ background: '#FA4616' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <span className="font-bold">You're a Founding Member!</span>
            <span className="text-white/90 ml-2">FREE FOREVER</span>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <span className="text-2xl font-bold text-yellow-300">{spotsLeft}</span>
          <span className="text-white/90 ml-2 text-sm">spots left</span>
        </div>
      </div>
    </div>
  );
}