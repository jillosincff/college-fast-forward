import React, { useRef, useState, useEffect } from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2TheNumbers() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s`,
  });

  return (
    <section ref={ref} style={{ background: '#f4f2ee', padding: '125px 24px 135px' }}>
      <style>{`@media(max-width:640px){.v2-numbers-grid{flex-direction:column !important;gap:32px !important}.v2-numbers-vs{display:none !important}}`}</style>
      <div className="max-w-[700px] mx-auto text-center">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#0d1117', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 48, ...f(0) }}>
          The Numbers Don't Lie
        </h2>

        {/* Stats */}
        <div className="v2-numbers-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginBottom: 36, ...f(0.08) }}>
          {/* Cold */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 64px)', color: '#9CA3AF', lineHeight: 1, marginBottom: 8 }}>1 in 250</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cold Application</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>gets an interview</p>
          </div>

          {/* VS */}
          <div className="v2-numbers-vs" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#0d1117' }}>VS</div>

          {/* Warm */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 64px)', color: '#E85D20', lineHeight: 1, marginBottom: 8 }}>1 in 5</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warm Introduction</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>gets an interview</p>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: '#374151', marginBottom: 12, ...f(0.14) }}>
          Same resume. Same student. <strong style={{ fontWeight: 600 }}>30× better odds.</strong>
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#0d1117', ...f(0.18) }}>
          The only difference? Someone cared enough to make an introduction.
        </p>
      </div>
    </section>
  );
}