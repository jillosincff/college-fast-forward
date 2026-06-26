import React, { useEffect } from 'react';

// ── Brand tokens (matched to StudentLandingPage) ──
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const BG = '#f8f9ff';
const CARD = '#ffffff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

const TITLE = '7 Best AI Career Tools for College Students (2026)';
const DESCRIPTION = 'Discover the 7 best AI career tools for college students in 2026 — from resume tailoring to alumni referrals. Stop applying blind. Start landing interviews.';
const CANONICAL = 'https://collegefastforward.com/blog/ai-career-tools-college-students';
const GET_STARTED = 'https://collegefastforward.com/GetStarted';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '7 Best AI Career Tools for College Students (2026)',
  description: 'Discover the 7 best AI career tools for college students in 2026 — from resume tailoring to alumni referrals.',
  url: CANONICAL,
  publisher: {
    '@type': 'Organization',
    name: 'College Fast Forward',
    url: 'https://collegefastforward.com',
  },
  datePublished: '2026-06-26',
  dateModified: '2026-06-26',
};

// Inject/replace a <head> tag, tracking it so we can clean up on unmount.
function setHeadTags() {
  const created = [];
  const prevTitle = document.title;
  document.title = TITLE;

  const upsertMeta = (attr, key, content) => {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
      created.push(el);
    } else {
      created.push({ el, prev: el.getAttribute('content') });
    }
    el.setAttribute('content', content);
  };

  upsertMeta('name', 'description', DESCRIPTION);
  upsertMeta('name', 'robots', 'index, follow');

  // Canonical
  let canonical = document.head.querySelector('link[rel="canonical"]');
  const prevCanonical = canonical ? canonical.getAttribute('href') : null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', CANONICAL);

  // JSON-LD
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify(JSON_LD);
  ld.setAttribute('data-blog-jsonld', 'true');
  document.head.appendChild(ld);
  created.push(ld);

  return () => {
    document.title = prevTitle;
    created.forEach(item => {
      if (item instanceof Element) item.remove();
      else if (item.el) item.el.setAttribute('content', item.prev || '');
    });
    if (prevCanonical) canonical.setAttribute('href', prevCanonical);
  };
}

export default function BlogAICareerTools() {
  useEffect(() => {
    if (!document.getElementById('blog-satoshi')) {
      const l = document.createElement('link');
      l.id = 'blog-satoshi'; l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap';
      document.head.appendChild(l);
    }
    const cleanup = setHeadTags();
    return cleanup;
  }, []);

  return (
    <div style={{ background: BG, fontFamily: SF, color: TEXT, minHeight: '100vh' }}>
      {/* ── HEADER ── */}
      <header style={{
        background: 'rgba(248,249,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.10)',
        padding: '0 clamp(16px,5vw,32px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="https://collegefastforward.com/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png" alt="College Fast Forward" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontFamily: SF, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>
            College{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span>
          </span>
        </a>
        <a href={GET_STARTED} style={{
          fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff',
          background: GRAD_INDIGO, borderRadius: 10, padding: '10px 20px',
          textDecoration: 'none', boxShadow: '0 4px 14px rgba(109,40,217,0.35)', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center',
        }}>Start Free →</a>
      </header>

      {/* ── ARTICLE ── */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px, 7vw, 64px) clamp(20px, 5vw, 32px)' }}>
        <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Career Guide · 2026
        </p>

        <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px, 7vw, 48px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 28px' }}>
          7 Best AI Career Tools for College Students in 2026
        </h1>

        <P>
          The 2026 job market has a brutal math problem: referrals make up just 7% of applications but account for 30–50% of all hires. Meanwhile, the average corporate job posting now receives 250+ applications within 24 hours. If you're a college student submitting applications through portals and hoping for the best, you're playing a losing game.
        </P>
        <P>
          AI career tools don't just help you apply faster — the best ones help you skip the line entirely. This guide covers the 7 tools that actually move the needle: matching you to real roles, tailoring your materials automatically, and — most importantly — connecting you to the warm referrals that get résumés read.
        </P>

        <H2>What Makes an AI Career Tool Actually Useful for College Students?</H2>
        <P>
          Most "AI career tools" are just resume templates with a chatbot bolted on. Before we get into the list, here's the framework we used to evaluate each tool:
        </P>
        <UL items={[
          'Does it reduce time-to-application without sacrificing quality?',
          'Does it help you access the hidden job market (roles filled before they\'re posted)?',
          'Does it leverage your existing network — alumni, parents, professors?',
          'Does it learn from your profile and improve recommendations over time?',
        ]} />
        <P>
          The tools below passed all four tests. Generic AI resume spinners didn't make the cut.
        </P>

        <H2>The 7 Best AI Career Tools for College Students in 2026</H2>

        <H3>1. College Fast Forward — Best for Warm Alumni &amp; Parent Referrals</H3>
        <P>
          Cold applications get a 2% callback rate. Warm referrals get 10x that. College Fast Forward is built around one insight: the most powerful career tool a college student has isn't a résumé — it's a warm introduction from someone already inside the company.
        </P>
        <P>
          The platform matches students with curated job and internship roles, then automatically identifies alumni and parent connections at those companies who can make a warm introduction. Instead of applying blind, you're walking in with someone vouching for you.
        </P>
        <UL items={[
          'AI-powered role matching based on your major, skills, and career goals',
          'Auto-tailored résumé for every role you apply to',
          'One-click referral requests to alumni and parent networks at target companies',
          'Built-in application tracker so nothing falls through the cracks',
          'Career assessment to surface roles you might not have considered',
        ]} />
        <CTA href={GET_STARTED} label="Get Early Access →" />

        <H3>2. Teal — Best AI Application Tracker</H3>
        <P>
          If you're running 20+ applications simultaneously, you need a system. Teal's browser extension saves job postings from any site in one click and gives each application an AI match score against your résumé. It won't get you the referral — but it keeps your pipeline airtight.
        </P>

        <H3>3. Kickresume — Best AI Résumé Builder</H3>
        <P>
          Kickresume generates role-specific résumé bullet points based on your experience and the target job description. Its ATS scanner flags keyword gaps before you submit. Pair it with College Fast Forward's auto-tailoring feature and you have a two-layer optimization on every application.
        </P>

        <H3>4. Perplexity AI — Best for Pre-Interview Company Research</H3>
        <P>
          Walking into an interview without knowing the company's last funding round, key competitors, or recent product launches is the fastest way to tank your credibility. Perplexity gives you cited, real-time answers. Ask it: "What has [Founder] said publicly about their biggest product challenge?" and walk in knowing something they didn't expect you to know.
        </P>

        <H3>5. Handshake — Best University-Integrated Job Board</H3>
        <P>
          Handshake remains the strongest campus-connected job board — employers posting here are specifically recruiting students, not sorting through experienced hires. Use it for discovery, but don't stop at applying. Find the company on College Fast Forward to see if you have a referral pathway before you hit submit.
        </P>

        <H3>6. LinkedIn — Best for Long-Term Network Building</H3>
        <P>
          LinkedIn is not a job board — it's a compound interest machine. Every connection you make as a sophomore pays dividends when you're job-hunting as a senior. Optimize your profile, post consistently about your field, and use it to research second-degree connections at target companies. Then use College Fast Forward to activate those connections as actual referrals.
        </P>

        <H3>7. ChatGPT — Best AI Writing Assistant for Outreach</H3>
        <P>
          Generic outreach gets ignored. Specific outreach gets responses. ChatGPT accelerates your first drafts dramatically — but only if you give it real context. Prompt it with: "Write a cold email to [Name] at [Company]. I'm a [year] studying [major]. Keep it under 100 words, end with a low-commitment ask." Then customize before sending.
        </P>

        <H2>The Referral Gap: Why Most College Students Are Leaving Their Biggest Advantage on the Table</H2>
        <P>
          Here's what the data actually shows about how jobs get filled in 2026:
        </P>
        <Table
          head={['Metric', 'Stat']}
          rows={[
            ['Referrals as % of total applications', '7%'],
            ['Referrals as % of total hires', '30–50%'],
            ['Days to hire a referral vs. non-referral', '29 days vs. 39 days'],
            ['Retention rate of referral hires at 1 year', '46% higher'],
            ['Jobs never publicly posted', 'Up to 85%'],
          ]}
        />
        <P>
          The gap between "applied online" and "referred by someone inside" is the single biggest leverage point in a college student's job search. Most students know this. Almost none have a systematic way to activate it.
        </P>
        <P>
          College Fast Forward was built specifically to close this gap — using your school's alumni network and parent community as a warm referral engine, not just a list of names.
        </P>

        <H2>How to Build Your AI-Powered Career Stack as a College Student</H2>
        <P>
          You don't need all seven tools. Here's the recommended stack by job search stage:
        </P>
        <Table
          head={['Stage', 'Tool', 'Purpose']}
          rows={[
            ['Career Exploration', 'College Fast Forward', 'AI role matching + career assessment'],
            ['Résumé Building', 'Kickresume', 'ATS-optimized, role-tailored résumé'],
            ['Finding Roles', 'Handshake + College Fast Forward', 'Campus-connected + referral-backed roles'],
            ['Getting Referred', 'College Fast Forward', 'Alumni + parent warm introductions'],
            ['Tracking Applications', 'College Fast Forward + Teal', 'Pipeline management'],
            ['Interview Prep', 'Perplexity AI + ChatGPT', 'Company research + outreach drafts'],
          ]}
        />

        <H2>The Bottom Line</H2>
        <P>
          The students landing jobs and internships in 2026 aren't the ones with the best résumés — they're the ones who stopped applying cold and started leveraging every warm connection available to them. AI tools make this faster and more systematic than it's ever been.
        </P>
        <P>
          Start with the referral layer. Everything else is optimization on top.
        </P>

        {/* Closing CTA card */}
        <div style={{ marginTop: 40, background: GRAD_INDIGO, borderRadius: 20, padding: 'clamp(28px, 6vw, 40px)', textAlign: 'center', boxShadow: '0 14px 40px rgba(109,40,217,0.28)' }}>
          <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 20px' }}>
            Find Your Referral Path on College Fast Forward
          </p>
          <a href={GET_STARTED} style={{
            fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: INDIGO,
            background: '#fff', borderRadius: 12, padding: '14px 32px',
            textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}>Get Started Free →</a>
        </div>
      </article>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1117', padding: '24px clamp(16px,5vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.3)' }}>
          © {new Date().getFullYear()} College Fast Forward. All rights reserved.
        </span>
        <nav style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Home', href: 'https://collegefastforward.com/' },
            { label: 'Terms', href: 'https://collegefastforward.com/#Terms' },
            { label: 'Privacy', href: 'https://collegefastforward.com/#Privacy' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ fontFamily: SF, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.35)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

// ── Article building blocks ──
function P({ children }) {
  return <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(16px, 3.5vw, 18px)', color: TEXT2, lineHeight: 1.75, margin: '0 0 22px' }}>{children}</p>;
}

function H2({ children }) {
  return <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 5.5vw, 34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.2, margin: '48px 0 18px' }}>{children}</h2>;
}

function H3({ children }) {
  return <h3 style={{ fontFamily: SF, fontSize: 'clamp(19px, 4.5vw, 24px)', fontWeight: 800, color: INDIGO_DIM, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '36px 0 14px' }}>{children}</h3>;
}

function UL({ items }) {
  return (
    <ul style={{ margin: '0 0 22px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3, fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(15px, 3.5vw, 17px)', color: TEXT2, lineHeight: 1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CTA({ href, label }) {
  return (
    <a href={href} style={{
      fontFamily: SF, fontSize: 'clamp(15px, 4vw, 16px)', fontWeight: 700, color: '#fff',
      background: GRAD_INDIGO, borderRadius: 12, padding: '13px 28px',
      textDecoration: 'none', display: 'inline-block', margin: '4px 0 22px',
      boxShadow: '0 8px 24px rgba(109,40,217,0.30)',
    }}>{label}</a>
  );
}

function Table({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '0 0 24px', borderRadius: 14, border: `1px solid ${INDIGO_BORDER}`, boxShadow: SHADOW, background: CARD }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', fontFamily: SF, fontSize: 13, fontWeight: 800, color: '#fff', background: INDIGO, padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: '1px solid #f1f5f9' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ fontSize: 14, color: ci === 0 ? TEXT : TEXT2, fontWeight: ci === 0 ? 700 : 500, padding: '12px 16px', lineHeight: 1.5 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}