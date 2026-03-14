import React from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const LEVELS = [
  { name: 'Contributor', min: 0, max: 49 },
  { name: 'Connector', min: 50, max: 149 },
  { name: 'Advocate', min: 150, max: 299 },
  { name: 'Champion', min: 300, max: Infinity },
];

function getLevel(pts) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].min) return { current: LEVELS[i], next: LEVELS[i + 1] || null, index: i };
  }
  return { current: LEVELS[0], next: LEVELS[1], index: 0 };
}

export default function KarmaStrip({ user }) {
  const pts = user?.student_karma || 0;
  const { current, next } = getLevel(pts);
  const target = next ? next.min : current.max;
  const pct = next ? Math.min(100, (pts / target) * 100) : 100;

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>Your Gator Karma</span>
        <button onClick={() => {}} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
          minHeight: 'auto', width: 'auto', padding: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          How to earn →
        </button>
      </div>

      <div className="karma-strip" style={{
        background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <style>{`
          @media(max-width:768px) {
            .karma-strip { flex-direction: column !important; align-items: flex-start !important; }
          }
        `}</style>
        {/* Left — number */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#E85D20', lineHeight: 1 }}>
            {pts}
          </div>
          <div style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#aaa',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            points
          </div>
          <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#1a1a1a', marginTop: 2 }}>
            {current.name}
          </div>
        </div>

        {/* Right — progress */}
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>
              {pts} pts
            </span>
            {next && (
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>
                {next.name} · {target} pts
              </span>
            )}
          </div>
          {/* Track */}
          <div style={{
            height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: '#E85D20', borderRadius: 2,
              width: `${pct}%`, transition: 'width 0.6s ease',
            }} />
          </div>
          {/* Hint */}
          {next && (
            <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginTop: 6 }}>
              <span style={{ color: '#E85D20', fontWeight: 500 }}>Invite a parent</span> to earn +50 pts and jump to {next.name}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}