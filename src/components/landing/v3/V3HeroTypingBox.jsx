import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';
const TYPING_SPEED = 30;
const ORANGE = '#E85D20';

/* ── School data ───────────────────────────────────── */
const SCHOOLS = [
  { abbr: 'UF', prompt: "I'm a marketing major at UF and want to work at a top brand like Nike or Spotify." },
  { abbr: 'FSU', prompt: "I'm interested in sports marketing agencies in New York." },
  { abbr: 'Wake Forest', prompt: "I'm exploring careers in wealth management and financial advising." },
  { abbr: 'U of M', prompt: "I'm a finance major at U of M and want to break into investment banking in Chicago or New York." },
  { abbr: 'USC', prompt: "I'm a communications major at USC interested in entertainment marketing or talent agencies in LA." },
];

const COMPANIES = [
  { name: 'Nike', tag: 'Brand Marketing' },
  { name: 'Spotify', tag: 'Music/Tech' },
  { name: 'Ogilvy', tag: 'Creative Agency' },
  { name: 'PepsiCo', tag: 'CPG' },
  { name: 'Lululemon', tag: 'DTC Brand' },
];

function buildDemoData(school) {
  return {
    companies: COMPANIES,
    hasAsterisk: false,
    alumni: [
      { name: 'Tyler Moreno', company: 'Nike', role: 'Brand Marketing Coordinator', year: `${school.abbr} '23` },
      { name: 'Michael Ross', company: 'Spotify', role: 'Marketing Associate', year: `${school.abbr} '22` },
      { name: 'Priya Patel', company: 'Ogilvy', role: 'Account Coordinator', year: `${school.abbr} '21` },
    ],
    outreach: {
      to: 'Tyler',
      toFull: 'Tyler Moreno',
      company: 'Nike',
      from: 'Olivia',
      body: `Hi Tyler,\n\nI'm a student exploring brand marketing and noticed you're at Nike — I'd love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\nOlivia`,
    },
  };
}

/* ── Main component ────────────────────────────────── */
export default function V3HeroTypingBox() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [playKey, setPlayKey] = useState(0); // increments to force replay

  const school = SCHOOLS[selectedIdx];
  const demoData = buildDemoData(school);

  const handleChipClick = (idx) => {
    if (idx === selectedIdx) return;
    setSelectedIdx(idx);
    setPlayKey(k => k + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Framing lines ──────────────────────────── */}
      <div className="text-center mb-6">
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 4 }}>
          Watch how FastIQ works for your student.
        </p>
        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontSize: 17, fontWeight: 400, color: ORANGE, lineHeight: 1.5 }}>
          Select a school to see a real example.
        </p>
      </div>

      {/* ── School chips ───────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {SCHOOLS.map((s, i) => {
          const active = i === selectedIdx;
          return (
            <button
              key={s.abbr}
              onClick={() => handleChipClick(i)}
              data-chip="true"
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                color: active ? '#fff' : ORANGE,
                background: active ? ORANGE : 'transparent',
                border: `1.5px solid ${ORANGE}`,
                borderRadius: 100, padding: '8px 18px',
                cursor: 'pointer', transition: 'all 0.2s',
                minHeight: 'auto', minWidth: 'auto',
              }}
            >
              {s.abbr}
            </button>
          );
        })}
      </div>

      {/* ── Animated demo (keyed for replay) ────── */}
      <DemoPlayer key={playKey} school={school} demoData={demoData} />
    </div>
  );
}

/* ── Isolated demo player (unmounts/remounts on key change) ── */
function DemoPlayer({ school, demoData }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCompanies, setShowCompanies] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const timersRef = useRef(new Set());

  const accent = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  // Auto-play on mount
  useEffect(() => {
    setHasStarted(true);
    setIsTyping(true);

    const promptText = school.prompt;
    let charIdx = 0;

    const typeChar = () => {
      if (charIdx <= promptText.length) {
        setDisplayedText(promptText.slice(0, charIdx));
        charIdx++;
        schedule(typeChar, TYPING_SPEED);
      } else {
        setIsTyping(false);
        schedule(() => {
          setShowCompanies(true);
          schedule(() => {
            setShowAlumni(true);
            schedule(() => {
              setShowOutreach(true);
              schedule(() => {
                setShowProof(true);
              }, 800);
            }, 950);
          }, 400);
        }, 500);
      }
    };
    typeChar();

    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current.clear();
    };
  }, []); // runs once per mount

  const isDone = showProof;

  return (
    <div style={{ opacity: hasStarted ? 1 : 0, transition: 'opacity 0.3s ease-out' }}>
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

      {/* ── Disclaimer (static) ────────────────────── */}
      <p className="text-center" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>This is a sample scenario.</span>{' '}
        <span style={{ color: '#E85D20' }}>FastIQ works for any student at any school.</span>
      </p>

      {/* ── Result cards ───────────────────────────── */}
      <div className="flex flex-col gap-3">
        <CompaniesCard companies={demoData.companies} visible={showCompanies} accent={accent} hasAsterisk={demoData.hasAsterisk} />
        <AlumniCard alumni={demoData.alumni} visible={showAlumni} accent={accent} />
        <OutreachCard outreach={demoData.outreach} visible={showOutreach} accent={accent} />
      </div>

      {/* ── Proof line ─────────────────────────────── */}
      <div className="mt-6" style={{ textAlign: 'left', opacity: isDone ? 1 : 0, transform: isDone ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.5s 0.2s, transform 0.5s 0.2s' }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: '#E85D20' }}>who to contact</span> and{' '}
          <span style={{ color: '#E85D20' }}>what to say</span>.
        </p>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}