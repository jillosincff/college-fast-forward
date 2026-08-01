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

// Real student stories (same testimonials shown on the homepage).
const STORIES = [
  { quote: "I stopped wondering what I should do every day. CLIFF always had the next move ready \u2014 and I landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/c2df92fac_IMG_8456.png", tag: "Landed an internship", color: '#6d28d9' },
  { quote: "CLIFF kept me on track without me constantly checking everything. I finally felt like someone was actually helping me.", name: "Maya R.", school: "UF '26, Business", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/980f1d142_IMG_8190.png", tag: "Off my mind", color: '#7c3aed' },
  { quote: "I spent less time searching and more time getting interviews. I heard back from an alumna within 48 hours.", name: "Nerissa R.", school: "USC '25, Marketing", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/574cf5430_IMG_8455.png", tag: "More interviews, less searching", color: '#ec4899' },
];

const WHY = [
  { icon: '\uD83C\uDFAF', title: 'Finds jobs worth applying to', desc: 'CLIFF ranks opportunities so you focus on the few that matter.' },
  { icon: '\uD83D\uDCDD', title: 'Tailors every resume', desc: 'One-click, ATS-optimized resumes matched to each job description.' },
  { icon: '\uD83E\uDD1D', title: 'Warm connections', desc: 'Parents and alumni at your target companies \u2014 only when they help.' },
  { icon: '\uD83C\uDFA4', title: 'Interview prep', desc: 'Mock interviews and feedback before you walk in.' },
];

export default function Customers() {
  return (
    <SeoLandingLayout
      title="Customer Stories | How Students Land with CLIFF | College Fast Forward"
      description="Real college students share how CLIFF helped them land internships, get interviews, and stop wondering what to do next. Free for students."
      slug="customers"
    >
      {/* Hero */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>Customer Stories</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          Real results.{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Real students.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 640 }}>
          College students use CLIFF to find the right jobs, tailor their resumes, and land interviews \u2014 with less searching and less stress.
        </p>
        <a href="#/GetStarted" style={{ display: 'inline-block', marginTop: 28, fontFamily: SF, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(109,40,217,0.32)' }}>Start Free \u2192</a>
      </section>

      {/* Testimonials */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {STORIES.map((s, i) => (
            <div key={i} style={{ background: CARD, borderRadius: 20, boxShadow: SHADOW, borderLeft: `4px solid ${s.color}`, padding: 'clamp(20px,5vw,28px) clamp(18px,4vw,24px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${s.color}14`, border: `1px solid ${s.color}33`, borderRadius: 100, padding: '4px 14px', marginBottom: 14 }}>
                <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: s.color }}>{s.tag}</span>
              </div>
              <p style={{ fontFamily: SF, fontSize: 'clamp(15px,3vw,17px)', fontWeight: 500, color: TEXT, lineHeight: 1.65, margin: '0 0 20px', fontStyle: 'italic' }}>&ldquo;{s.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={s.photo} alt={s.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${s.color}40`, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{s.name}</p>
                  <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '2px 0 0' }}>{s.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Why students use CLIFF */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 24px' }}>Why students use CLIFF</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {WHY.map((w, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '22px 20px', boxShadow: SHADOW }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>{w.icon}</span>
              <h3 style={{ fontFamily: SF, fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>{w.title}</h3>
              <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section narrow>
        <div style={{ textAlign: 'center', background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(32px,6vw,48px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Your story could be next</h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.88)', margin: '0 0 24px' }}>Free for college students. No credit card required.</p>
          <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: INDIGO, background: '#fff', borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Get Started Free \u2192</a>
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'Pricing', to: '#/pricing' },
          { label: 'About', to: '#/about' },
          { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
          { label: 'Interview Prep', to: '#/interview-prep' },
          { label: 'Job Application Tracker', to: '#/job-application-tracker' },
        ]}
      />
    </SeoLandingLayout>
  );
}