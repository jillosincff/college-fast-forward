import { useEffect, useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const SIZE = 140;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TARGET = 1;

export default function ATSScoreRing() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * TARGET);
      if (t < 1) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const offset = CIRCUMFERENCE * (1 - progress);
  const gradientId = 'ats-gradient';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* SVG Ring */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'none' }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 36, fontWeight: 900,
            color: '#10B981', letterSpacing: '-0.03em', lineHeight: 1,
            opacity: progress > 0.9 ? 1 : 0, transition: 'opacity 0.3s ease',
          }}>
            ✓
          </span>
          <span style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 700,
            color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            ATS-READY
          </span>
        </div>
      </div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#D1FAE5', borderRadius: 100,
        padding: '4px 12px',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: '#065F46' }}>
          ✨ Recruiter-Ready Formatting
        </span>
      </div>

      {/* Sub-text */}
      <p style={{
        fontFamily: FONT, fontSize: 11, color: '#9CA3AF',
        margin: 0, textAlign: 'center', lineHeight: 1.5, maxWidth: 160,
      }}>
        Structured so automated screening systems can parse every section of your resume.
      </p>
    </div>
  );
}