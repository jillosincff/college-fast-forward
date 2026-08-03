const dm = "'DM Sans', system-ui, sans-serif";

/**
 * The "keep your agent" moment — CLIFF is already mid-task when the plan
 * screen loads. Pro is framed as not interrupting work in progress,
 * not as unlocking features. The first overnight run is genuinely free,
 * so the framing stays honest.
 */
export default function QueuedWorkBanner({ targetRole, schoolName }) {
  const role = targetRole || 'your target role';
  const school = schoolName || 'your school';
  return (
    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 18, padding: '20px 22px', marginBottom: 28, boxShadow: '0 10px 30px rgba(15,23,42,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 0 4px rgba(245,158,11,0.18)', flexShrink: 0 }} />
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Work in progress — tonight, 4:30 AM
        </span>
      </div>
      <p style={{ fontFamily: dm, fontSize: 14.5, fontWeight: 700, color: '#F1F5F9', margin: '0 0 6px', lineHeight: 1.5 }}>
        I've already queued your first overnight run.
      </p>
      <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(203,213,225,0.85)', margin: 0, lineHeight: 1.65 }}>
        On the list: tailoring your resume to a live <strong style={{ color: '#93C5FD' }}>{role}</strong> opening
        and searching for a <strong style={{ color: '#93C5FD' }}>{school}</strong> insider at that company.
        Your first run is on me — <strong style={{ color: '#34D399' }}>going Pro keeps me working every night</strong> instead of stopping after one.
      </p>
    </div>
  );
}