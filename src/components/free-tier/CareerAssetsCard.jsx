import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';

// ── Locked Asset Row ──────────────────────────────────────────────
function LockedAssetRow({ icon, title, subtitle, buttonLabel, onUnlock, previewContent }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{title}</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>{subtitle}</p>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <button
            onClick={() => setShowPreview(true)}
            style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {/* Blurred preview overlay */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
          >
            {/* Blurred asset preview */}
            <div style={{ position: 'relative', background: '#f3f4f6', padding: 24, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none' }}>
                {previewContent}
              </div>
              {/* Lock badge overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 280 }}>
                  <p style={{ fontFamily: dm, fontSize: 28, margin: '0 0 8px' }}>🔒</p>
                  <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{title}</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 14px', lineHeight: 1.5 }}>
                    Your AI-optimized version is ready. Upgrade to unlock it.
                  </p>
                  <button
                    onClick={() => { setShowPreview(false); onUnlock(); }}
                    style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 10, padding: '11px 20px', cursor: 'pointer', minHeight: 'auto', width: '100%' }}
                  >
                    ⚡ Upgrade to Unlock — $4.99/wk
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <button
                onClick={() => setShowPreview(false)}
                style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Resume blurred preview content ───────────────────────────────
function ResumePreviewContent() {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, fontFamily: dm }}>
      <div style={{ height: 14, background: '#111827', borderRadius: 3, width: '55%', marginBottom: 6 }} />
      <div style={{ height: 10, background: '#e5e7eb', borderRadius: 3, width: '40%', marginBottom: 16 }} />
      <div style={{ height: 1, background: '#2563eb', marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[100, 90, 85, 70, 95, 80].map((w, i) => (
          <div key={i} style={{ height: 9, background: i % 3 === 0 ? '#bfdbfe' : '#e5e7eb', borderRadius: 3, width: `${w}%` }} />
        ))}
      </div>
      <div style={{ height: 10, background: '#2563eb', borderRadius: 3, width: '30%', marginTop: 14, marginBottom: 8 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[95, 80, 70].map((w, i) => (
          <div key={i} style={{ height: 9, background: '#e5e7eb', borderRadius: 3, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ── LinkedIn blurred preview content ─────────────────────────────
function LinkedInPreviewContent() {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, fontFamily: dm }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#bfdbfe', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 11, background: '#111827', borderRadius: 3, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 9, background: '#2563eb', borderRadius: 3, width: '80%', marginBottom: 4 }} />
          <div style={{ height: 9, background: '#e5e7eb', borderRadius: 3, width: '45%' }} />
        </div>
      </div>
      <div style={{ background: '#eff6ff', borderRadius: 6, padding: '8px 10px', border: '1px solid #bfdbfe' }}>
        <div style={{ height: 8, background: '#93c5fd', borderRadius: 3, width: '100%', marginBottom: 4 }} />
        <div style={{ height: 8, background: '#93c5fd', borderRadius: 3, width: '75%' }} />
      </div>
    </div>
  );
}

// ── ATS Diagnostics Tab ───────────────────────────────────────────
function AtsDiagnosticsTab({ onUpgrade }) {
  const [jd, setJd] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    if (!jd.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 28) + 38);
      setLoading(false);
    }, 2000);
  };

  const scoreColor = score >= 70 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '16px 20px' }}>
      {!score ? (
        <>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
            Paste a job description to get your ATS match score:
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
            style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: jd.trim() && !loading ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#d1d5db', border: 'none', borderRadius: 10, padding: '11px 0', cursor: jd.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinAts 0.7s linear infinite' }} />
                <style>{`@keyframes spinAts { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                Calculating...
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
                  {score >= 70 ? 'Good match' : score >= 50 ? 'Needs improvement' : 'Low match'}
                </p>
              </div>
            </div>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.6 }}>
              {score < 70 ? `Only ${score}% match. The Resume Wow rewrite can push this to 95%+.` : `Not bad! Resume Wow can push this even higher.`}
            </p>
          </div>
          <button
            onClick={onUpgrade}
            style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: 12, padding: '13px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(22,163,74,0.35)' }}
          >
            ✨ Clear All Red Flags with Resume Wow
          </button>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '6px 0 0' }}>AI rewrites to 95%+ · $4.99/wk</p>
          <button onClick={() => setScore(null)} style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
            Run another check
          </button>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function CareerAssetsCard({ onUpgrade }) {
  const [activeTab, setActiveTab] = useState('ats');

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>🗂️</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>My Career Assets</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>Resume · LinkedIn · ATS Check</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'ats', label: '📊 ATS Matcher' },
            { id: 'premium', label: '⚡ AI Optimizations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                fontFamily: dm,
                fontSize: 11,
                fontWeight: 700,
                color: activeTab === tab.id ? BLUE : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${BLUE}` : '2px solid transparent',
                padding: '8px 4px',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'ats' ? (
        <AtsDiagnosticsTab onUpgrade={onUpgrade} />
      ) : (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 4px', lineHeight: 1.5 }}>
            Your AI-optimized assets are built and waiting. Upgrade to download or apply them.
          </p>

          <LockedAssetRow
            icon="📄"
            title="AI Perfected Resume"
            subtitle="Locked (98% ATS Score Target)"
            buttonLabel="Unlock PDF"
            onUnlock={onUpgrade}
            previewContent={<ResumePreviewContent />}
          />

          <LockedAssetRow
            icon="🔗"
            title="LinkedIn Header Blueprint"
            subtitle="Locked (Recruiter Signal Sync)"
            buttonLabel="Unlock Copy"
            onUnlock={onUpgrade}
            previewContent={<LinkedInPreviewContent />}
          />

          <button
            onClick={onUpgrade}
            style={{ width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 10, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', marginTop: 4 }}
          >
            ⚡ Unlock All Assets — $4.99/wk
          </button>
        </div>
      )}
    </div>
  );
}