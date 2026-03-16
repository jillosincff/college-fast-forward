import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const BENEFITS = [
  'Real UF alumni matches at your target companies',
  'Personalized outreach messages written for you',
  'Pipeline tracking + follow-up reminders',
  'Weekly scout — new matches delivered automatically',
  '7-day free trial — cancel anytime',
];

export default function V2Pricing({ onCTA }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(14px)', transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s` });

  return (
    <section ref={ref} style={{ background: '#0d1117', padding: '100px 24px 110px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@media(max-width:768px){.v2-pricing-section{padding:72px 20px !important}}`}</style>
      <div aria-hidden className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(250,70,22,0.05),transparent 70%)' }} />

      <div className="max-w-[500px] mx-auto relative">
        {/* FASTIQ badge */}
        <div className="text-center mb-4" style={f(0)}>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FA4616', background: 'rgba(250,70,22,0.08)', border: '0.5px solid rgba(250,70,22,0.2)', borderRadius: 100, padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FA4616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" /></svg>
            FASTIQ™
          </span>
        </div>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 38px)', color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6, ...f(0.04) }}>
          $29/mo <span style={{ fontFamily: dmSans, fontSize: '0.55em', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>or</span> $249/year
        </h2>
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#06B6D4', marginBottom: 0, ...f(0.06) }}>Save 28% with annual</p>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '20px auto 32px', ...f(0.08) }} />

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(250,70,22,0.25)', borderRadius: 20, padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 0 40px rgba(250,70,22,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
          ...f(0.12),
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(250,70,22,0.15)', border: '0.5px solid rgba(250,70,22,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="#FA4616" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          <CTAButton text="Start 7-Day Free Trial" onClick={onCTA} fullWidth />
        </div>
      </div>
    </section>
  );
}