import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const FONT_LINK_ID = 'parent-relief-fonts';
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

const STATS = [
  { number: 'Nearly 1,000', label: 'families already on the platform' },
  { number: '48hrs', label: 'avg. time to first warm intro' },
  { number: '10+', label: 'universities and growing' },
];

export default function LandingParentRelief({ onCTA }) {
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
    transform: vis ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      className="landing-parent-relief"
      style={{
        background: '#0d1117',
        padding: '80px 48px 88px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-parent-relief { padding: 56px 24px !important; }
          .pr-stats-row { flex-direction: column !important; gap: 16px !important; }
          .pr-stats-row .pr-stat-sep { display: none !important; }
        }
      `}</style>
      {/* radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(220,85,30,0.06), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>

        {/* headline */}
        <h2 style={{ fontFamily: dmSans, fontWeight: 600, fontSize: 'clamp(36px, 5vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 32, ...fadeUp(0) }}>
          <span style={{ color: '#f4f0e8' }}>For Parents Who Are</span>
          <br />
          <span style={{ color: '#E85D20' }}>Freaking Out</span>
        </h2>

        {/* divider */}
        <div style={{ width: 48, height: 2, background: '#E85D20', borderRadius: 1, margin: '0 auto 36px', ...fadeUp(0.05) }} />

        {/* body copy 1 */}
        <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.8, textAlign: 'center', marginBottom: 20, ...fadeUp(0.1) }}>
          You're watching your kid spend hours applying to everything and hearing nothing back. You want to help — but you don't have connections at the companies they're interested in. And that feeling of helplessness is the worst part.
        </p>

        {/* pivot line */}
        <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 17, color: '#E85D20', lineHeight: 1.5, marginBottom: 24, ...fadeUp(0.15) }}>
          That's exactly why we built this.
        </p>

        {/* body copy 2 */}
        <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.8, textAlign: 'center', marginBottom: 52, ...fadeUp(0.18) }}>
          College Fast Forward connects your student to a community of UF parents and alumni who've pledged to help — people who work in the fields your kid is exploring, who remember what it felt like to be starting out, and who've committed to showing up when a student reaches out.
          <br /><br />
          And if nobody in the community is exactly the right fit? <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.9)' }}>FASTIQ goes further</b> — finding UF alumni worldwide who share your student's school, their values, and a reason to help.
        </p>

        {/* pull quote block */}
        <div
          style={{
            background: 'rgba(232,93,32,0.06)',
            border: '0.5px solid rgba(232,93,32,0.2)',
            borderRadius: 20,
            padding: '44px 40px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 52,
            ...fadeUp(0.22),
          }}
        >
          {/* decorative quote mark */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: -20,
              left: 24,
              fontFamily: playfair,
              fontSize: 120,
              color: '#E85D20',
              opacity: 0.12,
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            &ldquo;
          </span>

          {/* quote text */}
          <p style={{ position: 'relative', zIndex: 1, fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 3.5vw, 30px)', color: '#f4f0e8', lineHeight: 1.35, letterSpacing: '-0.01em', marginBottom: 6 }}>
            If you can't directly help your kid,
            <br />
            <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>
              we'll find someone who can.
            </span>
          </p>

          {/* attribution */}
          <p style={{ position: 'relative', zIndex: 1, fontFamily: dmSans, fontSize: 12, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(244,240,232,0.3)', margin: 0 }}>
            The College Fast Forward Promise
          </p>
        </div>

        {/* trust signals row */}
        <div className="pr-stats-row" style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', alignItems: 'center', marginBottom: 44, ...fadeUp(0.28) }}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.number}>
              {i > 0 && (
                <div className="pr-stat-sep" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', margin: '0 16px', flexShrink: 0, alignSelf: 'center' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#E85D20', lineHeight: 1 }}>{s.number}</span>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.35)', letterSpacing: '0.04em', textAlign: 'center', maxWidth: 110, lineHeight: 1.4 }}>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* CTA block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...fadeUp(0.33) }}>
          <PrimaryCTA text="Join the Network — $9/month" onClick={onCTA} />

          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.25)', lineHeight: 1.6, margin: 0 }}>
            Cancel anytime. No contracts. Takes <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.4)' }}>30 seconds</b> to join.
          </p>
        </div>
      </div>
    </section>
  );
}