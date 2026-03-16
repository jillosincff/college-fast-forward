import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const CARDS = [
  {
    type: 'student',
    quote: 'I spent weeks messaging people on LinkedIn and literally got no replies. I messaged 8 people on FASTIQ and 6 of them got right back to me. Total game-changer.',
    stat: { number: '6 of 8', label: 'replied' },
    initial: 'T',
    name: 'Tyler B.',
    role: 'UF Senior · Business',
  },
  {
    type: 'student',
    quote: 'Honestly, I had no clue how to start my job search. I reached out to several parents on here and they went out of their way to talk to me. It was actually incredible.',
    stat: null,
    initial: 'S',
    name: 'Sofia L.',
    role: 'UF Junior · Communications',
  },
  {
    type: 'parent',
    quote: 'My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own. Worth every penny.',
    stat: null,
    initial: 'D',
    name: 'Dana G.',
    role: 'UF Parent',
  },
];

/* ── fonts (loaded once) ───────────────────────────── */
const FONT_LINK_ID = 'testimonials-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

/* ── shared font stacks ────────────────────────────── */
const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

/* ── component ─────────────────────────────────────── */
export default function LandingTestimonials({ onClaim }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    ensureFonts();
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  });

  return (
    <section
      ref={sectionRef}
      className="landing-testimonials"
      style={{
        background: '#0a1016',
        padding: '96px 48px 104px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-testimonials { padding: 72px 24px !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 400,
          background: 'radial-gradient(ellipse at center, rgba(220,85,30,0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── headline ──────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative', ...fadeUp(0) }}>
        <h2
          style={{
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 52px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          <span style={{ color: '#f4f0e8' }}>One Intro </span>
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>
            Changed Everything.
          </span>
        </h2>

        <div
          style={{
            width: 40,
            height: 2,
            background: '#E85D20',
            borderRadius: 1,
            margin: '18px auto 0',
          }}
        />

        <p
          style={{
            fontFamily: dmSans,
            fontSize: 15,
            fontWeight: 300,
            color: 'rgba(244,240,232,0.4)',
            marginTop: 16,
          }}
        >
          From students who got unstuck — and the parents who made it happen.
        </p>
      </div>

      {/* ── cards grid ────────────────────────────── */}
      <div className="testimonial-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          marginBottom: 52,
          position: 'relative',
        }}
      >
        {CARDS.map((c, i) => (
          <Card key={c.name} card={c} style={fadeUp(0.1 + i * 0.1)} />
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────── */}
      <div style={{ textAlign: 'center', ...fadeUp(0.42) }}>
        <PrimaryCTA text="Join These Families" onClick={onClaim} />
      </div>
    </section>
  );
}

/* ── single card ──────────────────────────────────── */
function Card({ card, style }) {
  const isStudent = card.type === 'student';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: '28px 26px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
      }}
    >
      <div>
        {/* badge */}
        <Badge type={card.type} />

        {/* decorative quote mark */}
        <span
          style={{
            fontFamily: playfair,
            fontSize: 56,
            lineHeight: 0.5,
            color: '#E85D20',
            opacity: 0.4,
            display: 'block',
            marginBottom: 10,
            userSelect: 'none',
          }}
        >
          &ldquo;
        </span>

        {/* quote text */}
        <p
          style={{
            fontFamily: isStudent ? dmSans : playfair,
            fontSize: isStudent ? 15.5 : 16,
            fontWeight: isStudent ? 400 : 400,
            fontStyle: isStudent ? 'normal' : 'italic',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {card.quote}
        </p>

        {/* stat badge (card 1 only) */}
        {card.stat && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 6,
              background: 'rgba(232,93,32,0.1)',
              border: '0.5px solid rgba(232,93,32,0.25)',
              borderRadius: 8,
              padding: '7px 12px',
              marginTop: 14,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: playfair,
                fontSize: 22,
                fontWeight: 700,
                color: '#E85D20',
                lineHeight: 1,
              }}
            >
              {card.stat.number}
            </span>
            <span
              style={{
                fontFamily: dmSans,
                fontSize: 12,
                fontWeight: 400,
                color: 'rgba(232,93,32,0.8)',
              }}
            >
              {card.stat.label}
            </span>
          </div>
        )}
      </div>

      {/* footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 11,
          alignItems: 'center',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          paddingTop: 18,
          marginTop: card.stat ? 0 : 20,
        }}
      >
        {/* avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isStudent ? '#E85D20' : '#3a3a3a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: dmSans,
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {card.initial}
        </div>

        <div>
          <span
            style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 500,
              color: '#f4f0e8',
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            {card.name}
          </span>
          <span
            style={{
              fontFamily: dmSans,
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(244,240,232,0.4)',
              letterSpacing: '0.02em',
              display: 'block',
              lineHeight: 1.4,
            }}
          >
            {card.role}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── badge pill ───────────────────────────────────── */
function Badge({ type }) {
  const isStudent = type === 'student';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 100,
        padding: '4px 10px',
        fontFamily: dmSans,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 18,
        width: 'fit-content',
        background: isStudent ? 'rgba(232,93,32,0.12)' : 'rgba(255,255,255,0.07)',
        color: isStudent ? '#E85D20' : 'rgba(244,240,232,0.55)',
        border: isStudent
          ? '0.5px solid rgba(232,93,32,0.3)'
          : '0.5px solid rgba(255,255,255,0.15)',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'currentColor',
          opacity: 0.8,
        }}
      />
      {type === 'student' ? 'Student' : 'Parent'}
    </div>
  );
}