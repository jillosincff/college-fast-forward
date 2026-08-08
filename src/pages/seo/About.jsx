import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Section, CrossLinks } from '@/components/seo-landing/SeoSections';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const CORAL = '#f43f5e';
const CORAL_BORDER = 'rgba(244,63,94,0.22)';

const OLD_WAY = [
  'Spending 10+ hours a week scrolling job boards',
  'Tweaking your resume manually for every single application',
  'Going into interviews blind and unprepared',
  'Applying into a black hole with no feedback',
];

const CLIFF_WAY = [
  { title: 'Automated Discovery', desc: 'CLIFF surfaces roles tailored specifically to your background and goals.' },
  { title: 'Instant Optimization', desc: 'CLIFF tailors your resume to beat ATS filters in seconds.' },
  { title: 'Tailored Prep', desc: 'Custom interview prep and actionable guidance for every stage.' },
  { title: 'Clear Roadmap', desc: 'Know exactly where you stand and what to do next.' },
];

export default function About() {
  return (
    <SeoLandingLayout
      title="About College Fast Forward | Founder Jill Osinoff | CLIFF AI Career Agent"
      description="College Fast Forward built CLIFF, the AI career agent for college students and recent grads. Founded by Jill Osinoff — UF Mom and former professional recruiter."
      slug="about"
    >
      {/* 1. HERO */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(56px,8vw,88px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 12, fontWeight: 800, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
          About College Fast Forward
        </span>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,50px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          We built CLIFF so students{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>stop job searching.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,21px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 660 }}>
          CLIFF is the AI agent built for college students and recent grads who are sick of sending hundreds of resumes into the void.
        </p>
      </section>

      {/* 2. OUR MISSION */}
      <Section narrow>
        <div style={{ background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(28px,6vw,44px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 16px' }}>Our Mission</h2>
          <p style={{ fontFamily: INTER, fontSize: 'clamp(16px,3vw,19px)', color: 'rgba(255,255,255,0.94)', lineHeight: 1.7, margin: 0 }}>
            To level the playing field for entry-level talent. Getting your first job shouldn&apos;t feel like a full-time job. Right now, students are drowning in job postings, tailoring resumes manually for hours, and getting ghosted by automated HR software. We built College Fast Forward and CLIFF to give candidates their own unfair advantage — an AI advocate that works 24/7 to find the right roles, optimize applications, and prep you to land the offer.
          </p>
        </div>
      </Section>

      {/* 3. COMPARISON GRID */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 28px', textAlign: 'center' }}>The old way vs. the CLIFF way</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(18px,4vw,24px)' }}>
          {/* Old Way */}
          <div style={{ background: 'rgba(254,242,242,0.6)', border: `1px solid ${CORAL_BORDER}`, borderRadius: 20, padding: 'clamp(22px,5vw,30px)' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, color: CORAL, margin: '0 0 20px', letterSpacing: '-0.02em' }}>The Old Way 😫</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {OLD_WAY.map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ flexShrink: 0, marginTop: 4, color: CORAL, fontWeight: 900 }}>✕</span>
                  <p style={{ fontFamily: INTER, fontSize: 'clamp(13px,3vw,14px)', color: '#9f1239', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CLIFF Way */}
          <div style={{ background: 'rgba(245,243,255,0.85)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(22px,5vw,30px)', boxShadow: SHADOW_MD }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, color: INDIGO, margin: '0 0 20px', letterSpacing: '-0.02em' }}>The CLIFF Way ⚡</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CLIFF_WAY.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ flexShrink: 0, marginTop: 3, width: 22, height: 22, borderRadius: '50%', background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: INDIGO, fontWeight: 900, fontSize: 12 }}>✓</span>
                  <div>
                    <p style={{ fontFamily: SF, fontSize: 'clamp(14px,3vw,15px)', fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.4 }}>{item.title}</p>
                    <p style={{ fontFamily: INTER, fontSize: 'clamp(13px,3vw,14px)', color: INDIGO_DIM, margin: '3px 0 0', lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 4. FOUNDER SPOTLIGHT */}
      <Section narrow>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 24px', textAlign: 'center' }}>
          Built by someone who knows both sides of the hiring desk.
        </h2>
        <div style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(24px,5vw,36px)', boxShadow: SHADOW_MD }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
            {/* Founder headshot slot */}
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 34, fontWeight: 900, color: '#fff', marginBottom: 16, boxShadow: '0 8px 24px rgba(109,40,217,0.30)' }}>
              JO
            </div>
            <h3 style={{ fontFamily: SF, fontSize: 'clamp(20px,4vw,24px)', fontWeight: 900, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Jill Osinoff</h3>
            <p style={{ fontFamily: INTER, fontSize: 15, color: INDIGO, fontWeight: 700, margin: '0 0 12px' }}>Founder, College Fast Forward</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['UF Mom', 'Former Professional Recruiter'].map((badge) => (
                <span key={badge} style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO_DIM, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '5px 14px' }}>{badge}</span>
              ))}
            </div>
          </div>
          <blockquote style={{ fontFamily: INTER, fontSize: 'clamp(16px,3vw,18px)', color: TEXT2, lineHeight: 1.75, margin: 0, fontStyle: 'italic', borderLeft: `4px solid ${INDIGO}`, paddingLeft: 20 }}>
            &ldquo;As a former professional recruiter, I&apos;ve seen firsthand how broken, mechanical, and frustrating the hiring process can be for entry-level talent. And as a UF mom, I&apos;ve watched brilliant, hardworking students burn out trying to navigate it. I built College Fast Forward and CLIFF to change the rules. Students shouldn&apos;t have to spend hundreds of hours beating automated HR software just to get a foot in the door. CLIFF gives them the insider tools, strategy, and leverage they need to land their first real opportunity — fast.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <a href="https://www.linkedin.com/in/jillosinoff" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, borderRadius: 999, padding: '11px 22px', textDecoration: 'none', boxShadow: '0 6px 20px rgba(109,40,217,0.30)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
              Connect with Jill on LinkedIn
            </a>
          </div>
        </div>
      </Section>

      {/* 5. FINAL CTA */}
      <Section narrow>
        <div style={{ textAlign: 'center', background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(36px,6vw,56px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Ready to fast-forward your career?</h2>
          <p style={{ fontFamily: INTER, fontSize: 'clamp(16px,3vw,18px)', color: 'rgba(255,255,255,0.9)', margin: '0 0 28px', lineHeight: 1.6 }}>
            Stop scrolling through job boards. Let CLIFF take it from here.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: '#fff', background: '#0f172a', borderRadius: 14, padding: '16px 40px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', transition: 'transform 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >Start Free</a>
            <a href="#/pricing" style={{ fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', borderBottom: '2px solid rgba(255,255,255,0.5)', padding: '4px 2px' }}>See Pricing</a>
          </div>
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