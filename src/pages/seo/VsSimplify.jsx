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

const CLIFF_ONLY = [
  { title: 'Parent & alumni warm intros', desc: 'Simplify is a job board. CLIFF finds a real parent or alum at the company you\u2019re applying to and drafts the intro \u2014 the thing that actually gets you the interview.' },
  { title: 'An AI agent, not a browser extension', desc: 'Simplify autofills applications. CLIFF decides which jobs to apply to, tailors your resume to each, and preps the outreach \u2014 before you even sit down.' },
  { title: 'Mock interviews + LinkedIn review', desc: 'Built-in, unlimited on Pro. Simplify has no interview prep or LinkedIn optimization.' },
];

const WHERE_SIMPLIFY_WINS = [
  'A huge curated internship job board with smart filters.',
  'One-click autofill that genuinely saves time on repetitive applications.',
];

const COMPARISON = [
  { feature: 'Job board & autofill', cliff: 'Verdicts on every job + tracker', simp: 'Large board + autofill extension' },
  { feature: 'AI resume tailoring per job', cliff: 'One-click + ATS score', simp: 'Basic' },
  { feature: 'Warm networking (parents & alumni)', cliff: 'Included', simp: '\u2014' },
  { feature: 'AI-drafted outreach messages', cliff: 'Included', simp: '\u2014' },
  { feature: 'Mock interviews', cliff: 'Unlimited (Pro)', simp: '\u2014' },
  { feature: 'LinkedIn profile review', cliff: 'Included (Pro)', simp: '\u2014' },
  { feature: 'Overnight agent (works while you sleep)', cliff: 'Included (Pro)', simp: '\u2014' },
  { feature: 'Free plan', cliff: 'Free for students', simp: 'Free job board' },
];

const FAQS = [
  { q: 'Is CLIFF better than Simplify?', a: 'Different jobs. Simplify is a great internship job board with autofill. CLIFF is a career agent \u2014 it tells you which jobs are worth applying to, tailors your resume to each, finds a warm contact at the company, and preps your interview. If you want to browse and autofill, Simplify helps. If you want the warm intro that gets the reply, CLIFF is built for it.' },
  { q: 'Does CLIFF have a job board like Simplify?', a: 'CLIFF surfaces a ranked feed of jobs matched to your background and goals \u2014 not 10,000 listings to scroll. It gives you a verdict on each (pursue / consider / skip) and the 3 best moves for today, so you apply to fewer jobs with higher hit rates.' },
  { q: 'What\u2019s CLIFF\u2019s biggest advantage over Simplify?', a: 'Warm networking. Simplify has no way to connect you to a person at the company. CLIFF finds a parent or alum already in the network and drafts the intro \u2014 the single biggest lever for getting off the resume pile and into an interview.' },
  { q: 'Is CLIFF free?', a: 'CLIFF is free for college students \u2014 resume tailoring for your first application, job verdicts, the application tracker, and Today\u2019s Best Moves. CLIFF Pro is $19.96/month for unlimited tailoring, mock interviews, LinkedIn review, and warm networking.' },
];

export default function VsSimplify() {
  return (
    <SeoLandingLayout
      title="CLIFF vs Simplify | Warm Intros + an AI Agent, Not Just a Job Board | College Fast Forward"
      description="Simplify is a job board with autofill. CLIFF is a career agent that picks the jobs worth applying to, tailors your resume, and finds the parent or alum who can refer you. Free for students."
      slug="vs/simplify"
    >
      {/* Hero */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>CLIFF vs Simplify</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          A job board gets you{' '}
          <span style={{ color: TEXT3, textDecoration: 'line-through' }}>more jobs.</span>{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF gets you the intro.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 640 }}>
          Simplify helps you apply to more jobs, faster. But more cold applications is the problem, not the solution. CLIFF picks the few worth applying to \u2014 and finds the person who can refer you.
        </p>
        <a href="#/GetStarted" style={{ display: 'inline-block', marginTop: 28, fontFamily: SF, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(109,40,217,0.32)' }}>Try CLIFF Free →</a>
      </section>

      {/* The moat */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 8px' }}>What only CLIFF does</h2>
        <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT2, margin: '0 0 24px' }}>The three things a job board can&rsquo;t do \u2014 because applying to more jobs isn&rsquo;t the bottleneck.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {CLIFF_ONLY.map((w, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '22px 20px', boxShadow: SHADOW }}>
              <h3 style={{ fontFamily: SF, fontSize: 16, fontWeight: 800, color: INDIGO, margin: '0 0 8px' }}>{w.title}</h3>
              <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Honest credit */}
      <Section narrow>
        <div style={{ background: 'rgba(245,243,255,0.6)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '22px 24px' }}>
          <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, color: INDIGO_DIM, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 10px' }}>Where Simplify is genuinely strong</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.8 }}>
            {WHERE_SIMPLIFY_WINS.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, margin: '12px 0 0', lineHeight: 1.6 }}>If you want to cast a wide net fast, Simplify is a good board. We built CLIFF for students who&rsquo;d rather apply to 5 jobs well than 50 jobs blind.</p>
        </div>
      </Section>

      {/* Comparison table */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 22px' }}>Feature-by-feature</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: INTER, fontSize: 15, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${INDIGO_BORDER}` }}>
                <th style={{ textAlign: 'left', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: TEXT2, fontSize: 14 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: INDIGO, fontSize: 15 }}>CLIFF</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: TEXT, fontSize: 15 }}>Simplify</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(109,40,217,0.08)' }}>
                  <td style={{ padding: '14px 12px', color: TEXT, fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: INDIGO_DIM, fontWeight: 700 }}>{row.cliff}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: TEXT2 }}>{row.simp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section narrow>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 22px' }}>CLIFF vs Simplify FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 14, padding: '22px', boxShadow: SHADOW }}>
              <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>{f.q}</h3>
              <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section narrow>
        <div style={{ textAlign: 'center', background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(32px,6vw,48px)', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Apply to 5 jobs well. Not 50 blind.</h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.88)', margin: '0 0 24px' }}>Free for college students. CLIFF picks the jobs and writes the intro.</p>
          <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: INDIGO, background: '#fff', borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Try CLIFF Free →</a>
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'CLIFF vs Jobright', to: '#/vs/jobright' },
          { label: 'Pricing', to: '#/pricing' },
          { label: 'Customer Stories', to: '#/customers' },
          { label: 'Job Application Tracker', to: '#/job-application-tracker' },
        ]}
      />
    </SeoLandingLayout>
  );
}