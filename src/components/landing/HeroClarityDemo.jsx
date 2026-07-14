import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const VIOLET = '#7c3aed';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

const CHAOS_JOBS = [
  'Marketing Intern', 'Sales Dev Rep', 'Data Analyst', 'Brand Intern', 'BizOps Intern',
  'Account Exec', 'Product Intern', 'Finance Analyst', 'HR Coordinator', 'Ops Associate',
  'Growth Intern', 'Sales Intern', 'UX Research', 'Supply Chain', 'Consulting Analyst',
];

// Stage 0: the chaos — too many listings
function StageChaos() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 18, gap: 12 }}>
      <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: TEXT, margin: 0 }}>
        42 new matches found <span style={{ color: '#f43f5e', fontWeight: 700 }}>· way too many</span>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, opacity: 0.85 }}>
        {CHAOS_JOBS.map((j, i) => (
          <span key={j} style={{
            fontFamily: SF, fontSize: 10.5, fontWeight: 600, color: TEXT3,
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 100, padding: '5px 11px',
            animation: `hcd-rowin 0.4s ${i * 0.05}s ease both`,
          }}>{j}</span>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: '#f5f3ff', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 10, padding: '9px 12px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: INDIGO, animation: 'hcd-pulse 1s ease-in-out infinite' }} />
        <span style={{ fontFamily: SF, fontSize: 11.5, fontWeight: 700, color: INDIGO }}>CLIFF is sorting these for you…</span>
      </div>
    </div>
  );
}

// Stage 1: clarity — 3 best moves today
const MOVES = [
  { icon: '🏃', title: 'Apply to Nike', sub: 'Marketing Intern · resume tailored', tag: 'Alumni at Nike', tc: VIOLET },
  { icon: '📄', title: 'Review tailored resume', sub: 'Figma Product Intern · ready in 2 min' },
  { icon: '📬', title: 'Follow up with Deloitte', sub: 'Scheduled for tomorrow, 9:00 AM' },
];
function StageMoves() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 18, gap: 9 }}>
      <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: TEXT, margin: '0 0 2px', lineHeight: 1.4 }}>
        CLIFF narrowed <span style={{ color: INDIGO }}>42 matches</span> to your <span style={{ color: INDIGO }}>3 best moves</span> today.
      </p>
      {MOVES.map((m, i) => (
        <div key={m.title} style={{
          display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #eef2f7',
          borderRadius: 12, padding: '10px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          animation: `hcd-rowin 0.5s ${0.15 + i * 0.16}s ease both`,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{m.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
            <p style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.sub}</p>
          </div>
          {m.tag && (
            <span style={{ fontFamily: SF, fontSize: 9.5, fontWeight: 700, color: m.tc, background: `${m.tc}14`, border: `1px solid ${m.tc}33`, borderRadius: 100, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{m.tag}</span>
          )}
        </div>
      ))}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 7, animation: 'hcd-rowin 0.5s 0.7s ease both' }}>
        <span style={{ fontSize: 12 }}>🧠</span>
        <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: TEXT2, fontStyle: 'italic' }}>I filtered out sales roles like you asked.</span>
      </div>
    </div>
  );
}

// Stage 2: everything prepared
const DONE = [
  { t: 'Resume prepared', s: 'Tailored for Nike · 94% match' },
  { t: 'Application ready', s: 'One tap to review & send' },
  { t: 'Follow-up scheduled', s: 'Deloitte · tomorrow 9:00 AM' },
];
function StageReady() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 18, gap: 10, justifyContent: 'center' }}>
      {DONE.map((d, i) => (
        <div key={d.t} style={{
          display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #eef2f7',
          borderRadius: 12, padding: '13px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          animation: `hcd-rowin 0.5s ${i * 0.18}s ease both`,
        }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 800 }}>✓</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{d.t}</p>
            <p style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, margin: 0 }}>{d.s}</p>
          </div>
        </div>
      ))}
      <p style={{ fontFamily: SF, fontSize: 11.5, fontWeight: 700, color: INDIGO, margin: '4px 0 0', textAlign: 'center', animation: 'hcd-rowin 0.5s 0.6s ease both' }}>
        You just do the next move. CLIFF handles the rest.
      </p>
    </div>
  );
}

const STEPS = [
  { label: 'Too many jobs', sub: '42 matches — where do you even start?' },
  { label: "Today's best moves", sub: 'CLIFF picks what\u2019s worth your time' },
  { label: 'Everything prepared', sub: 'Resume, application & follow-up ready' },
];

export default function HeroClarityDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % STEPS.length), 3200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <style>{`
        @keyframes hcd-rowin { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hcd-fade { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes hcd-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: SHADOW_LG, border: '1px solid #eef2f7', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 14px', borderBottom: '1px solid #f1f5f9', background: '#fbfcfe' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f87171' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#34d399' }} />
          <span style={{ fontFamily: SF, fontSize: 10.5, fontWeight: 600, color: TEXT3, marginLeft: 8 }}>College Fast Forward</span>
        </div>
        <div style={{ position: 'relative', height: 300, background: '#fdfdff' }}>
          <div key={step} style={{ position: 'absolute', inset: 0, animation: 'hcd-fade 0.45s ease both' }}>
            {step === 0 && <StageChaos />}
            {step === 1 && <StageMoves />}
            {step === 2 && <StageReady />}
          </div>
        </div>
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