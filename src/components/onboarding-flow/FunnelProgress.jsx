// Shared 3-node progress anchor used across Resume Wow → LinkedIn Identity → Your Plan
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const GREEN = '#10B981';
const GREEN_BORDER = '#BBF7D0';
const BLUE = '#0066FF';

const STEPS = ['Resume Wow', 'LinkedIn Identity', 'Your Plan'];

/**
 * activeStep: 0 = Resume Wow, 1 = LinkedIn Identity, 2 = Your Plan
 */
export default function FunnelProgress({ activeStep = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      {STEPS.map((label, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const pending = i > activeStep;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? GREEN : active ? BLUE : '#E2E8F0',
                border: `2px solid ${done ? GREEN : active ? BLUE : '#CBD5E1'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: pending ? '#94A3B8' : '#fff',
                fontFamily: FONT,
                boxShadow: active ? `0 0 0 4px rgba(0,102,255,0.15)` : 'none',
                transition: 'all 0.4s ease',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontFamily: FONT, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                color: done ? GREEN : active ? BLUE : '#94A3B8',
                transition: 'color 0.4s',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 40, height: 2,
                background: done ? GREEN_BORDER : '#E2E8F0',
                borderRadius: 2, marginBottom: 18,
                transition: 'background 0.4s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}