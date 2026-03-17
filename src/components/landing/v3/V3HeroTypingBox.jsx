import React, { useState, useEffect, useRef, useCallback } from 'react';
import DEMO_SCENARIOS from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import V3SchoolSelector from './V3SchoolSelector';

const dmSans = '"DM Sans", system-ui, sans-serif';

const TYPING_SPEED = 30;
const THINK_DURATION = 1000;
const CARD_STAGGER = 700;
const DONE_PAUSE = 8000;

const SCENARIO_CHIPS = [
  { label: 'Consulting at Deloitte', idx: 0 },
  { label: 'Marketing at Nike', idx: 1 },
  { label: 'Finance target list', idx: 2 },
  { label: 'Tech sales path', idx: 4 },
];

// Phases: typing → thinking → companies → alumni → outreach → done
// "done" stays visible indefinitely until user switches scenario

export default function V3HeroTypingBox() {
  const [selectedSchool, setSelectedSchool] = useState('University of Michigan');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef(null);
  const typingRef = useRef(null);

  const schoolName = selectedSchool;
  const scenario = DEMO_SCENARIOS[scenarioIdx];

  // Clear all pending timers
  const clearAllTimers = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(typingRef.current);
  }, []);

  // Start the typing animation for the current scenario
  const runDemo = useCallback((text) => {
    clearAllTimers();
    setDisplayedText('');
    setPhase('typing');

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

  // Phase progression: thinking → companies → alumni → outreach → done
  useEffect(() => {
    if (phase === 'thinking') {
      timerRef.current = setTimeout(() => setPhase('companies'), THINK_DURATION);
    } else if (phase === 'companies') {
      timerRef.current = setTimeout(() => setPhase('alumni'), CARD_STAGGER);
    } else if (phase === 'alumni') {
      timerRef.current = setTimeout(() => setPhase('outreach'), CARD_STAGGER);
    } else if (phase === 'outreach') {
      timerRef.current = setTimeout(() => setPhase('done'), CARD_STAGGER);
    }
    // "done" phase: stay visible, no auto-advance
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  // Auto-start on mount
  useEffect(() => {
    runDemo(DEMO_SCENARIOS[0].prompt);
  }, []);

  // When scenario changes (from chip click), restart
  const switchScenario = useCallback((idx) => {
    if (idx === scenarioIdx && phase === 'done') return; // already showing
    setScenarioIdx(idx);
    runDemo(DEMO_SCENARIOS[idx].prompt);
  }, [scenarioIdx, phase, runDemo]);

  // When school changes, replay current scenario
  const handleSchoolChange = useCallback((school) => {
    if (!school) return;
    setSelectedSchool(school);
    // Re-run current scenario with new school (cards will auto-update via prop)
    runDemo(scenario.prompt);
  }, [scenario.prompt, runDemo]);

  const showCompanies = ['companies', 'alumni', 'outreach', 'done'].includes(phase);
  const showAlumni = ['alumni', 'outreach', 'done'].includes(phase);
  const showOutreach = ['outreach', 'done'].includes(phase);
  const isThinking = phase === 'thinking';
  const isDone = phase === 'done';

  return (
    <div className="max-w-2xl mx-auto">
      {/* School selector chip */}
      <V3SchoolSelector selectedSchool={selectedSchool} onSelect={handleSchoolChange} />

      {/* Input box */}
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 20, padding: '22px 24px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
          marginBottom: 16,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
            </svg>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20', letterSpacing: '0.04em' }}>FASTIQ</span>
          </div>
          <div className="flex-1" />
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Interactive demo</span>
        </div>

        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#fff', lineHeight: 1.6, margin: 0 }}>
          {displayedText}
          {phase === 'typing' && (
            <span className="inline-block w-[2px] h-[18px] bg-white/70 ml-0.5 align-text-bottom" style={{ animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* Thinking indicator */}
      <div
        style={{
          height: isThinking ? 44 : 0, opacity: isThinking ? 1 : 0,
          overflow: 'hidden', transition: 'height 0.3s, opacity 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginBottom: isThinking ? 12 : 0,
        }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20', opacity: 0.6, animation: `pulse-dot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
          ))}
        </div>
        <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Analyzing {schoolName} alumni network…
        </span>
      </div>

      {/* Output cards — always rendered, visibility controlled by phase */}
      <div className="flex flex-col gap-3">
        <CompaniesCard companies={scenario.companies} visible={showCompanies} />
        <AlumniCard alumni={scenario.alumni} visible={showAlumni} schoolName={schoolName} />
        <OutreachCard outreach={scenario.outreach} visible={showOutreach} schoolName={schoolName} />
      </div>

      {/* Bottom microcopy */}
      <div
        className="text-center mt-6"
        style={{
          opacity: isDone ? 1 : 0,
          transform: isDone ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s 0.3s, transform 0.5s 0.3s',
        }}
      >
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: '#E85D20' }}>who to contact</span> and{' '}
          <span style={{ color: '#E85D20' }}>what to say</span>.
        </p>
      </div>

      {/* Scenario switcher chips */}
      <div
        className="flex flex-wrap justify-center gap-2 mt-6"
        style={{
          opacity: isDone ? 1 : 0,
          transition: 'opacity 0.4s 0.5s',
        }}
      >
        {SCENARIO_CHIPS.map((chip) => {
          const isActive = chip.idx === scenarioIdx;
          return (
            <button
              key={chip.idx}
              onClick={() => switchScenario(chip.idx)}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                color: isActive ? '#E85D20' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(232,93,32,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? 'rgba(232,93,32,0.35)' : 'rgba(255,255,255,0.12)'}`,
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