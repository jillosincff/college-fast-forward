import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Section, CrossLinks } from '@/components/seo-landing/SeoSections';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

// Dated, founder-bylined updates — a recency + momentum signal for a
// pre-launch product, and a freshness hook for AI crawlers.
const ENTRIES = [
  {
    date: 'Aug 2026',
    title: 'CLIFF vs comparison pages + product showcase live',
    body: 'Published CLIFF vs Jobright and CLIFF vs Simplify, plus a real product showcase on the homepage showing the warm-intro composer and ATS-scored match card. The moat is finally visible.',
    by: 'Jill Osinoff, Founder',
  },
  {
    date: 'Jul 2026',
    title: 'Warm-intro composer shipped to the beta cohort',
    body: 'CLIFF now drafts the outreach message to a matched parent or alum in the student’s own voice, with a one-tap send. First beta replies came back within 48 hours.',
    by: 'Jill Osinoff, Founder',
  },
  {
    date: 'Jun 2026',
    title: 'Overnight prep agent goes live',
    body: 'CLIFF now pre-tailors a resume and queues the best job’s outreach overnight, so students wake up to a finished package instead of a to-do list. The morning brief email launched alongside it.',
    by: 'Jill Osinoff, Founder',
  },
  {
    date: 'May 2026',
    title: 'ATS resume tailoring + instant match score',
    body: 'Paste a job description, get a tailored resume and a 0–100 ATS match score in seconds. Free for every student’s first application.',
    by: 'Jill Osinoff, Founder',
  },
  {
    date: 'Apr 2026',
    title: 'Parent & alumni network crosses 4,000 members',
    body: 'Parents and alumni across 15+ universities are now opted in to help students from their school — the warm-intro moat that powers every CLIFF application.',
    by: 'Jill Osinoff, Founder',
  },
];

export default function Changelog() {
  return (
    <SeoLandingLayout
      title="CLIFF Changelog | What We Shipped | College Fast Forward"
      description="See what CLIFF shipped, month by month — the warm-intro composer, overnight agent, ATS tailoring, and the parent & alumni network. Dated updates from the founder."
      slug="changelog"
    >
      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>Changelog</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          What CLIFF{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>shipped.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 600 }}>
          We&rsquo;re pre-launch and shipping fast. Here&rsquo;s the real record — dated, founder-bylined, no vapor.
        </p>
      </section>

      {/* Timeline */}
      <Section narrow>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: INDIGO_BORDER }} />
          {ENTRIES.map((e, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: i === ENTRIES.length - 1 ? 0 : 28 }}>
              <div style={{ position: 'absolute', left: -28, top: 4, width: 16, height: 16, borderRadius: '50%', background: GRAD_INDIGO, border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(109,40,217,0.20)' }} />
              <div style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '22px 24px', boxShadow: SHADOW }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 100, padding: '4px 12px', letterSpacing: '0.04em' }}>{e.date}</span>
                  <span style={{ fontFamily: INTER, fontSize: 12, color: TEXT3, fontWeight: 600 }}>{e.by}</span>
                </div>
                <h2 style={{ fontFamily: SF, fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{e.title}</h2>
                <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.65, margin: 0 }}>{e.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section narrow>
        <div style={{ textAlign: 'center', background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(32px,6vw,48px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Watch the next ship land.</h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.88)', margin: '0 0 24px' }}>We update this every time something real goes out. Start free and you&rsquo;ll feel it.</p>
          <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: INDIGO, background: '#fff', borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Try CLIFF Free →</a>
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'About', to: '#/about' },
          { label: 'Pricing', to: '#/pricing' },
          { label: 'Customer Stories', to: '#/customers' },
          { label: 'CLIFF vs Jobright', to: '#/vs/jobright' },
          { label: 'CLIFF vs Simplify', to: '#/vs/simplify' },
        ]}
      />
    </SeoLandingLayout>
  );
}