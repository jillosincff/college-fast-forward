import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { YEARS, FIELDS, GOALS, getMiniPlan } from './miniPlanTemplates';

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

const TYPE_COLORS = {
  Build: '#0891b2', Prepare: '#6d28d9', Pursue: '#e11d48',
  Practice: '#d97706', Connect: '#059669', Explore: '#4f46e5',
};

const QUESTIONS = [
  { key: 'year', title: 'Where are you right now?', options: YEARS.map(y => y.label) },
  { key: 'field', title: 'What are you interested in?', options: FIELDS },
  { key: 'goal', title: 'What are you trying to get?', options: GOALS.map(g => g.label) },
];

function Pills({ options, value, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onSelect(opt)} style={{
            fontFamily: SF, fontSize: 15, fontWeight: 700,
            color: active ? '#fff' : TEXT2,
            background: active ? GRAD_INDIGO : '#fff',
            border: `1.5px solid ${active ? INDIGO : '#e2e8f0'}`,
            borderRadius: 999, padding: '12px 20px', cursor: 'pointer',
            minHeight: 48, transition: 'all 0.18s ease',
            boxShadow: active ? '0 6px 18px rgba(109,40,217,0.30)' : '0 1px 3px rgba(0,0,0,0.04)',
            touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.color = INDIGO; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = TEXT2; } }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{opt}</button>
        );
      })}
    </div>
  );
}

export default function CareerMiniPlanDemo({ go }) {
  const [step, setStep] = useState(0);            // 0 year · 1 field · 2 goal
  const [answers, setAnswers] = useState({ year: '', field: '', goal: '' });
  const [stage, setStage] = useState('ask');      // 'ask' | 'generating' | 'plan'
  const [plan, setPlan] = useState(null);
  const genRef = useRef(false);                   // double-tap / duplicate-generation guard
  const timerRef = useRef(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) { viewedRef.current = true; track('miniplan_demo_viewed'); }
    return () => clearTimeout(timerRef.current);
  }, []);

  const yearKey = YEARS.find(y => y.label === answers.year)?.key || '';
  const goalKey = GOALS.find(g => g.label === answers.goal)?.key || '';

  const generate = (finalAnswers) => {
    if (genRef.current) return;
    genRef.current = true;
    const yk = YEARS.find(y => y.label === finalAnswers.year)?.key || '';
    const gk = GOALS.find(g => g.label === finalAnswers.goal)?.key || '';
    const result = getMiniPlan(yk, finalAnswers.field, gk);
    setPlan(result);
    setStage('generating');
    track('miniplan_generated', { year: yk, field: finalAnswers.field, goal: gk, template_id: result.templateId });
    timerRef.current = setTimeout(() => setStage('plan'), 1400);
  };

  const select = (key, value) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    track(`miniplan_${key}_selected`, { value });
    if (key === 'year') { setStep(1); return; }
    if (key === 'field') {
      // "Still Exploring" doesn't need a goal — the plan is the exploration itself
      if (value === 'Still Exploring') generate({ ...nextAnswers, goal: '' });
      else setStep(2);
      return;
    }
    generate(nextAnswers);
  };

  const goBack = () => {
    if (step === 2 && stage === 'ask') setStep(1);
    else if (step === 1) setStep(0);
  };

  const restart = () => {
    clearTimeout(timerRef.current);
    genRef.current = false;
    setPlan(null);
    setAnswers({ year: '', field: '', goal: '' });
    setStep(0);
    setStage('ask');
  };

  const claim = () => {
    track('miniplan_cta_clicked', { year: yearKey, field: answers.field, goal: goalKey, template_id: plan?.templateId });
    // Carry selections into onboarding — the student never re-enters them
    try {
      if (yearKey) localStorage.setItem('cff_year', yearKey);
      if (answers.field && answers.field !== 'Still Exploring') localStorage.setItem('cff_industries', JSON.stringify([answers.field]));
      const seekingMap = { internship: 'internship', fulltime: 'fulltime', exploring: 'exploring', build_experience: 'exploring' };
      if (goalKey && seekingMap[goalKey]) localStorage.setItem('cff_seeking', seekingMap[goalKey]);
    } catch {}
    go();
  };

  const q = QUESTIONS[step];
  const contextLabel = [answers.year, answers.field, answers.goal && GOALS.find(g => g.label === answers.goal)?.label]
    .filter(Boolean).join(' • ').toUpperCase();

  return (
    <div style={{ padding: 'clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px)', background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 60%, #f0f9ff 100%)', borderTop: '1px solid #f1f5f9' }}>
      <style>{`
        @keyframes mpShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes mpFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Sparkles size={13} color={INDIGO} />
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Try it — no signup</span>
        </div>

        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 26px' }}>
          See what CLIFF would have you<br />
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>focus on right now.</span>
        </h2>

        {/* ── One question at a time ── */}
        {stage === 'ask' && (
          <div key={step} style={{ animation: 'mpFadeUp 0.35s ease' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 21px)', fontWeight: 800, color: TEXT, margin: '0 0 18px', letterSpacing: '-0.01em' }}>{q.title}</p>
            <Pills options={q.options} value={answers[q.key]} onSelect={(v) => select(q.key, v)} />
            {step > 0 && (
              <button onClick={goBack} style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', marginTop: 20, minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>
        )}

        {/* ── Generating ── */}
        {stage === 'generating' && (
          <div style={{ animation: 'mpFadeUp 0.3s ease', padding: '40px 0' }}>
            <div style={{ width: 30, height: 30, border: '3px solid rgba(109,40,217,0.2)', borderTopColor: INDIGO, borderRadius: '50%', animation: 'mpSpin 0.8s linear infinite', margin: '0 auto 18px' }} />
            <p style={{
              fontFamily: SF, fontSize: 16, fontWeight: 700, margin: 0,
              background: 'linear-gradient(90deg, #6d28d9 25%, #c4b5fd 50%, #6d28d9 75%)',
              backgroundSize: '200% 100%', animation: 'mpShimmer 1.4s linear infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CLIFF is checking your timing against the recruiting calendar…</p>
          </div>
        )}

        {/* ── The mini-plan ── */}
        {stage === 'plan' && plan && (
          <div style={{ animation: 'mpFadeUp 0.45s ease', maxWidth: 540, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SF, fontSize: 12, fontWeight: 700, color: GREEN, background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.22)', borderRadius: 100, padding: '6px 14px', marginBottom: 12 }}>
                🟢 {plan.fallback ? 'Here\u2019s a starting point:' : 'Done. Here\u2019s your focus for this month.'}
              </span>
              <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 19px)', fontWeight: 900, color: INDIGO, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                {contextLabel}
              </p>
              {plan.fallback && (
                <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, color: TEXT, margin: '10px 0 0' }}>
                  I can build a more accurate plan after learning a little more about you.
                </p>
              )}
              {plan.timingNote && (
                <p style={{ fontFamily: SF, fontSize: 13, color: TEXT2, margin: '10px auto 0', maxWidth: 440, lineHeight: 1.55 }}>{plan.timingNote}</p>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 20, padding: 'clamp(18px, 5vw, 26px)', boxShadow: '0 12px 36px rgba(109,40,217,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {plan.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, animation: `mpFadeUp 0.4s ease ${0.12 * i}s both` }}>
                  <span style={{ fontFamily: SF, fontSize: 15, fontWeight: 900, color: INDIGO, flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(109,40,217,0.08)', borderRadius: 8, marginTop: 1 }}>{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 16px)', fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{it.title}</p>
                      <span style={{ fontFamily: SF, fontSize: 10, fontWeight: 800, color: TYPE_COLORS[it.type] || INDIGO, background: `${TYPE_COLORS[it.type] || INDIGO}14`, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{it.type}</span>
                      {it.time && <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: TEXT3, flexShrink: 0 }}>{it.time}</span>}
                    </div>
                    <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: '0 0 6px', lineHeight: 1.55 }}>{it.text}</p>
                    <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: 0, lineHeight: 1.5 }}>
                      <strong style={{ color: TEXT2, fontWeight: 700 }}>Why now:</strong> {it.why}
                    </p>
                  </div>
                </div>
              ))}

              {plan.networkingNote && (
                <p style={{ fontFamily: SF, fontSize: 12.5, color: TEXT3, margin: 0, lineHeight: 1.55, fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>{plan.networkingNote}</p>
              )}
            </div>

            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, color: TEXT, textAlign: 'center', margin: '16px 0 0' }}>
              {plan.reassurance}
            </p>

            {/* ── Transition into signup ── */}
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 21px)', fontWeight: 900, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                This is the general version.{' '}
                <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your full plan gets personal.</span>
              </p>
              <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: '0 auto 18px', maxWidth: 420, lineHeight: 1.6 }}>
                CLIFF uses your school, graduation timing, location, resume, goals, and preferences to turn this into a living career plan.
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
              >Build My Full Plan →</button>
              <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: TEXT2, margin: '12px 0 0' }}>
                About 2 minutes · mostly taps · CLIFF does the rest
              </p>
              <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '6px 0 0' }}>Free to start. No card required.</p>
              <button onClick={restart} style={{ fontFamily: SF, fontSize: 12, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, minHeight: 44, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Try a different combination
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}