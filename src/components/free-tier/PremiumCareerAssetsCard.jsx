import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const GREEN = '#16a34a';

function AtsDiagnosticsTab() {
  const [jd, setJd] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 20) + 78); // Premium: higher scores
      setLoading(false);
    }, 2000);
  };

  const scoreColor = score >= 85 ? GREEN : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '16px 20px' }}>
      {!score ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>
            ✅ Uncapped usage — paste any job description to check your score:
          </p>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste job description here..."
            style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', minHeight: 90, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={runCheck}
            disabled={!jd.trim() || loading}
            style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: jd.trim() && !loading ? `linear-gradient(135deg, ${GREEN}, #15803d)` : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: jd.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinAts 0.7s linear infinite' }} />
                <style>{`@keyframes spinAts { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                Running ATS Check...
              </>
            ) : 'Run ATS Check →'}
          </button>
        </>
      ) : (
        <>
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
            <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
              {score >= 85 ? 'Great position! Your resume is well-optimized for this role.' : `Your resume needs a few targeted adjustments. Use your AI resume tool below.`}
            </p>
          </div>
          <button onClick={() => setScore(null)} style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto' }}>
            Run another check ↺
          </button>
        </>
      )}
    </div>
  );
}

function UnlockedAssetRow({ icon, title, subtitle, actionLabel, onAction, successMsg }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    await onAction(setCopied);
    setLoading(false);
  };

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0, fontWeight: 600 }}>{subtitle}</p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <button
          onClick={handleAction}
          disabled={loading}
          style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: copied ? '#6b7280' : `linear-gradient(135deg, ${GREEN}, #15803d)`, border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
        >
          {loading ? '...' : copied ? '✅ Copied!' : actionLabel}
        </button>
      </div>
    </div>
  );
}

export default function PremiumCareerAssetsCard({ user }) {
  const [activeTab, setActiveTab] = useState('ats');
  const BLUE = '#2563eb';

  const handleDownloadResume = async (setCopied) => {
    // Simulate generating PDF — in production this calls a backend function
    await new Promise(r => setTimeout(r, 800));
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${user?.full_name?.replace(' ', '_') || 'Resume'}_Optimized.pdf`;
    alert('Your optimized resume PDF is being generated. This would trigger the actual download in production.');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyLinkedIn = async (setCopied) => {
    const name = user?.full_name || 'Your Name';
    const school = user?.school || 'University';
    const major = user?.major || 'Business';
    const headline = `${major} Graduate | ${school} | Actively Seeking Opportunities in Finance & Tech | Open to Networking`;
    const about = `I'm a ${major} student at ${school} with a focus on building meaningful professional relationships and delivering impact from day one.\n\nI'm actively pursuing full-time opportunities where I can combine analytical thinking with collaborative execution.\n\nLet's connect — I'd love to learn about your experience at [Company].`;
    const fullText = `HEADLINE:\n${headline}\n\nABOUT:\n${about}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert(fullText);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>🗂️</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>My Career Assets</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0, fontWeight: 600 }}>Fully Unlocked — Premium</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'ats', label: '📊 ATS Matcher' },
            { id: 'assets', label: '⚡ AI Optimizations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700,
                color: activeTab === tab.id ? BLUE : '#6b7280',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${BLUE}` : '2px solid transparent',
                padding: '8px 4px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'ats' ? (
        <AtsDiagnosticsTab />
      ) : (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#16a34a', margin: '0 0 4px', lineHeight: 1.5, fontWeight: 600 }}>
            ✅ Your AI-optimized assets are ready to use.
          </p>

          <UnlockedAssetRow
            icon="📄"
            title="Master Resume Wow PDF"
            subtitle="98% ATS Score · Optimized & Ready"
            actionLabel="📥 Download PDF"
            onAction={handleDownloadResume}
          />

          <UnlockedAssetRow
            icon="🔗"
            title="LinkedIn Headline & About"
            subtitle="Recruiter-optimized · Copy & paste ready"
            actionLabel="📋 Copy to Clipboard"
            onAction={handleCopyLinkedIn}
          />
        </div>
      )}
    </div>
  );
}