import React from 'react';
import { playfair, dmSans, DARK_BG_ALT } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const PROBLEMS = [
  { icon: '🎯', text: "They don't know what they want" },
  { icon: '🏢', text: "They don't have target companies" },
  { icon: '🤝', text: "They don't know how to network" },
  { icon: '📄', text: "They send resumes into a black hole — and hear nothing back" },
];

export default function V3Problem() {
  const { ref, vis } = useFadeIn();

  return (
    <section id="how-it-works" ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px' }}>
      <div className="max-w-[640px] mx-auto">
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary, #4F8CFF)', textAlign: 'center', marginBottom: 14, transition: 'color 0.4s', ...fadeStyle(vis, 0) }}>
          The Reality
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#fff', textAlign: 'center', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          Most students aren't lazy. <em>They're lost.</em>
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 48, lineHeight: 1.6, ...fadeStyle(vis, 0.08) }}>
          This is not just a resume problem. It's a direction and execution problem.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...fadeStyle(vis, 0.12) }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1F1F23',
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
              <span style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.5 }}>{p.text}</span>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(17px, 2.2vw, 21px)', color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', lineHeight: 1.5, marginTop: 36,
          ...fadeStyle(vis, 0.16),
        }}>
          They don't have a plan — and no one is telling them what to do next.
        </p>
      </div>
    </section>
  );
}