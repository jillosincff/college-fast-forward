import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2FooterCTA({ spotsLeft, onCTA }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (d) => ({ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(12px)', transition: `opacity 0.45s ease ${d}s, transform 0.45s ease ${d}s` });

  return (
    <>
      <section ref={ref} style={{ background: '#0a1016', borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '80px 24px 72px', textAlign: 'center' }}>
        <style>{`@media(max-width:768px){.v2-footer-links{flex-direction:column !important;align-items:center !important;gap:12px !important;padding:24px 16px !important}}`}</style>

        <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16, ...f(0) }}>
          Only <span style={{ color: '#FA4616' }}>{spotsLeft}</span> founding spots left at founding rate.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 300, color: '#E5E7EB', marginBottom: 28, ...f(0.06) }}>
          Claim yours before they're gone.
        </p>

        <div style={f(0.12)} className="mb-5">
          <CTAButton text="Start 7-Day Free Trial — $29/mo after" onClick={onCTA} />
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.25)', ...f(0.18) }}>
          No credit card required. Cancel anytime.
        </p>
      </section>

      {/* Footer links */}
      <footer className="v2-footer-links" style={{ background: '#080c10', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>College Fast Forward</span>
        <nav style={{ display: 'flex', gap: 24 }}>
          {[{ label: 'Privacy', href: '#Privacy' }, { label: 'Terms', href: '#Terms' }, { label: 'Cookies', href: '#CookiePolicy' }].map((l) => (
            <a key={l.label} href={l.href} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s', minHeight: 'auto' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
            >{l.label}</a>
          ))}
        </nav>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} College Fast Forward. All rights reserved.</span>
      </footer>
    </>
  );
}