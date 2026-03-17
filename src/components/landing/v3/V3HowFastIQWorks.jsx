import React from 'react';
import { playfair, dmSans } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const STEPS = [
  {
    num: '01',
    title: 'Direction',
    desc: 'FastIQ helps your student figure out where to focus instead of guessing.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Action',
    desc: 'It gives them a clear daily plan so they know exactly what to do next.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Outreach',
    desc: 'It identifies alumni, prioritizes who to contact, and crafts personalized outreach.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Momentum',
    desc: "It keeps the process moving so your student builds traction instead of stalling out.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
      </svg>
    ),
  },
];

export default function V3HowFastIQWorks() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: '#0a0f18', padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:768px){.v3-steps-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[820px] mx-auto">
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', textAlign: 'center', marginBottom: 14, ...fadeStyle(vis, 0) }}>
          The FastIQ System
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)', color: '#fff', textAlign: 'center', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          FastIQ turns confusion into <em>momentum</em>
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 56, lineHeight: 1.6, maxWidth: 550, marginLeft: 'auto', marginRight: 'auto', ...fadeStyle(vis, 0.08) }}>
          This isn't another tool. It's a system your student follows.
        </p>

        <div className="v3-steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, ...fadeStyle(vis, 0.12) }}>
          {STEPS.map((s) => (
            <div key={s.num} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '28px 24px',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(232,93,32,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{s.num}</span>
              </div>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}