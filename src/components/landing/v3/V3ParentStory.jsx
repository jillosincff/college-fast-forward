import React from 'react';
import { playfair, dmSans, DARK_BG, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

export default function V3ParentStory() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <div className="max-w-[680px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, marginBottom: 14, ...fadeStyle(vis, 0) }}>
          Real Results
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 48, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.02) }}>
          One family's{' '}
          <em style={{ color: ORANGE }}>story.</em>
        </h2>

        {/* Story card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid #1F1F23',
          borderLeft: `4px solid ${ORANGE}`,
          borderRadius: 20,
          padding: '36px 32px',
          ...fadeStyle(vis, 0.06),
        }}>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={ORANGE} stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>

          {/* Opening quote */}
          <p style={{
            fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.8vw, 26px)', color: '#fff',
            lineHeight: 1.45, marginBottom: 20,
          }}>
            "My daughter applied for six months and heard nothing."
          </p>

          {/* Story body */}
          <p style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 400,
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 24,
          }}>
            Two weeks after joining College Fast Forward, she had three interviews — all from warm introductions made through the parent network. One of them turned into an offer.
          </p>

          {/* Attribution */}
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            — Parent, University of Florida · Class of 2025
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontWeight: 300, fontStyle: 'italic',
          fontSize: 13, color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6, marginTop: 24,
          ...fadeStyle(vis, 0.12),
        }}>
          Results vary. This is one family's experience — and why we built this.
        </p>
      </div>
    </section>
  );
}