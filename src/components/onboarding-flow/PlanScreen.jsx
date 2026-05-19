import { useState, useEffect, useRef } from 'react';
import BackdoorOpportunityCard from './BackdoorOpportunityCard';
import ATSScoreRing from './ATSScoreRing';
import FunnelProgress from './FunnelProgress';

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

export default function PlanScreen({ resumeData, college, seeking, blockers = [], frustration, locationPref, locationCity, quickRole, onBack, saveAndAuth }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const goToPaidDashboard = () => {
    // TEST MODE: skip payment, go straight to paid dashboard
    window.location.hash = '#FastIQDashboard';
  };

  const continueForFree = () => {
    // Persist onboarding data so it pre-populates on upgrade
    try {
      if (college) localStorage.setItem('cff_college', college);
      if (seeking) localStorage.setItem('cff_seeking', seeking);
      if (blockers?.length) localStorage.setItem('cff_blockers', JSON.stringify(blockers));
      if (frustration) localStorage.setItem('cff_frustration', String(frustration));
      if (locationPref) localStorage.setItem('cff_location_pref', locationPref);
      if (locationCity) localStorage.setItem('cff_location_city', locationCity);
      if (quickRole) localStorage.setItem('cff_quick_role', quickRole);
      if (resumeData?.original?.name) localStorage.setItem('cff_resume_name', resumeData.original.name);
      localStorage.setItem('cff_plan_type', 'free');
    } catch (e) {}
    // saveAndAuth completes the auth flow; it will route to FreeTierDashboard via GatorAuth
    if (saveAndAuth) saveAndAuth('free');
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
        <button onClick={() => setShowPaywall(true)} style={{
          width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
          border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto',
          boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
        }}>
          Unlock My 14-Day Action Plan →
        </button>
        <button onClick={continueForFree} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textAlign: 'center', textDecoration: 'underline' }}>
          Save progress and continue for free
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
      <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 8px' }}>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(24px, 4.5vw, 40px)', fontWeight: 900, color: TEXT, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {firstName ? firstName.toUpperCase() + ',' : ''}{' '}
          let's stop blindly applying{' '}
          <span style={{ color: BLUE }}>and start interviewing.</span>
        </h1>
        <p style={{ fontFamily: dm, fontSize: 16, color: TEXT2, lineHeight: 1.7, margin: '0 auto', maxWidth: 580 }}>
          <span style={{ fontWeight: 700, color: '#2563eb' }}>⚡ Inside Track Found:</span>{' '}
          We located a <strong style={{ color: TEXT }}>{schoolName !== 'your university' ? schoolName : 'University'} Alum</strong> working at your top match.{' '}
          <strong style={{ color: TEXT }}>{locationPref === 'remote' ? 'Look what we found for you:' : `Look what we found for you near ${location}:`}</strong>
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          2. THE CROWN JEWEL — Backdoor Opportunity Card
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, animation: 'fadUp 0.5s ease' }}>
        <BackdoorOpportunityCard
          schoolName={schoolName}
          location={location}
          targetRole={targetRole}
          onUnlock={() => setShowPaywall(true)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────
          3. PROOF HUB — Mini LinkedIn + ATS Ring
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          ✅ What We've Already Built For You
        </p>
        <div className="proof-hub" style={{ display: 'flex', gap: 14, alignItems: 'stretch', alignContent: 'stretch' }}>
          {/* Left: Mini LinkedIn */}
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>💼</span>
              <div>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT, margin: 0 }}>LinkedIn Rebuilt</p>
                <p style={{ fontFamily: dm, fontSize: 10, color: TEXT2, margin: 0 }}>Keyword-optimized for recruiters</p>
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <MiniLinkedInCard name={fullName} college={college} />
            </div>
          </div>

          {/* Right: ATS Ring */}
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT, margin: '0 0 6px', textAlign: 'center' }}>Resume Optimized</p>
            <p style={{ fontFamily: dm, fontSize: 10, color: TEXT2, margin: '0 0 14px', textAlign: 'center' }}>Passes Fortune 500 ATS filters instantly</p>
            <ATSScoreRing />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          4. 3-DAY SPRINT ROADMAP
      ───────────────────────────────────────────────────── */}
      <SprintRoadmap targetRole={targetRole} location={location} schoolName={schoolName} />

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
          6. THE CLOSE — Final Checkout Card
      ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 24, padding: '36px 28px', marginBottom: 20, boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }}>
        <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, margin: '0 0 6px' }}>
          Real Job ➔ Elite Profile ➔ 3-Day Execution Plan.
        </p>
        <h2 style={{ fontFamily: sat, fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {firstName ? `${firstName}, let's get you hired.` : "Let's get you hired."} 🎯
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: '0 0 8px', lineHeight: 1.6 }}>
          The Verified Feed · The Insider DM · Your Daily 14-Day Sprint
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 24 }}>
          <span style={{ fontFamily: sat, fontSize: 20, fontWeight: 900, color: GREEN }}>$4.99</span>
          <span style={{ fontFamily: dm, fontSize: 13, color: TEXT2, fontWeight: 500 }}>/week · ✨ Cancel in 1-click anytime</span>
        </div>

        <button
          onClick={() => setShowPaywall(true)}
          style={{
            width: '100%', maxWidth: 520, display: 'block', margin: '0 auto 12px',
            fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none', borderRadius: 18, padding: '22px 32px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(22,163,74,0.5), 0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(22,163,74,0.35), 0 2px 8px rgba(0,0,0,0.1)'; }}
        >
          Unlock My 14-Day Action Plan — $4.99/wk →
        </button>
        <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '0 0 16px' }}>
          🎁 Invite a friend and your first week is on us.
        </p>
        <button
          onClick={continueForFree}
          style={{ fontFamily: dm, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
        >
          Save progress and continue for free
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={onBack} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (() => {
        const roadblockTextMap = {
          ghosted: 'getting completely ghosted after applying to jobs',
          resume: 'your resume not getting the responses it deserves',
          which_jobs: 'struggling to find roles that actually fit your background',
          outreach: 'the dread of not knowing how to reach the right people',
          disorganized: 'feeling disorganized and losing track of opportunities',
          interviews: 'interview anxiety holding you back from landing the role',
        };
        const primaryBlocker = blockers?.[0];
        const selectedPain = roadblockTextMap[primaryBlocker] || 'the broken, old-school job hunt';

        const assetGrid = [
          { icon: '📄', label: 'Resume Wow', sub: 'ATS-optimized, recruiter-ready' },
          { icon: '💼', label: 'LinkedIn Mirror Map', sub: 'Keyword-matched to your targets' },
          { icon: '🤝', label: 'Parent Network', sub: 'Warm intros to hiring insiders' },
          { icon: '📡', label: 'Hidden Signals', sub: 'Verified active hiring feed' },
        ];

        return (
          <div
            onClick={() => setShowPaywall(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: 16, overflowY: 'auto' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 24, padding: '36px 32px', maxWidth: 480, width: '100%', animation: 'fadUp 0.25s ease', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Eyebrow */}
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', margin: '0 0 14px' }}>
                College Fast Forward · Premium Sprint
              </p>

              {/* Headline */}
              <h2 style={{ fontFamily: sat, fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: TEXT, textAlign: 'center', margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {firstName ? `Let's stop blindly applying, ${firstName}. Start interviewing.` : "Let's stop blindly applying. Start interviewing."}
              </h2>

              {/* Empathy Block */}
              <div style={{ borderLeft: `4px solid ${BLUE}`, background: 'rgba(15,23,42,0.02)', borderRadius: '0 12px 12px 0', padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>
                  <strong>{firstName ? `${firstName}, we` : 'We'} noticed you're dealing with {selectedPain}.</strong>
                  <br /><br />
                  We get it — it's incredibly deflating to spend hours tailoring an application, hit submit, and get completely ghosted. We've all been there, staring at an empty inbox wondering if a human even looked at your resume.
                  <br /><br />
                  That's exactly why we built this. The traditional application system is a black hole. <strong style={{ color: BLUE }}>College Fast Forward bypasses it entirely</strong> by plugging you directly into the people who actually want to hire you.
                </p>
              </div>

              {/* 2x2 Asset Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {assetGrid.map((a, i) => (
                  <div key={i} style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: '14px 14px' }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <p style={{ fontFamily: sat, fontSize: 13, fontWeight: 700, color: TEXT, margin: '6px 0 2px' }}>{a.label}</p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, margin: 0, lineHeight: 1.4 }}>{a.sub}</p>
                  </div>
                ))}
              </div>

              {/* Primary CTA */}
              <button
                onClick={goToPaidDashboard}
                style={{ width: '100%', fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', border: 'none', borderRadius: 14, padding: '20px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10, boxShadow: '0 8px 24px rgba(22,163,74,0.35)', letterSpacing: '-0.01em', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(22,163,74,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.35)'; }}
              >
                Deploy My Career Agent Now →
              </button>

              {/* Secondary link */}
              <button
                onClick={continueForFree}
                style={{ width: '100%', fontFamily: dm, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textAlign: 'center' }}
              >
                Save progress, continue for free
              </button>

              <p style={{ fontFamily: dm, fontSize: 11, color: TEXT2, textAlign: 'center', margin: '14px 0 0' }}>🎁 Invite a friend — get your first week free</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}