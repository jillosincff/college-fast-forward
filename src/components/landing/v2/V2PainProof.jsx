import React, { useRef, useState, useEffect } from 'react';
import { CTAButton } from './V2Hero';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2PainProof({ onCTA }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const f = (delay) => ({ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s` });

  return (
    <section ref={ref} className="v2-pain" style={{ background: '#0d1117', padding: '100px 24px 110px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@media(max-width:768px){.v2-pain{padding:72px 20px !important}}`}</style>
      <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(250,70,22,0.06),transparent 70%)' }} />

      <div className="max-w-[700px] mx-auto relative">
        {/* Headline */}
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 48px)', color: '#f4f0e8', letterSpacing: '-0.02em', lineHeight: 1.15, textAlign: 'center', marginBottom: 12, ...f(0) }}>
          Your Kid Is <span style={{ fontStyle: 'italic', color: '#FA4616' }}>Invisible</span> to Employers
        </h2>

        <div style={{ width: 40, height: 2, background: '#FA4616', borderRadius: 1, margin: '0 auto 32px', ...f(0.04) }} />

        {/* Pain body */}
        <div style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.7, textAlign: 'center', marginBottom: 16, ...f(0.08) }}>
          <p style={{ marginBottom: 14 }}>They apply to 200+ jobs. AI rejects 98%. No callbacks. Friends get "connection" interviews while they get silence.</p>
          <p style={{ color: '#E5E7EB' }}>Referrals are the #1 source of hires (Jobvite). Students don't lack opportunity — they lack access to the networks where opportunities live.</p>
        </div>

        {/* FASTIQ proof line */}
        <p style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.6, textAlign: 'center', maxWidth: 620, margin: '0 auto 48px', padding: '0 8px', ...f(0.14) }}>
          FASTIQ finds real UF grads already inside your target companies, drafts highly-responsive messages to them, and gets your kid in the door — bypassing thousands of other cold applicants.
        </p>

        {/* Interactive demo / screenshots */}
        <div style={{ marginBottom: 48, ...f(0.2) }}>
          <InteractiveTeaserDemo />
        </div>

        {/* CTA */}
        <div className="text-center" style={f(0.28)}>
          <CTAButton text="Start 7-Day Free Trial — $29/mo after" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}