import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import BackdoorOpportunityCard from './BackdoorOpportunityCard';
import ATSScoreRing from './ATSScoreRing';
import FunnelProgress from './FunnelProgress';
import OpportunityHub from './OpportunityHub';
import PremiumPaywallModal from './PremiumPaywallModal';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const BG = '#f8f9fc';
const CARD = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const TEXT2 = '#6b7280';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';
const LI_BG = '#F3F2EE';
const LI_CARD = '#FFFFFF';
const LI_BORDER_COLOR = '#E0DFDB';

/* ── Mini LinkedIn profile card (static, no typing animation) ── */
function MiniLinkedInCard({ name, college }) {
  const initials = (name || 'S U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const schoolShort = college ? college.split(' ').slice(-2).join(' ') : 'University';

  return (
    <div style={{ background: LI_BG, border: `1px solid ${LI_BORDER_COLOR}`, borderRadius: 12, overflow: 'hidden', fontSize: 0 }}>
      {/* Banner */}
      <div style={{ height: 56, background: 'linear-gradient(135deg, #0052CC 0%, #0066FF 45%, #0891B2 100%)' }} />
      {/* Body */}
      <div style={{ background: LI_CARD, padding: '0 14px 14px', borderTop: `1px solid ${LI_BORDER_COLOR}` }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: '3px solid #fff',
          background: 'linear-gradient(135deg, #1D4ED8, #0066FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: -26, marginBottom: 6,
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}>
          <span style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#fff' }}>{initials}</span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#1F2937', margin: '0 0 2px' }}>{name || 'Your Name'}</p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#6B7280', margin: '0 0 8px', lineHeight: 1.4 }}>
          Marketing Coordinator | Digital Strategy | {schoolShort} '26
        </p>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, borderTop: `1px solid ${LI_BORDER_COLOR}`, paddingTop: 10 }}>
          {[['87', 'Connections'], ['500+', 'Impressions'], ['Open', 'to Work']].map(([v, l], i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#0A66C2', margin: 0 }}>{v}</p>
              <p style={{ fontFamily: dm, fontSize: 9, color: '#6B7280', margin: 0, lineHeight: 1.3 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Keywords strip */}
      <div style={{ background: BLUE_LIGHT, borderTop: `1px solid ${LI_BORDER_COLOR}`, padding: '8px 14px' }}>
        <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 5px' }}>ATS Keywords Active</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Analytics'].map(kw => (
            <span key={kw} style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, color: BLUE, background: '#fff', border: `1px solid ${BLUE_BORDER}`, borderRadius: 4, padding: '2px 7px' }}>{kw}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 3-Day Sprint Roadmap ── */
function SprintRoadmap({ targetRole, location, schoolName }) {
  const days = [
    {
      day: 'Day 1',
      color: BLUE,
      bgColor: BLUE_LIGHT,
      borderColor: BLUE_BORDER,
      icon: '🚀',
      title: 'Deploy to Sarah K.',
      tasks: [
        'Send AI-crafted alumni intro DM to Sarah K. at Nexo Agency',
        'Agent monitors her LinkedIn for a reply signal',
        'Apply to 2 verified "active hiring" roles from your Feed',
      ],
    },
    {
      day: 'Day 2',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
      icon: '🔍',
      title: 'Run Hiring Signal Scan',
      tasks: [
        'Agent scans Nexo Agency + 2 adjacent companies for new openings',
        'Get notified if Sarah K. views your profile',
        'Deploy follow-up message if no reply within 24 hrs',
      ],
    },
    {
      day: 'Day 3',
      color: GREEN,
      bgColor: GREEN_LIGHT,
      borderColor: GREEN_BORDER,
      icon: '📅',
      title: 'Interview Prep Mode',
      tasks: [
        'If Sarah K. replies → Agent generates your interview brief',
        'Practice 5 predicted questions with AI feedback',
        'CRM auto-updates with interview status & next steps',
      ],
    },
  ];

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24 }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <div>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your 3-Day Sprint Roadmap</p>
          <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0 }}>Exactly what to do — and the Agent handles the rest.</p>
        </div>
      </div>
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative', paddingBottom: i < days.length - 1 ? 14 : 0 }}>
            {i < days.length - 1 && (
              <div style={{ position: 'absolute', left: 18, top: 38, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${d.borderColor}, ${days[i + 1].borderColor})` }} />
            )}
            <div style={{ width: 36, height: 36, borderRadius: 10, background: d.bgColor, border: `1.5px solid ${d.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              {d.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: d.color, background: d.bgColor, border: `1px solid ${d.borderColor}`, borderRadius: 100, padding: '2px 10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d.day}</span>
                <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: TEXT }}>{d.title}</span>
              </div>
              {/* Blurred task list — gated behind premium */}
              <div style={{ position: 'relative' }}>
                <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                  {d.tasks.map((t, ti) => (
                    <div key={ti} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: d.color, flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.55 }}>{t}</p>
                    </div>
                  ))}
                </div>
                {/* Frosted overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(2px)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: d.color, background: d.bgColor, border: `1px solid ${d.borderColor}`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                    🔒 Premium Action Plan Feature
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Old Way vs Fast Forward ── */
function ComparisonTable() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
      <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 16, padding: '18px 16px' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>❌ The Old Way</p>
        {[['2%', 'response rate on cold apps'], ['40 hrs', 'of searching per week'], ['~60%', 'of postings are ghost jobs']].map(([n, l], i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontFamily: sat, fontSize: 20, fontWeight: 900, color: '#ef4444', margin: '0 0 1px' }}>{n}</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 16, padding: '18px 16px' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>✅ Fast Forward Way</p>
        {[['18%', 'avg response on our leads'], ['4 hrs', 'of focused work per week'], ['100%', 'verified active hiring signals']].map(([n, l], i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontFamily: sat, fontSize: 20, fontWeight: 900, color: GREEN, margin: '0 0 1px' }}>{n}</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlanScreen({ resumeData, college, seeking, blockers = [], frustration, locationPref, locationCity, quickRole, selectedIndustries = [], targetRoles = [], onBack, saveAndAuth }) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [isDownsell, setIsDownsell] = useState(false);
  const [commitment, setCommitment] = useState(null);
  const exitIntentFired = useRef(false);

  // ── Exit-intent: desktop mouse leaves top of viewport ──
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 20 && !exitIntentFired.current && !showPaywall) {
        exitIntentFired.current = true;
        try { base44.entities.AnalyticsEvent.create({ event_name: 'exit_intent_triggered', user_id: 'anon', properties: { source: 'mouse_top' } }); } catch {}
        setIsDownsell(true);
        setShowPaywall(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showPaywall]);

  const openPaywall = (downsell = false) => {
    setIsDownsell(downsell);
    setShowPaywall(true);
  };

  const goToPaidDashboard = () => {
    window.location.hash = '#FastIQDashboard';
  };

  // PremiumPaywallModal handles the full share/clipboard flow internally.
  // onReferral is just a post-share callback — no need to re-trigger sharing here.
  const handleReferral = () => {
    // Modal has already copied/shared the payload. Nothing extra needed.
  };

  // Intercept ← Back on mobile as exit-intent
  const handleBack = () => {
    if (!exitIntentFired.current) {
      exitIntentFired.current = true;
      openPaywall(true);
    } else {
      onBack?.();
    }
  };

  const firstName = resumeData?.original?.name?.split(' ')[0] || null;
  const fullName = resumeData?.original?.name || null;
  const location = locationPref === 'remote' ? 'Remote' : locationCity || resumeData?.original?.location?.split(',')[0] || 'your city';
  const targetRole = quickRole || (seeking === 'internship' ? 'internship' : seeking === 'fulltime' ? 'full-time role' : 'opportunity');
  const schoolName = college || 'your university';

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 100, paddingBottom: 120, boxSizing: 'border-box' }}>
      <style>{`
        @keyframes fadUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseBlue { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.35)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0.0)} }
        .plan-sticky-cta { display: none; }
        @media (max-width: 767px) { .plan-sticky-cta { display: flex; } }
        @media (max-width: 640px) {
          .proof-hub { flex-direction: column !important; }
          .proof-hub-col { width: 100% !important; }
        }
      `}</style>

      {/* ── Mobile Sticky CTA ── */}
      <div className="plan-sticky-cta" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', borderTop: '1px solid #E2E8F0',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        flexDirection: 'column', alignItems: 'stretch', gap: 8,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <button onClick={() => openPaywall(false)} style={{
          width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
          border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto',
          boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
        }}>
          Unlock My 14-Day Action Plan — $4.99/week →
        </button>
      </div>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ marginBottom: 24 }}>
          <FunnelProgress activeStep={2} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 18 }}>
          <span style={{ fontSize: 13 }}>🗺️</span>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 3 — Your 14-Day Action Plan</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          1. HERO HEADER — Personal, urgent, action-focused
      ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 20, padding: '0 8px' }}>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(24px, 4.5vw, 40px)', fontWeight: 900, color: TEXT, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {firstName ? firstName + ', ' : ''}<span style={{ color: TEXT }}>let's stop blindly applying</span>{' '}
          <span style={{ color: BLUE }}>and start interviewing.</span>
        </h1>
        {/* Sub-headline: personal win summary */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: '16px 20px', maxWidth: 580, margin: '0 auto 16px', textAlign: 'left' }}>
          <p style={{ fontFamily: dm, fontSize: 14, color: TEXT, lineHeight: 1.7, margin: 0 }}>
            Your Agent has already <strong>rebuilt your resume + LinkedIn</strong>, found{' '}
            <strong style={{ color: BLUE }}>3 verified {schoolName} alumni connections</strong>, and unlocked hidden internal tracks.{' '}
            <span style={{ color: GREEN, fontWeight: 700 }}>You're no longer playing the numbers game.</span>
          </p>
        </div>
        {/* Inside Track Found banner */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 100, padding: '7px 18px', marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#c2410c', letterSpacing: '0.02em' }}>
            Inside Track Found: CLiFF bypassed public boards → active internal pipelines unlocked
          </span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '8px auto 0', maxWidth: 500, lineHeight: 1.6 }}>
          Here are your live hidden slots with a verified <strong style={{ color: TEXT }}>{schoolName} Alum</strong> connection:
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          2. PRIMARY FEED — Expandable Opportunity Hub
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, animation: 'fadUp 0.4s ease' }}>
        <OpportunityHub
          selectedIndustries={selectedIndustries}
          targetRoles={targetRoles}
          firstName={firstName}
          primaryBlocker={blockers?.[0]}
          schoolName={college}
          onUpgrade={() => setShowPaywall(true)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          3. PROOF HUB — Mini LinkedIn + ATS Ring (demoted)
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          ✅ What We've Already Built For You
        </p>
        <div className="proof-hub" style={{ display: 'flex', gap: 14, alignItems: 'stretch', alignContent: 'stretch' }}>
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>💼</span>
              <div>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT, margin: 0 }}>LinkedIn Rebuilt</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: GREEN, fontWeight: 700, margin: 0 }}>→ Ready for recruiters &amp; warm intros</p>
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <MiniLinkedInCard name={fullName} college={college} />
            </div>
          </div>
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT, margin: '0 0 2px', textAlign: 'center' }}>Resume Optimized</p>
            <p style={{ fontFamily: dm, fontSize: 10, color: GREEN, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>→ 98% ATS Match (Top 2%)</p>
            <p style={{ fontFamily: dm, fontSize: 10, color: TEXT2, margin: '0 0 14px', textAlign: 'center' }}>Passes Fortune 500 ATS filters instantly</p>
            <ATSScoreRing />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          5. VALUE CONTRAST — Old Way vs Fast Forward
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          Why the old way is failing you
        </p>
        <ComparisonTable />
      </div>

      {/* ─────────────────────────────────────────────────────
          5b. COMMITMENT QUESTION — Self-persuasion before paywall
      ───────────────────────────────────────────────────── */}
      <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: '28px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '0 0 6px', lineHeight: 1.6 }}>
          {firstName ? `${firstName}, you're` : "You're"} now set up for a real 14-day sprint.{' '}
          <span style={{ color: GREEN, fontWeight: 700 }}>Most students who reach this point land their first interview or warm intro within 2 weeks.</span>
        </p>
        <h3 style={{ fontFamily: sat, fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: TEXT, margin: '16px 0 14px', letterSpacing: '-0.02em' }}>
          How committed are you to getting hired this semester?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '🔥 Extremely — Let\'s go', value: 'extreme' },
            { label: '✅ Very committed', value: 'very' },
            { label: '🤔 Somewhat — still figuring it out', value: 'somewhat' },
          ].map(opt => (
            <button key={opt.value} onClick={() => { setCommitment(opt.value); setTimeout(() => openPaywall(false), 320); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                background: commitment === opt.value ? (opt.value === 'extreme' ? GREEN_LIGHT : BLUE_LIGHT) : '#F8FAFC',
                border: `1.5px solid ${commitment === opt.value ? (opt.value === 'extreme' ? GREEN_BORDER : BLUE_BORDER) : '#E2E8F0'}`,
                borderRadius: 10, padding: '14px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${commitment === opt.value ? (opt.value === 'extreme' ? GREEN : BLUE) : '#CBD5E1'}`, background: commitment === opt.value ? (opt.value === 'extreme' ? GREEN : BLUE) : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>
                {commitment === opt.value && '✓'}
              </div>
              <span style={{ fontFamily: dm, fontSize: 14, fontWeight: commitment === opt.value ? 700 : 500, color: commitment === opt.value ? TEXT : TEXT2 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          6. THE CLOSE — Final Checkout Card
      ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 24, padding: '36px 28px', marginBottom: 20, boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '0 0 6px' }}>
          Unlock My Elite Profile + 14-Day Execution Plan 🎯
        </p>
        <h2 style={{ fontFamily: sat, fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: TEXT, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {firstName ? `${firstName}, let's get you hired.` : "Let's get you hired."} 🎯
        </h2>

        {/* Pricing pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '7px 20px', marginBottom: 22 }}>
          <span style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: GREEN }}>$4.99</span>
          <span style={{ fontFamily: dm, fontSize: 13, color: TEXT2, fontWeight: 500 }}>/week · Cancel anytime in 1 click</span>
        </div>

        {/* Big green CTA */}
        <button
          onClick={() => openPaywall(false)}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 14px',
            fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none', borderRadius: 18, padding: '22px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(22,163,74,0.5), 0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)'; }}
        >
          Unlock My 14-Day Action Plan — $4.99/week →
        </button>

        {/* Trust builders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0 }}>
            🏆 Join 2,400+ students landing opportunities
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: 0 }}>
            🔒 No credit card needed to start — charged only after your free trial
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: BLUE, margin: 0, fontWeight: 600 }}>
            🎁 Or text 3 friends for free access
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={handleBack} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <PremiumPaywallModal
          firstName={firstName}
          schoolName={schoolName}
          isDownsell={isDownsell}
          onClose={() => setShowPaywall(false)}
          onPay={goToPaidDashboard}
          onReferral={handleReferral}
        />
      )}
    </div>
  );
}