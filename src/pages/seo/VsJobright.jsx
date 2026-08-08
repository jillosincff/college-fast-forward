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

// Honest, defensible comparison — lead with the one moat neither rival has.
const CLIFF_ONLY = [
  { title: 'Parent & alumni warm intros', desc: 'CLIFF finds a parent or alum at the company you’re applying to and drafts the intro. Jobright has no networking layer at all.' },
  { title: 'An overnight agent, not a tool', desc: 'CLIFF pre-tailors your resume, finds the warm contact, and queues the outreach while you sleep. Jobright waits for you to drive every action.' },
  { title: 'Mock interviews + LinkedIn review', desc: 'Built-in, unlimited on Pro. Jobright focuses on resume + autofill, with no interview prep or LinkedIn optimization.' },
];

const WHERE_JOBright_WINS = [
  'A slick resume optimizer with real-time AI rewriting suggestions.',
  'A free plan that’s generous for resume-only use.',
];

const COMPARISON = [
  { feature: 'AI resume tailoring', cliff: 'One-click per job + ATS score', jr: 'Strong, real-time rewrites' },
  { feature: 'Job matching & autofill', cliff: 'Verdicts on every job + tracker', jr: 'Autofill extension + boards' },
  { feature: 'Warm networking (parents & alumni)', cliff: 'Included', jr: '—' },
  { feature: 'AI-drafted outreach messages', cliff: 'Included', jr: '—' },
  { feature: 'Mock interviews', cliff: 'Unlimited (Pro)', jr: '—' },
  { feature: 'LinkedIn profile review', cliff: 'Included (Pro)', jr: '—' },
  { feature: 'Overnight agent (works while you sleep)', cliff: 'Included (Pro)', jr: '—' },
  { feature: 'Free plan', cliff: 'Free for students', jr: 'Free for resumes' },
];

const FAQS = [
  { q: 'Is CLIFF better than Jobright?', a: 'They solve different problems. Jobright is an excellent resume optimizer. CLIFF is a full career agent — it tailors your resume, finds a parent or alum at the company, drafts the warm intro, preps your interview, and tracks every application. If you only want a resume tool, Jobright is great. If you want the warm intro that actually gets you the interview, CLIFF is built for it.' },
  { q: 'Does CLIFF do resume tailoring like Jobright?', a: 'Yes. Paste a job description and CLIFF tailors your resume to it in seconds with an instant ATS match score — the same core feature Jobright is known for, included free for students.' },
  { q: 'What’s CLIFF’s biggest advantage over Jobright?', a: 'Warm networking. Jobright has no way to connect you to a real person at the company. CLIFF finds a parent or alum already in the network, drafts the intro message, and turns a cold application into a warm one — the single biggest lever for hearing back.' },
  { q: 'Is CLIFF free?', a: 'CLIFF is free for college students — resume tailoring for your first application, job verdicts, the application tracker, and Today’s Best Moves. CLIFF Pro is $19.96/month for unlimited tailoring, mock interviews, LinkedIn review, and warm networking.' },
];

export default function VsJobright() {
  return (
    <SeoLandingLayout
      title="CLIFF vs Jobright.ai | Warm Intros Jobright Can't Offer | College Fast Forward"
      description="CLIFF does everything Jobright does — AI resume tailoring and ATS scores — plus the one thing Jobright can't: parent & alumni warm intros that get you the interview. Free for students."
      slug="vs/jobright"
    >
      {/* Hero */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,32px) 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: INDIGO, margin: '0 0 14px' }}>CLIFF vs Jobright.ai</p>
        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px,7vw,48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 20px' }}>
          Same resume power.{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plus the warm intro.</span>
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 'clamp(17px,3.5vw,20px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 640 }}>
          Jobright is a great resume optimizer. But a tailored resume into a black hole is still a black hole. CLIFF finds the parent or alum who can refer you — and drafts the message.
        </p>
        <a href="#/GetStarted" style={{ display: 'inline-block', marginTop: 28, fontFamily: SF, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(109,40,217,0.32)' }}>Try CLIFF Free →</a>
      </section>

      {/* The moat */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 8px' }}>What only CLIFF does</h2>
        <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT2, margin: '0 0 24px' }}>The three things Jobright can&rsquo;t do — because they&rsquo;re not a networking product.</p>
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
          <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, color: INDIGO_DIM, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 10px' }}>Where Jobright is genuinely strong</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: INTER, fontSize: 15, color: TEXT2, lineHeight: 1.8 }}>
            {WHERE_JOBright_WINS.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, margin: '12px 0 0', lineHeight: 1.6 }}>If resume-only is all you need, Jobright is a fine choice. We built CLIFF for students who also need to get past the resume screen.</p>
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
                <th style={{ textAlign: 'center', padding: '14px 12px', fontFamily: SF, fontWeight: 800, color: TEXT, fontSize: 15 }}>Jobright</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(109,40,217,0.08)' }}>
                  <td style={{ padding: '14px 12px', color: TEXT, fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: INDIGO_DIM, fontWeight: 700 }}>{row.cliff}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: TEXT2 }}>{row.jr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section narrow>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 22px' }}>CLIFF vs Jobright FAQ</h2>
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
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Stop optimizing resumes into the void.</h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.88)', margin: '0 0 24px' }}>Free for college students. CLIFF tailors your resume <em>and</em> writes the warm intro.</p>
          <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: INDIGO, background: '#fff', borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Try CLIFF Free →</a>
        </div>
      </Section>

      <CrossLinks
        links={[
          { label: 'CLIFF vs Simplify', to: '#/vs/simplify' },
          { label: 'Pricing', to: '#/pricing' },
          { label: 'Customer Stories', to: '#/customers' },
          { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
        ]}
      />
    </SeoLandingLayout>
  );
}