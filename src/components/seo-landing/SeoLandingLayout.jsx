import React, { useEffect } from 'react';

// ── Brand tokens (matched to StudentLandingPage / blog) ──
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const BG = '#f8f9ff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SITE = 'https://collegefastforward.com';
const LOGO = 'https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png';

const NAV_LINKS = [
  { label: 'How it Works', to: '#/' },
  { label: 'Pricing', to: '#/' },
  { label: 'Log In', to: '#/GatorAuth' },
];

const FOOTER_TOOLS = [
  { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
  { label: 'ATS Resume Checker', to: '#/ats-resume-checker' },
  { label: 'Interview Prep', to: '#/interview-prep' },
  { label: 'Job Application Tracker', to: '#/job-application-tracker' },
  { label: 'LinkedIn Review', to: '#/linkedin-review' },
  { label: 'AI Career Tools Guide', to: '#/blog/ai-career-tools-college-students' },
];

// Inject SEO head tags for one landing page, clean up on unmount.
function setHeadTags({ title, description, slug }) {
  const canonical = `${SITE}/${slug}`;
  const created = [];
  const prevTitle = document.title;
  document.title = title;

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

  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', 'index, follow');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:site_name', 'College Fast Forward');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);

  let canonicalEl = document.head.querySelector('link[rel="canonical"]');
  const prevCanonical = canonicalEl ? canonicalEl.getAttribute('href') : null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
    created.push(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonical);

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'College Fast Forward',
    url: canonical,
    description,
    applicationCategory: 'CareerApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'College Fast Forward', url: SITE },
  });
  ld.setAttribute('data-seo-jsonld', 'true');
  document.head.appendChild(ld);
  created.push(ld);

  return () => {
    document.title = prevTitle;
    created.forEach(item => {
      if (item instanceof Element) item.remove();
      else if (item.el) item.el.setAttribute('content', item.prev || '');
    });
    if (prevCanonical) canonicalEl.setAttribute('href', prevCanonical);
  };
}

export default function SeoLandingLayout({ title, description, slug, children }) {
  useEffect(() => {
    if (!document.getElementById('seo-satoshi')) {
      const l = document.createElement('link');
      l.id = 'seo-satoshi';
      l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=inter@400,500,600,700&display=swap';
      document.head.appendChild(l);
    }
    const cleanup = setHeadTags({ title, description, slug });
    return cleanup;
  }, [title, description, slug]);

  return (
    <div style={{ background: BG, fontFamily: SF, color: TEXT, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`@media(max-width:640px){.seo-nav-links{display:none!important}}`}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: 'rgba(248,249,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.10)',
        padding: '0 clamp(16px,5vw,32px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={LOGO} alt="College Fast Forward" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontFamily: SF, fontSize: 'clamp(15px,3vw,17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>
            College{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span>
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,3vw,28px)' }}>
          <span className="seo-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,3vw,28px)' }}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.to} style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, color: TEXT2, textDecoration: 'none' }}>{l.label}</a>
            ))}
          </span>
          <a href="#/GetStarted" style={{
            fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, borderRadius: 10, padding: '10px 20px',
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(109,40,217,0.35)', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center',
          }}>Start Free →</a>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1117', padding: '36px clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 300 }}>
            <span style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: '#f4f0e8' }}>College Fast Forward</span>
            <p style={{ fontFamily: INTER, fontSize: 12, color: 'rgba(244,240,232,0.4)', marginTop: 10, lineHeight: 1.6 }}>
              CLIFF — the AI career agent that finds roles, tailors resumes, and lands interviews for college students.
            </p>
          </div>
          <div>
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: 'rgba(244,240,232,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Tools</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FOOTER_TOOLS.map(l => (
                <a key={l.label} href={l.to} style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(244,240,232,0.45)', textDecoration: 'none' }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: 'rgba(244,240,232,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Company</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#/" style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(244,240,232,0.45)', textDecoration: 'none' }}>Home</a>
              <a href="#/GatorAuth" style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(244,240,232,0.45)', textDecoration: 'none' }}>Log In</a>
              <a href="#/GetStarted" style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(244,240,232,0.45)', textDecoration: 'none' }}>Sign Up</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1120, margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <span style={{ fontFamily: SF, fontSize: 12, color: 'rgba(244,240,232,0.3)' }}>© {new Date().getFullYear()} College Fast Forward. All rights reserved.</span>
          <nav style={{ display: 'flex', gap: 20 }}>
            <a href="#/Terms" style={{ fontFamily: SF, fontSize: 12, color: 'rgba(244,240,232,0.35)', textDecoration: 'none' }}>Terms</a>
            <a href="#/Privacy" style={{ fontFamily: SF, fontSize: 12, color: 'rgba(244,240,232,0.35)', textDecoration: 'none' }}>Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}