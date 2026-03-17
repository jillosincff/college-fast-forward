import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

export default function V3StudentQuiz({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '110px 24px 120px' }}>
      <div className="max-w-[560px] mx-auto text-center">
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', marginBottom: 14, ...fadeStyle(vis, 0) }}>
          For Students
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#fff', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          Not sure where to start?
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 36, ...fadeStyle(vis, 0.08) }}>
          Take the 60-second student quiz to uncover possible paths, target companies, and where to begin.
        </p>

        <div style={fadeStyle(vis, 0.12)}>
          <CTAButton text="Take the Student Quiz →" onClick={onCTA} variant="outline" />
        </div>
      </div>
    </section>
  );
}