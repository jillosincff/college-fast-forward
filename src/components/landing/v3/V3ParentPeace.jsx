import React from 'react';
import { playfair, dmSans, DARK_BG, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const STEPS = [
  {
    num: '01',
    title: 'FastIQ builds the plan',
    body: 'Your student enters their goals. FastIQ identifies target companies, finds alumni to contact, and writes personalized outreach — in minutes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'The network steps in',
    body: 'When a parent in the community is connected to someone at your student\'s target company, they get a simple nudge:',
    nudge: '"A student is targeting Nike. You know someone there. Want to make an intro?" One click. Done.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Your student gets in the room',
    body: 'Not another application into a black hole. A real introduction to a real person who can actually open the door. That\'s the difference between being considered and being ignored.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
  },
];

export default function V3ParentPeace({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-pp-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[860px] mx-auto">
        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0) }}>
          This is how College Fast Forward{' '}
          <em style={{ color: ORANGE }}>actually works.</em>
        </h2>

        <div style={{ width: 40, height: 2, background: ORANGE, borderRadius: 1, margin: '0 auto 20px', ...fadeStyle(vis, 0.04) }} />

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.55, maxWidth: 640, margin: '0 auto 52px', ...fadeStyle(vis, 0.06) }}>
          AI builds the strategy. Your community opens the doors. Together, they change everything.
        </p>

        <div className="v3-pp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48, ...fadeStyle(vis, 0.10) }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1F1F23',
              borderRadius: 20, padding: '30px 24px',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F23'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(232,93,32,0.08)',
                  border: '1px solid rgba(232,93,32,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.icon}
                </div>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>{s.num}</span>
              </div>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 14, lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{s.body}</p>

              {/* Nudge bubble for Card 02 */}
              {s.nudge && (
                <div style={{
                  marginTop: 16,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: 14,
                  borderLeft: `3px solid ${ORANGE}`,
                  padding: '14px 16px',
                }}>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                    {s.nudge}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p className="text-center" style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: ORANGE, lineHeight: 1.55,
          marginBottom: 36,
          ...fadeStyle(vis, 0.16),
        }}>
          This is what College Fast Forward does. And there's nothing else like it.
        </p>

        {/* CTA */}
        <div className="flex justify-center" style={fadeStyle(vis, 0.20)}>
          <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}