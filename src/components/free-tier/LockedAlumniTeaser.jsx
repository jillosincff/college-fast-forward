import useAlumniTeaser from '@/hooks/useAlumniTeaser';

const dm = "'DM Sans', system-ui, sans-serif";

// "1 warm connection found" — shows ONE real alumni match with the name locked.
// Renders nothing if no real match exists (no fabricated data, ever).
export default function LockedAlumniTeaser({ user, theme, onUnlock }) {
  const match = useAlumniTeaser();

  if (!match?.found) return null;

  const schoolName = (() => {
    try { return localStorage.getItem('cff_college') || user?.school || 'your school'; } catch { return 'your school'; }
  })();
  const primary = theme?.primary || '#4F46E5';
  const headline = match.is_target_company
    ? `Warm connection found at ${match.company} — your target company`
    : `Warm connection found at ${match.company}`;

  return (
    <div
      onClick={onUnlock}
      style={{
        background: '#fff', border: `1.5px solid ${primary}55`, borderRadius: 20,
        overflow: 'hidden', boxShadow: `0 4px 16px ${primary}18`, cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${primary}30`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${primary}18`; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${theme?.bgTint || '#EEF2FF'}, rgba(255,255,255,0.85))`, padding: '14px 20px', borderBottom: `1px solid ${primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🤝</span>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {headline}
          </p>
        </div>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ● LIVE
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {/* Avatar with lock */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, ${theme?.secondary || primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: dm, fontSize: 17, fontWeight: 800, filter: 'blur(0px)' }}>
            {match.blurred_name?.[0] || '?'}
          </div>
          <span style={{ position: 'absolute', bottom: -3, right: -3, background: '#111827', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, border: '2px solid #fff' }}>🔒</span>
        </div>

        {/* Details */}
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
            <span style={{ background: '#e5e7eb', borderRadius: 4, padding: '0 8px', filter: 'blur(4px)', userSelect: 'none' }}>{match.blurred_name}</span>
            <span style={{ fontWeight: 600, color: '#6b7280' }}> · {schoolName} alum</span>
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', margin: 0, fontWeight: 600 }}>
            {match.role_title} at {match.company}
            {match.verified && <span style={{ color: '#16a34a' }}> · Verified ✓</span>}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onUnlock(); }}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${primary}, ${theme?.secondary || primary})`, border: 'none', borderRadius: 10, padding: '11px 18px', cursor: 'pointer', minHeight: 'auto', boxShadow: `0 3px 10px ${primary}44`, whiteSpace: 'nowrap', flex: '0 1 auto' }}
        >
          🔓 Unlock to see who →
        </button>
      </div>

      {/* Footer hook */}
      <div style={{ padding: '10px 20px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0, fontWeight: 600 }}>
          {match.total_at_targets > 1
            ? `${match.total_at_targets} alumni found at your target companies. Premium reveals names, LinkedIn profiles, and writes your outreach.`
            : 'Premium reveals their name, LinkedIn profile, and writes your outreach message for you.'}
        </p>
      </div>
    </div>
  );
}