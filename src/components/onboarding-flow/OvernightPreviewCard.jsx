const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

// The strongest close we have: CLIFF doesn't hand you a to-do list, it hands you
// finished work. This previews the exact brief Pro students wake up to, built
// from THIS student's role/school so it reads as theirs, not a generic demo.
export default function OvernightPreviewCard({ firstName, targetRole, schoolName, onUpgrade }) {
  const role = targetRole || 'your target role';
  const school = schoolName || 'your school';

  const lines = [
    { t: `Tailored your resume for a ${role} opening posted today`, lock: false },
    { t: `Found a ${school} contact inside that company`, lock: true },
    { t: 'Wrote your intro message — ready to send', lock: true },
    { t: 'Checked your open applications for anything going cold', lock: true },
  ];

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
        What happens tonight while you sleep
      </p>

      <div style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #2e1065 100%)', border: '1.5px solid #4c1d95', borderRadius: 24, padding: '28px 24px', boxShadow: '0 12px 40px rgba(30,27,75,0.30)' }}>

        {/* Phone-style brief header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 15 }}>🌙</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Tomorrow · 6:00 AM
          </span>
        </div>

        <h3 style={{ fontFamily: sat, fontSize: 'clamp(19px, 3vw, 25px)', fontWeight: 900, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
          {firstName ? `${firstName}, here's what I did` : "Here's what I did"}<br />while you were asleep.
        </h3>

        {/* The finished-work list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {lines.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: l.lock ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${l.lock ? 'rgba(196,181,253,0.18)' : 'rgba(16,185,129,0.35)'}`,
              borderRadius: 12, padding: '13px 15px',
            }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{l.lock ? '🔒' : '✓'}</span>
              <p style={{
                fontFamily: dm, fontSize: 13.5, fontWeight: 600, margin: 0, lineHeight: 1.5,
                color: l.lock ? 'rgba(226,232,240,0.55)' : '#6ee7b7',
                filter: l.lock ? 'blur(0.4px)' : 'none',
              }}>{l.t}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: dm, fontSize: 13.5, color: 'rgba(226,232,240,0.85)', margin: '0 0 18px', lineHeight: 1.65 }}>
          Not a to-do list. Actual work, already finished, waiting when you open your phone.
          <strong style={{ color: '#fff' }}> Free gets you the matches. Pro gets you the package.</strong>
        </p>

        <button
          onClick={onUpgrade}
          style={{
            width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#2e1065',
            background: 'linear-gradient(135deg, #fff 0%, #ede9fe 100%)',
            border: 'none', borderRadius: 14, padding: '17px 24px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)', transition: 'transform 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Put CLiFF to work tonight →
        </button>
      </div>
    </div>
  );
}