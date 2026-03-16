import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA, SecondaryCTA } from '@/components/landing/LandingCTAButton';

const FONT_LINK_ID = 'footer-cta-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function LandingFooterCTA({ stats, onClaim }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return (
    <>
      {/* Pre-footer conversion block */}
      <section
        ref={ref}
        className="landing-footer-cta"
        style={{
          background: '#0a1016',
          borderTop: '0.5px solid rgba(255,255,255,0.08)',
          padding: '96px 48px 80px',
          textAlign: 'center',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .landing-footer-cta { padding: 72px 24px !important; }
            .landing-footer-cta .footer-cta-headline { font-size: clamp(26px, 6vw, 36px) !important; }
            .footer-cta-grid { flex-direction: column-reverse !important; width: 100% !important; }
            .footer-cta-grid > * { width: 100% !important; }
            .landing-footer-links { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 12px !important; padding: 24px 24px !important; }
          }
        `}</style>
        {/* Headline */}
        <h2 className="footer-cta-headline"
          style={{
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 44px)',
            color: '#f4f0e8',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 16,
            ...fadeUp(0),
          }}
        >
          Your student's career starts with{' '}
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>
            one conversation.
          </span>
        </h2>

        {/* Subhead */}
        <p
          style={{
            fontFamily: dmSans,
            fontSize: 19,
            fontWeight: 300,
            color: '#FFFFFF',
            maxWidth: 520,
            margin: '0 auto 36px',
            lineHeight: 1.6,
            ...fadeUp(0.08),
          }}
        >
          Nearly 1,000 UF families have already found their people on College Fast Forward. The right intro is waiting.
        </p>

        {/* CTA grid */}
        <div className="footer-cta-grid"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
            ...fadeUp(0.16),
          }}
        >
          <SecondaryCTA text="Join the Network — $9/month" onClick={onClaim} />
          <PrimaryCTA text="Unlock FASTIQ — $29/month" onClick={onClaim} />
        </div>

        {/* Fine print */}
        <p
          style={{
            fontFamily: dmSans,
            fontSize: 13,
            fontWeight: 300,
            color: 'rgba(244,240,232,0.25)',
            margin: 0,
            ...fadeUp(0.22),
          }}
        >
          Cancel anytime. No contracts. Takes 30 seconds.
        </p>
      </section>

      {/* Standard footer links */}
      <footer className="landing-footer-links"
        style={{
          background: '#080c10',
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Left: wordmark */}
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(244,240,232,0.4)' }}>
          College Fast Forward
        </span>

        {/* Center: nav links */}
        <nav style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Privacy', href: '#Privacy' },
            { label: 'Terms', href: '#Terms' },
            { label: 'Cookies', href: '#CookiePolicy' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: dmSans,
                fontSize: 13,
                fontWeight: 300,
                color: 'rgba(244,240,232,0.25)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                minHeight: 'auto',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(244,240,232,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(244,240,232,0.25)'; }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: copyright */}
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.2)' }}>
          © {new Date().getFullYear()} College Fast Forward. All rights reserved.
        </span>
      </footer>
    </>
  );
}