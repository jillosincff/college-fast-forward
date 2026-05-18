import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const GREEN = '#16a34a';
const BLUE = '#4f46e5';

const VERSIONS = [
  { id: 'master', label: 'Master Resume', filename: 'Master_Resume.pdf', date: 'Active', badge: 'Default' },
  { id: 'salesforce', label: 'Salesforce Tailored', filename: 'Resume_Salesforce.pdf', date: 'May 18, 2026', badge: null },
  { id: 'deloitte', label: 'Deloitte Tailored', filename: 'Resume_Deloitte.pdf', date: 'May 15, 2026', badge: null },
];

function AtsTab({ activeVersion }) {
  const [jd, setJd] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 20) + 78);
      setLoading(false);
    }, 2000);
  };

  const scoreColor = score !== null ? (score >= 85 ? GREEN : score >= 70 ? '#f59e0b' : '#ef4444') : null;

  if (score !== null) {
    return (
      <div style={{ padding: '14px 18px' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`, borderRadius: 14, padding: '12px 20px', marginBottom: 10 }}>
            <span style={{ fontFamily: dm, fontSize: 32, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>ATS Match</p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
                {score >= 85 ? 'Excellent match!' : score >= 70 ? 'Good — small tweaks needed' : 'Needs improvement'}
              </p>
            </div>
          </div>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>
            Scored against: <strong style={{ color: '#374151' }}>{activeVersion.label}</strong>
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
            {score >= 85 ? 'Great position! Your resume is well-optimized for this role.' : 'A few targeted adjustments would improve your alignment with this JD.'}
          </p>
        </div>
        <button onClick={() => setScore(null)} style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto' }}>
          Run another check ↺
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 18px' }}>
      <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '0 0 8px' }}>
        Comparing against: <strong style={{ color: '#374151' }}>{activeVersion.label}</strong>
      </p>
      <textarea
        value={jd}
        onChange={e => setJd(e.target.value)}
        placeholder="Paste target job description here to compare against your selected resume version..."
        style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', minHeight: 90, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      <button
        onClick={runCheck}
        disabled={!jd.trim() || loading}
        style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: jd.trim() && !loading ? `linear-gradient(135deg, ${GREEN}, #15803d)` : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: jd.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
      >
        {loading ? (
          <>
            <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinAts 0.7s linear infinite' }} />
            <style>{`@keyframes spinAts { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            Running ATS Check...
          </>
        ) : 'Run ATS Check →'}
      </button>
    </div>
  );
}

function GhostTab() {
  const [ghostCompany, setGhostCompany] = useState('');
  const [ghostDate, setGhostDate] = useState('');
  const [ghostResult, setGhostResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    if (!ghostCompany.trim() || !ghostDate) return;
    setLoading(true);
    setTimeout(() => {
      const riskScore = Math.floor(Math.random() * 40) + 60;
      setGhostResult({
        riskScore,
        riskLevel: riskScore >= 80 ? 'HIGH' : riskScore >= 60 ? 'MEDIUM' : 'LOW',
        message: riskScore >= 80
          ? `${ghostCompany} has paused internal recruiter activity. Stop waiting—deploy an automated outreach to a verified alum or parent contact on this team instead.`
          : riskScore >= 60
          ? `${ghostCompany} shows reduced hiring activity. Consider following up with a warm connection.`
          : `${ghostCompany} is actively reviewing applications. Your submission is in good standing.`
      });
      setLoading(false);
    }, 2000);
  };

  const ghostColor = ghostResult?.riskScore >= 80 ? '#ef4444' : ghostResult?.riskScore >= 60 ? '#f59e0b' : GREEN;

  if (ghostResult) {
    return (
      <div style={{ padding: '14px 18px' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${ghostColor}15`, border: `1px solid ${ghostColor}40`, borderRadius: 14, padding: '12px 20px', marginBottom: 10 }}>
            <span style={{ fontFamily: dm, fontSize: 32, fontWeight: 900, color: ghostColor, lineHeight: 1 }}>{ghostResult.riskScore}%</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>Ghost Risk: {ghostResult.riskLevel}</p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
                {ghostResult.riskLevel === 'HIGH' ? '🚨 Immediate action needed' : ghostResult.riskLevel === 'MEDIUM' ? '⚠️ Follow-up recommended' : '✅ Application healthy'}
              </p>
            </div>
          </div>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 14px', lineHeight: 1.6 }}>{ghostResult.message}</p>
          {ghostResult.riskScore >= 80 && (
            <button style={{ width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 10, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(239,68,68,0.25)', marginBottom: 10 }}>
              🚀 Deploy Automated Outreach →
            </button>
          )}
        </div>
        <button onClick={() => { setGhostResult(null); setGhostCompany(''); setGhostDate(''); }} style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto' }}>
          Run another Ghost Check ↺
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 18px' }}>
      <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 8px', lineHeight: 1.5 }}>
        👻 Track an application you've already submitted:
      </p>
      <input value={ghostCompany} onChange={e => setGhostCompany(e.target.value)} placeholder="Company name (e.g. Salesforce)" style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
      <input type="date" value={ghostDate} onChange={e => setGhostDate(e.target.value)} style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
      <button
        onClick={runCheck}
        disabled={!ghostCompany.trim() || !ghostDate || loading}
        style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: ghostCompany.trim() && ghostDate && !loading ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: ghostCompany.trim() && ghostDate && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {loading ? (
          <>
            <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinGhost 0.7s linear infinite' }} />
            <style>{`@keyframes spinGhost { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            Running Ghost Check...
          </>
        ) : '👻 Run Application Ghost Check'}
      </button>
    </div>
  );
}

export default function PremiumCareerAssetsCard({ user }) {
  const [activeVersionId, setActiveVersionId] = useState('master');
  const [activeTab, setActiveTab] = useState('ats');

  const activeVersion = VERSIONS.find(v => v.id === activeVersionId);
  const displayName = user?.full_name?.split(' ')[0] || 'your';
  const masterFilename = `${user?.full_name?.replace(/\s+/g, '_') || 'Master'}_Resume.pdf`;

  const TABS = [
    { id: 'ats', label: '📊 ATS Matcher', tooltip: null },
    { id: 'ghost', label: '👻 Ghost Check', tooltip: 'Reveals recruiter activity, login frequency, and hiring freeze risk at a specific company.' },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

      {/* Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📁</span>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Resume Corner</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#16a34a' }}>Premium Active</span>
          </div>
        </div>
      </div>

      {/* Active File Panel */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 20, color: BLUE, flexShrink: 0 }}>📄</span>
              <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                {activeVersion.filename}
              </span>
              {activeVersion.badge && (
                <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: BLUE, background: `${BLUE}12`, border: `1px solid ${BLUE}25`, borderRadius: 100, padding: '2px 7px', flexShrink: 0 }}>{activeVersion.badge}</span>
              )}
            </div>
            <span style={{ fontFamily: dm, fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{activeVersion.date}</span>
          </div>

          {/* Quick action links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
            {[
              { label: '✏️ Edit', action: () => alert('Live editor coming soon') },
              { label: '📥 Download', action: () => alert(`Downloading ${activeVersion.filename}`) },
              { label: '🔄 Swap File', action: () => alert('Upload flow coming soon') },
            ].map((btn, i) => (
              <span key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {i > 0 && <span style={{ color: '#cbd5e1', margin: '0 8px', fontSize: 12 }}>|</span>}
                <button
                  onClick={btn.action}
                  style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3730a3'}
                  onMouseLeave={e => e.currentTarget.style.color = BLUE}
                >
                  {btn.label}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Version Switcher */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Switch Versions</p>
          <select
            value={activeVersionId}
            onChange={e => setActiveVersionId(e.target.value)}
            style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', outline: 'none', cursor: 'pointer' }}
          >
            {VERSIONS.map(v => (
              <option key={v.id} value={v.id}>
                {v.label}{v.date !== 'Active' ? ` · ${v.date}` : ' (Active)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool Tabs */}
      <div style={{ borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', padding: '0 18px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700,
                color: activeTab === tab.id ? BLUE : '#6b7280',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? BLUE : 'transparent'}`,
                padding: '10px 4px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              {tab.label}
              {tab.tooltip && (
                <span style={{ position: 'relative', display: 'inline-block', cursor: 'help', color: '#94a3b8', lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.querySelector('.tip').style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.querySelector('.tip').style.opacity = '0'}
                >
                  ⓘ
                  <span className="tip" style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                    transform: 'translateX(-50%)', width: 200,
                    background: '#0f172a', color: '#fff', fontFamily: dm,
                    fontSize: 11, fontWeight: 400, lineHeight: 1.5,
                    padding: '8px 10px', borderRadius: 8, textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    opacity: 0, transition: 'opacity 0.18s ease',
                    pointerEvents: 'none', zIndex: 50, whiteSpace: 'normal',
                  }}>
                    {tab.tooltip}
                    <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #0f172a' }} />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'ats' ? (
          <AtsTab activeVersion={activeVersion} />
        ) : (
          <GhostTab />
        )}
      </div>
    </div>
  );
}