import React from 'react';
import { playfair, dmSans, DARK_BG, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const ROWS = [
  { left: 'Sending resumes into a black hole', right: 'Target companies identified in minutes' },
  { left: 'No idea who to contact', right: "Alumni matched to your student's goals" },
  { left: 'Generic outreach that gets ignored', right: 'Personalized messages ready to send' },
  { left: 'No network, no access', right: 'Warm introductions from parents and alumni' },
  { left: 'Stuck and overwhelmed', right: 'A clear plan and daily next steps' },
];

export default function V3ComparisonTable() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px' }}>
      <style>{`
        @media(max-width:640px){
          .v3-comp-row{flex-direction:column !important; gap:0 !important}
          .v3-comp-hdr{flex-direction:column !important; gap:0 !important}
          .v3-comp-divider{display:none !important}
        }
      `}</style>
      <div className="max-w-[780px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, marginBottom: 14, ...fadeStyle(vis, 0) }}>
          The Difference
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          Job searching alone vs.{' '}
          <em style={{ color: ORANGE }}>College Fast Forward</em>
        </h2>

        <div style={{ width: 40, height: 2, background: ORANGE, borderRadius: 1, margin: '0 auto 48px', ...fadeStyle(vis, 0.06) }} />

        {/* Table container */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1F1F23', ...fadeStyle(vis, 0.10) }}>
          {/* Header row */}
          <div className="v3-comp-hdr" style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '20px 24px', background: 'rgba(255,255,255,0.03)' }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#6B7280', margin: 0 }}>
                Job searching alone
              </p>
            </div>
            <div className="v3-comp-divider" style={{ width: 1, background: '#1F1F23' }} />
            <div style={{ flex: 1, padding: '20px 24px', background: 'rgba(232,93,32,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
              </svg>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: ORANGE, margin: 0 }}>
                College Fast Forward
              </p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div key={i}>
              <div style={{ height: 1, background: '#1F1F23' }} />
              <div className="v3-comp-row" style={{ display: 'flex' }}>
                <div style={{ flex: 1, padding: '16px 24px', background: 'rgba(220,38,38,0.03)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#7F4040', fontSize: 15, flexShrink: 0, marginTop: 1 }}>✗</span>
                  <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#9CA3AF', lineHeight: 1.55 }}>{row.left}</span>
                </div>
                <div className="v3-comp-divider" style={{ width: 1, background: '#1F1F23' }} />
                <div style={{ flex: 1, padding: '16px 24px', background: 'rgba(232,93,32,0.03)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: ORANGE, fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.55 }}>{row.right}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}