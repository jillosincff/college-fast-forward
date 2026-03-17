import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

export default function V3Numbers() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-stats-row{flex-direction:column !important;gap:32px !important}.v3-stats-vs{display:none !important}}`}</style>
      <div className="max-w-[700px] mx-auto text-center">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0) }}>
          The difference isn't effort.{' '}
          <em>It's direction, action, and access.</em>
        </h2>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '0 auto 48px', ...fadeStyle(vis, 0.04) }} />

        <div className="v3-stats-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginBottom: 40, ...fadeStyle(vis, 0.08) }}>
          {/* Cold */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 60px)', color: '#4B5563', lineHeight: 1, marginBottom: 8 }}>1 in 250</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cold Application</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>leads to an offer</p>
          </div>

          <div className="v3-stats-vs" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>vs</div>

          {/* Warm */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 60px)', color: '#E85D20', lineHeight: 1, marginBottom: 8 }}>1 in 5</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Referral</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>can lead to an interview</p>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: '#FFFFFF', lineHeight: 1.65, ...fadeStyle(vis, 0.14) }}>
          FastIQ improves direction and execution.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>The network can increase the odds even more.</span>
        </p>
      </div>
    </section>
  );
}