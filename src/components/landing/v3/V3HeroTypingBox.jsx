import { useState, useEffect, useRef, useCallback } from 'react';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';

const dmSans = '"DM Sans", system-ui, sans-serif';
const playfair = '"Playfair Display", Georgia, serif';
const TYPING_SPEED = 70;
const ORANGE = '#E85D20';

const SCHOOL_DEMOS = {
  UF: {
    studentName: 'Alex',
    studentYear: '27',
    alumniName: 'Jennifer Gomez',
    alumniTitle: 'Brand Marketing Manager',
    alumniCompany: 'Disney',
    companies: [
      { name: 'Disney', tag: 'Top Pick' },
      { name: 'Universal', tag: 'Strong Fit' },
      { name: 'NBCUniversal', tag: 'Great Culture' },
      { name: 'Spotify', tag: 'Alumni Network' },
      { name: 'Nike', tag: 'Target' },
    ],
    prompt: "I'm a marketing major at UF looking to break into brand marketing at top entertainment or lifestyle companies.",
    field: 'brand marketing',
  },
  FSU: {
    studentName: 'Jordan',
    studentYear: '27',
    alumniName: 'Marcus Reid',
    alumniTitle: 'Investment Banking Analyst',
    alumniCompany: 'Goldman Sachs',
    companies: [
      { name: 'Goldman Sachs', tag: 'Top Pick' },
      { name: 'JP Morgan', tag: 'Strong Fit' },
      { name: 'Morgan Stanley', tag: 'Great Culture' },
      { name: 'BlackRock', tag: 'Alumni Network' },
      { name: 'Deloitte', tag: 'Target' },
    ],
    prompt: "I'm a finance major at FSU looking to break into investment banking in New York.",
    field: 'investment banking',
  },
  'Wake Forest': {
    studentName: 'Emma',
    studentYear: '26',
    alumniName: 'Sarah Chen',
    alumniTitle: 'Strategy Consultant',
    alumniCompany: 'McKinsey',
    companies: [
      { name: 'McKinsey', tag: 'Top Pick' },
      { name: 'BCG', tag: 'Strong Fit' },
      { name: 'Bain', tag: 'Great Culture' },
      { name: 'Deloitte', tag: 'Alumni Network' },
      { name: 'Accenture', tag: 'Target' },
    ],
    prompt: "I'm a Wake Forest student exploring strategy consulting at top-tier firms.",
    field: 'strategy consulting',
  },
  'U of M': {
    studentName: 'Ryan',
    studentYear: '27',
    alumniName: 'David Park',
    alumniTitle: 'Senior Software Engineer',
    alumniCompany: 'Google',
    companies: [
      { name: 'Google', tag: 'Top Pick' },
      { name: 'Meta', tag: 'Strong Fit' },
      { name: 'Apple', tag: 'Great Culture' },
      { name: 'Microsoft', tag: 'Alumni Network' },
      { name: 'Amazon', tag: 'Target' },
    ],
    prompt: "I'm a CS major at U of M looking for software engineering roles at top tech companies.",
    field: 'software engineering',
  },
  USC: {
    studentName: 'Olivia',
    studentYear: '27',
    alumniName: 'Jordan Blake',
    alumniTitle: 'Talent Agency Assistant',
    alumniCompany: 'WME',
    companies: [
      { name: 'WME', tag: 'Top Pick' },
      { name: 'CAA', tag: 'Strong Fit' },
      { name: 'Disney', tag: 'Great Culture' },
      { name: 'Netflix', tag: 'Alumni Network' },
      { name: 'Universal', tag: 'Target' },
    ],
    prompt: "I'm a communications major at USC interested in entertainment marketing or talent agencies in LA.",
    field: 'entertainment marketing',
  },
};

const SCHOOL_KEYS = Object.keys(SCHOOL_DEMOS);

function buildDefaultMessage(abbr) {
  const s = SCHOOL_DEMOS[abbr];
  return `Hey ${s.alumniName.split(' ')[0]}, I'm a ${abbr} '${s.studentYear} student and noticed you're a ${s.alumniTitle} at ${s.alumniCompany}. Your path from ${abbr} is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all. — ${s.studentName}, ${abbr} '${s.studentYear}`;
}

function buildDemoData(abbr) {
  const s = SCHOOL_DEMOS[abbr];
  return {
    companies: s.companies,
    hasAsterisk: false,
    alumni: [
      { name: s.alumniName, company: s.alumniCompany, role: s.alumniTitle, year: `${abbr} '${s.studentYear}` },
    ],
    outreach: {
      to: s.alumniName.split(' ')[0],
      toFull: s.alumniName,
      company: s.alumniCompany,
      from: s.studentName,
      body: `Hi ${s.alumniName.split(' ')[0]},\n\nI'm a student exploring ${s.field} and noticed you're at ${s.alumniCompany} — I'd love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\n${s.studentName}`,
    },
  };
}

export default function V3HeroTypingBox() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  const abbr = SCHOOL_KEYS[selectedIdx];
  const demoData = buildDemoData(abbr);

  const handleChipClick = (idx) => {
    if (idx === selectedIdx) return;
    setSelectedIdx(idx);
    setPlayKey(k => k + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          Select a school to see a real example →
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {SCHOOL_KEYS.map((s, i) => {
          const active = i === selectedIdx;
          return (
            <button
              key={s}
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
              {s}
            </button>
          );
        })}
      </div>

      <DemoPlayer key={playKey} abbr={abbr} demoData={demoData} />
    </div>
  );
}

function DemoPlayer({ abbr, demoData }) {
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
    const s = SCHOOL_DEMOS[abbr];
    const msg = `Hey ${alumni.name.split(' ')[0]}, I'm a ${abbr} '${s.studentYear} student and noticed you're a ${alumni.role} at ${alumni.company}. Your path from ${abbr} is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all. — ${s.studentName}, ${abbr} '${s.studentYear}`;
    startTyping(msg);
  }, [abbr, startTyping]);

  useEffect(() => {
    setHasStarted(true);
    startTyping(buildDefaultMessage(abbr));

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
  }, []);

  const isDone = showProof;

  return (
    <div style={{ opacity: hasStarted ? 1 : 0, transition: 'opacity 0.3s ease-out' }}>
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

      <p className="text-center" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>This is a sample scenario.</span>{' '}
        <span style={{ color: '#E85D20' }}>FastIQ works for any student at any school.</span>
      </p>

      <div className="flex flex-col gap-3">
        <CompaniesCard companies={demoData.companies} visible={showCompanies} accent={accent} hasAsterisk={demoData.hasAsterisk} />
        <AlumniCard alumni={demoData.alumni} visible={showAlumni} accent={accent} onAlumniHover={handleAlumniHover} />
        <OutreachCard outreach={demoData.outreach} visible={showOutreach} accent={accent} />
      </div>

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