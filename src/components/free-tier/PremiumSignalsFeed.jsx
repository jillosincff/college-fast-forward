import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const mono = "'Courier New', monospace";

const LIVE_SIGNALS = [
  {
    id: 'unadvertised-salesforce',
    type: 'unadvertised',
    emoji: '🔥',
    count: 3,
    label: 'Unadvertised roles discovered',
    company: 'Salesforce',
    detail: 'matching your Alumni network',
    time: 'This morning',
    badge: 'NEW',
    expansion: {
      roles: [
        { title: 'Business Development Representative (Commercial)', status: '🟢' },
        { title: 'Strategy & Operations Analyst', status: '🟢' },
        { title: 'Solutions Engineer (Entry Level)', status: '🟢' },
      ],
      intel: 'Our agent detected these roles inside a private staging directory on Salesforce\'s internal recruitment site. They are not indexed on LinkedIn or Indeed yet.',
      cta: '📥 Add Selected to My Opportunities Pipeline',
      ctaType: 'pipeline',
    },
  },
  {
    id: 'recruiter-view-deloitte',
    type: 'recruiter_view',
    emoji: '👀',
    count: 1,
    label: 'Hiring Manager viewed your profile',
    company: 'Deloitte',
    detail: 'Senior Recruiter, Campus Programs',
    time: '2 hours ago',
    badge: 'HOT',
    expansion: {
      insider: { name: 'Sarah M.', title: 'Campus Recruiter', company: 'Deloitte' },
      activity: 'Spent 2 minutes reviewing your "Master_Resume_Wow" file.',
      source: 'Synced via your Deloitte Alumni Referral Link.',
      intel: 'Sarah is actively looking at your background. This is the absolute highest probability window to secure an interview.',
      cta: '⚡ Open Drawer & Send Direct LinkedIn Outreach',
      ctaType: 'outreach',
    },
  },
  {
    id: 'backdoor-amazon',
    type: 'backdoor',
    emoji: '🎯',
    count: 5,
    label: 'New backdoor leads crawled',
    company: 'Amazon',
    detail: 'from alumni-connected companies',
    time: 'Today',
    badge: null,
    expansion: {
      roles: [
        { title: 'Program Manager Intern — AWS Operations', status: '🟢' },
        { title: 'Finance Analyst, Supply Chain', status: '🟡' },
        { title: 'Technical Recruiter (Campus)', status: '🟢' },
        { title: 'Business Intelligence Engineer', status: '🟢' },
        { title: 'Operations Research Scientist', status: '🟡' },
      ],
      intel: 'Sourced from alumni-shared referral threads and internal job boards not accessible to the public. Yellow roles have 2+ matching UF network contacts.',
      cta: '📥 Add Selected to My Opportunities Pipeline',
      ctaType: 'pipeline',
    },
  },
  {
    id: 'headcount-jpmorgan',
    type: 'headcount',
    emoji: '📡',
    count: 2,
    label: 'Hiring signals detected',
    company: 'JPMorgan Chase',
    detail: 'Engineering team headcount expanding',
    time: '4 hours ago',
    badge: null,
    expansion: {
      company: 'JPMorgan Chase',
      metric: 'Tech engineering headcount expanded by 14% in the last 30 days.',
      network: '4 UF grads were promoted within this specific team last week.',
      intel: 'Massive headcount movement means open headcount reqs are dropping soon. Let\'s get ahead of the pile.',
      cta: '🔎 Auto-Generate a Warm Coffee Chat Request',
      ctaType: 'coffeechat',
    },
  },
];

function SignalExpansion({ signal, theme, onAddToPipeline }) {
  const t = theme || { primary: '#2563eb' };
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [added, setAdded] = useState(false);

  const toggleRole = (title) => {
    setSelectedRoles(prev =>
      prev.includes(title) ? prev.filter(r => r !== title) : [...prev, title]
    );
  };

  const handleCTA = () => {
    if (signal.expansion.ctaType === 'pipeline') {
      const toAdd = selectedRoles.length > 0
        ? signal.expansion.roles.filter(r => selectedRoles.includes(r.title))
        : signal.expansion.roles;
      onAddToPipeline(signal.company, toAdd);
      setAdded(true);
    }
  };

  const { expansion: ex } = signal;

  return (
    <div style={{
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderRadius: '0 0 14px 14px',
      padding: '16px 16px 14px',
      animation: 'expandIn 0.25s ease both',
    }}>
      <style>{`@keyframes expandIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Type A & C: Role list */}
      {ex.roles && (
        <div style={{ marginBottom: 12 }}>
          {ex.roles.map((role, i) => (
            <div
              key={i}
              onClick={() => toggleRole(role.title)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, marginBottom: 5, cursor: 'pointer',
                background: selectedRoles.includes(role.title) ? `${t.primary}12` : '#fff',
                border: `1px solid ${selectedRoles.includes(role.title) ? t.primary : '#e5e7eb'}`,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 12 }}>{role.status}</span>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#111827', flex: 1 }}>{role.title}</span>
              <div style={{
                width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedRoles.includes(role.title) ? t.primary : '#cbd5e1'}`,
                background: selectedRoles.includes(role.title) ? t.primary : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selectedRoles.includes(role.title) && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
              </div>
            </div>
          ))}
          {ex.roles.length > 1 && (
            <p style={{ fontFamily: dm, fontSize: 10, color: '#94a3b8', margin: '4px 0 0 2px' }}>
              {selectedRoles.length > 0 ? `${selectedRoles.length} selected` : 'Click roles to select, or add all'}
            </p>
          )}
        </div>
      )}

      {/* Type B: Recruiter view */}
      {ex.insider && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>🕵️‍♂️ Insider</span>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827' }}>{ex.insider.name}, {ex.insider.title} at {ex.insider.company}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>⏱️ Activity</span>
              <span style={{ fontFamily: dm, fontSize: 12, color: '#374151' }}>{ex.activity}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>📈 Source</span>
              <span style={{ fontFamily: dm, fontSize: 12, color: '#374151' }}>{ex.source}</span>
            </div>
          </div>
        </div>
      )}

      {/* Type D: Headcount signal */}
      {ex.metric && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>🏢 Company</span>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827' }}>{ex.company}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>📊 Signal</span>
              <span style={{ fontFamily: dm, fontSize: 12, color: '#374151' }}>{ex.metric}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: '#64748b', width: 80, flexShrink: 0 }}>🐊 Network</span>
              <span style={{ fontFamily: dm, fontSize: 12, color: '#374151' }}>{ex.network}</span>
            </div>
          </div>
        </div>
      )}

      {/* Intel box */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
        <p style={{ fontFamily: mono, fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500, letterSpacing: '-0.01em' }}>
          "{ex.intel}"
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={ex.ctaType === 'pipeline' ? handleCTA : undefined}
        disabled={added}
        style={{
          width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700,
          color: '#fff',
          background: added ? '#6b7280' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`,
          border: 'none', borderRadius: 10, padding: '11px 0',
          cursor: added ? 'default' : 'pointer', minHeight: 'auto',
          boxShadow: added ? 'none' : `0 4px 12px ${t.primary}33`,
          transition: 'all 0.2s',
        }}
      >
        {added ? '✅ Added to Your Pipeline' : ex.cta}
      </button>
    </div>
  );
}

export default function PremiumSignalsFeed({ college, theme, onAddToPipeline }) {
  const t = theme || { primary: '#2563eb', secondary: '#1d4ed8', bgTint: '#eff6ff' };
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <style>{`
        @keyframes pulse-glow {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes stream-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .signal-row { animation: stream-in 0.4s ease both; }
        .signal-row:nth-child(1) { animation-delay: 0.05s; }
        .signal-row:nth-child(2) { animation-delay: 0.15s; }
        .signal-row:nth-child(3) { animation-delay: 0.25s; }
        .signal-row:nth-child(4) { animation-delay: 0.35s; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 60%, #0d1a3a 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Live Career Signals Feed</p>
          <p style={{ fontFamily: mono, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Agent crawling 24/7 · All signals unlocked</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      </div>

      {/* Signal rows */}
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LIVE_SIGNALS.map((sig, i) => {
          const isOpen = expandedId === sig.id;
          return (
            <div
              key={sig.id}
              className="signal-row"
              style={{
                background: i === 0 ? '#f0fdf4' : '#f9fafb',
                border: `1px solid ${isOpen ? t.primary : (i === 0 ? '#bbf7d0' : '#e5e7eb')}`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                boxShadow: isOpen ? `0 4px 16px ${t.primary}18` : 'none',
              }}
            >
              {/* Row header */}
              <div
                style={{ padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => toggle(sig.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `linear-gradient(135deg, ${t.primary}22, ${t.primary}44)`,
                    border: `1px solid ${t.primary}33`,
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
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
                    <button
                      onClick={e => { e.stopPropagation(); toggle(sig.id); }}
                      style={{
                        fontFamily: dm, fontSize: 10, fontWeight: 700,
                        color: isOpen ? '#fff' : t.primary,
                        background: isOpen ? t.primary : `${t.primary}15`,
                        border: `1px solid ${t.primary}33`,
                        borderRadius: 8, padding: '3px 10px', cursor: 'pointer', minHeight: 'auto',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isOpen ? 'Close ↑' : 'Reveal →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expansion panel */}
              {isOpen && (
                <SignalExpansion
                  signal={sig}
                  theme={t}
                  onAddToPipeline={onAddToPipeline || (() => {})}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 22px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>✅ All signals unlocked — Premium Active</p>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#16a34a' }}>View All Leads →</span>
      </div>
    </div>
  );
}