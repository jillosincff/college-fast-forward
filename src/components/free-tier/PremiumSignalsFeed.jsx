const dm = "'DM Sans', system-ui, sans-serif";

const LIVE_SIGNALS = [
  { emoji: '🔥', count: 3, label: 'Unadvertised roles discovered', company: 'Salesforce', detail: 'matching your Alumni network', time: 'This morning', badge: 'NEW' },
  { emoji: '👀', count: 1, label: 'Hiring Manager viewed your optimized profile map', company: 'Deloitte', detail: 'Senior Recruiter, Campus Programs', time: '2 hours ago', badge: 'HOT' },
  { emoji: '🎯', count: 5, label: 'New backdoor leads crawled', company: 'Amazon', detail: 'from alumni-connected companies', time: 'Today', badge: null },
  { emoji: '📡', count: 2, label: 'Hiring signals detected', company: 'JPMorgan Chase', detail: 'Engineering team headcount expanding', time: '4 hours ago', badge: null },
];

export default function PremiumSignalsFeed({ college, theme }) {
  const t = theme || { primary: '#2563eb', secondary: '#1d4ed8', bgTint: '#eff6ff' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)`, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Live Career Signals Feed</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Your agent is actively crawling. All results unlocked.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#22c55e' }}>LIVE</span>
        </div>
      </div>

      {/* Unlocked signals */}
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LIVE_SIGNALS.map((sig, i) => (
          <div
            key={i}
            style={{
              background: i === 0 ? '#f0fdf4' : '#f9fafb',
              border: `1px solid ${i === 0 ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 14,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Company logo placeholder */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `linear-gradient(135deg, ${t.primary}22, ${t.primary}44)`,
                border: `1px solid ${t.primary}33`,
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {sig.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: i === 0 ? '#16a34a' : '#111827' }}>{sig.count}</span>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{sig.label}</p>
                  {sig.badge && (
                    <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#fff', background: i === 0 ? '#16a34a' : '#ef4444', borderRadius: 100, padding: '2px 8px' }}>{sig.badge}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: t.primary, background: `${t.primary}15`, borderRadius: 6, padding: '2px 8px' }}>{sig.company}</span>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>{sig.detail}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', margin: '0 0 6px' }}>{sig.time}</p>
                <button style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: t.primary, background: `${t.primary}15`, border: `1px solid ${t.primary}33`, borderRadius: 8, padding: '3px 10px', cursor: 'pointer', minHeight: 'auto' }}>
                  Reveal →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 22px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>✅ All signals unlocked — Premium Active</p>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#16a34a' }}>View All Leads →</span>
      </div>
    </div>
  );
}