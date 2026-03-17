import React, { useState, useEffect, useRef, useCallback } from 'react';
import DEMO_SCENARIOS from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';

const dmSans = '"DM Sans", system-ui, sans-serif';

/* ── Phases of the demo ─────────────────────────────── */
const PHASE_TYPING    = 'typing';
const PHASE_THINKING  = 'thinking';
const PHASE_COMPANIES = 'companies';
const PHASE_ALUMNI    = 'alumni';
const PHASE_OUTREACH  = 'outreach';
const PHASE_DONE      = 'done';
const PHASE_IDLE      = 'idle';      // waiting before next cycle

const TYPING_SPEED = 35;             // ms per char
const THINK_DURATION = 1400;
const COMPANY_REVEAL = 900;
const ALUMNI_REVEAL = 1000;
const OUTREACH_REVEAL = 1100;
const PAUSE_AFTER = 6000;            // pause before next scenario

export default function V3HeroTypingBox() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState(PHASE_TYPING);
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef(null);

  const scenario = DEMO_SCENARIOS[scenarioIdx];

  /* ── Typing effect ─────────────────────────────────── */
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
        // Done typing → thinking
        timerRef.current = setTimeout(() => setPhase(PHASE_THINKING), 400);
      }
    };
    type();
  }, [scenario.prompt]);

  /* ── Phase progression ─────────────────────────────── */
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
    } else if (phase === PHASE_IDLE) {
      const next = (scenarioIdx + 1) % DEMO_SCENARIOS.length;
      setScenarioIdx(next);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, scenarioIdx]);

  /* ── Kick off each new scenario ─────────────────────── */
  useEffect(() => {
    startTyping();
    return () => clearTimeout(timerRef.current);
  }, [scenarioIdx, startTyping]);

  const showCompanies = [PHASE_COMPANIES, PHASE_ALUMNI, PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase);
  const showAlumni = [PHASE_ALUMNI, PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase);
  const showOutreach = [PHASE_OUTREACH, PHASE_DONE, PHASE_IDLE].includes(phase);
  const isThinking = phase === PHASE_THINKING;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Label above */}
      <div className="text-center mb-4">
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20' }}>
          See FastIQ in action
        </span>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.5 }}>
          In seconds, FastIQ can suggest target companies, surface alumni, and draft personalized outreach.
        </p>
      </div>

      {/* ── Input box ──────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 20,
          padding: '22px 24px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
          marginBottom: 16,
        }}
      >
        {/* Header row */}
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

        {/* Typed prompt */}
        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#fff', lineHeight: 1.6, margin: 0 }}>
          {displayedText}
          {phase === PHASE_TYPING && (
            <span className="inline-block w-[2px] h-[18px] bg-white/70 ml-0.5 align-text-bottom" style={{ animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* ── Thinking indicator ────────────────────────── */}
      <div
        style={{
          height: isThinking ? 44 : 0,
          opacity: isThinking ? 1 : 0,
          overflow: 'hidden',
          transition: 'height 0.3s, opacity 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: isThinking ? 12 : 0,
        }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#E85D20',
                opacity: 0.6,
                animation: `pulse-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>
        <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Analyzing companies and alumni network…
        </span>
      </div>

      {/* ── Output cards (stacked, progressive reveal) ── */}
      <div className="flex flex-col gap-3">
        <CompaniesCard companies={scenario.companies} visible={showCompanies} />
        <AlumniCard alumni={scenario.alumni} visible={showAlumni} />
        <OutreachCard outreach={scenario.outreach} visible={showOutreach} />
      </div>

      {/* ── Bottom microcopy (appears when done) ──────── */}
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
        <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          That's what turns confusion into momentum.
        </p>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.3);opacity:1} }
      `}</style>
    </div>
  );
}