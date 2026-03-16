import React, { useRef, useState, useEffect } from 'react';

const playfair = "'Playfair Display', Georgia, serif";

export default function V2PositioningStatement() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background: '#0d1117', padding: '120px 24px', textAlign: 'center' }}>
      <p style={{
        fontFamily: playfair,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 'clamp(22px, 3.5vw, 34px)',
        color: '#fff',
        lineHeight: 1.5,
        maxWidth: 700,
        margin: '0 auto',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        "It's not just a job board. It's a synchronized system where parent advocacy and AI intelligence work together 24/7 to land the offer."
      </p>
    </section>
  );
}