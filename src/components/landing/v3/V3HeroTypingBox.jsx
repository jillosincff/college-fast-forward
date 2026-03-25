import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';
const TYPING_SPEED = 70;
const ORANGE = '#E85D20';

/* ── School data ───────────────────────────────────── */
const SCHOOLS = [
  {
    abbr: 'UF',
    prompt: "I'm a marketing major at UF and want to work at a top brand like Nike or Spotify.",
    companies: [
      { name: 'Nike', tag: 'Brand Marketing' },
      { name: 'Spotify', tag: 'Music/Tech' },
      { name: 'Ogilvy', tag: 'Creative Agency' },
      { name: 'PepsiCo', tag: 'CPG' },
      { name: 'Lululemon', tag: 'DTC Brand' },
    ],
    alumni: [
      { name: 'Sarah Chen', company: 'Nike', role: 'Brand Marketing Coordinator' },
      { name: 'Jake Williams', company: 'Spotify', role: 'Marketing Associate' },
      { name: 'Lauren Brooks', company: 'Ogilvy', role: 'Account Coordinator' },
    ],
    outreach: {
      to: 'Sarah', toFull: 'Sarah Chen', company: 'Nike', from: 'Olivia',
      field: 'brand marketing',
    },
  },
  {
    abbr: 'FSU',
    prompt: "I'm interested in sports marketing agencies in New York.",
    companies: [
      { name: 'IMG Academy', tag: 'Sports Marketing' },
      { name: 'Wasserman', tag: 'Sports Agency' },
      { name: 'ESPN', tag: 'Media/Sports' },
      { name: 'Endeavor', tag: 'Talent Agency' },
      { name: 'Nike', tag: 'Sports Division' },
    ],
    alumni: [
      { name: 'Marcus Rivera', company: 'IMG Academy', role: 'Sports Marketing Coordinator' },
      { name: 'Hannah Lee', company: 'Wasserman', role: 'Client Services Associate' },
      { name: 'Chris Walker', company: 'ESPN', role: 'Content Marketing Specialist' },
    ],
    outreach: {
      to: 'Marcus', toFull: 'Marcus Rivera', company: 'IMG Academy', from: 'Olivia',
      field: 'sports marketing',
    },
  },
  {
    abbr: 'Wake Forest',
    prompt: "I'm exploring careers in wealth management and financial advising.",
    companies: [
      { name: 'Morgan Stanley', tag: 'Wealth Management' },
      { name: 'Merrill Lynch', tag: 'Financial Advisory' },
      { name: 'Raymond James', tag: 'Wealth Management' },
      { name: 'UBS', tag: 'Private Banking' },
      { name: 'Edward Jones', tag: 'Financial Services' },
    ],
    alumni: [
      { name: 'Daniel Green', company: 'Morgan Stanley', role: 'Wealth Management Analyst' },
      { name: 'Emily Carter', company: 'Merrill Lynch', role: 'Financial Advisor Associate' },
      { name: 'Kevin Shah', company: 'Raymond James', role: 'Client Associate' },
    ],
    outreach: {
      to: 'Daniel', toFull: 'Daniel Green', company: 'Morgan Stanley', from: 'Olivia',
      field: 'wealth management',
    },
  },
  {
    abbr: 'U of M',
    prompt: "I'm a finance major at U of M and want to break into investment banking in Chicago or New York.",
    companies: [
      { name: 'Goldman Sachs', tag: 'Investment Banking' },
      { name: 'JP Morgan', tag: 'Banking' },
      { name: 'Morgan Stanley', tag: 'IB Division' },
      { name: 'Lazard', tag: 'M&A Advisory' },
      { name: 'Evercore', tag: 'Investment Banking' },
    ],
    alumni: [
      { name: 'Ryan Goldberg', company: 'Goldman Sachs', role: 'Investment Banking Analyst' },
      { name: 'Nicole Tran', company: 'JP Morgan', role: 'Associate Analyst' },
      { name: 'Alex Martinez', company: 'Lazard', role: 'M&A Analyst' },
    ],
    outreach: {
      to: 'Ryan', toFull: 'Ryan Goldberg', company: 'Goldman Sachs', from: 'Olivia',
      field: 'investment banking',
    },
  },
  {
    abbr: 'USC',
    prompt: "I'm a communications major at USC interested in entertainment marketing or talent agencies in LA.",
    companies: [
      { name: 'WME', tag: 'Talent Agency' },
      { name: 'CAA', tag: 'Creative Agency' },
      { name: 'Disney', tag: 'Entertainment' },
      { name: 'Netflix', tag: 'Streaming/Marketing' },
      { name: 'Universal', tag: 'Entertainment Marketing' },
    ],
    alumni: [
      { name: 'Jordan Blake', company: 'WME', role: 'Talent Agency Assistant' },
      { name: 'Mia Gonzalez', company: 'CAA', role: 'Marketing Coordinator' },
      { name: 'Tyler Moreno', company: 'Disney', role: 'Entertainment Marketing Associate' },
    ],
    outreach: {
      to: 'Jordan', toFull: 'Jordan Blake', company: 'WME', from: 'Olivia',
      field: 'entertainment marketing',
    },
  },
];

const DEFAULT_MESSAGE = "Hey Sarah, I'm a UF '27 CS major and noticed you're a Software Engineer at Google. Your path from UF to Mountain View is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all. — Alex, UF '27";

function buildOutreachMsg(school, alumni) {
  const yr = `'${String(new Date().getFullYear() + 1).slice(2)}`;
  return `Hey ${alumni.name.split(' ')[0]}, I'm a ${school.abbr} ${yr} student and noticed you're a ${alumni.role} at ${alumni.company}. Your path from ${school.abbr} is exactly what I'm aiming for — would love 15 minutes to hear how you got there. No pressure at all. — Alex, ${school.abbr} ${yr}`;
}

function buildDemoData(school) {
  const yr = school.abbr;
  return {
    companies: school.companies,
    hasAsterisk: false,
    alumni: school.alumni.map((a, i) => ({ ...a, year: `${yr} '${23 - i}` })),
    outreach: {
      to: school.outreach.to,
      toFull: school.outreach.toFull,
      company: school.outreach.company,
      from: school.outreach.from,
      body: `Hi ${school.outreach.to},\n\nI'm a student exploring ${school.outreach.field} and noticed you're at ${school.outreach.company} — I'd love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\n${school.outreach.from}`,
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
  const typingRef = useRef(false);

  const accent = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const startTyping = useCallback((text) => {
    // Cancel all pending timers
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current.clear();
    typingRef.current = true;
    setIsTyping(true);
    setDisplayedText('');
    let charIdx = 0;
    const typeChar = () => {
      if (!typingRef.current) return;
      if (charIdx <= text.length) {
        setDisplayedText(text.slice(0, charIdx));
        charIdx++;
        const id = setTimeout(typeChar, TYPING_SPEED);
        timersRef.current.add(id);
      } else {
        setIsTyping(false);
      }
    };
    typeChar();
  }, []);

  const handleAlumniHover = useCallback((alumni) => {
    const yr = `'${String(new Date().getFullYear() + 1).slice(2)}`;
    const msg = `Hey ${alumni.name.split(' ')[0]}, I'm a ${school.abbr} ${yr} student and noticed you're a ${alumni.role} at ${alumni.company}. Your path from ${school.abbr} is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all. — Alex, ${school.abbr} ${yr}`;
    startTyping(msg);
  }, [school, startTyping]);

  // Auto-play on mount
  useEffect(() => {
    setHasStarted(true);
    startTyping(DEFAULT_MESSAGE);

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

    return () => {
      typingRef.current = false;
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current.clear();
    };
  }, []); // runs once per mount

  const isDone = showProof;

  return (
    <div style={{ opacity: hasStarted ? 1 : 0, transition: 'opacity 0.3s ease-out' }}>
      {/* ── White input box ───────────────────── */}
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
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>Hover an alumni card to see their message</span>
        </div>
        <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#111111', lineHeight: 1.6, margin: 0 }}>
          {displayedText || <span style={{ color: 'rgba(0,0,0,0.25)' }}>Describe your goal...</span>}
          {isTyping && (
            <span className="inline-block w-[2px] h-[18px] ml-0.5 align-text-bottom" style={{ background: 'rgba(0,0,0,0.45)', animation: 'blink 0.9s infinite' }} />
          )}
        </p>
      </div>

      {/* ── Disclaimer (static) ────────────── */}
      <p className="text-center" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>This is a sample scenario.</span>{' '}
        <span style={{ color: '#E85D20' }}>FastIQ works for any student at any school.</span>
      </p>

      {/* ── Result cards ─────────────────── */}
      <div className="flex flex-col gap-3">
        <CompaniesCard companies={demoData.companies} visible={showCompanies} accent={accent} hasAsterisk={demoData.hasAsterisk} />
        <AlumniCard alumni={demoData.alumni} visible={showAlumni} accent={accent} onAlumniHover={handleAlumniHover} />
        <OutreachCard outreach={demoData.outreach} visible={showOutreach} accent={accent} />
      </div>

      {/* ── Proof line ───────────────────── */}
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