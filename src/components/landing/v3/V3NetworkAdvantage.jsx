import React from 'react';
import { playfair, dmSans, LIGHT_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const BLOCKS = [
  {
    icon: '🤝',
    title: 'Community support system',
    desc: 'Families are part of a broader network that can occasionally open doors.',
  },
  {
    icon: '🔗',
    title: 'Optional warm introduction',
    desc: 'When relevant, a connection can help increase the chance of a response.',
  },
  {
    icon: '📈',
    title: 'Better odds',
    desc: 'FastIQ drives the process. The network can accelerate outcomes.',
  },
];

export default function V3NetworkAdvantage() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: LIGHT_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-net-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[780px] mx-auto">
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#0d1117', textAlign: 'center', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0) }}>
          Then the network gives them an edge
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: '#374151', textAlign: 'center', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 48px', ...fadeStyle(vis, 0.06) }}>
          FastIQ works on its own. But when the right opportunity appears, the College Fast Forward network can help boost the odds.
        </p>

        <div className="v3-net-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36, ...fadeStyle(vis, 0.1) }}>
          {BLOCKS.map((b, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              padding: '28px 22px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 14 }}>{b.icon}</span>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 16, color: '#0d1117', marginBottom: 10, lineHeight: 1.3 }}>{b.title}</h3>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#6B7280', lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(18px, 2.5vw, 24px)', color: '#E85D20', textAlign: 'center', lineHeight: 1.5, ...fadeStyle(vis, 0.16) }}>
          A parent intro is the icing on the cake — not the entire cake.
        </p>
      </div>
    </section>
  );
}