import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';

export default function ResumeAtsTeaser({ onUpgrade }) {
  const [jd, setJd] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    // Simulate an ATS check with a random score
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 30) + 38); // 38-68% range — clearly needs upgrade
      setLoading(false);
    }, 1800);
  };

  const scoreColor = score >= 70 ? GREEN : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>📄</span>
        <div>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Resume ATS Check</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>1 free check/month</p>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {!score ? (
          <>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px' }}>Paste a job description to get your ATS match score:</p>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste job description here..."
              style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', minHeight: 90, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={runCheck}
              disabled={!jd.trim() || loading}
              style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: jd.trim() ? `linear-gradient(135deg, ${BLUE}, #1d4ed8)` : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: jd.trim() ? 'pointer' : 'not-allowed', minHeight: 'auto', transition: 'all 0.15s' }}
            >
              {loading ? 'Scanning...' : 'Run ATS Check →'}
            </button>
            {loading && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #e5e7eb', borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spinAts 0.8s linear infinite' }} />
                <style>{`@keyframes spinAts { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Score Result */}
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`, borderRadius: 14, padding: '12px 20px', marginBottom: 10 }}>
                <span style={{ fontFamily: dm, fontSize: 32, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>ATS Match</p>
                  <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
                    {score >= 70 ? 'Good match' : score >= 50 ? 'Needs improvement' : 'Low match'}
                  </p>
                </div>
              </div>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                {score < 70 ? `Your resume is only a ${score}% match. The "Resume Wow" rewrite can push this to 95%+ instantly.` : `Not bad! The "Resume Wow" tool can push this even higher.`}
              </p>
            </div>

            {/* Locked: Resume Wow */}
            <div
              onClick={onUpgrade}
              style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', border: `1px solid ${BLUE_BORDER}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <span style={{ fontSize: 20 }}>🔒</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: BLUE, margin: '0 0 2px' }}>Unlock Resume Wow Rewrite</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>1-click AI rewrite to 95%+ ATS score</p>
              </div>
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: BLUE, borderRadius: 8, padding: '5px 12px', flexShrink: 0 }}>$4.99/wk</span>
            </div>

            <button
              onClick={() => setScore(null)}
              style={{ marginTop: 12, width: '100%', fontFamily: dm, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
            >
              Run another check
            </button>
          </>
        )}
      </div>
    </div>
  );
}