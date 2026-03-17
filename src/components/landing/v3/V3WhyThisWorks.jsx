import React from 'react';
import { playfair, dmSans, DARK_BG_ALT } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

export default function V3WhyThisWorks() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px' }}>
      <div className="max-w-[700px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary, #4F8CFF)', marginBottom: 14, transition: 'color 0.4s', ...fadeStyle(vis, 0) }}>
          Why This Works
        </p>

        {/* Block 1 */}
        <div style={{ marginBottom: 48, ...fadeStyle(vis, 0.04) }}>
          <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 38px)', color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Your network isn't just who you know.<br />
            <em style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>It's who the network knows.</em>
          </h2>
          <p className="text-center" style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
            One parent has a few connections. A community unlocks thousands.
          </p>
        </div>

        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 auto 48px', ...fadeStyle(vis, 0.08) }} />

        {/* Block 2 */}
        <div style={{ marginBottom: 48, ...fadeStyle(vis, 0.12) }}>
          <h3 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 3vw, 32px)', color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Most resumes never reach a human.
          </h3>
          <p className="text-center" style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
            We help your student get in front of someone who can actually open the door.
          </p>
        </div>

        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 auto 48px', ...fadeStyle(vis, 0.16) }} />

        {/* Closing */}
        <p className="text-center" style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          color: '#fff', lineHeight: 1.35, letterSpacing: '-0.01em',
          ...fadeStyle(vis, 0.20),
        }}>
          This is the difference between being ignored<br />
          <span style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>and getting in the room.</span>
        </p>
      </div>
    </section>
  );
}