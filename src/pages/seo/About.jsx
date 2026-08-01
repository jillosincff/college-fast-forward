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
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

const VALUES = [
  { title: 'Outcomes over clicks', desc: 'CLIFF exists to land students internships and first jobs \u2014 not to generate engagement. We measure success in interviews and offers.' },
  { title: 'Less cognitive load', desc: 'The job search is exhausting. CLIFF manages the whole journey so students always know their next best move.' },
  { title: 'Signal, not noise', desc: 'Thousands of job postings, but only a few matter. CLIFF tells students which ones are worth their time.' },
  { title: 'Real connections', desc: 'When networking genuinely helps, CLIFF taps trusted parents and alumni \u2014 never spam, never cold busywork.' },
];

export default function About() {
  return (
    <SeoLandingLayout
      title="About College Fast Forward | Founder Jill Osinoff | CLIFF AI Career Agent"
      description="College Fast Forward is a US-based company building CLIFF, the AI career agent for college students. Founded by Jill Osinoff to help students land internships and first jobs."
      slug="about"
    >
      {/* Hero */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>About</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          We built CLIFF so students{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>stop job searching.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 660 }}>
          College Fast Forward is a US-based company. Our product is CLIFF \u2014 the AI career agent that finds roles worth applying to, tailors resumes, preps interviews, and keeps the job search on track for college students and recent grads.
        </p>
      </section>

      {/* Mission */}
      <Section narrow>
        <div style={{ background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(28px,6vw,40px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Our mission</h2>
          <p style={{ fontFamily: INTER, fontSize: 'clamp(16px,3vw,18px)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, margin: 0 }}>
            Getting your first job is brutal. Students drown in postings, guess at what matters, and burn out. CLIFF acts as a proactive career agent \u2014 managing the entire internship and first-job search so students spend less time wondering what to do and more time making meaningful progress.
          </p>
        </div>
      </Section>

      {/* Founder */}
      <Section narrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 28, alignItems: 'center' }}>
          <div style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 28, boxShadow: SHADOW, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: GRAD_INDIGO, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 30, fontWeight: 900, color: '#fff' }}>JO</div>
            <h3 style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: TEXT, margin: '0 0 4px' }}>Jill Osinoff</h3>
            <p style={{ fontFamily: INTER, fontSize: 14, color: INDIGO, fontWeight: 700, margin: 0 }}>Founder</p>
          </div>
          <div>
            <h3 style={{ fontFamily: SF, fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Founded by Jill Osinoff</h3>
            <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT2, lineHeight: 1.7, margin: 0 }}>
              Jill founded College Fast Forward after watching students struggle to navigate the internship and first-job search. The company is US-based and operated, building CLIFF as an AI career agent that reduces the cognitive load of the job search \u2014 so students always know their next best move.
            </p>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 24px' }}>What we believe</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '24px 22px', boxShadow: SHADOW }}>
              <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>{v.title}</h3>
              <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Operator disclosure */}
      <Section narrow>
        <div style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '24px 24px', boxShadow: SHADOW }}>
          <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 10px' }}>Company &amp; operator</h3>
          <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.65, margin: 0 }}>
            College Fast Forward is a US-based company. The product is CLIFF, an AI career agent. &ldquo;FastIQ&rdquo; and &ldquo;Gator&rdquo; are retired legacy names and do not describe the current product.
          </p>
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'Pricing', to: '#/pricing' },
          { label: 'Customer Stories', to: '#/customers' },
          { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
          { label: 'Interview Prep', to: '#/interview-prep' },
          { label: 'LinkedIn Review', to: '#/linkedin-review' },
        ]}
      />
    </SeoLandingLayout>
  );
}