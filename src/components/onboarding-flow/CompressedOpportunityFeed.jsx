const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const TEASER_JOBS = [
  { id: 2, label: 'Top-Tier FinTech Firm', location: 'New York, NY', remote: true, match: 'Parent Network match detected (VP of Engineering)', matchType: 'parent' },
  { id: 3, label: 'Locked Global Brand', location: 'Austin, TX', remote: false, match: '3 Alums work here (2 in Product Management)', matchType: 'alumni' },
  { id: 4, label: 'Premium Tech Startup', location: 'San Francisco, CA', remote: false, match: '1 Alum works here (Talent Acquisition Lead)', matchType: 'alumni' },
];

export default function CompressedOpportunityFeed({ onUnlock }) {
  return (
    <div style={{ marginTop: 12 }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 2px' }}>
        <span style={{ fontSize: 13 }}>🔥</span>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>
          Other Active Inside Tracks Found For You
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEASER_JOBS.map((job) => (
          <div
            key={job.id}
            style={{
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#e0e7ff'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(79,70,229,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
          >
            {/* Lock icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: '#F1F5F9', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🔒</div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontFamily: sat, fontSize: 12, fontWeight: 800, color: '#111827' }}>
                  [{job.label}]
                </span>
                <span style={{ fontFamily: dm, fontSize: 10, color: '#94A3B8' }}>
                  · {job.location}{job.remote ? ' (Remote Optional)' : ''}
                </span>
              </div>
              <p style={{ fontFamily: dm, fontSize: 11, color: job.matchType === 'parent' ? '#7c3aed' : '#2563eb', fontWeight: 600, margin: 0 }}>
                ✨ Ecosystem Match: {job.match}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={onUnlock}
              style={{
                fontFamily: dm, fontSize: 10, fontWeight: 800,
                color: '#4F46E5', background: '#EEF2FF',
                border: '1px solid #C7D2FE', borderRadius: 10,
                padding: '7px 12px', cursor: 'pointer', minHeight: 'auto',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#4F46E5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
            >
              Reveal Role →
            </button>
          </div>
        ))}
      </div>

      {/* Bottom nudge */}
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button
          onClick={onUnlock}
          style={{
            fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#2563eb',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 100, padding: '9px 20px',
            cursor: 'pointer', minHeight: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          🔒 Unlock All 14 Inside Tracks →
        </button>
      </div>
    </div>
  );
}