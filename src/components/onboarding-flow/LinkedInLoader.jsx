import { useEffect, useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const TEXT3 = '#94A3B8';
const INDIGO = '#6366F1';
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';

export default function LinkedInLoader({ firstName, college, selectedIndustries = [], onSkip }) {
  const industryLabel = selectedIndustries?.length > 0
    ? selectedIndustries.slice(0, 2).join(' & ')
    : 'your target fields';

  const STEPS = [
    { label: 'Analyzing your experience & skills', done: true },
    { label: 'Writing a recruiter-magnet headline', done: true },
    { label: 'Crafting your story-driven About section', done: true },
    { label: 'Building your ATS keyword list', done: true },
    { label: 'Optimizing for warm intros & alumni outreach', done: false },
  ];

  const [visibleSteps, setVisibleSteps] = useState(0);

  // Reveal steps one by one
  useEffect(() => {
    if (visibleSteps >= STEPS.length) return;
    const delay = visibleSteps === 0 ? 300 : 700;
    const t = setTimeout(() => setVisibleSteps(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [visibleSteps]);



  return (
    <div style={{ maxWidth: 520, width: '100%', paddingTop: 100, paddingBottom: 80, boxSizing: 'border-box', margin: '0 auto', textAlign: 'center' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes checkIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmerBar { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes factFade { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Icon */}
      <div style={{ width: 64, height: 64, borderRadius: 16, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px', boxShadow: SHADOW_MD }}>💼</div>

      {/* Headline */}
      <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: TEXT, margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
        CLiFF is building your LinkedIn Identity...
      </h2>

      {/* Sub-headline */}
      <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 32px', lineHeight: 1.65, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        Crafting a recruiter-magnet headline, story-driven bio, and ATS-optimized keywords for <strong style={{ color: TEXT }}>{industryLabel}</strong>{college ? ` — tuned for ${college} alumni networks` : ''}.
      </p>

      {/* Checklist card */}
      <div style={{ background: CARD, borderRadius: 16, boxShadow: SHADOW_MD, border: '1.5px solid #E2E8F0', overflow: 'hidden', position: 'relative', marginBottom: 20 }}>
        {/* Shimmer top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366F1, #0066FF, #10B981, #6366F1)', backgroundSize: '300% auto', animation: 'shimmerBar 2.5s ease infinite' }} />

        <div style={{ padding: '28px 24px 22px', textAlign: 'left' }}>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Processing your profile…</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((step, i) => {
              const visible = i < visibleSteps;
              const isSpinning = visible && !step.done;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', opacity: visible ? 1 : 0.15, animation: visible ? 'checkIn 0.4s ease forwards' : 'none', transition: 'opacity 0.3s' }}>
                  {isSpinning ? (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #E2E8F0', borderTop: `2px solid ${INDIGO}`, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  ) : visible ? (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>
                    </div>
                  ) : (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #E2E8F0', flexShrink: 0 }} />
                  )}
                  <span style={{ fontFamily: FONT, fontSize: 13, color: visible ? (isSpinning ? INDIGO : '#065F46') : TEXT3, fontWeight: visible ? 600 : 400, lineHeight: 1.5, transition: 'color 0.3s' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rotating status line */}
          <div style={{ marginTop: 18, padding: '10px 14px', background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8 }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: BLUE, margin: 0, lineHeight: 1.6, minHeight: 36 }}>
              💡 Students with optimized LinkedIn profiles get 3–5x more views and messages.
            </p>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 8px', lineHeight: 1.65, fontStyle: 'italic' }}>
        You're creating a professional presence that actually works — not just another generic profile.
      </p>

      {/* Timing estimate */}
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 12px', lineHeight: 1.6 }}>
        Almost done — usually <strong style={{ color: '#64748B' }}>20–40 seconds</strong>.
      </p>

      {/* Skip button */}
      {onSkip && (
        <button onClick={onSkip} style={{ fontFamily: FONT, fontSize: 12, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Skip &amp; see preview →
        </button>
      )}
    </div>
  );
}