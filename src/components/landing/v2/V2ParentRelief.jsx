import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const QUOTES = [
  { text: 'My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own. Worth every penny.', name: 'Dana G.', role: 'UF Parent' },
  { text: 'I spent weeks messaging people on LinkedIn and literally got no replies. I messaged 8 people on FASTIQ and 6 of them got right back to me. Total game-changer.', name: 'Tyler B.', role: 'UF Senior · Business' },
];

export default function V2ParentRelief({ onCTA }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s` });

  return (
    <section ref={ref} className="v2-parent" style={{ background: '#0F172A', padding: '110px 24px 120px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@media(max-width:768px){.v2-parent{padding:80px 20px !important}.v2-parent-quotes{grid-template-columns:1fr !important}}`}</style>
      <div aria-hidden className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(250,70,22,0.05),transparent 70%)' }} />

      <div className="max-w-[680px] mx-auto relative">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.12, textAlign: 'center', marginBottom: 14, ...f(0) }}>
          <span style={{ color: '#f4f0e8' }}>For Parents Who Are </span>
          <span style={{ fontStyle: 'italic', color: '#FA4616' }}>Freaking Out</span>
        </h2>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '0 auto 36px', ...f(0.04) }} />

        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginBottom: 20, ...f(0.08) }}>
          You're watching your kid spiral — late nights on Handshake, dodging your questions, stress everywhere.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginBottom: 20, ...f(0.12) }}>
          FASTIQ gives them something real to act on: <strong style={{ fontWeight: 500 }}>real UF alumni, ready-to-send messages, visible progress</strong>.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginBottom: 0, ...f(0.14) }}>
          You stop asking "any updates?" because you see momentum. They stop feeling invisible.
        </p>

        {/* Quotes */}
        <div className="v2-parent-quotes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 44, marginBottom: 48, ...f(0.18) }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 22px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(250,70,22,0.3)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(250,70,22,0.08), 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'; }}
            >
              <span style={{ fontFamily: playfair, fontSize: 44, lineHeight: 0.5, color: '#FA4616', opacity: 0.35, display: 'block', marginBottom: 10, userSelect: 'none' }}>&ldquo;</span>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 16 }}>{q.text}</p>
              <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: i === 0 ? '#FA4616' : '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{q.name[0]}</div>
                <div>
                  <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8', display: 'block' }}>{q.name}</span>
                  <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>{q.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={f(0.24)}>
          <CTAButton text="Activate FASTIQ for My Student — 7-Day Free Trial" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}