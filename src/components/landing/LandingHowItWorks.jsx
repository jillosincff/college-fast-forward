import React, { useEffect, useRef, useState } from 'react';
import { PrimaryCTA, SecondaryCTA } from '@/components/landing/LandingCTAButton';

/* ── fonts ─────────────────────────────────────────── */
const FONT_LINK_ID = 'hiw-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

/* ── data ──────────────────────────────────────────── */
const TABS = [
  { id: 'network', label: 'Basic Membership', name: 'The Parent Network', price: '$9 / month' },
  { id: 'fastiq', label: 'Full Access', name: 'FASTIQ Career Concierge', price: '$29 / month' },
];

const PANELS = {
  network: {
    includes: null,
    cards: [
      {
        title: 'Take the Parent Pledge',
        body: 'Create your free account and commit to paying it forward. You agree to respond when a student reaches out — with a lead, a referral, advice, or just 20 minutes of your time. <b>That pledge is what makes this network different from everywhere else.</b>',
      },
      {
        title: 'Your Student Gets Matched',
        body: 'Students create a profile and are immediately matched with UF parents and alumni already on the platform. They reach out directly — to <b>real people at real companies</b> who already said yes to helping.',
      },
      {
        title: 'Real Conversations. Real Doors.',
        body: 'A parent responds. A call happens. An intro gets made. Research shows shared university affinity creates instant trust — the kind no cold application can replicate. <b>One warm conversation changes everything.</b>',
      },
    ],
    cta: { text: 'Join the Network — $9/month', dark: true },
  },
  fastiq: {
    includes:
      'Includes <b>everything in The Parent Network</b> — plus your own AI career concierge working for you 24/7.',
    cards: [
      {
        title: 'Tell FASTIQ Where You Want to Go',
        body: 'Target companies, career paths, industries — or just something you\'re curious about. Want to know what a nuclear physicist\'s day actually looks like? FASTIQ finds the <b>UF alumni living that life right now</b> and helps you reach them.',
      },
      {
        title: 'Your Concierge Goes to Work',
        body: 'FASTIQ reaches beyond the platform into the <b>full UF alumni network worldwide</b> — Gators at your target companies who share your school, your values, and a reason to help. It drafts outreach, tailors your resume to specific listings, and surfaces opportunities that never hit the job boards.',
      },
      {
        title: 'Show Up Ready. Every Time.',
        body: 'Real-time company intel before every conversation. Interview prep before every call. Follow-up reminders so nothing falls through the cracks. <b>When a door opens — because a real person held it — you walk through it ready.</b>',
      },
    ],
    cta: { text: 'Unlock FASTIQ — $29/month', dark: false },
  },
};

const STATS = [
  { number: '85%', label: 'of jobs filled through networking' },
  { number: '#1', label: 'source of hires is referrals' },
  { number: '2×', label: 'more likely to get hired via alumni affinity' },
];

/* ── component ─────────────────────────────────────── */
export default function LandingHowItWorks({ onClaim }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('network');
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const switchTab = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setAnimKey((k) => k + 1);
  };

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  const panel = PANELS[activeTab];

  return (
    <section
      ref={sectionRef}
      className="landing-hiw"
      style={{
        background: '#0d1117',
        padding: '72px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .landing-hiw { padding: 56px 24px !important; }
          .hiw-tabs { flex-direction: column !important; }
          .hiw-tabs button { min-width: 100% !important; }
          .hiw-cards-grid { grid-template-columns: 1fr !important; }
          .hiw-stats-row { flex-direction: column !important; gap: 16px !important; }
          .hiw-stats-row .hiw-stat-sep { display: none !important; }
        }
      `}</style>
      {/* glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(ellipse at center, rgba(220,85,30,0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>

        {/* ── headline ────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 20, ...fadeUp(0) }}>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(34px, 5vw, 50px)', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            <span style={{ color: '#f4f0e8' }}>How It </span>
            <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Works</span>
          </h2>
          <div style={{ width: 40, height: 2, background: '#E85D20', borderRadius: 1, margin: '16px auto 0' }} />
        </div>

        {/* ── provocation ─────────────────────────── */}
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '28px auto 44px', ...fadeUp(0.1) }}>
          <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 19, color: 'rgba(244,240,232,0.65)', lineHeight: 1.6, margin: '0 0 16px' }}>
            "Students don't lack opportunity. They lack access to the networks where opportunities live."
          </p>
          <StatsRow />
        </div>

        {/* ── tabs ────────────────────────────────── */}
        <div className="hiw-tabs" style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 44, flexWrap: 'wrap', ...fadeUp(0.15) }}>
          {TABS.map((t) => (
            <TabButton key={t.id} tab={t} active={activeTab === t.id} onClick={() => switchTab(t.id)} />
          ))}
        </div>

        {/* ── panel content ───────────────────────── */}
        <PanelContent key={animKey} panel={panel} onClaim={onClaim} />
      </div>
    </section>
  );
}

/* ── stats row ────────────────────────────────────── */
function StatsRow() {
  return (
    <div className="hiw-stats-row" style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
      {STATS.map((s, i) => (
        <React.Fragment key={s.number}>
          {i > 0 && (
            <div className="hiw-stat-sep" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', margin: '0 16px', flexShrink: 0 }} />
          )}
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#E85D20', lineHeight: 1 }}>{s.number}</div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(244,240,232,0.35)', maxWidth: 120, lineHeight: 1.4, marginTop: 6 }}>{s.label}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── tab button ───────────────────────────────────── */
function TabButton({ tab, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? 'rgba(232,93,32,0.1)'
    : hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)';
  const border = active
    ? '0.5px solid rgba(232,93,32,0.45)'
    : hovered ? '0.5px solid rgba(255,255,255,0.18)' : '0.5px solid rgba(255,255,255,0.1)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 5,
        padding: '18px 28px',
        borderRadius: 14,
        minWidth: 220,
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        background: bg,
        border,
        minHeight: 'auto',
        width: 'auto',
      }}
    >
      <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: active ? 'rgba(232,93,32,0.8)' : 'rgba(244,240,232,0.35)' }}>
        {tab.label}
      </span>
      <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 500, lineHeight: 1.2, color: active ? '#f4f0e8' : 'rgba(244,240,232,0.5)' }}>
        {tab.name}
      </span>
      <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: active ? '#E85D20' : 'rgba(244,240,232,0.2)' }}>
        {tab.price}
      </span>
    </button>
  );
}

/* ── panel content (animated on switch) ───────────── */
function PanelContent({ panel, onClaim }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    // small raf delay to trigger CSS transitions on mount
    const id = requestAnimationFrame(() => setVis(true));
    return () => { cancelAnimationFrame(id); setVis(false); };
  }, []);

  const cardFade = (i) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.45s ease ${0.05 + i * 0.07}s, transform 0.45s ease ${0.05 + i * 0.07}s`,
  });

  const isDark = panel.cta.dark;

  return (
    <div ref={ref}>
      {/* includes banner (FASTIQ only) */}
      {panel.includes && (
        <div
          style={{
            background: 'rgba(232,93,32,0.07)',
            border: '0.5px solid rgba(232,93,32,0.2)',
            borderRadius: 10,
            padding: '13px 18px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.45s ease 0.22s, transform 0.45s ease 0.22s',
          }}
        >
          {/* checkmark icon */}
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(232,93,32,0.9)', lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: panel.includes.replace(/<b>/g, '<b style="font-weight:500;color:#E85D20">') }}
          />
        </div>
      )}

      {/* cards grid */}
      <div className="hiw-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 16 }}>
        {panel.cards.map((c, i) => (
          <div
            key={c.title}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '30px 24px 26px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.25s, border-color 0.25s',
              ...cardFade(i),
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            {/* step number */}
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 22 }}>
              {i + 1}
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#f4f0e8', marginBottom: 10, lineHeight: 1.3 }}>
              {c.title}
            </div>
            <div
              style={{ fontFamily: dmSans, fontSize: 14.5, fontWeight: 300, color: 'rgba(244,240,232,0.58)', lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: c.body.replace(/<b>/g, '<b style="font-weight:400;color:rgba(244,240,232,0.85)">') }}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 32,
          opacity: vis ? 1 : 0,
          transform: vis ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.45s ease 0.26s, transform 0.45s ease 0.26s',
        }}
      >
        {isDark
          ? <SecondaryCTA text={panel.cta.text} onClick={onClaim} />
          : <PrimaryCTA text={panel.cta.text} onClick={onClaim} />
        }
      </div>
    </div>
  );
}