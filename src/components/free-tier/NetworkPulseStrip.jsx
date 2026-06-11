import useAlumniTeaser from '@/hooks/useAlumniTeaser';

const dm = "'DM Sans', system-ui, sans-serif";

// Outcome-framed real network stats — only renders stats that are genuinely > 0.
export default function NetworkPulseStrip({ user, theme }) {
  const data = useAlumniTeaser();
  if (!data || !data.network_total) return null;

  const schoolName = (() => {
    try { return localStorage.getItem('cff_college') || user?.school || 'your school'; } catch { return 'your school'; }
  })();
  const primary = theme?.primary || '#4F46E5';

  const stats = [
    {
      icon: '🎓',
      value: data.network_capped ? `${data.network_total}+` : data.network_total,
      label: `${schoolName} alumni mapped`,
    },
    data.companies_mapped > 1 && {
      icon: '🏢',
      value: data.companies_mapped,
      label: 'companies with warm paths',
    },
    data.total_at_targets > 0 && {
      icon: '🎯',
      value: data.total_at_targets,
      label: `at your target compan${data.total_at_targets === 1 ? 'y' : 'ies'}`,
    },
    data.verified_total > 0 && {
      icon: '✓',
      value: data.verified_total,
      label: 'verified by students',
    },
  ].filter(Boolean);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      padding: '10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>
        ⚡ Network Pulse
      </span>
      {stats.map((s, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: dm, fontSize: 11.5, color: '#4b5563', fontWeight: 600, background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 100, padding: '4px 11px' }}>
        <span style={{ fontSize: 12 }}>{s.icon}</span>
          <strong style={{ color: '#111827', fontWeight: 800 }}>{s.value}</strong> {s.label}
        </span>
      ))}
    </div>
  );
}