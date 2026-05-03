import { dmSans, ORANGE, BORDER, MUTED, SAFE_TOP } from './theme';

/**
 * Sticky progress strip that lives at the very top of every onboarding screen.
 * Shows three act segments (problem / aha / commit) and the user's position
 * inside the current act.
 */
export default function ProgressHeader({ act, screenInAct, totalInAct, onBack }) {
  const segments = [
    { label: 'The problem', actNum: 1 },
    { label: 'Your aha moment', actNum: 2 },
    { label: 'Your plan', actNum: 3 },
  ];

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${BORDER}`,
      paddingTop: SAFE_TOP,
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Back"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: MUTED, fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                padding: 0, minHeight: 'auto',
              }}
            >
              ← Back
            </button>
          ) : <span />}
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.14em', color: ORANGE,
          }}>
            Act {act} · {segments[act - 1]?.label}
          </span>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>
            {screenInAct} / {totalInAct}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {segments.map((seg) => {
            const filled = seg.actNum < act ? 1 : seg.actNum > act ? 0 : Math.max(0, screenInAct / totalInAct);
            return (
              <div key={seg.actNum} style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, filled * 100)}%`,
                  height: '100%', background: ORANGE,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
