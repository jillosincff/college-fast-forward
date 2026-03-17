import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';

const dmSans = '"DM Sans", system-ui, sans-serif';
const TYPING_SPEED = 30;

/* ── School rotation data ──────────────────────────── */
const SCHOOLS = [
  {
    name: 'University of Florida',
    abbr: 'UF',
    prompt: "I'm a marketing major at UF and want to work at a top brand like Nike or Spotify.",
  },
  {
    name: 'Florida State University',
    abbr: 'FSU',
    prompt: "I'm interested in sports marketing agencies in New York.",
  },
  {
    name: 'Wake Forest University',
    abbr: 'Wake Forest',
    prompt: "I'm exploring careers in wealth management and financial advising.",
  },
  {
    name: 'University of Michigan',
    abbr: 'U of M',
    prompt: "I'm a finance major at U of M and want to break into investment banking in Chicago or New York.",
  },
  {
    name: 'University of Southern California',
    abbr: 'USC',
    prompt: "I'm a communications major at USC interested in entertainment marketing or talent agencies in LA.",
  },
];

function getNextSchool() {
  let idx = 0;
  try {
    const stored = sessionStorage.getItem('cff_demo_school_idx');
    if (stored !== null) {
      idx = (parseInt(stored, 10) + 1) % SCHOOLS.length;
    }
    sessionStorage.setItem('cff_demo_school_idx', String(idx));
  } catch (e) { /* private browsing */ }
  return SCHOOLS[idx];
}

/* ── Fixed demo content (same across all schools) ──── */
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
    schoolAbbr: school.abbr,
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
  const [school] = useState(() => getNextSchool());
  const [displayedText, setDisplayedText] = useState('');
  const [showCompanies, setShowCompanies] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [demoData] = useState(() => buildDemoData(school));
  const [hasStarted, setHasStarted] = useState(false);

  const timersRef = useRef(new Set());
  const containerRef = useRef(null);
  const hasPlayedRef = useRef(false);

  const accent = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current.clear();
  }, []);

  const runDemo = useCallback(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    setHasStarted(true);

    const promptText = school.prompt;

    setIsTyping(true);
    let charIdx = 0;
    const typeChar = () => {
      if (charIdx <= promptText.length) {
        setDisplayedText(promptText.slice(0, charIdx));
        charIdx++;
        schedule(typeChar, TYPING_SPEED);
      } else {
        setIsTyping(false);

        // Step 3 — Companies card (500ms after typing completes)
        schedule(() => {
          setShowCompanies(true);

          // Step 4 — Alumni card (400ms after companies)
          schedule(() => {
            setShowAlumni(true);

            // Step 5 — Outreach card (500ms after last alumni row ~450ms)
            schedule(() => {
              setShowOutreach(true);

              // Step 6 — Footer line (300ms after outreach completes ~800ms)
              schedule(() => {
                setShowProof(true);
              }, 800);
            }, 500 + 450);
          }, 400);
        }, 500);
      }
    };
    typeChar();
  }, [schedule, school]);

  // Intersection Observer — trigger once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasPlayedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPlayedRef.current) {
          runDemo();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      clearAllTimers();
      // Reset for Strict Mode double-mount
      hasPlayedRef.current = false;
      setDisplayedText('');
      setShowCompanies(false);
      setShowAlumni(false);
      setShowOutreach(false);
      setShowProof(false);
      setIsTyping(false);
      setHasStarted(false);
    };
  }, [runDemo, clearAllTimers]);

  const isDone = showProof;

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto" style={{ opacity: hasStarted ? 1 : 0, transition: 'opacity 0.4s ease-out' }}>
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

      {/* ── Demo disclaimer (static, always visible once demo starts) ── */}
      <p className="text-center" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>For demo purposes only.</span>{' '}
        <span style={{ color: '#E85D20' }}>FastIQ works for any school.</span>
      </p>

      {/* ── Dark result cards ──────────────────────── */}
      <div className="flex flex-col gap-3">
        <CompaniesCard companies={demoData.companies} visible={showCompanies} accent={accent} hasAsterisk={demoData.hasAsterisk} />
        <AlumniCard alumni={demoData.alumni} visible={showAlumni} accent={accent} showSchoolBadge={false} />
        <OutreachCard outreach={demoData.outreach} visible={showOutreach} accent={accent} />
      </div>

      {/* ── Proof line ─────────────────────────────── */}
      <div className="mt-6" style={{ textAlign: 'left', opacity: isDone ? 1 : 0, transform: isDone ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.5s 0.2s, transform 0.5s 0.2s' }}>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.55, margin: 0 }}>
          FastIQ doesn't just give advice — it shows your student{' '}
          <span style={{ color: accent.primary }}>who to contact</span> and{' '}
          <span style={{ color: accent.primary }}>what to say</span>.
        </p>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes msgFadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}