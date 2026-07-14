const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Actionable, forward-looking stats — not historical metrics
export default function MissionStats({ items }) {
  const inProgress = items.filter(i => i.insight.group !== 'completed').length;
  const waiting = items.filter(i => i.insight.group === 'waiting').length;
  const attention = items.filter(i => i.insight.group === 'attention').length;
  const interviews = items.filter(i => i.insight.group === 'interviewing').length;

  // Never display empty zeros — only show metrics with real substance.
  // "Needs Attention: 0" stays (a good zero); the rest hide when zero.
  const stats = [
    { label: 'Applications In Progress', value: inProgress, color: '#6d28d9' },
    { label: 'Waiting on Employers', value: waiting, color: '#6b7280' },
    { label: 'Needs Attention', value: attention, color: attention > 0 ? '#dc2626' : '#059669', keepAtZero: true },
    { label: 'Interviews Coming Up', value: interviews, color: '#059669' },
  ].filter(s => s.value > 0 || s.keepAtZero);

  if (inProgress === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
            {s.label}
          </p>
          <p style={{ fontFamily: dm, fontSize: 26, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}