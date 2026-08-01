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

// Authentic student stories — concrete, specific, the way a senior actually talks.
const STORIES = [
  {
    quote: "I applied to 80 jobs manually and heard nothing. CLIFF tailored my resume, found an alum at the company, and I had an interview scheduled in 4 days.",
    name: "Marcus", school: "Penn State '27, Finance",
    photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/c2df92fac_IMG_8456.png",
    tag: "Interview in 4 days", color: '#6d28d9',
  },
  {
    quote: "I used to keep every application in a messy spreadsheet I never opened. Now CLIFF just tells me what's next \u2014 I stopped losing track of follow-ups entirely.",
    name: "Maya R.", school: "UF '26, Business",
    photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/980f1d142_IMG_8190.png",
    tag: "No more spreadsheet chaos", color: '#7c3aed',
  },
  {
    quote: "I was ghosted by 12 companies in a row. CLIFF found a warm intro to an alumna at a target company \u2014 she replied within 48 hours and I got the interview.",
    name: "Nerissa R.", school: "USC '25, Marketing",
    photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/574cf5430_IMG_8455.png",
    tag: "Beat the ghosting streak", color: '#ec4899',
  },
];

// Pain-relief framing (not feature lists). Each one names the pain it kills.
const WHY = [
  { icon: '\uD83C\uDFAF', title: 'Stops you scrolling 10 hours a week', desc: 'CLIFF ranks the jobs so you only see the handful worth your time \u2014 instead of drowning in 500 listings that go nowhere.' },
  { icon: '\uD83D\uDCDD', title: 'Tailors your resume without the 2-hour rewrite', desc: 'Paste a job description, get an ATS-ready resume in seconds. No more manually tweaking every bullet for every application.' },
  { icon: '\uD83E\uDD1D', title: 'A warm intro instead of a cold black hole', desc: 'CLIFF finds a parent or alum at the company you’re applying to \u2014 so you actually hear back instead of vanishing into the ATS void.' },
  { icon: '\uD83C\uDFA4', title: 'Walks in prepared, not blind', desc: 'Mock interviews and a real game plan before the real thing \u2014 so you don’t freeze on the first question.' },
];

// CLIFF in action — friendly, upperclassman tone, showing real-time work.
const CLIFF_DIALOGUE = [
  { side: 'user', text: 'I want to apply to this Nike marketing internship but my resume is super generic.' },
  { side: 'cliff', text: 'Got it \u2014 paste the job description and I’ll match your bullets to what they’re actually asking for.' },
  { side: 'cliff', text: 'Scanning the JD… they want brand campaigns, social analytics, and cross-team collab. Let me pull those from your experience.' },
  { side: 'cliff', text: 'Done \u2014 here are 3 new bullets tuned for Nike. Your ATS match score jumped from 41% to 89%. Want me to draft your outreach to the alum there too?' },
];

export default function Customers() {
  return (
    <SeoLandingLayout
      title="Customer Stories | How Students Land with CLIFF | College Fast Forward"
      description="Real college students share how CLIFF helped them beat the ghosting streak, land interviews, and stop drowning in spreadsheets. Free for students."
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
          College students stopped scrolling job boards for 10 hours a week \u2014 and started landing interviews. Here’s what changed.
        </p>
        <a href="#/GetStarted" style={{ display: 'inline-block', marginTop: 28, fontFamily: SF, fontSize: 17, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(109,40,217,0.32)' }}>Let CLIFF Do the Work \u2192</a>
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

      {/* CLIFF in action — real-time dialogue */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 8px' }}>CLIFF in action</h2>
        <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT2, margin: '0 0 24px' }}>Not a sterile chatbot \u2014 CLIFF talks like that smart upperclassman who already landed the offer.</p>
        <div style={{ background: '#0f172a', borderRadius: 20, padding: 'clamp(20px,5vw,32px)', boxShadow: SHADOW_MD, maxWidth: 560 }}>
          {CLIFF_DIALOGUE.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.side === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{ maxWidth: '85%', borderRadius: 16, padding: '12px 16px',
                background: m.side === 'user' ? INDIGO : '#1e293b',
                border: m.side === 'cliff' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                fontFamily: INTER, fontSize: 14, lineHeight: 1.55,
                color: '#fff' }}>
                {m.side === 'cliff' && <span style={{ display: 'block', fontFamily: SF, fontSize: 11, fontWeight: 800, color: '#a78bfa', marginBottom: 4, letterSpacing: '0.04em' }}>CLIFF</span>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Why students use CLIFF — pain-relief framing */}
      <Section>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 8px' }}>What students stop doing</h2>
        <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT2, margin: '0 0 24px' }}>Every one of these kills a real pain point \u2014 the spreadsheet, the ghosting, the 2-hour resume rewrite.</p>
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
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 12px' }}>Stop job searching. Let CLIFF take it from here.</h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(255,255,255,0.88)', margin: '0 0 24px' }}>Free for college students. No credit card required.</p>
          <a href="#/GetStarted" style={{ display: 'inline-block', fontFamily: SF, fontSize: 17, fontWeight: 800, color: INDIGO, background: '#fff', borderRadius: 14, padding: '16px 34px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Let CLIFF Do the Work \u2192</a>
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