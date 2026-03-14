import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const FONT_LINK_ID = 'student-pivot-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function LandingStudentPivot({ onFunnel }) {
  const sectionRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.15 },
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
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0d1117 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,70,22,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-32 sm:py-48 text-center">

        {/* Eyebrow — DM Sans 500, 11px, uppercase */}
        <div style={{ marginBottom: 20, ...fadeUp(0) }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: dmSans, fontSize: 11, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#06B6D4',
            background: 'rgba(6,182,212,0.1)', border: '0.5px solid rgba(6,182,212,0.2)',
            borderRadius: 100, padding: '5px 14px',
          }}>
            For Students
          </span>
        </div>

        {/* Headline — DM Sans 600 (intentionally punchy, exception) */}
        <h2 style={{
          fontFamily: dmSans, fontWeight: 600,
          fontSize: 'clamp(28px, 5vw, 48px)',
          color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.1,
          marginBottom: 32, ...fadeUp(0.06),
        }}>
          It's mid-March and you still{' '}
          <span style={{ color: '#E85D20' }}>
            have zero plans for summer.
          </span>
        </h2>

        {/* Reframe quote — Playfair italic */}
        <div style={{ maxWidth: 540, margin: '0 auto 40px', ...fadeUp(0.12) }}>
          <p style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 17, color: 'rgba(244,240,232,0.55)', lineHeight: 1.7,
          }}>
            "You're not behind because you're not trying hard enough. You're behind because nobody taught you how this actually works."
          </p>
        </div>

        {/* CTA */}
        <div style={fadeUp(0.18)}>
          <PrimaryCTA text="Find out where you actually stand" onClick={() => onFunnel('quiz')} />
        </div>

        {/* Subhead */}
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.35)', lineHeight: 1.6, marginTop: 20, ...fadeUp(0.24) }}>
          Takes 2 minutes · 9 questions · No BS — just the truth about where you stand
        </p>

        {/* Fine print */}
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.2)', marginTop: 10, ...fadeUp(0.28) }}>
          Free to take
        </p>
      </div>
    </section>
  );
}