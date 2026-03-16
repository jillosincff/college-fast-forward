import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const FONT_LINK_ID = 'pain-block-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const painStats = [
  {
    number: '200+',
    line1: 'applications sent',
    line2: 'by the average student',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    number: '6 seconds',
    line1: 'is how long a recruiter',
    line2: 'looks at their resume',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    number: '0',
    line1: 'warm connections at',
    line2: 'their dream companies',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
];

export default function LandingPainBlock({ onCTA }) {
  const sectionRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      className="landing-pain-block"
      style={{ background: '#0d1117', padding: '96px 48px 104px', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-pain-block { padding: 72px 24px !important; }
          .pain-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* radial glow */}
      <div aria-hidden style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>

        {/* Headline — Playfair Display */}
        <h2 style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(32px, 5vw, 52px)',
          color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.1,
          marginBottom: 8, ...fadeUp(0),
        }}>
          Your Kid Is Invisible
        </h2>
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(32px, 5vw, 52px)',
          color: 'rgba(244,240,232,0.4)', letterSpacing: '-0.02em', lineHeight: 1.1,
          marginBottom: 16, ...fadeUp(0.06),
        }}>
          to Employers
        </p>

        {/* divider */}
        <div style={{ width: 40, height: 2, background: '#E85D20', borderRadius: 1, margin: '0 auto 48px', ...fadeUp(0.08) }} />

        {/* Stat cards */}
        <div className="pain-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20, marginBottom: 48, ...fadeUp(0.12),
        }}>
          {painStats.map((s) => (
            <div
              key={s.number}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: '30px 24px 26px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#E85D20', lineHeight: 1, marginBottom: 10 }}>{s.number}</p>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{s.line1}</p>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{s.line2}</p>
            </div>
          ))}
        </div>

        {/* Body copy */}
        <div style={{ maxWidth: 620, margin: '0 auto 40px', ...fadeUp(0.18) }}>
          <p style={{ fontFamily: dmSans, fontSize: 19, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.6, marginBottom: 16 }}>
            Their friends who get interviews? They're not smarter.
            <br />
            They have <span style={{ fontWeight: 500, color: '#FFFFFF' }}>connections</span>. Someone made an introduction.
            <br />
            Someone opened a door.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 19, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Your student is applying into a black hole.
          </p>
        </div>

        {/* Bold callout */}
        <p style={{
          fontFamily: dmSans, fontSize: 19, fontWeight: 400,
          color: '#FFFFFF', lineHeight: 1.6,
          marginBottom: 36, ...fadeUp(0.24),
        }}>
          A perfect resume means nothing without a warm connection.{' '}
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>FASTIQ changes that.</span>
        </p>

        {/* CTA */}
        <div style={fadeUp(0.3)}>
          <PrimaryCTA text="See How It Works" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}