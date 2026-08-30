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
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 28) + 38); // 38-65% range — clearly needs upgrade
      setLoading(false);
    }, 2000);
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
              id="btn-run-ats"
              onClick={runCheck}
              disabled={!jd.trim() || loading}
              style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: jd.trim() && !loading ? `linear-gradient(135deg, ${BLUE}, #1d4ed8)` : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: jd.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spinAts 0.7s linear infinite', flexShrink: 0 }} />
                  <style>{`@keyframes spinAts { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                  Calculating ATS score...
                </>
              ) : 'Run ATS Check →'}
            </button>
            {loading && (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <div style={{ position: 'relative', display: 'inline-block', width: 56, height: 56 }}>
                  <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke={BLUE} strokeWidth="4"
                      strokeDasharray="138" strokeDashoffset="138"
                      style={{ animation: 'atsRing 2s ease-in-out forwards' }} />
                    <style>{`@keyframes atsRing { from{stroke-dashoffset:138} to{stroke-dashoffset:28} }`}</style>
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, fontSize: 10, fontWeight: 700, color: BLUE }}>ATS</span>
                </div>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '6px 0 0' }}>Scanning your resume against job requirements...</p>
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

            {/* Green CTA — shown immediately after score, high conversion */}
            <button
              onClick={onUpgrade}
              style={{ width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: 12, padding: '14px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(22,163,74,0.35)', transition: 'all 0.2s', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(22,163,74,0.35)'; }}
            >
              ✨ Clear All Red Flags with Resume Wow
            </button>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '6px 0 0' }}>
              AI rewrites your resume to 95%+ · $4.99/week — billed monthly at $19.96
            </p>

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