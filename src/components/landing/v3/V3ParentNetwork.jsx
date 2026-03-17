import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
// Note: this section replaces the old quiz — it's the parent network value proposition
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const COLUMNS = [
  {
    title: 'Networking at scale',
    text: "Your student isn't starting from zero. They tap into a growing network of parents and alumni across schools and industries.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #E85D20)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Warm introductions',
    text: "Real opportunities don't come from job boards. They come from conversations — and knowing the right person.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #E85D20)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
  },
  {
    title: 'One network, every school',
    text: "This isn't limited to one campus. Your student gains access to a national network of families.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #E85D20)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
];

export default function V3ParentNetwork({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-pn-grid{grid-template-columns:1fr !important}}`}</style>

      <div className="max-w-[820px] mx-auto">
        {/* Main headline */}
        <h2 className="text-center" style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(28px, 4.5vw, 48px)',
          color: '#fff', lineHeight: 1.12, letterSpacing: '-0.02em',
          marginBottom: 10,
          ...fadeStyle(vis, 0),
        }}>
          This is College Fast Forward.
        </h2>
        <h2 className="text-center" style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(24px, 3.8vw, 42px)',
          lineHeight: 1.15, letterSpacing: '-0.02em',
          marginBottom: 20,
          color: 'var(--accent-primary, #E85D20)',
          transition: 'color 0.4s',
          ...fadeStyle(vis, 0.04),
        }}>
          Where parents turn connections into opportunities&nbsp;for&nbsp;students.
        </h2>

        {/* Subheadline */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.75)', lineHeight: 1.65,
          maxWidth: 640, margin: '0 auto 16px',
          ...fadeStyle(vis, 0.06),
        }}>
          Because this is still a who-you-know game — and now your student has a network behind them.
        </p>

        {/* Supporting paragraph */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.7vw, 17px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
          maxWidth: 620, margin: '0 auto 56px',
          ...fadeStyle(vis, 0.08),
        }}>
          College Fast Forward is a parent-powered network where families choose to help — offering introductions, advice, and access to opportunities students would never find on their own.
        </p>

        {/* Divider */}
        <div style={{ width: 40, height: 2, background: 'var(--accent-primary, #4F8CFF)', borderRadius: 1, margin: '0 auto 48px', transition: 'background 0.4s', ...fadeStyle(vis, 0.10) }} />

        {/* 3-column value block */}
        <div className="v3-pn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48, ...fadeStyle(vis, 0.12) }}>
          {COLUMNS.map((col, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1F1F23',
              borderRadius: 20, padding: '30px 24px',
              textAlign: 'center',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border, rgba(232,93,32,0.30))'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--accent-soft, rgba(232,93,32,0.12))',
                border: '1px solid var(--accent-border, rgba(232,93,32,0.25))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                transition: 'background 0.4s, border-color 0.4s',
              }}>
                {col.icon}
              </div>
              <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
                {col.title}
              </h3>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                {col.text}
              </p>
            </div>
          ))}
        </div>

        {/* Power line */}
        <p className="text-center" style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(17px, 2.2vw, 22px)',
          color: 'var(--accent-primary, #E85D20)',
          lineHeight: 1.5, marginBottom: 48,
          transition: 'color 0.4s',
          ...fadeStyle(vis, 0.16),
        }}>
          When one parent helps a student, every student benefits.
        </p>

        {/* CTA */}
        <div className="text-center" style={fadeStyle(vis, 0.20)}>
          <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} />
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300,
            color: 'rgba(255,255,255,0.4)', marginTop: 14, lineHeight: 1.5,
          }}>
            Free to join the network. FastIQ included.
          </p>
        </div>
      </div>
    </section>
  );
}