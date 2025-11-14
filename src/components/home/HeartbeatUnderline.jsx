
export default function HeartbeatUnderline() {
  return (
    <svg viewBox="0 0 720 24" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="pulse" x1="0" x2="1">
          <stop offset="0%" stopColor="#0033A0"/>
          <stop offset="50%" stopColor="#11A63A"/>
          <stop offset="100%" stopColor="#FA4616"/>
        </linearGradient>
      </defs>
      {/* base line */}
      <path d="M4 12 H120 L150 4 L180 20 L210 12 H330 L360 6 L390 18 L420 12 H716"
            fill="none" stroke="url(#pulse)" strokeWidth="4" strokeLinecap="round"
            className="opacity-90" />
      {/* moving pulse (dash offset anim) */}
      <path d="M4 12 H120 L150 4 L180 20 L210 12 H330 L360 6 L390 18 L420 12 H716"
            fill="none" stroke="url(#pulse)" strokeWidth="4" strokeLinecap="round"
            style={{ strokeDasharray: "24 180", animation: "dash 2.4s ease-in-out infinite" }} />
      {/* three connected dots at the right */}
      <g className="dots">
        <circle cx="660" cy="12" r="4" fill="#0033A0" />
        <circle cx="688" cy="12" r="4" fill="#11A63A" />
        <circle cx="716" cy="12" r="4" fill="#FA4616" />
      </g>
      <style jsx>{`
        @keyframes dash { 0% { stroke-dashoffset: 220; } 100% { stroke-dashoffset: -220; } }
        @media (prefers-reduced-motion: reduce) {
          .dots { opacity: 1; }
          path[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}