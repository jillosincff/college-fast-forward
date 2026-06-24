import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const VIOLET = '#7c3aed';
const TEAL_DARK = '#0891b2';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

// 3-step loop: Upload/ATS Match -> Curated Dashboard w/ badges -> Warm Intro
const STEPS = [
  { key: 'match',     label: 'Resume Match',   sub: 'ATS-optimized for the role' },
  { key: 'dashboard', label: 'Curated Matches', sub: 'With warm connections' },
  { key: 'intro',     label: 'Warm Intro',      sub: 'Generated & ready to send' },
];

// ── Step 1: Upload / ATS Match ───────────────────────────────
function StepMatch() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1100, 1);
      setScore(Math.round(p * 94));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const circ = 2 * Math.PI * 52;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 18, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', background: '#f1f5f9', borderRadius: 10, padding: '10px 14px', width: '100%' }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>📄</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>your_resume.pdf</p>
          <p style={{ fontFamily: SF, fontSize: 10, color: '#16a34a', margin: 0, fontWeight: 600 }}>✓ Uploaded</p>
        </div>
      </div>
      <div style={{ position: 'relative', width: 124, height: 124 }}>
        <svg width="124" height="124" viewBox="0 0 124 124" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="62" cy="62" r="52" fill="none" stroke="#eef2ff" strokeWidth="12" />
          <circle cx="62" cy="62" r="52" fill="none" stroke={INDIGO} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (circ * score) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: SF, fontSize: 30, fontWeight: 900, color: INDIGO, letterSpacing: '-0.04em' }}>{score}%</span>
          <span style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>ATS Match</span>
        </div>
      </div>
      <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: 0, textAlign: 'center', fontWeight: 500 }}>Tailored to beat the resume bots</p>
    </div>
  );
}

// ── Step 2: Curated Dashboard with Parent/Alumni badges ──────
const ROWS = [
  { co: 'Stripe',   role: 'Finance Analyst', badge: 'Alumni',  bc: VIOLET,    logo: 'S' },
  { co: 'Figma',    role: 'Product Intern',  badge: 'Parent',  bc: TEAL_DARK, logo: 'F' },
  { co: 'Notion',   role: 'GTM Associate',   badge: 'Alumni',  bc: VIOLET,    logo: 'N' },
];
function StepDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, padding: 18 }}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: TEXT, margin: '2px 0 2px', letterSpacing: '-0.01em' }}>Your curated matches</p>
      {ROWS.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #eef2f7', borderRadius: 12, padding: '11px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          animation: `hpv-rowin 0.5s ${i * 0.14}s ease both`,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f1f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 15, fontWeight: 800, color: INDIGO, flexShrink: 0 }}>{r.logo}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.co}</p>
            <p style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.role}</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${r.bc}14`, border: `1px solid ${r.bc}33`, borderRadius: 100, padding: '4px 9px', flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.bc }} />
            <span style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: r.bc, whiteSpace: 'nowrap' }}>{r.badge}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 3: Generate Warm Intro ──────────────────────────────
const INTRO_LINES = [
  'Hi Sarah — I’m a junior at UF studying Finance,',
  'and I saw you’re on the analytics team at Stripe.',
  'Would you be open to a quick 15-min chat about',
  'how you got started? Thank you so much!',
];
function StepIntro() {
  const [lines, setLines] = useState(0);
  useEffect(() => {
    setLines(0);
    const ivs = INTRO_LINES.map((_, i) => setTimeout(() => setLines(i + 1), 350 + i * 320));
    return () => ivs.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>SR</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 700, color: TEXT, margin: 0 }}>Sarah R. · Stripe</p>
          <p style={{ fontFamily: SF, fontSize: 10.5, color: VIOLET, margin: 0, fontWeight: 600 }}>UF Alumni · Finance</p>
        </div>
        <span style={{ fontFamily: SF, fontSize: 9.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 100, padding: '3px 8px', whiteSpace: 'nowrap' }}>Warm path</span>
      </div>
      <div style={{ flex: 1, background: '#f8f9ff', border: '1px solid #eef2f7', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {INTRO_LINES.map((ln, i) => (
          <p key={i} style={{
            fontFamily: SF, fontSize: 11.5, color: TEXT2, margin: 0, lineHeight: 1.45,
            opacity: i < lines ? 1 : 0, transform: i < lines ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>{ln}</p>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, fontWeight: 600 }}>✨ Written by your Agent</span>
        <span style={{ fontFamily: SF, fontSize: 11.5, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, borderRadius: 9, padding: '7px 16px', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}>Send →</span>
      </div>
    </div>
  );
}

export default function HeroProductVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // ~1.9s per step => under 6s for the full 3-step loop
    const iv = setInterval(() => setStep(s => (s + 1) % STEPS.length), 1900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <style>{`
        @keyframes hpv-rowin { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hpv-fade { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Browser-chrome framed product card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: SHADOW_LG, border: '1px solid #eef2f7', overflow: 'hidden' }}>
        {/* Chrome bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 14px', borderBottom: '1px solid #f1f5f9', background: '#fbfcfe' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f87171' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontFamily: SF, fontSize: 10.5, fontWeight: 600, color: TEXT3, marginLeft: 8 }}>College Fast Forward</span>
        </div>

        {/* Animated step stage */}
        <div style={{ position: 'relative', height: 320, background: '#ffffff' }}>
          <div key={step} style={{ position: 'absolute', inset: 0, animation: 'hpv-fade 0.45s ease both' }}>
            {step === 0 && <StepMatch />}
            {step === 1 && <StepDashboard />}
            {step === 2 && <StepIntro />}
          </div>
        </div>

        {/* Step indicator footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#fbfcfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: GRAD_INDIGO, flexShrink: 0 }}>
            <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#fff' }}>{step + 1}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{STEPS[step].label}</p>
            <p style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{STEPS[step].sub}</p>
          </div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {STEPS.map((_, i) => (
              <span key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i === step ? INDIGO : '#e2e8f0', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}