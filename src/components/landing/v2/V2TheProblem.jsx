import React, { useRef, useState, useEffect } from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const STEPS = [
  { icon: '📄', text: 'They apply to 200 jobs' },
  { icon: '🤖', text: 'AI rejects 98% before a human sees it' },
  { icon: '😔', text: 'They never hear back' },
  { icon: '👀', text: 'They watch friends with "connections" get interviews' },
  { icon: '❓', text: 'They wonder what they\'re doing wrong' },
];

export default function V2TheProblem() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s`,
  });

  return (
    <section ref={ref} style={{ background: '#0d1117', padding: '125px 24px 135px' }}>
      <div className="max-w-[600px] mx-auto">
        {/* Eyebrow */}
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', textAlign: 'center', marginBottom: 14, ...f(0) }}>
          The Problem
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#fff', textAlign: 'center', lineHeight: 1.15, marginBottom: 8, letterSpacing: '-0.02em', ...f(0.04) }}>
          Your Student Is Invisible to Employers
        </h2>
        <p style={{ fontFamily: dmSans, fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 48, ...f(0.06) }}>
          (And it's not their fault. The system is broken.)
        </p>

        {/* Flow cards */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, ...f(0.1) }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                maxWidth: 480,
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{step.icon}</span>
                <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.5 }}>{step.text}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ color: '#c9a84c', fontSize: 20, padding: '6px 0', userSelect: 'none' }}>↓</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Closing */}
        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginTop: 48, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', ...f(0.16) }}>
          Here's the truth: It doesn't matter how perfect their resume is. Without a warm connection, their resume goes into the same black hole as everyone else's.
        </p>

        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', textAlign: 'center', marginTop: 24, lineHeight: 1.6, ...f(0.2) }}>
          The students who land jobs? They have someone on the inside who{' '}
          <span style={{ fontStyle: 'italic', color: '#E85D20' }}>cares enough to pick up the phone</span>.
        </p>
      </div>
    </section>
  );
}