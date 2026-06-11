const dm = "'DM Sans', system-ui, sans-serif";

/**
 * Post-expiry paywall header — replaces the new-user pitch for students
 * whose premium trial has ended. Acknowledges the expiry, names what
 * stopped working, and gives one clear reactivation CTA.
 */
export default function TrialEndedHeader({ firstName, theme, onReactivate }) {
  const paused = [
    { icon: '🤝', label: 'Warm alumni matching' },
    { icon: '✉️', label: 'AI outreach scripts' },
    { icon: '📡', label: 'Daily job signals' },
    { icon: '💬', label: 'CliFF career agent' },
  ];

  return (
    <div className="hero-header-card" style={{
      background: 'linear-gradient(135deg, #1a1108, #2d1a05)',
      border: '1px solid rgba(232,93,32,0.35)',
      borderRadius: 20,
      padding: '24px 28px',
      marginBottom: 20,
      boxShadow: '0 4px 24px rgba(232,93,32,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 100, padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ⏸ Trial Ended — Agent Paused
        </span>
      </div>

      <h2 className="hero-title" style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
        {firstName}, your premium trial has ended — but your progress is saved.
      </h2>
      <p className="hero-subtitle" style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 16px', lineHeight: 1.65, fontWeight: 500 }}>
        Your pipeline, drafts, and alumni matches are all still here. CliFF just stopped working in the background. Reactivate to pick up exactly where you left off.
      </p>

      {/* What's paused */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {paused.map((p) => (
          <span key={p.label} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 12px' }}>
            {p.icon} {p.label} <span style={{ color: '#fbbf24' }}>· paused</span>
          </span>
        ))}
      </div>

      <button
        className="hero-cta-btn"
        onClick={onReactivate}
        style={{
          fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff',
          background: '#E85D20', border: 'none', borderRadius: 12,
          padding: '12px 24px', cursor: 'pointer', minHeight: 'auto',
          boxShadow: '0 4px 14px rgba(232,93,32,0.4)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#d44e14'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#E85D20'; }}
      >
        ⚡ Reactivate Premium — $4.99/wk
      </button>
      <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '10px 0 0' }}>
        Billed monthly at $19.96/mo · Cancel anytime
      </p>
    </div>
  );
}