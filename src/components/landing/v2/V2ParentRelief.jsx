import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const QUOTES = [
  { text: 'My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own. Worth every penny.', name: 'Dana G.', role: 'UF Parent' },
  { text: 'Honestly, I had no clue how to start my job search. I reached out to several parents on here and they went out of their way to talk to me. It was actually incredible.', name: 'Sofia L.', role: 'UF Junior · Communications' },
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
    <section ref={ref} className="v2-parent" style={{ background: '#0a1016', padding: '100px 24px 110px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@media(max-width:768px){.v2-parent{padding:72px 20px !important}.v2-parent-quotes{grid-template-columns:1fr !important}}`}</style>
      <div aria-hidden className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(250,70,22,0.05),transparent 70%)' }} />

      <div className="max-w-[700px] mx-auto relative">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.15, textAlign: 'center', marginBottom: 12, ...f(0) }}>
          <span style={{ color: '#f4f0e8' }}>For Parents Who Are </span>
          <span style={{ fontStyle: 'italic', color: '#FA4616' }}>Freaking Out</span>
        </h2>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '0 auto 32px', ...f(0.04) }} />

        <div style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginBottom: 20, ...f(0.08) }}>
          <p style={{ marginBottom: 16 }}>
            You're watching your kid spiral — late nights on Handshake, dodging your questions, stress everywhere. You're spending a fortune on college and terrified they'll graduate with nothing lined up.
          </p>
          <p>
            FASTIQ is the plan you can both believe in: finds real UF alumni already working at the companies they're targeting, writes the messages they can send <em>today</em>, shows progress you can both see — so you stop asking "any updates?" and they stop feeling invisible.
          </p>
        </div>

        {/* Quotes */}
        <div className="v2-parent-quotes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 40, marginBottom: 44, ...f(0.16) }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '24px 22px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontFamily: playfair, fontSize: 48, lineHeight: 0.5, color: '#FA4616', opacity: 0.4, display: 'block', marginBottom: 10, userSelect: 'none' }}>&ldquo;</span>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 16 }}>{q.text}</p>
              <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FA4616', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', flexShrink: 0 }}>{q.name[0]}</div>
                <div>
                  <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#f4f0e8', display: 'block' }}>{q.name}</span>
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.4)' }}>{q.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={f(0.24)}>
          <CTAButton text="Start 7-Day Free Trial — $29/mo after" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}