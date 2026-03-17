import React from 'react';
import { playfair, dmSans, DARK_BG_ALT } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const AI_BULLETS = [
  'Identifies target companies',
  'Finds the right alumni',
  'Writes personalized outreach',
  'Prepares resumes + LinkedIn',
  'Guides every next step',
];

const NETWORK_BULLETS = [
  'Parents and alumni across industries',
  'Warm introductions',
  'Real conversations',
  'Insider advice',
  'Hidden opportunities',
];

function Bullet({ text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 7,
        background: 'var(--accent-primary, #4F8CFF)',
        boxShadow: '0 0 6px var(--accent-glow, rgba(79,140,255,0.3))',
        transition: 'background 0.4s, box-shadow 0.4s',
      }} />
      <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
        {text}
      </span>
    </li>
  );
}

function ColumnCard({ icon, header, bullets, tagline, delay, vis }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '32px 26px 28px',
      flex: 1, minWidth: 0,
      transition: 'border-color 0.3s, box-shadow 0.3s',
      ...fadeStyle(vis, delay),
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-border, rgba(79,140,255,0.30))';
        e.currentTarget.style.boxShadow = '0 0 30px var(--accent-glow, rgba(79,140,255,0.08))';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--accent-soft, rgba(79,140,255,0.12))',
        border: '1px solid var(--accent-border, rgba(79,140,255,0.25))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        {icon}
      </div>

      {/* Header */}
      <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 18, lineHeight: 1.3 }}>
        {header}
      </h3>

      {/* Bullets */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
        {bullets.map((b, i) => <Bullet key={i} text={b} />)}
      </ul>

      {/* Tagline */}
      <p style={{
        fontFamily: dmSans, fontWeight: 700, fontSize: 16,
        color: 'var(--accent-primary, #4F8CFF)',
        transition: 'color 0.4s',
        lineHeight: 1.4, marginTop: 'auto',
      }}>
        {tagline}
      </p>
    </div>
  );
}

function Connector({ vis }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 0', minWidth: 60,
      ...fadeStyle(vis, 0.14),
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--accent-soft, rgba(79,140,255,0.12))',
        border: '1.5px solid var(--accent-border, rgba(79,140,255,0.30))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px var(--accent-glow, rgba(79,140,255,0.15))',
        transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
      }}>
        <span style={{
          fontFamily: dmSans, fontWeight: 300, fontSize: 28,
          color: 'var(--accent-primary, #4F8CFF)',
          lineHeight: 1, transition: 'color 0.4s',
        }}>+</span>
      </div>
      <span style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 500,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center', marginTop: 10, lineHeight: 1.35, maxWidth: 90,
      }}>
        Where it all comes together
      </span>
    </div>
  );
}

export default function V3AIAccessModel({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 100px' }}>
      <style>{`
        @media(max-width:768px){
          .v3-aia-row{flex-direction:column !important; gap:0 !important}
          .v3-aia-connector{padding:8px 0 !important}
          .v3-aia-connector > div:first-child{width:44px !important;height:44px !important}
          .v3-aia-connector span:last-child{display:none !important}
        }
      `}</style>

      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        {/* Micro headline */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--accent-primary, #4F8CFF)',
          marginBottom: 14, transition: 'color 0.4s',
          ...fadeStyle(vis, 0),
        }}>
          This is the difference most students don't have
        </p>

        {/* Transition */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 17px)', fontWeight: 400,
          color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
          marginBottom: 28,
          ...fadeStyle(vis, 0.02),
        }}>
          But even the best plan needs one thing to work — <em>access.</em>
        </p>

        {/* Core statement */}
        <h2 className="text-center" style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(26px, 4vw, 44px)',
          color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em',
          marginBottom: 8,
          ...fadeStyle(vis, 0.04),
        }}>
          AI finds the path.<br />
          People open the doors.
        </h2>
        <p className="text-center" style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 500,
          color: 'var(--accent-primary, #4F8CFF)', lineHeight: 1.5,
          maxWidth: 560, margin: '0 auto 52px',
          transition: 'color 0.4s',
          ...fadeStyle(vis, 0.06),
        }}>
          One warm introduction beats 100 cold applications.
        </p>

        {/* 3-column layout */}
        <div className="v3-aia-row" style={{ display: 'flex', alignItems: 'stretch', gap: 16, marginBottom: 48 }}>
          <ColumnCard
            vis={vis}
            delay={0.08}
            header="FastIQ (AI)"
            tagline="AI does the work"
            bullets={AI_BULLETS}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                <circle cx="12" cy="6" r="1" fill="var(--accent-primary, #4F8CFF)" stroke="none"/>
              </svg>
            }
          />

          <div className="v3-aia-connector">
            <Connector vis={vis} />
          </div>

          <ColumnCard
            vis={vis}
            delay={0.18}
            header="The Network"
            tagline="Access opens the door"
            bullets={NETWORK_BULLETS}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #4F8CFF)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
          />
        </div>

        {/* Key insight */}
        <p className="text-center" style={{
          fontFamily: playfair, fontWeight: 700,
          fontSize: 'clamp(17px, 2.3vw, 24px)',
          lineHeight: 1.4, marginBottom: 16,
          color: '#fff', letterSpacing: '-0.01em',
          ...fadeStyle(vis, 0.24),
        }}>
          This is the difference between being ignored<br />
          <span style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>and getting in the room.</span>
        </p>

        {/* Bottom flow */}
        <p className="text-center" style={{
          fontFamily: dmSans, fontWeight: 500,
          fontSize: 'clamp(15px, 2vw, 18px)',
          lineHeight: 1.5, marginBottom: 0,
          color: 'rgba(255,255,255,0.5)',
          ...fadeStyle(vis, 0.26),
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ignored</span>
          {' → '}
          <span style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>Connected</span>
          {' → '}
          <span style={{ color: '#10B981' }}>Hired.</span>
        </p>

        {/* CTA */}
        <div className="text-center" style={fadeStyle(vis, 0.28)}>
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