import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getScenariosForSchool, resolveScenario } from './V3HeroDemoData';
import { CompaniesCard, AlumniCard, OutreachCard } from './V3HeroDemoCards';
import { getSchoolAccent, setAccentVars } from './schoolAccents';

const dmSans = '"DM Sans", system-ui, sans-serif';
const TYPING_SPEED = 30; // ~30ms per character as specified

/* ── Skeleton ──────────────────────────────────────── */
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
  // No school branding for landing page (logged-out visitors)
  const [displayedText, setDisplayedText] = useState('');
  const [showCompanies, setShowCompanies] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [resolvedData, setResolvedData] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Use a Set of timer ids so we can cancel ALL pending timers on reset
  const timersRef = useRef(new Set());
  const containerRef = useRef(null);
  const hasPlayedRef = useRef(false);

  // Neutral accent for logged-out state (no school branding)
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

  /* ── Orchestrated sequence per spec ────────────────────────── */
  const runDemo = useCallback(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    setHasStarted(true);

    // Fixed demo data — no school branding, 3 unique alumni
    const promptText = "I'm a marketing major and want to work at a top brand like Nike or Spotify.";
    const data = {
      companies: [
        { name: 'Nike', tag: 'Brand Marketing' },
        { name: 'Spotify', tag: 'Music/Tech' },
        { name: 'Ogilvy', tag: 'Creative Agency' },
        { name: 'PepsiCo', tag: 'CPG' },
        { name: 'Lululemon', tag: 'DTC Brand' },
      ],
      hasAsterisk: false,
      alumni: [
        { name: 'Tyler Moreno', company: 'Nike', role: 'Brand Marketing Coordinator', year: "'23" },
        { name: 'Michael Ross', company: 'Spotify', role: 'Marketing Associate', year: "'22" },
        { name: 'Priya Patel', company: 'Ogilvy', role: 'Account Coordinator', year: "'21" },
      ],
      outreach: {
        to: 'Tyler',
        toFull: 'Tyler Moreno',
        company: 'Nike',
        from: 'Olivia',
        body: `Hi Tyler,\n\nI'm a marketing major and brand strategy is exactly where I want to build my career — I noticed you're at Nike and would love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\nOlivia`,
      },
    };

    setResolvedData(data);

    // Step 1 — Type prompt (0ms delay start)
    setIsTyping(true);
    let charIdx = 0;
    const typeChar = () => {
      if (charIdx <= promptText.length) {
        setDisplayedText(promptText.slice(0, charIdx));
        charIdx++;
        schedule(typeChar, TYPING_SPEED);
      } else {
        // Typing complete — no cursor after
        setIsTyping(false);
        
        // Step 2 — Companies card (500ms after typing completes)
        schedule(() => {
          setShowCompanies(true);
          
          // Step 3 — Alumni card (400ms after companies)
          schedule(() => {
            setShowAlumni(true);
            
            // Step 4 — Outreach card (500ms after last alumni row ~450ms)
            schedule(() => {
              setShowOutreach(true);
              
              // Step 5 — Footer line (300ms after outreach completes ~800ms)
              schedule(() => {
                setShowProof(true);
              }, 800);
            }, 500 + 450); // 450ms for 3 alumni rows at 150ms each
          }, 400);
        }, 500);
      }
    };
    typeChar();
  }, [schedule]);

  // Intersection Observer — trigger demo when scrolled into view (once only)
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
    return () => observer.disconnect();
  }, [runDemo]);

  // Cleanup on unmount
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

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

      {/* ── Dark result cards ──────────────────────── */}
      {resolvedData && (
        <div className="flex flex-col gap-3">
          <CompaniesCard companies={resolvedData.companies} visible={showCompanies} accent={accent} hasAsterisk={resolvedData.hasAsterisk} />
          <AlumniCard alumni={resolvedData.alumni} visible={showAlumni} accent={accent} showSchoolBadge={false} />
          <OutreachCard outreach={resolvedData.outreach} visible={showOutreach} accent={accent} />
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

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes msgFadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}