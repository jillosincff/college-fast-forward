import React, { useState, useEffect } from 'react';

export default function ProgressRing({ value, max, color, size = 68, strokeWidth = 6 }) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={animated ? offset : circumference}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1.5s ease-out',
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
}