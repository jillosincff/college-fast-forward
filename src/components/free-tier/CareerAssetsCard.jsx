import { useState } from 'react';
import { getUniversityBrand } from '@/lib/universityBrand';
import LinkedInOptimizationHub from './LinkedInOptimizationHub';

const dm = "'DM Sans', system-ui, sans-serif";

// ── Pain-point panel config ───────────────────────────────────────
const PAIN_PANEL = {
  getting_ghosted: {
    tabLabel: '📊 ATS Optimization',
    title: 'Resume AI Audit Active',
    badge: '98% ATS Compatibility',
    badgeStyle: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    description: 'We parsed your resume against standard corporate ATS filters. Your original layout carried a high risk of automated rejection. CLiFF has rebuilt a mirror copy.',
    visual: (school) => (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 700, color: '#374151' }}>
          <span>❌ Missing High-Intent Keywords</span>
          <span style={{ color: '#ef4444' }}>Fixed by CLiFF</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 700, color: '#374151' }}>
          <span>❌ Unreadable PDF Columns</span>
          <span style={{ color: '#ef4444' }}>Streamlined</span>
        </div>
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 800, color: '#111827' }}>
          <span>⚡ Rebuilt {school} Identity File</span>
          <span style={{ color: '#16a34a' }}>Ready 🔒</span>
        </div>
      </div>
    ),
    ctaLabel: '⚡ Download My Optimized Resume',
  },
  interview_anxiety: {
    tabLabel: '🛡️ Interview Simulator',
    title: 'Custom Mock Prep Ready',
    badge: '3 Modules Isolated',
    badgeStyle: { background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' },
    description: "You mentioned interviewing makes you nervous. CLiFF analyzed the active loops for your target track and calibrated an interactive simulator to prep you.",
    visual: (school) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: '🎯 Behavioral & Culture Loops', school },
          { label: '📊 Technical Domain Deep-Dives', school },
          { label: `🔗 ${school} Alumni Intel`, school },
        ].map(({ label }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 700, color: '#374151' }}>
            <span>{label}</span>
            <span style={{ color: '#6366f1' }}>Locked 🔒</span>
          </div>
        ))}
      </div>
    ),
    ctaLabel: '🚀 Start Interactive Mock Prep Loop',
  },
  which_jobs: {
    tabLabel: '🎯 Role Targeting',
    title: 'Role Match Engine Active',
    badge: 'Live Signal Scan',
    badgeStyle: { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    description: "CLiFF scanned your profile against live hiring signals and mapped the exact roles where you're a real fit — not just where you applied.",
    visual: (school) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['Top-Matched Role Clusters', 'Salary Benchmarks by Track', `${school} Hiring Activity Feed`].map(label => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 700, color: '#374151' }}>
            <span>📌 {label}</span>
            <span style={{ color: '#ea580c' }}>Locked 🔒</span>
          </div>
        ))}
      </div>
    ),
    ctaLabel: '🔍 Unlock My Role Match Report',
  },
  outreach: {
    tabLabel: '✉️ Network Multiplier',
    title: 'Outreach Drafts Ready',
    badge: 'Alumni Mapped',
    badgeStyle: { background: '#fdf4ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
    description: `CLiFF mapped your school's active alumni ecosystem and drafted personalized outreach messages for each warm path it found.`,
    visual: (school) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[`${school} Alumni at Target Co.`, 'Cold → Warm Conversion Script', 'Follow-Up Sequence (3-touch)'].map(label => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontFamily: dm, fontWeight: 700, color: '#374151' }}>
            <span>📨 {label}</span>
            <span style={{ color: '#9333ea' }}>Locked 🔒</span>
          </div>
        ))}
      </div>
    ),
    ctaLabel: '📨 Unlock My Outreach Drafts',
  },
};

// Fallback for unknown pain keys — defaults to ghosted panel
const DEFAULT_PAIN_KEY = 'getting_ghosted';

// ── Locked Asset Row (AI Optimizations tab) ───────────────────────
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
            style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ position: 'relative', background: '#f3f4f6', padding: 24, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none' }}>{previewContent}</div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 280 }}>
                  <p style={{ fontFamily: dm, fontSize: 28, margin: '0 0 8px' }}>🔒</p>
                  <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{title}</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 14px', lineHeight: 1.5 }}>Your AI-optimized version is ready. Upgrade to unlock it.</p>
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
              <button onClick={() => setShowPreview(false)} style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResumePreviewContent() {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, fontFamily: dm }}>
      <div style={{ height: 14, background: '#111827', borderRadius: 3, width: '55%', marginBottom: 6 }} />
      <div style={{ height: 10, background: '#e5e7eb', borderRadius: 3, width: '40%', marginBottom: 16 }} />
      <div style={{ height: 1, background: '#2563eb', marginBottom: 12 }} />
      {[100, 90, 85, 70, 95, 80].map((w, i) => (
        <div key={i} style={{ height: 9, background: i % 3 === 0 ? '#bfdbfe' : '#e5e7eb', borderRadius: 3, width: `${w}%`, marginBottom: 5 }} />
      ))}
    </div>
  );
}

function LinkedInPreviewContent() {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, fontFamily: dm }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#bfdbfe', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 11, background: '#111827', borderRadius: 3, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 9, background: '#2563eb', borderRadius: 3, width: '80%', marginBottom: 4 }} />
        </div>
      </div>
      <div style={{ background: '#eff6ff', borderRadius: 6, padding: '8px 10px', border: '1px solid #bfdbfe' }}>
        <div style={{ height: 8, background: '#93c5fd', borderRadius: 3, width: '100%', marginBottom: 4 }} />
        <div style={{ height: 8, background: '#93c5fd', borderRadius: 3, width: '75%' }} />
      </div>
    </div>
  );
}

// ── Locked Feature Gate Overlay ──────────────────────────────────
function FeatureGate({ children, onUpgrade }) {
  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
      {/* Blurred content underneath */}
      <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
        {children}
      </div>
      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(248,250,252,0.65)',
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 14,
      }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#1e293b', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
          Reserved for Premium Subscribers
        </p>
        <button
          onClick={onUpgrade}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none', borderRadius: 8, padding: '7px 14px',
            cursor: 'pointer', minHeight: 'auto',
          }}
        >
          Unlock — $4.99/wk →
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function CareerAssetsCard({ user, onUpgrade, isPremium = false }) {
  const [activeTab, setActiveTab] = useState('pain');

  const painKey = user?.primaryPainPoint || user?.primary_pain_point || DEFAULT_PAIN_KEY;
  const panel = PAIN_PANEL[painKey] || PAIN_PANEL[DEFAULT_PAIN_KEY];
  const brand = getUniversityBrand(user?.school_code || user?.school);
  const school = brand.shortName;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>🗂️</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>My Career Assets</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>Personalized to your goals</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'pain', label: panel.tabLabel },
            { id: 'linkedin', label: '🌐 LinkedIn Hub' },
            { id: 'premium', label: '⚡ AI Optimizations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, fontFamily: dm, fontSize: 11, fontWeight: 700,
                color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                padding: '8px 4px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'linkedin' ? (
        <LinkedInOptimizationHub user={user} onUpgrade={onUpgrade} isPremium={isPremium} />
      ) : activeTab === 'pain' ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title + badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{panel.title}</p>
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap', ...panel.badgeStyle }}>
              {panel.badge}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.65 }}>
            {panel.description}
          </p>

          {/* Dynamic visual */}
          {panel.visual(school)}

          {/* CTA */}
          <button
            onClick={onUpgrade}
            style={{ width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff', background: '#0f172a', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}
          >
            {panel.ctaLabel}
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 4px', lineHeight: 1.5 }}>
            Your AI-optimized assets are built and waiting. Upgrade to download or apply them.
          </p>

          {isPremium ? (
            <LockedAssetRow
              icon="📄"
              title="AI Perfected Resume"
              subtitle="Locked (98% ATS Score Target)"
              buttonLabel="Unlock PDF"
              onUnlock={onUpgrade}
              previewContent={<ResumePreviewContent />}
            />
          ) : (
            <FeatureGate onUpgrade={onUpgrade}>
              <LockedAssetRow
                icon="📄"
                title="AI Perfected Resume"
                subtitle="⚡ Download My Optimized Resume File"
                buttonLabel="Download"
                onUnlock={onUpgrade}
                previewContent={<ResumePreviewContent />}
              />
            </FeatureGate>
          )}

          {isPremium ? (
            <LockedAssetRow
              icon="🔗"
              title="LinkedIn Header Blueprint"
              subtitle="Locked (Recruiter Signal Sync)"
              buttonLabel="Unlock Copy"
              onUnlock={onUpgrade}
              previewContent={<LinkedInPreviewContent />}
            />
          ) : (
            <FeatureGate onUpgrade={onUpgrade}>
              <LockedAssetRow
                icon="🚀"
                title="Interview Simulator Loop"
                subtitle="🚀 Start Interactive Mock Prep Loop"
                buttonLabel="Start"
                onUnlock={onUpgrade}
                previewContent={<LinkedInPreviewContent />}
              />
            </FeatureGate>
          )}

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