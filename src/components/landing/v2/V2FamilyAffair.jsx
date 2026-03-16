import React, { useRef, useState, useEffect } from 'react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const MESSAGES = [
  "My daughter needs an internship this summer. Do you know anyone in fashion? Can you do me a favor — if I send you her resume, can you pass it along to your contact? She has no clue what she wants to do but she needs to do something. Running out of time and of course, she left this for the last minute.",
  "We're in the same boat. My son loves sports but we don't know anyone. He sent his resume to a million companies and hasn't gotten one response. I'm so upset. I really don't know what to do.",
  "Wait — my neighbor's son works for ESPN. I'll ask if he can help...",
];

export default function V2FamilyAffair() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s`,
  });

  return (
    <section ref={ref} style={{ background: '#f4f2ee', padding: '100px 24px 110px' }}>
      <style>{`@media(max-width:768px){.v2-family{padding:72px 20px !important}}`}</style>
      <div className="max-w-[760px] mx-auto">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#0d1117', lineHeight: 1.15, textAlign: 'center', marginBottom: 40, letterSpacing: '-0.02em', ...f(0) }}>
          Let's be real. Job searching is a <em>family affair</em>.
        </h2>

        {/* Conversation thread */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44, ...f(0.08) }}>
          {MESSAGES.map((msg, i) => (
            <div key={i} style={{
              background: '#1a1f2e',
              borderRadius: 16,
              padding: '20px 24px',
              maxWidth: '92%',
              alignSelf: i === 2 ? 'flex-end' : 'flex-start',
            }}>
              <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: 0 }}>
                "{msg}"
              </p>
            </div>
          ))}
        </div>

        {/* Pivot */}
        <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#0d1117', textAlign: 'center', marginBottom: 20, ...f(0.14) }}>
          That's it. That's the whole game.
        </h3>

        <div style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 400, color: '#374151', lineHeight: 1.7, textAlign: 'center', maxWidth: 600, margin: '0 auto 32px', ...f(0.18) }}>
          <p style={{ marginBottom: 14 }}>One parent. One connection. One conversation that changes everything.</p>
          <p>The problem isn't your kid. It's that most families don't have a neighbor whose son works at ESPN.</p>
        </div>

        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px, 3vw, 30px)', color: '#E85D20', textAlign: 'center', lineHeight: 1.4, ...f(0.22) }}>
          "College Fast Forward gives every family that neighbor."
        </p>
      </div>
    </section>
  );
}