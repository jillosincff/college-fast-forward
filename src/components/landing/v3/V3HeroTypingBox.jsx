import React, { useState, useEffect, useRef, useCallback } from 'react';
import DEMO_SCENARIOS, { getRandomAlumniNames } from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import V3SchoolSelector from './V3SchoolSelector';
import { getSchoolAccent, setAccentVars } from './schoolAccents';

const dmSans = '"DM Sans", system-ui, sans-serif';
const TYPING_SPEED = 30;

const SCENARIO_CHIPS = [
  { label: 'Marketing at Nike', idx: 0 },
  { label: 'Data Science at Stripe', idx: 1 },
  { label: 'Pre-med → Consulting', idx: 2 },
  { label: 'Comms → Tech', idx: 4 },
];

const THINKING_STEPS = [
  { key: 'think_companies', msg: 'Finding target companies…', dur: 800 },
  { key: 'think_alumni',    msg: 'Identifying alumni…',       dur: 750 },
  { key: 'think_outreach',  msg: 'Drafting outreach…',        dur: 700 },
];

function resolveScenario(scenario, schoolName) {
  const names = getRandomAlumniNames(scenario.alumniRoles.length);
  const alumni = scenario.alumniRoles.map((r, i) => ({
    name: names[i], company: r.company, role: r.role, year: r.year,
  }));
  const firstAlumni = alumni[0];
  return {
    ...scenario,
    alumni,
    outreach: {
      to: firstAlumni.name.split(' ')[0],
      toFull: firstAlumni.name,
      company: scenario.outreach.company,
      from: scenario.outreach.from,
      body: scenario.outreach.bodyTemplate(schoolName, firstAlumni.name),
    },
  };
}

/* ── Skeleton shown before first paint ─────────────── */
function DemoSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ width: 180, height: 32, borderRadius: 100, background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '22px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 80, height: 14, borderRadius: 4, background: '#E5E7EB' }} />
          <div className="flex-1" />
          <div style={{ width: 80, height: 10, borderRadius: 4, background: '#F3F4F6' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="demo-skel" style={{ width: '85%', height: 14, borderRadius: 4, background: '#E5E7EB' }} />
          <div className="demo-skel" style={{ width: '55%', height: 14, borderRadius: 4, background: '#F3F4F6', animationDelay: '0.15s' }} />
        </div>
      </div>
      <style>{`.demo-skel{animation:demoShimmer 1.5s ease-in-out infinite}@keyframes demoShimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

/* ── Main component ────────────────────────────────── */
export default function V3HeroTypingBox() {
  const [selectedSchool, setSelectedSchool] = useState('University of Florida');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [resolvedData, setResolvedData] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Animation state
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('idle');          // idle | typing | thinking | companies | alumni | outreach | done
  const [thinkMsg, setThinkMsg] = useState('');

  const timerRef = useRef(null);
  const typingRef = useRef(null);
  const mountedRef = useRef(false);

  const accent = getSchoolAccent(selectedSchool);
  useEffect(() => { setAccentVars(selectedSchool); }, [selectedSchool]);

  const clearTimers = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(typingRef.current);
  }, []);

  /* ── Orchestrated demo sequence ───────────────────── */
  const runDemo = useCallback((scIdx, school) => {
    clearTimers();
    setDisplayedText('');
    setResolvedData(null);
    setPhase('idle');
    setThinkMsg('');

    const sc = DEMO_SCENARIOS[scIdx];
    const text = sc.promptTemplate(school);
    const data = resolveScenario(sc, school);

    // Use rAF to ensure clean slate before starting
    requestAnimationFrame(() => {
      setResolvedData(data);
      setPhase('typing');

      // Step 1: Type prompt
      let i = 0;
      const typeChar = () => {
        if (i <= text.length) {
          setDisplayedText(text.slice(0, i));
          i++;
          typingRef.current = setTimeout(typeChar, TYPING_SPEED);
        } else {
          // Step 2: Pause, then run thinking → reveal sequence
          timerRef.current = setTimeout(() => runThinkingSequence(0), 800);
        }
      };
      typeChar();

      function runThinkingSequence(stepIdx) {
        if (stepIdx >= THINKING_STEPS.length) {
          // All cards revealed — done
          timerRef.current = setTimeout(() => setPhase('done'), 200);
          return;
        }
        const step = THINKING_STEPS[stepIdx];
        setPhase('thinking');
        setThinkMsg(step.msg);

        timerRef.current = setTimeout(() => {
          // Reveal the card for this step
          const cardPhase = step.key.replace('think_', '');
          setPhase(cardPhase);

          // Stagger: wait, then move to next thinking step
          timerRef.current = setTimeout(() => {
            runThinkingSequence(stepIdx + 1);
          }, 300);
        }, step.dur);
      }
    });
  }, [clearTimers]);

  // Mount: skeleton → reveal → start
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const t = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => runDemo(0, 'University of Florida'), 120);
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const switchScenario = useCallback((idx) => {
    if (idx === scenarioIdx && phase === 'done') return;
    setScenarioIdx(idx);
    runDemo(idx, selectedSchool);
  }, [scenarioIdx, phase, runDemo, selectedSchool]);

  const handleSchoolChange = useCallback((school) => {
    if (!school) return;
    setSelectedSchool(school);
    runDemo(scenarioIdx, school);
  }, [scenarioIdx, runDemo]);

  // Derived visibility — cards stay visible once revealed
  const PHASE_ORDER = ['idle', 'typing', 'thinking', 'companies', 'alumni', 'outreach', 'done'];
  const phaseGte = (target) => PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target);
  const showCompanies = phaseGte('companies');
  const showAlumni    = phaseGte('alumni');
  const showOutreach  = phaseGte('outreach');
  const isThinking    = phase === 'thinking';
  const isDone        = phase === 'done';

  if (!isReady) return <DemoSkeleton />;

  return (
    <div className="max-w-2xl mx-auto" style={{ animation: 'demoFadeIn 0.4s ease-out' }}>
      <V3SchoolSelector selectedSchool={selectedSchool} onSelect={handleSchoolChange} accent={accent} />

      {/* ── White input box ─────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 18, padding: '22px 24px',
          boxShadow: isDone
            ? `0 10px 40px rgba(0,0,0,0.3), 0 0 20px ${accent.glow}`
            : '0 10px 40px rgba(0,0,0,0.3)',
          marginBottom: 16,
          transition: 'box-shadow 0.6s',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
            </svg>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: accent.primary, letterSpacing: '0.04em' }}>FASTIQ</span>
          </div>
          <div className="flex-1" />
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>Guided demo</span>
        </div>
        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#111111', lineHeight: 1.6, margin: 0 }}>
          {displayedText || <span style={{ color: 'rgba(0,0,0,0.25)' }}>Describe your goal...</span>}
          {phase === 'typing' && displayedText && (
            <span className="inline-block w-[2px] h-[18px] ml-0.5 align-text-bottom" style={{ background: 'rgba(0,0,0,0.45)', animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* ── Thinking indicator ─────────────────────── */}
      <div style={{
        height: isThinking ? 40 : 0,
        opacity: isThinking ? 1 : 0,
        overflow: 'hidden',
        transition: 'height 0.25s, opacity 0.25s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        marginBottom: isThinking ? 12 : 0,
      }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, animation: `pulseDot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
          ))}
        </div>
        <span key={thinkMsg} style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', animation: 'fadeUp 0.25s ease' }}>
          {thinkMsg}
        </span>
      </div>

      {/* ── Dark result cards ──────────────────────── */}
      {resolvedData && (
        <div className="flex flex-col gap-3">
          <CompaniesCard companies={resolvedData.companies} visible={showCompanies} accent={accent} hasAsterisk={resolvedData.hasAsterisk} />
          <AlumniCard alumni={resolvedData.alumni} visible={showAlumni} schoolName={selectedSchool} accent={accent} />
          <OutreachCard outreach={resolvedData.outreach} visible={showOutreach} schoolName={selectedSchool} accent={accent} />
        </div>
      )}

      {/* ── Proof line ─────────────────────────────── */}
      <div className="text-center mt-6" style={{ opacity: isDone ? 1 : 0, transform: isDone ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.5s 0.2s, transform 0.5s 0.2s' }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: accent.primary }}>who to contact</span> and{' '}
          <span style={{ color: accent.primary }}>what to say</span>.
        </p>
      </div>

      {/* ── Scenario chips ─────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mt-6" style={{ opacity: (isDone || phase === 'typing') ? 1 : 0.35, transition: 'opacity 0.4s' }}>
        {SCENARIO_CHIPS.map((chip) => {
          const isActive = chip.idx === scenarioIdx;
          return (
            <button
              key={chip.idx}
              onClick={() => switchScenario(chip.idx)}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = accent.border; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#23252B'; }}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                color: isActive ? accent.primary : '#71717A',
                background: isActive ? accent.soft : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? accent.border : '#23252B'}`,
                borderRadius: 100, padding: '8px 16px',
                cursor: 'pointer', transition: 'all 0.2s',
                minHeight: 'auto', minWidth: 'auto', width: 'auto',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.3);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes msgFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes demoFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}