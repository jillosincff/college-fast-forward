import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2StudentPivot({ onCTA }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(14px)', transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s` });

  return (
    <section ref={ref} style={{ background: '#0d1117', padding: '80px 24px 90px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(6,182,212,0.04), transparent)' }} />

      <div className="max-w-[620px] mx-auto relative text-center">
        <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#06B6D4', marginBottom: 14, ...f(0) }}>
          For Students
        </div>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 40px)', color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12, ...f(0.04) }}>
          It's mid-March and you still have <span style={{ fontStyle: 'italic', color: '#06B6D4' }}>zero plans</span> for summer.
        </h2>

        <div style={{ width: 40, height: 2, background: '#06B6D4', borderRadius: 1, margin: '0 auto 24px', ...f(0.06) }} />

        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, marginBottom: 36, ...f(0.1) }}>
          Your friends are posting offers. Your parents keep asking questions. You have no experience, no connections, and no clue how to fix it. FASTIQ finds real UF grads inside your target companies, messages them for you, and gets your foot in the door — bypassing thousands of cold applicants.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3" style={f(0.16)}>
          <CTAButton text="I know where I want to work… but I don't know anyone there" onClick={onCTA} />
          <CTAButton text="I literally have no clue where to even start" onClick={onCTA} variant="teal" />
        </div>
      </div>
    </section>
  );
}