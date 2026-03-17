import React, { useState, useEffect, useRef, useCallback } from 'react';
import DEMO_SCENARIOS from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import V3SchoolSelector from './V3SchoolSelector';

const dmSans = '"DM Sans", system-ui, sans-serif';

const PHASE_TYPING    = 'typing';
const PHASE_THINKING  = 'thinking';
const PHASE_COMPANIES = 'companies';
const PHASE_ALUMNI    = 'alumni';
const PHASE_OUTREACH  = 'outreach';
const PHASE_DONE      = 'done';
const PHASE_IDLE      = 'idle';

const TYPING_SPEED = 35;
const THINK_DURATION = 1400;
const COMPANY_REVEAL = 900;
const ALUMNI_REVEAL = 1000;
const OUTREACH_REVEAL = 1100;
const PAUSE_AFTER = 6000;

export default function V3HeroTypingBox() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState(PHASE_IDLE);
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef(null);
  const hasStartedRef = useRef(false);

  const schoolName = selectedSchool || 'University of Florida';
  const scenario = DEMO_SCENARIOS[scenarioIdx];

  // When school is selected, start the demo
  useEffect(() => {
    if (selectedSchool && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startTyping();
    }
  }, [selectedSchool]);

  // Also auto-start after 4 seconds if no school selected
  useEffect(() => {
    const autoStart = setTimeout(() => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        startTyping();
      }
    }, 4000);
    return () => clearTimeout(autoStart);
  }, []);

  const startTyping = useCallback(() => {
    const text = scenario.prompt;
    let i = 0;
    setDisplayedText('');
    setPhase(PHASE_TYPING);

    const type = () => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
        timerRef.current = setTimeout(type, TYPING_SPEED);
      } else {
        timerRef.current = setTimeout(() => setPhase(PHASE_THINKING), 400);
      }
    };
    type();
  }, [scenario.prompt]);

  useEffect(() => {
    if (phase === PHASE_THINKING) {
      timerRef.current = setTimeout(() => setPhase(PHASE_COMPANIES), THINK_DURATION);
    } else if (phase === PHASE_COMPANIES) {
      timerRef.current = setTimeout(() => setPhase(PHASE_ALUMNI), COMPANY_REVEAL);
    } else if (phase === PHASE_ALUMNI) {
      timerRef.current = setTimeout(() => setPhase(PHASE_OUTREACH), ALUMNI_REVEAL);
    } else if (phase === PHASE_OUTREACH) {
      timerRef.current = setTimeout(() => setPhase(PHASE_DONE), OUTREACH_REVEAL);
    } else if (phase === PHASE_DONE) {
      timerRef.current = setTimeout(() => setPhase(PHASE_IDLE), PAUSE_AFTER);
    } else if (phase === PHASE_IDLE && hasStartedRef.current) {
      const next = (scenarioIdx + 1) % DEMO_SCENARIOS.length;
      setScenarioIdx(next);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, scenarioIdx]);

  useEffect(() => {
    if (hasStartedRef.current) {
      startTyping();
    }
    return () => clearTimeout(timerRef.current);
  }, [scenarioIdx, startTyping]);

  const showCompanies = [PHASE_COMPANIES, PHASE_ALUMNI, PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase) && hasStartedRef.current;
  const showAlumni = [PHASE_ALUMNI, PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase) && hasStartedRef.current;
  const showOutreach = [PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase) && hasStartedRef.current;
  const isThinking = phase === PHASE_THINKING;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Label */}
      <div className="text-center mb-4">
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20' }}>
          See FastIQ in action
        </span>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.5 }}>
          FastIQ tailors everything to your student's school.
        </p>
      </div>

      {/* School selector */}
      <V3SchoolSelector selectedSchool={selectedSchool} onSelect={setSelectedSchool} />

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
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Live demo</span>
        </div>

        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#fff', lineHeight: 1.6, margin: 0 }}>
          {hasStartedRef.current ? displayedText : (
            <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Select a school above to see FastIQ in action…</span>
          )}
          {phase === PHASE_TYPING && (
            <span className="inline-block w-[2px] h-[18px] bg-white/70 ml-0.5 align-text-bottom" style={{ animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* Thinking */}
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

      {/* Output cards */}
      <div className="flex flex-col gap-3">
        {hasStartedRef.current && <CompaniesCard companies={scenario.companies} visible={showCompanies} />}
        {hasStartedRef.current && <AlumniCard alumni={scenario.alumni} visible={showAlumni} schoolName={schoolName} />}
        {hasStartedRef.current && <OutreachCard outreach={scenario.outreach} visible={showOutreach} schoolName={schoolName} />}
      </div>

      {/* Bottom microcopy */}
      <div
        className="text-center mt-6"
        style={{
          opacity: showOutreach ? 1 : 0,
          transform: showOutreach ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s 0.4s, transform 0.5s 0.4s',
        }}
      >
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, marginBottom: 4 }}>
          FastIQ doesn't just give advice.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55 }}>
          It shows your student <span style={{ color: '#E85D20' }}>who to contact</span> and <span style={{ color: '#E85D20' }}>what to say</span>.
        </p>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.3);opacity:1} }
      `}</style>
    </div>
  );
}