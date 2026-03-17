import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const BENEFITS = [
  'Clear direction, not guessing',
  'Personalized target companies and alumni discovery',
  'AI-generated outreach that actually helps',
  'Daily action plan to keep your student moving',
  'Access to the College Fast Forward network when it matters',
];

export default function V3Pricing({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG, padding: '120px 24px 130px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(250,70,22,0.05),transparent 70%)' }} />

      <div className="max-w-[500px] mx-auto relative">
        {/* Badge */}
        <div className="text-center mb-4" style={fadeStyle(vis, 0)}>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.2)', borderRadius: 100, padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" /></svg>
            FASTIQ™
          </span>
        </div>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 38px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6, ...fadeStyle(vis, 0.04) }}>
          Give your student a real advantage
        </h2>

        <div className="text-center" style={fadeStyle(vis, 0.06)}>
          <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 3vw, 34px)', color: '#f4f0e8', marginBottom: 4, marginTop: 20 }}>
            $29/mo <span style={{ fontFamily: dmSans, fontSize: '0.55em', fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>or</span> $249/year
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#c9a84c', marginBottom: 0 }}>Save 28% with annual</p>
        </div>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '20px auto 28px', ...fadeStyle(vis, 0.08) }} />

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(232,93,32,0.25)', borderRadius: 20, padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 0 40px rgba(232,93,32,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
          ...fadeStyle(vis, 0.12),
        }}>
          <p className="text-center" style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#FFFFFF', marginBottom: 24 }}>
            Start with a free 7-day trial
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {BENEFITS.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '0.5px solid rgba(232,93,32,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="#E85D20" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} fullWidth />
        </div>

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 16, ...fadeStyle(vis, 0.18) }}>
          Access the network. Activate progress with FastIQ.
        </p>
      </div>
    </section>
  );
}