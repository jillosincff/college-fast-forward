import React, { useEffect, useRef, useState } from 'react';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const FONT_LINK_ID = 'fastiq-intro-fonts';
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

const FEATURES = [
  {
    title: 'Discover Alumni at Target Companies',
    body: 'FASTIQ scans the full UF alumni network worldwide and surfaces Gators at your student\'s dream companies — people who share their school, their values, and a reason to help.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Personalized Outreach, Ready to Send',
    body: 'Every message is drafted specifically for the contact — referencing shared background, the right tone, and a clear ask. Students send it. Alumni actually respond.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: 'Intel, Prep & Follow-Through',
    body: 'Real-time company intel before every conversation. Interview prep before every call. Follow-up reminders so nothing falls through the cracks.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function LandingFastIQIntro({ onCTA }) {
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
      className="landing-fastiq-intro"
      style={{ background: '#0a1016', padding: '72px 48px 80px', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-fastiq-intro { padding: 56px 24px !important; }
          .fiq-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* radial glow */}
      <div aria-hidden style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.05), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>

        {/* badge */}
        <div style={{ textAlign: 'center', marginBottom: 14, ...fadeUp(0) }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#E85D20', background: 'rgba(232,93,32,0.1)', border: '0.5px solid rgba(232,93,32,0.25)',
            borderRadius: 100, padding: '5px 14px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
            </svg>
            FASTIQ™
          </span>
        </div>

        {/* headline */}
        <h2 style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(30px, 4vw, 44px)',
          color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.15,
          textAlign: 'center', marginBottom: 16, ...fadeUp(0.05),
        }}>
          Your Student's <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>AI Career Concierge</span>
        </h2>

        {/* divider */}
        <div style={{ width: 40, height: 2, background: '#E85D20', borderRadius: 1, margin: '0 auto 24px', ...fadeUp(0.08) }} />

        {/* body */}
        <p style={{
          fontFamily: dmSans, fontSize: 17, fontWeight: 300,
          color: 'rgba(244,240,232,0.6)', lineHeight: 1.8, textAlign: 'center',
          maxWidth: 620, margin: '0 auto 48px', ...fadeUp(0.1),
        }}>
          FASTIQ finds real UF grads at your kid's dream companies, writes the perfect intro message, and gets them in the door — bypassing thousands of cold applicants.
        </p>

        {/* feature cards */}
        <div className="fiq-cards-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, marginBottom: 48,
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '30px 24px 26px',
                display: 'flex', flexDirection: 'column',
                transition: 'background 0.25s, border-color 0.25s',
                ...fadeUp(0.14 + i * 0.07),
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(232,93,32,0.12)', border: '0.5px solid rgba(232,93,32,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
              }}>
                {f.icon}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#f4f0e8', marginBottom: 10, lineHeight: 1.3 }}>
                {f.title}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 14.5, fontWeight: 300, color: 'rgba(244,240,232,0.58)', lineHeight: 1.75 }}>
                {f.body}
              </div>
            </div>
          ))}
        </div>

        {/* interactive demo */}
        <div style={{ marginBottom: 48, ...fadeUp(0.35) }}>
          <InteractiveTeaserDemo />
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', ...fadeUp(0.4) }}>
          <PrimaryCTA text="Claim Your Free Spot" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}