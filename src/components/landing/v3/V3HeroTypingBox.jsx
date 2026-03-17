import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DEMO_SCENARIOS, { getRandomAlumniNames } from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import V3SchoolSelector from './V3SchoolSelector';
import { getSchoolAccent, setAccentVars } from './schoolAccents';

const dmSans = '"DM Sans", system-ui, sans-serif';

const TYPING_SPEED = 30;
const THINK_DURATION = 1000;
const CARD_STAGGER = 700;

const SCENARIO_CHIPS = [
  { label: 'Consulting at Deloitte', idx: 0 },
  { label: 'Engineering at Google', idx: 1 },
  { label: 'Banking at Goldman', idx: 2 },
  { label: 'Tech sales path', idx: 4 },
];

// Build resolved scenario data with randomized alumni names
function resolveScenario(scenario, schoolName) {
  const names = getRandomAlumniNames(scenario.alumniRoles.length);
  const alumni = scenario.alumniRoles.map((r, i) => ({
    name: names[i],
    company: r.company,
    role: r.role,
    year: r.year,
  }));
  const firstAlumni = alumni[0];
  const body = scenario.outreach.bodyTemplate(schoolName, firstAlumni.name);
  return {
    ...scenario,
    alumni,
    outreach: {
      to: firstAlumni.name.split(' ')[0],
      toFull: firstAlumni.name,
      company: scenario.outreach.company,
      from: scenario.outreach.from,
      body,
    },
  };
}

export default function V3HeroTypingBox() {
  const [selectedSchool, setSelectedSchool] = useState('University of Florida');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [displayedText, setDisplayedText] = useState('');
  const [resolvedData, setResolvedData] = useState(null);
  const timerRef = useRef(null);
  const typingRef = useRef(null);

  const accent = getSchoolAccent(selectedSchool);
  const scenario = DEMO_SCENARIOS[scenarioIdx];

  useEffect(() => { setAccentVars(selectedSchool); }, [selectedSchool]);

  const clearAllTimers = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(typingRef.current);
  }, []);

  const runDemo = useCallback((scIdx, school) => {
    clearAllTimers();
    setDisplayedText('');
    setPhase('typing');
    const sc = DEMO_SCENARIOS[scIdx];
    const text = sc.promptTemplate(school);
    // Resolve new randomized data
    setResolvedData(resolveScenario(sc, school));
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
        typingRef.current = setTimeout(type, TYPING_SPEED);
      } else {
        timerRef.current = setTimeout(() => setPhase('thinking'), 300);
      }
    };
    type();
  }, [clearAllTimers]);

  useEffect(() => {
    if (phase === 'thinking') timerRef.current = setTimeout(() => setPhase('companies'), THINK_DURATION);
    else if (phase === 'companies') timerRef.current = setTimeout(() => setPhase('alumni'), CARD_STAGGER);
    else if (phase === 'alumni') timerRef.current = setTimeout(() => setPhase('outreach'), CARD_STAGGER);
    else if (phase === 'outreach') timerRef.current = setTimeout(() => setPhase('done'), CARD_STAGGER);
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  useEffect(() => { runDemo(0, selectedSchool); }, []);

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

  const showCompanies = ['companies', 'alumni', 'outreach', 'done'].includes(phase);
  const showAlumni = ['alumni', 'outreach', 'done'].includes(phase);
  const showOutreach = ['outreach', 'done'].includes(phase);
  const isThinking = phase === 'thinking';
  const isDone = phase === 'done';

  return (
    <div className="max-w-2xl mx-auto">
      <V3SchoolSelector selectedSchool={selectedSchool} onSelect={handleSchoolChange} accent={accent} />

      {/* Input box */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDone ? accent.border : '#1F1F23'}`,
          borderRadius: 20, padding: '22px 24px',
          boxShadow: isDone ? `0 8px 48px rgba(0,0,0,0.5), 0 0 20px ${accent.glow}` : '0 8px 48px rgba(0,0,0,0.4)',
          marginBottom: 16,
          transition: 'border-color 0.6s, box-shadow 0.6s',
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
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Interactive demo</span>
        </div>
        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#fff', lineHeight: 1.6, margin: 0 }}>
          {displayedText}
          {phase === 'typing' && <span className="inline-block w-[2px] h-[18px] bg-white/60 ml-0.5 align-text-bottom" style={{ animation: 'blink 0.9s infinite' }} />}
        </p>
      </div>

      {/* Thinking */}
      <div style={{ height: isThinking ? 44 : 0, opacity: isThinking ? 1 : 0, overflow: 'hidden', transition: 'height 0.3s, opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: isThinking ? 12 : 0 }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: accent.primary, opacity: 0.6, animation: `pulse-dot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
          ))}
        </div>
        <span style={{ fontFamily: dmSans, fontSize: 13, color: '#A1A1AA' }}>
          Analyzing {selectedSchool} alumni network…
        </span>
      </div>

      {/* Output cards */}
      {resolvedData && (
        <div className="flex flex-col gap-3">
          <CompaniesCard companies={resolvedData.companies} visible={showCompanies} accent={accent} hasAsterisk={resolvedData.hasAsterisk} />
          <AlumniCard alumni={resolvedData.alumni} visible={showAlumni} schoolName={selectedSchool} accent={accent} />
          <OutreachCard outreach={resolvedData.outreach} visible={showOutreach} schoolName={selectedSchool} accent={accent} />
        </div>
      )}

      {/* Microcopy */}
      <div className="text-center mt-6" style={{ opacity: isDone ? 1 : 0, transform: isDone ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.5s 0.3s, transform 0.5s 0.3s' }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: accent.primary }}>who to contact</span> and{' '}
          <span style={{ color: accent.primary }}>what to say</span>.
        </p>
      </div>

      {/* Scenario chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6" style={{ opacity: isDone ? 1 : 0, transition: 'opacity 0.4s 0.5s' }}>
        {SCENARIO_CHIPS.map((chip) => {
          const isActive = chip.idx === scenarioIdx;
          return (
            <button
              key={chip.idx}
              onClick={() => switchScenario(chip.idx)}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = accent.border; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#1F1F23'; }}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                color: isActive ? accent.primary : '#A1A1AA',
                background: isActive ? accent.soft : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? accent.border : '#1F1F23'}`,
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
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.3);opacity:1} }
      `}</style>
    </div>
  );
}