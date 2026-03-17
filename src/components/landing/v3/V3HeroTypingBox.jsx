import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getScenariosForSchool, resolveScenario } from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import V3SchoolSelector from './V3SchoolSelector';
import { getSchoolAccent, setAccentVars } from './schoolAccents';

const dmSans = '"DM Sans", system-ui, sans-serif';
const TYPING_SPEED = 32;

// Initial delay before demo starts on first load (let user read headline)
const INITIAL_DELAY = 2200;
// Delay before demo restarts on school change
const SCHOOL_CHANGE_DELAY = 500;

/* ── Skeleton for initial load ─────────────────────── */
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

/* ── Main orchestrated demo ────────────────────────── */
export default function V3HeroTypingBox() {
  const [selectedSchool, setSelectedSchool] = useState('University of Florida');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Animation state
  const [displayedText, setDisplayedText] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showCompanies, setShowCompanies] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [resolvedData, setResolvedData] = useState(null);

  const timerRef = useRef(null);
  const typingRef = useRef(null);
  const mountedRef = useRef(false);

  const accent = getSchoolAccent(selectedSchool);
  useEffect(() => { setAccentVars(selectedSchool); }, [selectedSchool]);

  const clearTimers = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(typingRef.current);
  }, []);

  // Reset all visual state to blank
  const resetState = useCallback(() => {
    clearTimers();
    setDisplayedText('');
    setStatusMsg('');
    setShowCompanies(false);
    setShowAlumni(false);
    setShowOutreach(false);
    setShowProof(false);
    setIsTyping(false);
    setResolvedData(null);
  }, [clearTimers]);

  /* ── The orchestrated sequence ────────────────────── */
  const runDemo = useCallback((school, scIdx, delay) => {
    resetState();

    const scenarios = getScenariosForSchool(school);
    const idx = scIdx % scenarios.length;
    const scenario = scenarios[idx];
    const data = resolveScenario(scenario);
    const promptText = scenario.promptText;

    // Schedule the entire sequence as a chain
    timerRef.current = setTimeout(() => {
      // Prep resolved data (hidden until cards reveal)
      setResolvedData(data);

      // Stage 1: Start typing
      setIsTyping(true);
      let charIdx = 0;
      const typeChar = () => {
        if (charIdx <= promptText.length) {
          setDisplayedText(promptText.slice(0, charIdx));
          charIdx++;
          typingRef.current = setTimeout(typeChar, TYPING_SPEED);
        } else {
          setIsTyping(false);
          // Stage 2: Pause after typing completes
          timerRef.current = setTimeout(() => {
            // Stage 3: Show "Building target list…" → reveal companies
            setStatusMsg('Building target list…');
            timerRef.current = setTimeout(() => {
              setShowCompanies(true);
              setStatusMsg('');

              // Stage 4: Pause → "Searching for alumni…" → reveal alumni
              timerRef.current = setTimeout(() => {
                setStatusMsg('Searching for alumni…');
                timerRef.current = setTimeout(() => {
                  setShowAlumni(true);
                  setStatusMsg('');

                  // Stage 5: Pause → "Composing outreach…" → reveal outreach
                  timerRef.current = setTimeout(() => {
                    setStatusMsg('Composing outreach…');
                    timerRef.current = setTimeout(() => {
                      setShowOutreach(true);
                      setStatusMsg('');

                      // Stage 6: Show proof line
                      timerRef.current = setTimeout(() => {
                        setShowProof(true);
                      }, 500);
                    }, 800);
                  }, 800);
                }, 800);
              }, 800);
            }, 800);
          }, 900);
        }
      };
      typeChar();
    }, delay);
  }, [resetState]);

  // Mount: skeleton → ready → start with initial delay
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const t = setTimeout(() => {
      setIsReady(true);
      runDemo('University of Florida', 0, INITIAL_DELAY);
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const handleSchoolChange = useCallback((school) => {
    if (!school || school === selectedSchool) return;
    setSelectedSchool(school);
    setScenarioIdx(0);
    runDemo(school, 0, SCHOOL_CHANGE_DELAY);
  }, [selectedSchool, runDemo]);

  const handleChipClick = useCallback((school, idx) => {
    setScenarioIdx(idx);
    runDemo(school, idx, SCHOOL_CHANGE_DELAY);
  }, [runDemo]);

  // Build chip labels from current school's scenarios
  const scenarios = getScenariosForSchool(selectedSchool);
  const chipLabels = scenarios.map((s, i) => {
    // Extract a short label from the prompt
    const text = s.promptText;
    // Take first meaningful phrase (up to 40 chars)
    const short = text.length > 45 ? text.slice(0, 42) + '…' : text;
    return { label: short, idx: i };
  });

  const isDone = showProof;

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
          {isTyping && displayedText && (
            <span className="inline-block w-[2px] h-[18px] ml-0.5 align-text-bottom" style={{ background: 'rgba(0,0,0,0.45)', animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* ── Status label (one at a time) ───────────── */}
      <div style={{
        height: statusMsg ? 40 : 0,
        opacity: statusMsg ? 1 : 0,
        overflow: 'hidden',
        transition: 'height 0.3s ease, opacity 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: statusMsg ? 12 : 0,
      }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, animation: `pulseDot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
          ))}
        </div>
        <span key={statusMsg} style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', animation: 'fadeUp 0.25s ease' }}>
          {statusMsg}
        </span>
      </div>

      {/* ── Dark result cards (revealed one at a time) */}
      {resolvedData && (
        <div className="flex flex-col gap-3">
          <CompaniesCard companies={resolvedData.companies} visible={showCompanies} accent={accent} hasAsterisk={resolvedData.hasAsterisk} />
          <AlumniCard alumni={resolvedData.alumni} visible={showAlumni} schoolName={selectedSchool} accent={accent} />
          <OutreachCard outreach={resolvedData.outreach} visible={showOutreach} schoolName={selectedSchool} accent={accent} />
        </div>
      )}

      {/* ── Proof line ─────────────────────────────── */}
      <div className="text-center mt-6" style={{ opacity: showProof ? 1 : 0, transform: showProof ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.5s 0.2s, transform 0.5s 0.2s' }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: accent.primary }}>who to contact</span> and{' '}
          <span style={{ color: accent.primary }}>what to say</span>.
        </p>
      </div>

      {/* ── Scenario chips ─────────────────────────── */}
      {chipLabels.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6" style={{ opacity: isDone ? 1 : 0.3, transition: 'opacity 0.5s' }}>
          {chipLabels.map((chip) => {
            const isActive = chip.idx === scenarioIdx;
            return (
              <button
                key={chip.idx}
                onClick={() => handleChipClick(selectedSchool, chip.idx)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = accent.border; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#23252B'; }}
                style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                  color: isActive ? accent.primary : '#71717A',
                  background: isActive ? accent.soft : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? accent.border : '#23252B'}`,
                  borderRadius: 100, padding: '8px 16px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  minHeight: 'auto', minWidth: 'auto', width: 'auto',
                  maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

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