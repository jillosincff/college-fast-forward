import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { GraduationCap, Users, Target, FileText, Rocket, Check, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import AppShowcase from '@/components/landing/AppShowcase';
import LiveJobsSection from '@/components/landing/LiveJobsSection';
import AgentWeekDemo from '@/components/landing/AgentWeekDemo';
import WhileAwaySection from '@/components/landing/WhileAwaySection';
import PhilosophySection from '@/components/landing/PhilosophySection';
import WhatIsCliffing from '@/components/landing/WhatIsCliffing';
import RoommateSection from '@/components/landing/RoommateSection';
import ProblemClarifier from '@/components/landing/ProblemClarifier';
import { HERO_VARIANTS, getHeroVariant, trackHeroEvent } from '@/components/landing/heroVariants';
import DayWithCliff from '@/components/landing/DayWithCliff';
import CliffTrustSection from '@/components/landing/CliffTrustSection';
import SchoolMarquee from '@/components/landing/SchoolMarquee';
import MatchTeaser from '@/components/landing/MatchTeaser';
import JourneySection from '@/components/landing/JourneySection';

// ── Design Tokens — Light Mode / Gen Z ─────────────────────────
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

// Page backgrounds
const BG   = '#f8f9ff';
const BG2  = '#ffffff';

// Cards
const CARD  = '#ffffff';
const CARD2 = '#f1f5ff';

// Text
const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

// Signature Purple — primary brand color (unified across all CTAs)
const INDIGO       = '#6d28d9';
const INDIGO_DIM   = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER= 'rgba(109,40,217,0.20)';

// Violet — secondary accent
const VIOLET       = '#7c3aed';
const VIOLET_LIGHT = 'rgba(124,58,237,0.08)';
const VIOLET_BORDER= 'rgba(124,58,237,0.20)';

// Pink — accent 3
const PINK        = '#ec4899';
const PINK_LIGHT  = 'rgba(236,72,153,0.08)';
const PINK_BORDER = 'rgba(236,72,153,0.22)';

// Teal — accent 4
const TEAL        = '#06b6d4';
const TEAL_LIGHT  = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const TEAL_DARK   = '#0891b2';

// Coral for "bad" contrast
const CORAL       = '#f43f5e';
const CORAL_LIGHT = 'rgba(244,63,94,0.07)';
const CORAL_BORDER= 'rgba(244,63,94,0.22)';

// Gradient helpers
const GRAD_HERO   = 'linear-gradient(145deg, #f0f4ff 0%, #fdf2ff 50%, #f0fbff 100%)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const GRAD_WARM   = 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)';

// Shadows (unified across all floating elements)
const SHADOW    = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';



const PROOF_CALLOUTS = [
  { text: 'Tailored resumes for every job you target' },
  { text: 'Interview preparation and practice' },
  { text: 'Smarter job prioritization — focus where you can actually win' },
  { text: 'Warm introductions when they genuinely improve your chances' },
  { text: 'Follow-up reminders at exactly the right time' },
  { text: 'Career strategy that adapts as you make progress' },
  { text: 'Networking done for you — not left up to you' },
];

const STORIES = [
  { quote: "I stopped wondering what I should do every day. CLIFF always had the next move ready — and I landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/c2df92fac_IMG_8456.png", tag: "Landed an internship", color: INDIGO },
  { quote: "CLIFF kept me on track without me constantly checking everything. I finally felt like someone was actually helping me.", name: "Maya R.", school: "UF '26, Business", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/980f1d142_IMG_8190.png", tag: "Off my mind", color: VIOLET },
  { quote: "I spent less time searching and more time getting interviews. I heard back from an alumna within 48 hours.", name: "Nerissa R.", school: "USC '25, Marketing", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/574cf5430_IMG_8455.png", tag: "More interviews, less searching", color: PINK },
];

function StoriesCarousel() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const total = STORIES.length;

  useEffect(() => {
    const iv = setInterval(() => { if (!dragging) setActive(a => (a + 1) % total); }, 5500);
    return () => clearInterval(iv);
  }, [dragging]);

  const goTo = (i) => setActive((i + total) % total);
  const onTouchStart = (e) => { setDragging(true); setStartX(e.touches[0].clientX); };
  const onTouchMove = (e) => { if (dragging) setOffset(e.touches[0].clientX - startX); };
  const onTouchEnd = () => { if (Math.abs(offset) > 50) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };
  const onMouseDown = (e) => { setDragging(true); setStartX(e.clientX); };
  const onMouseMove = (e) => { if (dragging) setOffset(e.clientX - startX); };
  const onMouseUp = () => { if (Math.abs(offset) > 60) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };

  const s = STORIES[active];

  return (
    <div style={{ userSelect: 'none' }}>
      <div
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          background: CARD, borderRadius: 20, boxShadow: SHADOW_LG,
          borderLeft: `4px solid ${s.color}`,
          padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)', cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.06}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 140,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${s.color}14`, border: `1px solid ${s.color}33`, borderRadius: 100, padding: '4px 14px', marginBottom: 14 }}>
          <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: s.color }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 500, color: TEXT, lineHeight: 1.65, margin: '0 0 20px', fontStyle: 'italic' }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={s.photo} alt={s.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${s.color}40`, flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{s.name}</p>
            <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '2px 0 0' }}>{s.school}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STORIES.map((st, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Go to story ${i + 1}`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', minHeight: 44, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'block', width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? st.color : '#e2e8f0', transition: 'all 0.3s ease' }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1].map((i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} aria-label={i === 0 ? 'Previous story' : 'Next story'} style={{ width: 44, height: 44, borderRadius: '50%', background: CARD2, border: '1px solid #e2e8f0', color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 44, minWidth: 44, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.color = INDIGO; }}
              onMouseLeave={e => { e.currentTarget.style.background = CARD2; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = TEXT2; }}
            >{i === 0 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentLandingPage({ onParentClick }) {
  const [mounted, setMounted] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);
  const [funnelStartScreen, setFunnelStartScreen] = useState(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [heroVariant] = useState(() => getHeroVariant());
  const { user, isLoadingAuth } = useAuth();

  // Track which hero variant was shown (once per page view)
  useEffect(() => {
    trackHeroEvent('hero_variant_shown', heroVariant);
  }, [heroVariant]);

  useEffect(() => {
    setMounted(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const referrerId = urlParams.get('r') || hashParams.get('r');
      if (referrerId) localStorage.setItem('cff_referrer_id', referrerId);
    } catch {}
    if (!document.getElementById('slp-satoshi')) {
      const l = document.createElement('link');
      l.id = 'slp-satoshi'; l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  // Show sticky CTA bar after scrolling past ~50% of the viewport-height hero
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.6;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 640;
      setShowStickyCTA(scrolled && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isLoadingAuth || !user) return;
    if (user.persona === 'parent' || user.roles?.includes('parent')) navigate('ParentHome');
    else if (user.persona === 'alumni' || user.roles?.includes('alumni'))
      navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
    else if (user.persona || user.roles?.length > 0) navigate('FreeTierDashboard');
  }, [user, isLoadingAuth]);

  const go = () => {
    if (!isLoadingAuth && user) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) navigate('ParentHome');
      else if (user.persona === 'alumni' || user.roles?.includes('alumni'))
        navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
      else navigate('FreeTierDashboard');
    } else {
      try {
        localStorage.setItem('pending_invite_role', 'student');
        sessionStorage.setItem('cff_onboarding_type', 'student');
      } catch (e) {}
      navigate('GatorAuth');
    }
  };

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  const login = () => {
    navigate('GatorAuth');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SectionLabel = ({ text }) => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{text}</span>
    </div>
  );

  const CTAButton = ({ label = 'Start Free →', onClick = go, fullWidth = false, style: extra = {} }) => (
    <button onClick={onClick} style={{
      fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 700, color: '#fff',
      background: GRAD_INDIGO, border: 'none', borderRadius: 999,
      padding: 'clamp(14px, 4vw, 17px) clamp(28px, 6vw, 40px)',
      cursor: 'pointer', minHeight: 52,
      boxShadow: `0 8px 28px rgba(109,40,217,0.30)`,
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
      ...extra,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.42)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.30)'; }}
    >{label}</button>
  );

  // While auth is resolving, or when a logged-in user is about to be redirected
  // to their dashboard, don't paint the marketing page — otherwise it flashes
  // for a beat before the redirect effect fires.
  const willRedirect = !isLoadingAuth && user && (user.persona || user.roles?.length > 0);
  if (isLoadingAuth || willRedirect) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${INDIGO_BORDER}`, borderTopColor: INDIGO, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: BG, fontFamily: SF, color: TEXT, overflowX: 'hidden' }}>
      {showFunnel && <OnboardingFlow onClose={() => { setShowFunnel(false); setFunnelStartScreen(null); }} resumeAtScreen={funnelStartScreen} />}

      <style>{`
        @keyframes pulseGreen { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hero-animate { animation: fadeUp 0.7s ease both; }
        .hero-animate-2 { animation: fadeUp 0.7s 0.12s ease both; }
        .hero-animate-3 { animation: fadeUp 0.7s 0.24s ease both; }
        .hero-animate-4 { animation: fadeUp 0.7s 0.36s ease both; }
        .hero-animate-5 { animation: fadeUp 0.7s 0.48s ease both; }
        .hero-animate-6 { animation: fadeUp 0.7s 0.60s ease both; }
        /* Nav: tighten secondary links on small screens so they stay visible */
        @media (max-width: 640px) {
          .nav-secondary-link { font-size: 12px !important; padding: 8px 6px !important; }
          .nav-cta-btn { padding: 10px 14px !important; font-size: 13px !important; }
          .nav-jump-link { display: none !important; }
        }
        /* Hero: stack layout on mobile */
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { order: 3; min-height: 280px !important; margin-top: 8px; }
          .hero-text { order: 1; }
        }
        /* Hero: compress height on desktop so the visual doesn't float in empty space */
        @media (min-width: 769px) {
          .hero-section { min-height: auto !important; }
        }
        /* How-it-works steps: stack on mobile */
        @media (max-width: 760px) {
          .hiw-steps { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          /* Full-width primary CTAs for easier thumb reach on phones */
          .hero-cta-btn { width: 100% !important; align-self: stretch !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(248,249,255,0.90)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.10)',
        padding: '0 clamp(16px,5vw,32px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SF, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png" alt="College Fast Forward" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
          <span>College{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Fast Forward
          </span></span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => scrollToSection('how-it-works')} className="nav-secondary-link nav-jump-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>How it Works</button>
          <button onClick={() => scrollToSection('pricing')} className="nav-secondary-link nav-jump-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Pricing</button>
          <button onClick={parent} className="nav-secondary-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Parents &amp; Alumni</button>
          {!(!isLoadingAuth && user) && (
            <button onClick={login} className="nav-secondary-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Log In</button>
          )}
          <button onClick={go} className="nav-cta-btn" style={{
            fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 999,
            padding: '10px 20px', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(109,40,217,0.35)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{!isLoadingAuth && user ? 'Dashboard →' : 'Start CLIFFing →'}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero-section" style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(80px, 12vw, 112px) clamp(20px, 5vw, 40px) clamp(48px, 7vw, 64px)',
        background: GRAD_HERO, position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle radial glow */}
        <div style={{ position: 'absolute', top: '50%', right: '0%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', transform: 'translate(-20%, -50%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 'clamp(40px, 8vw, 80px)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Left Column - Text (60%) */}
          <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

            {/* Eyebrow badge */}
            {mounted && (
              <div className="hero-animate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.18)', borderRadius: 999, padding: 'clamp(8px, 2.5vw, 12px) clamp(14px, 4vw, 28px)', marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                <GraduationCap size={14} color={INDIGO} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: SF, fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', lineHeight: 1.4 }}>YOUR PROACTIVE AI CAREER AGENT FOR INTERNSHIPS &amp; FIRST JOBS</span>
              </div>
            )}

            {/* Main headline — A/B testable variants (default: A) */}
            {mounted && (
              <div className="hero-animate-2">
                <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px, 8vw, 60px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: '#030712', margin: '0 0 16px' }}>
                  <span style={{ display: 'block' }}>{HERO_VARIANTS[heroVariant].line1}</span>
                  <span style={{ display: 'block', background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {HERO_VARIANTS[heroVariant].line2}
                  </span>
                </h1>
              </div>
            )}

            {/* Sub-headline */}
            {mounted && (
              <div className="hero-animate-3">
                <h2 style={{ fontFamily: SF, fontSize: 'clamp(16px, 4.2vw, 21px)', fontWeight: 500, color: '#334155', margin: '0 0 32px', lineHeight: 1.5, letterSpacing: '-0.01em', maxWidth: 560 }}>
                  Tell CLIFF what you want. It finds the opportunities worth your time, prepares stronger applications, and keeps your search moving — without the endless scrolling and guessing.
                </h2>
              </div>
            )}

            {/* CTA */}
            {mounted && (
              <div className="hero-animate-5" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { trackHeroEvent('hero_primary_cta_click', heroVariant); go(); }} className="hero-cta-btn" style={{
                  fontFamily: SF, fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 600, color: '#fff',
                  background: GRAD_INDIGO, border: 'none', borderRadius: 999,
                  padding: 'clamp(16px, 4vw, 20px) clamp(48px, 8vw, 64px)',
                  cursor: 'pointer', minHeight: 56,
                  boxShadow: '0 20px 48px rgba(109,40,217,0.35)',
                  transition: 'all 0.3s ease',
                  touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                  alignSelf: 'flex-start',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)'; e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 24px 56px rgba(109,40,217,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GRAD_INDIGO; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(109,40,217,0.35)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                >
                  Start CLIFFing
                </button>
                <button onClick={() => { trackHeroEvent('hero_secondary_cta_click', heroVariant); scrollToSection('what-is-cliffing'); }} className="hero-cta-btn" style={{
                  fontFamily: SF, fontSize: 'clamp(15px, 3.5vw, 16px)', fontWeight: 700, color: INDIGO,
                  background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999,
                  padding: 'clamp(14px, 3.5vw, 18px) clamp(28px, 6vw, 40px)',
                  cursor: 'pointer', minHeight: 56, transition: 'all 0.2s ease',
                  touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; e.currentTarget.style.borderColor = INDIGO; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = INDIGO_BORDER; }}
                >
                  See What CLIFFing Means
                </button>
                </div>

                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(13px, 3vw, 14px)', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Free to start. Your first CLIFF-powered application is on us.
                </p>

                {/* Above-the-fold social proof */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex' }}>
                    {STORIES.map((st, i) => (
                      <img key={i} src={st.photo} alt={st.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i > 0 ? -10 : 0, boxShadow: SHADOW }} />
                    ))}
                  </div>
                  <div>
                    <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>2,400+ students on CFF</p>
                    <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '1px 0 0', fontWeight: 500 }}>Backed by 4,100+ parents & alumni in the network</p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Right Column - Product Visualization (40%) */}
          {mounted && (
            <div className="hero-animate-6 hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Soft radial glow behind the product card */}
              <div style={{ position: 'absolute', inset: '-10%', background: 'radial-gradient(circle at 50% 50%, rgba(109,40,217,0.10) 0%, transparent 70%)', borderRadius: 24, pointerEvents: 'none' }} />
              <AgentWeekDemo />
            </div>
          )}
        </div>
      </div>

      {/* ── WHAT IS CLIFFING? ── */}
      <WhatIsCliffing go={go} />

      {/* ── WHILE YOU WERE AWAY (marketing illustration) ── */}
      <WhileAwaySection />

      {/* ── PROBLEM CLARIFIER ── */}
      <ProblemClarifier />

      {/* ── SCHOOL MARQUEE ── */}
      <SchoolMarquee />

      {/* ── LIVE JOBS ── */}
      <LiveJobsSection go={go} />

      {/* ── OLD WAY VS SMART WAY ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="Two ways to job hunt" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            Without CLIFF vs.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>With CLIFF</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 28px)' }}>
            {/* Old Way - "Black Hole" box with warning state */}
            <div style={{ background: 'rgba(254,242,242,0.6)', border: `1px solid ${CORAL_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 1px 3px rgba(244,63,94,0.08)' }}>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>Without CLIFF</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: CORAL, margin: '0 0 20px', letterSpacing: '-0.02em' }}>You do everything alone</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { emoji: '🔍', text: 'Browse hundreds of jobs' },
                  { emoji: '📄', text: 'Rewrite your resume for every application' },
                  { emoji: '🏢', text: 'Research every company yourself' },
                  { emoji: '🤔', text: 'Figure out who to contact' },
                  { emoji: '⏰', text: 'Remember to follow up' },
                  { emoji: '🤞', text: 'Hope something works' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <X size={15} color={CORAL} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#9f1239', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: CORAL_LIGHT, borderRadius: 10, padding: '10px 14px', textAlign: 'center', border: `1px solid ${CORAL_BORDER}` }}>
                <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: CORAL }}>Only ~2% of online applications lead to a job (Jobvite Recruiting Benchmark)</span>
              </div>
            </div>

            {/* Smart Way - elevated with soft glow */}
            <div style={{ background: 'rgba(245,243,255,0.8)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: SHADOW_MD }}>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>With CLIFF</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: INDIGO, margin: '0 0 20px', letterSpacing: '-0.02em' }}>CLIFF does the work</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { emoji: '🎯', text: 'Tell CLIFF your goal' },
                  { emoji: '✨', text: "Review today's best moves" },
                  { emoji: '✅', text: 'Approve applications' },
                  { emoji: '🎤', text: 'Practice interviews' },
                  { emoji: '📬', text: 'Follow up at the right time' },
                  { emoji: '🏁', text: 'Stay on track until you get hired' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={15} color={INDIGO} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: INDIGO_DIM, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 10, padding: '10px 14px', textAlign: 'center', border: `1px solid ${INDIGO_BORDER}` }}>
                <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO }}>Referred candidates are far more likely to land interviews (LinkedIn)</span>
              </div>
            </div>
          </div>

          {/* CFF proof list - connected dashboard element */}
          <div style={{ marginTop: 'clamp(32px, 8vw, 48px)', background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, boxShadow: SHADOW, padding: 'clamp(20px, 5vw, 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.25)' }}><Zap size={18} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>CLIFF uses every advantage available</p>
                <p style={{ fontFamily: SF, fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>The network supports the promise — it isn't the promise</p>
              </div>
            </div>
            {PROOF_CALLOUTS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 'clamp(9px, 2.5vw, 12px) 0', borderBottom: i < PROOF_CALLOUTS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</span>
                </div>
                <p style={{ fontFamily: SF, fontSize: 'clamp(12px, 3.5vw, 13px)', color: TEXT2, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </div>

      {/* ── JOURNEY: FROM DOOM-SCROLLING TO DONE-FOR-YOU ── */}
      <JourneySection />

      {/* ── APP SHOWCASE ── */}
      <AppShowcase />

      {/* ── PRODUCT PHILOSOPHY ── */}
      <PhilosophySection />

      {/* ── A DAY WITH CLIFF ── */}
      <DayWithCliff />

      {/* ── WHY STUDENTS TRUST CLIFF ── */}
      <CliffTrustSection />

      {/* ── HOW IT WORKS ── */}
      <div id="how-it-works" style={{ background: BG, borderTop: '1px solid #f1f5f9', padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', scrollMarginTop: 80 }}>
        <Reveal><div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel text="Your agent never clocks out" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 7vw, 48px)', textAlign: 'center' }}>
            What CLIFF does{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>while you're busy.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { emoji: '🔭', title: 'Finds better opportunities', sub: 'Keeps scanning and surfaces only the ones actually worth your time.' },
              { emoji: '🧹', title: 'Removes expired jobs', sub: 'Dead listings disappear before you waste a minute on them.' },
              { emoji: '📄', title: 'Prepares stronger applications', sub: 'Everything you submit goes out sharper than you\u2019d send alone.' },
              { emoji: '🗂️', title: 'Keeps your search organized', sub: 'Every application, follow-up, and interview lives in one plan.' },
              { emoji: '🎯', title: 'Tells you exactly what matters today', sub: 'One next move, every day. You never wonder what to do next.' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', boxShadow: SHADOW, border: '1px solid #f1f5f9', transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = SHADOW_MD; e.currentTarget.style.borderColor = INDIGO_BORDER; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.borderColor = '#f1f5f9'; }}
              >
                <div style={{ fontSize: 26, marginBottom: 12 }}>{s.emoji}</div>
                <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{s.title}</p>
                <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 500, color: TEXT2, margin: 0, lineHeight: 1.55 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Student Stories" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(24px, 6vw, 36px)', textAlign: 'center' }}>
            Real results.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }}>Real students.</span>
          </h2>
          <StoriesCarousel />
          <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textAlign: 'center', margin: 'clamp(16px, 4vw, 24px) 0 0', lineHeight: 1.6 }}>
            Students use CFF to stay organized, reduce stress, and move through the search with more traction.
          </p>
        </div></Reveal>
      </div>

      {/* ── CAMPAIGN: YOUR ROOMMATE IS STILL JOB SEARCHING ── */}
      <RoommateSection go={go} />

      {/* ── YOUR UNFAIR ADVANTAGE: PARENTS & ALUMNI ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px) 0', background: BG, borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel text="Parents & Alumni" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 14px' }}>
            Your unfair{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>advantage.</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: TEXT2, margin: '0 auto', maxWidth: 540, lineHeight: 1.65 }}>
            Unlike LinkedIn or Indeed, CLIFF can uncover trusted parents, alumni and mentors — and brings them in when they genuinely improve your chances.
          </p>
        </div></Reveal>
      </div>
      <MatchTeaser go={go} />

      {/* ── PRICING ── */}
      <div id="pricing" style={{ background: BG, padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', scrollMarginTop: 80 }}>
        <Reveal><div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel text="Simple Pricing" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            Start with direction.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Upgrade when you want CLIFF to do the work.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 4vw, 24px)', alignItems: 'stretch' }}>
            {/* CFF Free — guidance */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 32px)', border: '1px solid #e2e8f0', boxShadow: SHADOW, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: TEXT, margin: '0 0 4px' }}>CFF Free</p>
              <p style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 700, color: TEXT2, margin: '0 0 4px' }}>See what CLIFF recommends.</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: '0 0 18px', fontStyle: 'italic' }}>For students who want a smarter place to start.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {['Personalized job recommendations', "Today's Best Moves", 'Career Momentum', 'Application tracking', 'Basic CLIFF access', 'One CLIFF-powered application preview'].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <Check size={14} color="#64748b" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 500, color: TEXT2, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              <button onClick={go} style={{ marginTop: 'auto', fontFamily: SF, fontSize: 15, fontWeight: 700, color: INDIGO, background: '#fff', border: `1.5px solid ${INDIGO}`, borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 52, width: '100%' }}>
                Start Free
              </button>
            </div>

            {/* CLIFF Pro — execution */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 32px)', border: `2px solid ${INDIGO}`, boxShadow: SHADOW_MD, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontSize: 11, fontWeight: 800, borderRadius: 100, padding: '4px 14px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>LET CLIFF DO THE WORK</span>
              <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: INDIGO, margin: '0 0 4px' }}>CLIFF Pro</p>
              <p style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 700, color: TEXT2, margin: '0 0 4px' }}>Let CLIFF do the work.</p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: '0 0 12px', fontStyle: 'italic' }}>For students actively trying to get hired.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                <span style={{ fontFamily: SF, fontSize: 34, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em' }}>$4.99</span>
                <span style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, color: TEXT3 }}>/week · cancel anytime</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {['Unlimited tailored applications', 'Full Job Workspaces', 'Connection discovery', 'Outreach and follow-ups', 'Unlimited interview practice', 'Proactive discoveries', 'Unlimited CLIFF support', 'Weekly Career Brief'].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <Check size={14} color={INDIGO} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              <CTAButton label="Start CLIFF Pro" fullWidth style={{ marginTop: 'auto' }} />
            </div>
          </div>

          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: TEXT, textAlign: 'center', margin: 'clamp(24px, 6vw, 32px) 0 0' }}>
            Free tells you what to do.{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro helps you get it done.</span>
          </p>
        </div></Reveal>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <Reveal><div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>Let CLIFF become your career agent</p>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Stop searching.<br />Start making progress.
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.75)', margin: '0 0 clamp(28px, 6vw, 36px)', lineHeight: 1.65 }}>
            Join 2,400+ students who handed the hard part to CLIFF.
          </p>
          <button onClick={go} style={{
            fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: '#fff',
            background: '#0f172a', border: 'none', borderRadius: 999,
            padding: 'clamp(16px, 4vw, 20px) clamp(40px, 8vw, 56px)',
            cursor: 'pointer', minHeight: 56,
            boxShadow: '0 14px 44px rgba(15,23,42,0.45), 0 0 0 4px rgba(255,255,255,0.20)',
            transition: 'all 0.2s ease', touchAction: 'manipulation',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.boxShadow = '0 20px 56px rgba(15,23,42,0.55), 0 0 0 4px rgba(255,255,255,0.30)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(15,23,42,0.45), 0 0 0 4px rgba(255,255,255,0.20)'; }}
          >
            Start CLIFFing →
          </button>
          <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'rgba(255,255,255,0.85)', margin: 'clamp(20px, 5vw, 28px) 0 0', lineHeight: 1.6 }}>
            Got a parent or alum who can help students land?{' '}
            <button onClick={parent} style={{ fontFamily: SF, fontSize: 'inherit', fontWeight: 800, color: '#fff', background: 'none', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.5)', padding: 0, cursor: 'pointer', minHeight: 'auto', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            >Join as a Parent or Alum →</button>
          </p>
        </div></Reveal>
      </div>

      {/* ── STICKY CTA BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(109,40,217,0.12)',
        boxShadow: '0 -4px 24px rgba(15,23,42,0.08)',
        padding: 'clamp(10px, 3vw, 14px) clamp(16px, 5vw, 32px)',
        paddingBottom: 'calc(clamp(10px, 3vw, 14px) + env(safe-area-inset-bottom, 0px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        transform: showStickyCTA ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <span style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          CLIFF is ready to start working for you
        </span>
        <button onClick={go} style={{
          fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#fff',
          background: GRAD_INDIGO, border: 'none', borderRadius: 999,
          padding: '12px clamp(20px, 5vw, 32px)', cursor: 'pointer', minHeight: 48, flexShrink: 0,
          boxShadow: '0 6px 20px rgba(109,40,217,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >{!isLoadingAuth && user ? 'Dashboard →' : 'Start CLIFFing →'}</button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: 'clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)', paddingBottom: 'calc(clamp(20px, 5vw, 28px) + 76px + env(safe-area-inset-bottom, 0px))', textAlign: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Log In', null, login], ['Parents & Alumni', null, parent], ['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com?subject=College%20Fast%20Forward%20Support']].map(([label, href, handler]) => (
            <a key={label} href={href || undefined} onClick={!href ? (e) => { e.preventDefault(); handler && handler(); } : undefined} style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} College Fast Forward · Helping students land faster with less stress.
        </p>
      </div>
    </div>
  );
}