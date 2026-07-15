import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const track = (eventName, properties = {}) => {
  try { base44.analytics.track({ eventName, properties }); } catch {}
};

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const GREEN = '#059669';

const YEARS = [
  { label: 'Freshman', key: 'freshman' },
  { label: 'Sophomore', key: 'sophomore' },
  { label: 'Junior', key: 'junior' },
  { label: 'Senior', key: 'senior' },
  { label: 'Recent Grad', key: 'recent_grad' },
];

const INTERESTS = ['Tech', 'Marketing', 'Finance', 'Healthcare', 'Business', 'Still Exploring'];

const CHECKLISTS = {
  freshman: [
    { icon: '🧭', bold: 'Step 1:', text: "Join your school's major-specific clubs or associations." },
    { icon: '🛠️', bold: 'Step 2:', text: 'Build one independent side project to start your resume.' },
    { icon: '😌', bold: 'Step 3:', text: 'Take a breath. Do not worry about high-stakes internships yet.' },
  ],
  mid: [
    { icon: '🔥', bold: 'Step 1:', text: 'Build your target list of 20 companies before fall recruiting.' },
    { icon: '📄', bold: 'Step 2:', text: 'Clean up your resume and LinkedIn profile before applications open.' },
    { icon: '🤝', bold: 'Step 3:', text: 'Start practicing mock interviews now — not after you get one.' },
  ],
  senior: [
    { icon: '🚀', bold: 'Step 1:', text: 'Lock in your referral network; cold outreach to alumni on LinkedIn.' },
    { icon: '🎯', bold: 'Step 2:', text: 'Apply to at least 3 target opportunities every week.' },
    { icon: '💡', bold: 'Step 3:', text: 'Optimize your portfolio/GitHub/case studies for recruiter reviews.' },
  ],
};

const pickChecklist = (yearKey, interest) => {
  if (yearKey === 'freshman' || interest === 'Still Exploring') return CHECKLISTS.freshman;
  if (yearKey === 'senior' || yearKey === 'recent_grad') return CHECKLISTS.senior;
  return CHECKLISTS.mid;
};

function PillRow({ label, options, value, onSelect }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: TEXT2, margin: '0 0 10px', letterSpacing: '0.02em' }}>{label}</p>
      <div className="jd-pill-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((opt) => {
          const active = value === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt.label)}
              style={{
                fontFamily: SF, fontSize: 14, fontWeight: 700,
                color: active ? '#fff' : TEXT2,
                background: active ? GRAD_INDIGO : '#fff',
                border: `1.5px solid ${active ? INDIGO : '#e2e8f0'}`,
                borderRadius: 999, padding: '10px 18px', cursor: 'pointer',
                minHeight: 44, whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: active ? '0 6px 18px rgba(109,40,217,0.30)' : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.color = INDIGO; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = TEXT2; } }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >{opt.label}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function JourneyDemo({ go }) {
  const [year, setYear] = useState('');
  const [interest, setInterest] = useState('');
  const [stage, setStage] = useState('select'); // 'select' | 'planning' | 'plan'
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const maybeStart = (nextYear, nextInterest) => {
    if (nextYear && nextInterest && stage === 'select') {
      track('journey_demo_completed', { year: nextYear, interest: nextInterest });
      setStage('planning');
      timerRef.current = setTimeout(() => setStage('plan'), 1500);
    }
  };

  const selectYear = (y) => { setYear(y); maybeStart(y, interest); };
  const selectInterest = (i) => { setInterest(i); maybeStart(year, i); };

  const yearKey = YEARS.find((y) => y.label === year)?.key || '';
  const checklist = pickChecklist(yearKey, interest);

  const claim = () => {
    track('journey_demo_cta_clicked', { year: yearKey, interest });
    // Pre-populate the onboarding flow with these answers
    try {
      if (yearKey) localStorage.setItem('cff_year', yearKey);
      if (interest && interest !== 'Still Exploring') localStorage.setItem('cff_industries', JSON.stringify([interest]));
    } catch {}
    go();
  };

  return (
    <div style={{ padding: 'clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px)', background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 60%, #f0f9ff 100%)', borderTop: '1px solid #f1f5f9' }}>
      <style>{`
        @keyframes jdShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes jdFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .jd-pill-row { flex-wrap: nowrap !important; overflow-x: auto !important; justify-content: flex-start !important; padding: 2px 4px 6px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .jd-pill-row::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Sparkles size={13} color={INDIGO} />
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Try it — no signup</span>
        </div>

        {/* ── STATE 1: Micro-assessment ── */}
        {stage === 'select' && (
          <div style={{ animation: 'jdFadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 24px' }}>
              Where are you in your journey?
            </h2>
            <PillRow label="What year are you?" options={YEARS} value={year} onSelect={selectYear} />
            <PillRow label="What are you interested in?" options={INTERESTS.map((i) => ({ label: i }))} value={interest} onSelect={selectInterest} />
          </div>
        )}

        {/* ── TRANSITION: CLIFF is planning ── */}
        {stage === 'planning' && (
          <div style={{ animation: 'jdFadeUp 0.35s ease', padding: '48px 0' }}>
            <div style={{ width: 30, height: 30, border: '3px solid rgba(109,40,217,0.2)', borderTopColor: INDIGO, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
            <p style={{
              fontFamily: SF, fontSize: 16, fontWeight: 700, margin: 0,
              background: 'linear-gradient(90deg, #6d28d9 25%, #c4b5fd 50%, #6d28d9 75%)',
              backgroundSize: '200% 100%', animation: 'jdShimmer 1.4s linear infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CLIFF is analyzing your timeline…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── STATE 2: Personalized action plan ── */}
        {stage === 'plan' && (
          <div style={{ animation: 'jdFadeUp 0.45s ease', maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SF, fontSize: 12, fontWeight: 700, color: GREEN, background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.22)', borderRadius: 100, padding: '6px 14px', marginBottom: 12 }}>
                🟢 Done. Here is your focus for this month:
              </span>
              <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 900, color: INDIGO, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                {year} • {interest}
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 20, padding: 'clamp(18px, 5vw, 26px)', boxShadow: '0 12px 36px rgba(109,40,217,0.12)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {checklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, animation: `jdFadeUp 0.4s ease ${0.12 * i}s both` }}>
                  <span style={{ fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.8vw, 15px)', color: TEXT2, margin: 0, lineHeight: 1.55 }}>
                    <strong style={{ color: TEXT, fontWeight: 800 }}>{item.bold}</strong> {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: '0 0 14px', fontStyle: 'italic' }}>
                Plus CLIFF has unlocked 3 templates & 12 direct alumni routes for you.
              </p>
              <button onClick={claim} style={{
                fontFamily: SF, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD_INDIGO,
                border: 'none', borderRadius: 999, padding: '16px 40px', cursor: 'pointer', minHeight: 56,
                boxShadow: '0 12px 32px rgba(109,40,217,0.35)', transition: 'all 0.2s ease',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              >Claim Your Free Plan →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}