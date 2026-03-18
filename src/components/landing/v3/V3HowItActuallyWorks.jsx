import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const STEPS = [
  {
    num: '01',
    title: 'FastIQ builds the plan',
    items: ['Target companies identified', 'Alumni discovered', 'Personalized outreach drafted'],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Your student takes action',
    items: ['Reaches out to real people', 'Builds momentum daily', 'Tracks progress'],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'The network steps in',
    items: ['When a connection exists', 'When access matters', 'When it changes everything'],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function V3HowItActuallyWorks() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-hiaw-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[860px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary, #4F8CFF)', marginBottom: 14, transition: 'color 0.4s', ...fadeStyle(vis, 0) }}>
          How It Works
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          How your student actually moves forward
        </h2>

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 8, ...fadeStyle(vis, 0.06) }}>
          AI finds the path. People open the doors.
        </p>

        <div style={{ width: 40, height: 2, background: '#E85D20', borderRadius: 1, margin: '0 auto 52px', ...fadeStyle(vis, 0.08) }} />

        <div className="v3-hiaw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48, ...fadeStyle(vis, 0.12) }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1F1F23',
              borderRadius: 20, padding: '30px 24px',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border, rgba(79,140,255,0.30))'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F23'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--accent-soft, rgba(79,140,255,0.1))',
                  border: '1px solid var(--accent-border, rgba(79,140,255,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.4s, border-color 0.4s',
                }}>
                  {s.icon}
                </div>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>{s.num}</span>
              </div>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 16, lineHeight: 1.3 }}>{s.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {s.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary, #4F8CFF)', marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center" style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.55,
          ...fadeStyle(vis, 0.18),
        }}>
          The network isn't required.<br />
          <span style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>But when it's there — it changes everything.</span>
        </p>
      </div>
    </section>
  );
}