import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import BackdoorOpportunityCard from './BackdoorOpportunityCard';
import ATSScoreRing from './ATSScoreRing';
import FunnelProgress from './FunnelProgress';
import OpportunityHub from './OpportunityHub';
import PremiumPaywallModal from './PremiumPaywallModal';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

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

/* ── 14-Day Plan Roadmap ── */
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
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your 14-Day Plan Roadmap</p>
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
  const rows = [
    ['2% response rate on cold apps', '18% avg response on our leads'],
    ['40 hrs searching per week', '4 hrs of focused work per week'],
    ['~60% of postings are ghost jobs', '100% verified active hiring signals'],
  ];
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1.5px solid ${BORDER}` }}>
        <div style={{ padding: '12px 18px', borderRight: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#374151' }}>The Old Way</span>
          <span style={{ fontSize: 14 }}>❌</span>
        </div>
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#374151' }}>The Fast Forward Way</span>
          <span style={{ fontSize: 14 }}>✅</span>
        </div>
      </div>
      {/* Data rows */}
      {rows.map(([old, ff], i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < rows.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
          <div style={{ padding: '14px 18px', borderRight: `1px solid ${BORDER}`, background: '#fafafa' }}>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{old}</p>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <p style={{ fontFamily: dm, fontSize: 13, color: GREEN, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{ff}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlanScreen({ resumeData, college, seeking, blockers = [], frustration, locationPref, locationCity, quickRole, selectedIndustries = [], targetRoles = [], onBack, saveAndAuth }) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [commitment, setCommitment] = useState(null);
  const [showCommitmentRequired, setShowCommitmentRequired] = useState(false);

  const openPaywall = () => {
    setShowPaywall(true);
  };

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Launch real Stripe checkout — saves onboarding data first, then redirects
  const launchCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      // Ensure user is authenticated first; if not, trigger auth + store intent
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        // Not logged in yet — save intent and route through auth
        localStorage.setItem('cff_post_auth_intent', 'checkout_pro_monthly');
        if (saveAndAuth) {
          await saveAndAuth('paid');
        } else {
          base44.auth.loginWithProvider('google', window.location.origin + '/#FreeTierDashboard?checkout=pro_monthly');
        }
        setCheckoutLoading(false);
        return;
      }
      // Already authenticated — call checkout directly
      const res = await createCheckoutSession({
        plan: 'pro_monthly',
        user: { id: user.id, email: user.email, family_id: user.family_id },
        successUrl: window.location.origin + '/#FreeTierDashboard?upgrade=success',
        cancelUrl: window.location.href,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setCheckoutError(res?.data?.error || 'Something went wrong. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('Could not start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  const firstName = resumeData?.original?.name?.split(' ')[0] || null;
  const fullName = resumeData?.original?.name || null;
  const location = locationPref === 'remote' ? 'Remote' : locationCity || resumeData?.original?.location?.split(',')[0] || 'your city';
  const targetRole = quickRole || (seeking === 'internship' ? 'internship' : seeking === 'fulltime' ? 'full-time role' : 'opportunity');
  const schoolName = college || 'your university';

  return (
    <div style={{ maxWidth: 780, width: '100%', paddingTop: 100, paddingBottom: 120, boxSizing: 'border-box', paddingLeft: 0, paddingRight: 0 }}>
      <style>{`
        @keyframes fadUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseBlue { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.35)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0.0)} }
        .plan-sticky-cta { display: none; }
        @media (max-width: 767px) {
          .plan-sticky-cta { display: flex; }
          .plan-main-cta { margin-bottom: 80px !important; }
          .plan-body-text { font-size: 16px !important; line-height: 1.6 !important; }
          .plan-commitment-card { padding: 20px 16px !important; }
          .plan-close-card { padding: 28px 16px !important; }
        }
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
        <button
          onClick={() => { if (!commitment) { setShowCommitmentRequired(true); const el = document.getElementById('commitment-anchor'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; } launchCheckout(); }}
          disabled={checkoutLoading}
          style={{
            width: '100%', fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: 'none', borderRadius: 14, padding: '18px 16px', cursor: checkoutLoading ? 'default' : 'pointer', minHeight: 56,
            boxShadow: '0 4px 16px rgba(109,40,217,0.40)',
          }}
        >
          {checkoutLoading ? 'Launching…' : 'Deploy CLiFF Agent — $4.99 →'}
        </button>
      </div>

      {/* ── Progress Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <FunnelProgress activeStep={2} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '6px 18px' }}>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.08em', textTransform: 'uppercase' }}>✅ Step 3 — Your 14-Day Action Plan</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          1. HERO HEADER
      ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 4px' }}>
        <h1 style={{ fontFamily: sat, fontSize: 'clamp(26px, 4.5vw, 42px)', fontWeight: 900, color: TEXT, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {firstName ? `${firstName}, ` : ''}<span style={{ color: TEXT }}>let's stop blindly applying</span>{' '}
          <span style={{ color: BLUE }}>and start interviewing.</span>
        </h1>
        <p style={{ fontFamily: dm, fontSize: 16, color: TEXT2, lineHeight: 1.65, margin: '0 auto', maxWidth: 560 }}>
          CLiFF has already <strong style={{ color: TEXT }}>rebuilt your resume + LinkedIn</strong>, found{' '}
          <strong style={{ color: BLUE }}>3 verified {schoolName} alumni connections</strong>, and unlocked hidden internal tracks.{' '}
          <strong style={{ color: GREEN }}>You're no longer playing the numbers game.</strong>
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          2. INSIDE TRACK — Dark highlight section
      ───────────────────────────────────────────────────── */}
      <div style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: 20, padding: '24px 24px 20px', marginBottom: 28, boxShadow: '0 4px 16px rgba(109,40,217,0.08)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div>
            <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.01em' }}>Inside Track Found</p>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>CLiFF bypassed public job boards and opened active internal pipelines.</p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live</span>
          </div>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#4b5563', margin: '0 0 18px', lineHeight: 1.6 }}>
          Here are your hidden opportunities with verified <strong style={{ color: BLUE }}>{schoolName} alumni</strong>:
        </p>

        {/* Teaser cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
          {[
            { role: 'Senior Product Manager', company: '████████', dept: 'Product & Strategy', badge: `1 ${schoolName.split(' ').slice(-2).join(' ')} Alum Found` },
            { role: 'Investment Banking Analyst', company: '███████ ██████', dept: 'Finance & Banking', badge: `1 ${schoolName.split(' ').slice(-2).join(' ')} Alum Found` },
            { role: 'Marketing Director', company: '████', dept: 'Marketing & Growth', badge: `1 ${schoolName.split(' ').slice(-2).join(' ')} Alum Found` },
          ].map((card, i) => (
            <div key={i} style={{
              background: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)',
              border: i === 0 ? `1px solid ${BLUE_BORDER}` : '1px solid #e5e7eb',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              filter: i > 0 ? 'blur(2.5px)' : 'none',
              opacity: i === 0 ? 1 : i === 1 ? 0.7 : 0.45,
              userSelect: i > 0 ? 'none' : 'auto',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                {['👩‍💼', '👨‍💼', '👩‍💻'][i]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>{card.role}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '0 0 5px', letterSpacing: '0.03em' }}>{card.company} · {card.dept}</p>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: GREEN, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 6, padding: '2px 8px' }}>✓ {card.badge}</span>
              </div>
              {i === 0 && (
                <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 8, padding: '6px 12px', flexShrink: 0 }}>
                  <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, margin: 0, whiteSpace: 'nowrap' }}>Ready to Intro →</p>
                </div>
              )}
            </div>
          ))}
          {/* Fade overlay on locked cards */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to bottom, transparent, rgba(245,243,255,0.95))', borderRadius: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14, pointerEvents: 'none' }}>
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 18px' }}>
              🔒 2 more alumni connections unlock with your plan
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          3. COMMITMENT QUESTION — Pill toggle
      ───────────────────────────────────────────────────── */}
      <div id="commitment-anchor" className="plan-commitment-card" style={{ background: CARD, border: `1.5px solid ${showCommitmentRequired && !commitment ? '#ef4444' : BORDER}`, borderRadius: 20, padding: '28px 24px', marginBottom: 28, boxShadow: showCommitmentRequired && !commitment ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
        {/* Network badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0f4ff', border: '1px solid #c7d7ff', borderRadius: 100, padding: '5px 16px' }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.06em' }}>
              Target Set: {college || 'Your University'} Network
            </span>
          </div>
        </div>
        <h3 style={{ fontFamily: sat, fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          How aggressive is your search this semester?
        </h3>
        {showCommitmentRequired && !commitment && (
          <p style={{ fontFamily: dm, fontSize: 12, color: '#ef4444', fontWeight: 700, margin: '0 0 10px', textAlign: 'center' }}>
            ↑ Pick a mode to continue.
          </p>
        )}
        {/* Pill row */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: commitment ? 14 : 0 }}>
          {[
            { label: 'Just Browsing', value: 'somewhat', emoji: '🤔', response: "That's okay. Even 30 min/week with CLiFF beats 100 cold apps." },
            { label: 'Actively Hunting', value: 'very', emoji: '✅', response: "Solid — that's all it takes. Let's build your edge." },
            { label: 'Absolute Blitzkrieg', value: 'extreme', emoji: '⚡', response: "Hell yes — CLiFF is ready when you are." },
          ].map(opt => {
            const isActive = commitment === opt.value;
            const activeBg = opt.value === 'extreme' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : opt.value === 'very' ? BLUE : '#4b5563';
            return (
              <button key={opt.value} onClick={() => setCommitment(opt.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: dm, fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : TEXT2,
                  background: isActive ? activeBg : '#F8FAFC',
                  border: `1.5px solid ${isActive ? 'transparent' : '#E2E8F0'}`,
                  borderRadius: 100, padding: '10px 22px',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: isActive ? '0 4px 16px rgba(109,40,217,0.28)' : 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 14 }}>{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
        {commitment && (() => {
          const resp = { extreme: "Hell yes — CLiFF is ready when you are.", very: "Solid — that's all it takes. Let's build your edge.", somewhat: "That's okay. Even 30 min/week with CLiFF beats 100 cold apps." };
          const col = commitment === 'extreme' ? '#6d28d9' : commitment === 'very' ? BLUE : '#374151';
          const bg = commitment === 'extreme' ? '#f5f3ff' : commitment === 'very' ? BLUE_LIGHT : '#f9fafb';
          const bd = commitment === 'extreme' ? '#ddd6fe' : commitment === 'very' ? BLUE_BORDER : '#e5e7eb';
          return (
            <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 10, padding: '12px 16px', animation: 'fadUp 0.2s ease' }}>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: col, margin: 0 }}>{resp[commitment]}</p>
            </div>
          );
        })()}
      </div>

      {/* ─────────────────────────────────────────────────────
          4. PRIMARY FEED — Expandable Opportunity Hub
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
          5. PROOF HUB — Mini LinkedIn + ATS Ring
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          ✅ What We've Already Built For You
        </p>
        <div className="proof-hub" style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>💼</span>
              <div>
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>LinkedIn Rebuilt</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: GREEN, fontWeight: 700, margin: 0 }}>→ Ready for recruiters &amp; warm intros</p>
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <MiniLinkedInCard name={fullName} college={college} />
            </div>
          </div>
          <div className="proof-hub-col" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'stretch' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, textAlign: 'center' }}>Resume Optimized</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: GREEN, fontWeight: 700, margin: 0, textAlign: 'center' }}>98% ATS Match (Top 2%)</p>
            <p style={{ fontFamily: dm, fontSize: 10, color: TEXT2, margin: '0 0 10px', textAlign: 'center' }}>Top 2% of Global Applicants</p>
            <ATSScoreRing />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          6. VALUE CONTRAST — Old Way vs Fast Forward
      ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          Why the old way is failing you
        </p>
        <ComparisonTable />
      </div>

      {/* ─────────────────────────────────────────────────────
          7. THE CLOSE — Dark deployment CTA
      ───────────────────────────────────────────────────── */}
      <div className="plan-close-card plan-main-cta" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1.5px solid #ddd6fe', borderRadius: 24, padding: '36px 28px', marginBottom: 20, boxShadow: '0 8px 32px rgba(109,40,217,0.12)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.10)', border: '1px solid rgba(109,40,217,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 14 }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase' }}>CLiFF Agent · Ready to Deploy</span>
          </div>
          <h2 style={{ fontFamily: sat, fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {firstName ? `${firstName}, let's get you hired.` : "Let's get you hired."}
          </h2>
          <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, margin: 0 }}>
            Unlock Your Full 14-Day Sprint Plan
          </p>
        </div>

        {/* Live metrics strip */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          {[
            { label: 'Resume Optimization', value: '98% ATS Approved', color: GREEN },
            { label: 'Alumni Matrix', value: '3 Warm Tracks Isolated', color: BLUE },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, minWidth: 140, background: '#fff', border: `1px solid ${BLUE_BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{m.label}</p>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, background: '#fff', border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '8px 24px' }}>
            <span style={{ fontFamily: sat, fontSize: 26, fontWeight: 900, color: BLUE }}>$4.99</span>
            <span style={{ fontFamily: dm, fontSize: 13, color: TEXT2 }}>/week — billed monthly at $19.96 · Cancel anytime</span>
          </div>
        </div>

        {/* Deploy button — purple */}
        <button
          onClick={() => {
            if (!commitment) {
              setShowCommitmentRequired(true);
              const el = document.getElementById('commitment-anchor');
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
            launchCheckout();
          }}
          disabled={checkoutLoading}
          style={{
            maxWidth: 520, margin: '0 auto 20px',
            fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff',
            background: checkoutLoading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: 'none', borderRadius: 14, padding: '20px 32px', cursor: checkoutLoading ? 'default' : 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(109,40,217,0.45), 0 2px 8px rgba(0,0,0,0.2)',
            letterSpacing: '-0.01em', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
          }}
          onMouseEnter={e => { if (!checkoutLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(109,40,217,0.60)'; }}}
          onMouseLeave={e => { if (!checkoutLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,40,217,0.45), 0 2px 8px rgba(0,0,0,0.2)'; }}}
        >
          {checkoutLoading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Launching Stripe…
            </>
          ) : 'Deploy CLiFF Agent — $4.99 →'}
        </button>
        {checkoutError && (
          <p style={{ fontFamily: dm, fontSize: 13, color: '#ef4444', textAlign: 'center', margin: '-12px 0 16px', fontWeight: 600 }}>
            ⚠️ {checkoutError}
          </p>
        )}

        {/* Trust signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0 }}>🏆 Join 2,400+ students landing interviews this month</p>
          <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0 }}>Cancel anytime</p>
        </div>
      </div>

      {/* ── Free-tier exit — clear next step for users who don't upgrade now ── */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button
          onClick={() => saveAndAuth?.('free')}
          style={{ width: '100%', maxWidth: 520, margin: '0 auto', fontFamily: dm, fontSize: 15, fontWeight: 700, color: TEXT, background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '16px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
        >
          Continue with the free version →
        </button>
        <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, margin: '10px 0 0', lineHeight: 1.5 }}>
          Get started free with 5 daily job matches. Upgrade anytime to unlock alumni intros &amp; your full sprint plan.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={handleBack} style={{ fontFamily: dm, fontSize: 12, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
      </div>

      {/* ── Paywall Modal ── */}
      {showPaywall && (
        <PremiumPaywallModal
          firstName={firstName}
          schoolName={schoolName}
          isDownsell={false}
          onClose={() => setShowPaywall(false)}
          onPay={launchCheckout}
        />
      )}
    </div>
  );
}