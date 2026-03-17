import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const BULLETS = [
  { icon: '✓', text: 'Clear direction' },
  { icon: '✓', text: 'Daily action' },
  { icon: '✓', text: 'Real outreach' },
  { icon: '✓', text: 'Visible momentum' },
];

export default function V3ParentPeace() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <div className="max-w-[620px] mx-auto text-center">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0) }}>
          For parents who want to see <em>real progress</em>
        </h2>

        <div style={{ width: 40, height: 2, background: 'var(--accent-primary, #4F8CFF)', borderRadius: 1, margin: '0 auto 36px', transition: 'background 0.4s', ...fadeStyle(vis, 0.04) }} />

        <p style={{ fontFamily: dmSans, fontSize: 18, color: '#A1A1AA', lineHeight: 1.7, marginBottom: 12, ...fadeStyle(vis, 0.08) }}>
          You don't need to manage your student.
          <br />
          You need a system that works.
        </p>

        <p style={{ fontFamily: dmSans, fontSize: 18, color: '#A1A1AA', lineHeight: 1.7, marginBottom: 36, ...fadeStyle(vis, 0.12) }}>
          FastIQ gives them direction and daily action.
          <br />
          You get peace of mind knowing they're finally moving.
        </p>

        <div className="flex flex-wrap justify-center gap-3" style={fadeStyle(vis, 0.16)}>
          {BULLETS.map((b, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid #1F1F23',
              borderRadius: 100, padding: '10px 20px',
            }}>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: 16 }}>{b.icon}</span>
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff' }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}