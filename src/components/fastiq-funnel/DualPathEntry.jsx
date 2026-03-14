import React, { useEffect, useRef, useState } from 'react';
import { useFunnel } from './FunnelContext';
import { base44 } from '@/api/base44Client';

const FONT_LINK_ID = 'quiz-entry-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=Playfair+Display:ital,wght@1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const STATS = [
  'Takes 2 minutes',
  '9 questions',
  'No BS — just the truth about where you stand',
];

export default function DualPathEntry() {
  const { setPath, setPhase } = useFunnel();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleStart = () => {
    base44.analytics.track({ eventName: 'funnel_started', properties: { path: 'known' } });
    setPath('known');
    setPhase('quiz');
  };

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  });

  return (
    <div
      ref={ref}
      style={{
        background: '#0d1117',
        padding: '64px 24px 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(220,85,30,0.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* badge */}
      <div style={{ marginBottom: 28, ...fadeUp(0) }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 100,
            padding: '6px 16px',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(244,240,232,0.5)' }}>
            For Students
          </span>
        </span>
      </div>

      {/* headline */}
      <h2
        style={{
          fontFamily: dmSans,
          fontWeight: 600,
          fontSize: 'clamp(36px, 6vw, 58px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: 720,
          margin: '0 auto 24px',
          ...fadeUp(0.05),
        }}
      >
        <span style={{ color: '#f4f0e8' }}>It's mid-March and you still </span>
        <span style={{ color: '#E85D20' }}>have zero plans for summer.</span>
      </h2>

      {/* body copy */}
      <p
        style={{
          fontFamily: dmSans,
          fontSize: 17,
          fontWeight: 300,
          color: 'rgba(244,240,232,0.55)',
          lineHeight: 1.7,
          maxWidth: 520,
          margin: '0 auto 16px',
          ...fadeUp(0.1),
        }}
      >
        Your friends are posting offers. Your parents keep asking questions. And you're still refreshing Handshake hoping something shows up.
      </p>

      {/* reframe quote */}
      <p
        style={{
          fontFamily: playfair,
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: 16,
          color: 'rgba(244,240,232,0.4)',
          lineHeight: 1.6,
          maxWidth: 480,
          margin: '0 auto 44px',
          ...fadeUp(0.15),
        }}
      >
        You're not behind because you're not trying hard enough. You're behind because nobody taught you how this actually works.
      </p>

      {/* stats row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          flexWrap: 'wrap',
          marginBottom: 44,
          ...fadeUp(0.18),
        }}
      >
        {STATS.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', opacity: 0.6, flexShrink: 0 }} />
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.35)' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginBottom: 20, ...fadeUp(0.22) }}>
        <button
          onClick={handleStart}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#d44e14';
            e.currentTarget.style.transform = 'translateY(-2px)';
            const arrow = e.currentTarget.querySelector('.qe-arrow');
            if (arrow) arrow.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#E85D20';
            e.currentTarget.style.transform = 'translateY(0)';
            const arrow = e.currentTarget.querySelector('.qe-arrow');
            if (arrow) arrow.style.transform = 'translateX(0)';
          }}
          style={{
            fontFamily: dmSans,
            fontSize: 17,
            fontWeight: 500,
            color: '#fff',
            background: '#E85D20',
            borderRadius: 100,
            padding: '18px 44px',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            minHeight: 'auto',
            minWidth: 'auto',
            width: 'auto',
          }}
        >
          Find out where you actually stand
          <svg className="qe-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 0.15s ease' }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* fine print */}
      <p
        style={{
          fontFamily: dmSans,
          fontSize: 13,
          fontWeight: 300,
          color: 'rgba(244,240,232,0.25)',
          lineHeight: 1.6,
          ...fadeUp(0.28),
        }}
      >
        Free to take. See real UF alumni at <span style={{ fontWeight: 400, color: 'rgba(244,240,232,0.4)' }}>Amazon, Google, Nike, TikTok</span> and more.
      </p>
    </div>
  );
}