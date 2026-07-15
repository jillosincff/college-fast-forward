const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Numbered stepping-stone list — the last step (the goal) gets the highlight.
export default function PathSteps({ title, steps }) {
  if (!steps?.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, i) => {
          const isGoal = i === steps.length - 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, fontSize: 11, fontWeight: 800, background: isGoal ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#f5f3ff', color: isGoal ? '#fff' : '#6d28d9' }}>
                {i + 1}
              </div>
              <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: isGoal ? 900 : 700, color: isGoal ? '#6d28d9' : '#374151', margin: 0 }}>
                {step}{isGoal ? ' 🎯' : ''}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}