import React from 'react';
import { playfair, dmSans, DARK_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

export default function V3FinalCTA({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <>
      <section ref={ref} style={{ background: DARK_BG, padding: '110px 24px 100px', textAlign: 'center' }}>
        <div className="max-w-[600px] mx-auto">
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 18, ...fadeStyle(vis, 0) }}>
            Your Student's Future
          </p>

          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
            From "I don't know what I'm doing"<br />
            to <em style={{ color: 'var(--accent-primary, #4F8CFF)', transition: 'color 0.4s' }}>"I know exactly what to do next."</em>
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: '#A1A1AA', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 14px', ...fadeStyle(vis, 0.08) }}>
            Not a job board. Not just AI. Not just networking.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 32px', ...fadeStyle(vis, 0.10) }}>
            A plan. An edge. And real momentum.
          </p>

          {/* Testimonial cards */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10" style={{ maxWidth: 600, margin: '0 auto 40px', ...fadeStyle(vis, 0.12) }}>
            {[
              { quote: 'My son got 3 responses in a week after using this.', attr: 'Parent, Class of 2026' },
              { quote: 'Finally — something that actually helps my kid move forward.', attr: 'Parent, University of Florida' },
            ].map((t, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid #1F1F23', borderRadius: 16, padding: '22px 20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#E85D20" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 15, color: '#fff', lineHeight: 1.55, marginBottom: 10 }}>
                  "{t.quote}"
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  — {t.attr}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={fadeStyle(vis, 0.16)}>
            <CTAButton text="Try It Risk-Free for 7 Days" onClick={onCTA} />
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', marginTop: 10, ...fadeStyle(vis, 0.17) }}>
            Cancel anytime. No long-term commitment.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.3)', marginTop: 8, ...fadeStyle(vis, 0.18) }}>
            Free to join the network. FastIQ included in your trial.
          </p>
        </div>
      </section>

      <footer className="v3-footer" style={{ background: '#050505', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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