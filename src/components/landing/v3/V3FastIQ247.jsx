import React from 'react';
import { playfair, dmSans } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    title: 'Finds hidden opportunities',
    desc: 'Surfaces roles, companies, and paths your student would never find on their own.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Identifies alumni everywhere',
    desc: "Finds alumni from your student's school at companies and industries that matter.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
    title: 'Writes personalized outreach',
    desc: 'Drafts messages they can actually send — not generic templates.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
      </svg>
    ),
    title: 'Tailors resumes for each role',
    desc: 'Creates ATS-friendly resumes and cover letters matched to specific jobs.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    title: 'Builds a stronger LinkedIn profile',
    desc: 'Helps your student look more credible to recruiters and professionals.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Prepares for interviews',
    desc: 'Supports mock interviews using proven structures like STAR.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    ),
    title: 'Suggests follow-ups',
    desc: 'Keeps conversations alive and momentum going after first outreach.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
      </svg>
    ),
    title: 'Keeps momentum going',
    desc: "Daily next steps so progress never stalls.",
  },
];

export default function V3FastIQ247() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: '#0E0F14', padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-feat-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[900px] mx-auto">
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary, #4F8CFF)', textAlign: 'center', marginBottom: 14, transition: 'color 0.4s', ...fadeStyle(vis, 0) }}>
          Beyond the demo
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', textAlign: 'center', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          FastIQ works for your student 24/7
        </h2>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 56, lineHeight: 1.6, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto', ...fadeStyle(vis, 0.08) }}>
          Not just advice — a system that uncovers opportunities and keeps your student moving forward.
        </p>

        <div className="v3-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, ...fadeStyle(vis, 0.12) }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1F1F23',
              borderRadius: 16, padding: '22px 20px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border, rgba(79,140,255,0.25))'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1F1F23'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--accent-soft, rgba(79,140,255,0.08))', border: '1px solid var(--accent-border, rgba(79,140,255,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: dmSans, fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}