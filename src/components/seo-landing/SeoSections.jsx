import React from 'react';

// Shared, conversion-focused section blocks for the SEO landing pages.
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const CTA_HREF = '#/GetStarted';

const ctaStyle = {
  display: 'inline-block', fontFamily: SF, fontSize: 'clamp(16px,3.5vw,18px)',
  fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 14,
  padding: '16px 34px', textDecoration: 'none',
  boxShadow: '0 10px 30px rgba(109,40,217,0.32)',
};

export function Section({ children, narrow }) {
  return (
    <section style={{ maxWidth: narrow ? 820 : 1120, margin: '0 auto', padding: 'clamp(36px,7vw,72px) clamp(20px,5vw,32px)' }}>
      {children}
    </section>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px,5vw,38px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px' }}>
      {children}
    </h2>
  );
}

export function Hero({ h1, sub, ctaLabel }) {
  return (
    <section style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(52px,9vw,88px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
      <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,52px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.08, margin: '0 0 22px' }}>
        {h1}
      </h1>
      <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,21px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 720 }}>
        {sub}
      </p>
      <a href={CTA_HREF} style={ctaStyle}>{ctaLabel} →</a>
    </section>
  );
}

export function Steps({ title, steps }) {
  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18, marginTop: 28 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '24px 22px', boxShadow: SHADOW }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              {i + 1}
            </div>
            <h3 style={{ fontFamily: SF, fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>{s.title}</h3>
            {s.desc ? <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{s.desc}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function FeatureGrid({ title, items }) {
  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginTop: 28 }}>
        {items.map((f, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 14, padding: '20px', boxShadow: SHADOW, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <h3 style={{ fontFamily: SF, fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>{f.title}</h3>
              {f.desc ? <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.55, margin: 0 }}>{f.desc}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function SocialProof() {
  return (
    <Section narrow>
      <div style={{ background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(28px,6vw,40px)', textAlign: 'center', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
        <p style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Join 5,000+ students using CLIFF
        </p>
        <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
          From freshmen exploring to seniors closing offers — CLIFF is their career copilot.
        </p>
      </div>
    </Section>
  );
}

export function CTASection({ label }) {
  return (
    <Section narrow>
      <div style={{ textAlign: 'center', background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(32px,6vw,48px)', boxShadow: SHADOW }}>
        <a href={CTA_HREF} style={ctaStyle}>{label} →</a>
        <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT3, marginTop: 16, marginBottom: 0 }}>Free to join · No credit card required</p>
      </div>
    </Section>
  );
}

export function CrossLinks({ links }) {
  return (
    <Section narrow>
      <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>Explore more</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {links.map((l, i) => (
          <a key={i} href={l.to} style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: INDIGO_DIM, background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '10px 18px', textDecoration: 'none' }}>
            {l.label} →
          </a>
        ))}
      </div>
    </Section>
  );
}