const dm = "'DM Sans', system-ui, sans-serif";

const RISK_CONFIG = {
  LOW: {
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    badgeText: '#15803d',
    dot: '#22c55e',
    label: (days) => `⏱️ FRESH — ${days !== null ? `${days}D LIVE` : 'JUST POSTED'}`,
    actionLabel: 'Apply Now (High Visibility)',
    actionBg: '#2563eb',
    actionColor: '#fff',
    disabled: false,
    cliffTip: (company) =>
      `This listing just dropped${company ? ` at ${company}` : ''}. Your resume has a high chance of landing at the top of the pile — apply and let's prep your tailored pitch.`,
  },
  MEDIUM: {
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    badgeText: '#b45309',
    dot: '#f59e0b',
    label: (days) => `⚠️ SATURATING — ${days}D LIVE`,
    actionLabel: 'Apply + Find Backdoor',
    actionBg: '#d97706',
    actionColor: '#fff',
    disabled: false,
    cliffTip: (company) =>
      `This listing is filling up${company ? ` at ${company}` : ''}. Applying is still worth it, but pairing it with a warm network message dramatically improves your odds.`,
  },
  HIGH: {
    badgeBg: '#fff1f2',
    badgeBorder: '#fecdd3',
    badgeText: '#be123c',
    dot: '#f43f5e',
    label: (days) => `🛑 GHOST RISK HIGH — ${days}D LIVE`,
    actionLabel: 'Cold Application Blocked',
    actionBg: '#e5e7eb',
    actionColor: '#9ca3af',
    disabled: true,
    cliffTip: (company) =>
      `This listing has been live over a week${company ? ` at ${company}` : ''}. Cold applications are likely hitting a black hole. Use the network backdoor instead — it's your only real shot.`,
  },
};

export default function PublicJobSignalCard({ job, user, onBackdoorClick, schoolAbbr }) {
  const risk = job.riskLevel || 'LOW';
  const cfg = RISK_CONFIG[risk];
  const school = schoolAbbr || user?.school_abbreviation || user?.school_code || 'Your School';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: dm, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: '#6b7280',
              background: '#f3f4f6', borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
            }}>
              {job.source || 'Public'}
            </span>
            {/* Live dot */}
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
          </div>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px', lineHeight: 1.3 }}>
            {job.title}
          </p>
          {job.companyName && (
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
              {job.companyName}
            </p>
          )}
        </div>

        {/* Ghost Risk Badge */}
        <span style={{
          fontFamily: dm, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
          background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, color: cfg.badgeText,
          borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap', flexShrink: 0,
          textTransform: 'uppercase',
        }}>
          {cfg.label(job.daysLive)}
        </span>
      </div>

      {/* CliFF tip */}
      <div style={{
        background: risk === 'HIGH' ? '#fff1f2' : risk === 'MEDIUM' ? '#fffbeb' : '#f0f9ff',
        border: `1px solid ${risk === 'HIGH' ? '#fecdd3' : risk === 'MEDIUM' ? '#fde68a' : '#bae6fd'}`,
        borderRadius: 8, padding: '8px 12px',
      }}>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: risk === 'HIGH' ? '#be123c' : risk === 'MEDIUM' ? '#b45309' : '#0369a1' }}>
            ⚡ CliFF:{' '}
          </span>
          {cfg.cliffTip(job.companyName)}
        </p>
      </div>

      {/* Network affinity layer */}
      <div style={{
        background: 'rgba(255,237,213,0.5)', border: '1px solid rgba(253,186,116,0.5)',
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#92400e', margin: 0 }}>
          🐊 {job.totalAlumni ?? 0} {school} grads here · {job.parentConnections ?? 0} parent backdoors
        </p>
        <button
          onClick={() => onBackdoorClick && onBackdoorClick(job)}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#4f46e5',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap',
            minHeight: 'auto', minWidth: 'auto',
          }}
        >
          Ask CliFF →
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={cfg.disabled}
          onClick={() => !cfg.disabled && window.open(job.sourceUrl, '_blank')}
          style={{
            flex: risk === 'HIGH' ? 1 : 2,
            fontFamily: dm, fontSize: 11, fontWeight: 700,
            background: cfg.actionBg, color: cfg.actionColor,
            border: 'none', borderRadius: 10, padding: '10px 0',
            cursor: cfg.disabled ? 'not-allowed' : 'pointer',
            opacity: cfg.disabled ? 0.6 : 1,
            transition: 'opacity 0.2s',
            minHeight: 'auto',
          }}
        >
          {cfg.actionLabel}
        </button>

        {/* High risk: show prominent bypass button */}
        {risk === 'HIGH' && (
          <button
            onClick={() => onBackdoorClick && onBackdoorClick(job)}
            style={{
              flex: 2,
              fontFamily: dm, fontSize: 11, fontWeight: 800,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
            }}
          >
            🔑 Bypass Black Hole via Network
          </button>
        )}
      </div>
    </div>
  );
}