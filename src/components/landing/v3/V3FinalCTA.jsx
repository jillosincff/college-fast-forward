import React from 'react';
import { playfair, dmSans, LIGHT_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

export default function V3FinalCTA({ onCTA, onQuiz }) {
  const { ref, vis } = useFadeIn();

  return (
    <>
      <section ref={ref} style={{ background: LIGHT_BG, padding: '110px 24px 100px', textAlign: 'center' }}>
        <div className="max-w-[600px] mx-auto">
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#0d1117', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em', ...fadeStyle(vis, 0) }}>
            From stuck and uncertain<br />
            to <em style={{ color: '#E85D20' }}>focused, active, and moving forward</em>
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: '#374151', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 36px', ...fadeStyle(vis, 0.06) }}>
            FastIQ gives your student a clear path.
            <br />
            The College Fast Forward network gives them an extra edge when it matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={fadeStyle(vis, 0.12)}>
            <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} />
            <button
              onClick={onQuiz}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                color: '#E85D20', background: 'none', border: 'none',
                cursor: 'pointer', padding: '12px 20px',
                minHeight: 'auto', minWidth: 'auto', width: 'auto',
                textDecoration: 'underline', textUnderlineOffset: 4,
              }}
            >
              Take the Student Quiz
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="v3-footer" style={{ background: '#0d1117', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <style>{`@media(max-width:768px){.v3-footer{flex-direction:column !important;align-items:center !important;gap:12px !important;padding:24px 16px !important}}`}</style>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>College Fast Forward</span>
        <nav style={{ display: 'flex', gap: 24 }}>
          {[{ label: 'Privacy', href: '#Privacy' }, { label: 'Terms', href: '#Terms' }, { label: 'Contact', href: '#SubmitFeedback' }].map((l) => (
            <a key={l.label} href={l.href} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.2s', minHeight: 'auto' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
            >{l.label}</a>
          ))}
        </nav>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.15)' }}>© {new Date().getFullYear()} College Fast Forward. All Rights Reserved.</span>
      </footer>
    </>
  );
}