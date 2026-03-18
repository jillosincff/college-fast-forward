import React from 'react';
import { playfair, dmSans, DARK_BG, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const COLUMNS = [
  {
    title: 'Networking at scale',
    text: "Your student isn't starting from zero. They tap into a growing network of parents and alumni across schools and industries.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Warm introductions',
    text: "Real opportunities don't come from job boards. They come from conversations — and knowing the right person.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    ),
  },
  {
    title: 'One network, every school',
    text: "This isn't limited to one campus. Your student gains access to a national network of families.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
];

const FASTIQ_ITEMS = [
  { title: 'Finds hidden opportunities', desc: 'Surfaces roles, companies, and paths your student would never find on their own.' },
  { title: 'Identifies alumni everywhere', desc: "Finds alumni from your student's school at companies and industries that matter." },
  { title: 'Writes personalized outreach', desc: 'Drafts messages they can actually send, not generic templates.' },
  { title: 'Tailors resumes for each role', desc: 'Creates ATS-friendly resumes and cover letters matched to specific jobs.' },
];

const NETWORK_ITEMS = [
  'Parents and alumni across industries',
  'Warm introductions when it matters',
  'Real conversations, not cold outreach',
  'One network, every school',
];

function LightningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export default function V3ParentNetwork({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-pn-grid{grid-template-columns:1fr !important}.v3-pn-feat{grid-template-columns:1fr !important}}`}</style>

      <div className="max-w-[860px] mx-auto">
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
          color: ORANGE,
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
          maxWidth: 620, margin: '0 auto 48px',
          ...fadeStyle(vis, 0.08),
        }}>
          A shared network of parents and alumni who choose to help — offering introductions, insight, and access.
        </p>

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
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F23'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(232,93,32,0.08)',
                border: '1px solid rgba(232,93,32,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
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

        {/* ── Merged two-column FastIQ / Network features ── */}
        <div className="v3-pn-feat" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 48, ...fadeStyle(vis, 0.16) }}>
          {/* Left — What FastIQ does */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1F1F23',
            borderRadius: 20, padding: '28px 24px',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F23'; }}
          >
            <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
              What FastIQ does
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {FASTIQ_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(232,93,32,0.08)',
                    border: '1px solid rgba(232,93,32,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 1,
                  }}>
                    <LightningIcon />
                  </div>
                  <div>
                    <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: 3 }}>{item.title}</p>
                    <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — What the network does */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1F1F23',
            borderRadius: 20, padding: '28px 24px',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F23'; }}
          >
            <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
              What the network does
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {NETWORK_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(232,93,32,0.08)',
                    border: '1px solid rgba(232,93,32,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PeopleIcon />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Power line */}
        <p className="text-center" style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(17px, 2.2vw, 22px)',
          color: ORANGE,
          lineHeight: 1.5, marginBottom: 48,
          ...fadeStyle(vis, 0.20),
        }}>
          Your network isn't just who you know. It's who the network knows.
        </p>

        {/* CTA */}
        <div className="text-center" style={fadeStyle(vis, 0.24)}>
          <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} />
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300,
            color: 'rgba(255,255,255,0.4)', marginTop: 14, lineHeight: 1.5,
          }}>
            Parents join the network for free. FastIQ included.
          </p>
        </div>
      </div>
    </section>
  );
}