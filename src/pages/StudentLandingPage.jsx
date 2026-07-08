import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { GraduationCap, Users, Target, FileText, Rocket, Check, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import PricingComparison from '@/components/landing/PricingComparison';
import AppShowcase from '@/components/landing/AppShowcase';
import LiveJobsSection from '@/components/landing/LiveJobsSection';
import WarmApplyHeroDemo from '@/components/landing/WarmApplyHeroDemo';
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
  { text: 'Upload once — get perfectly tailored resume versions for every job you target' },
  { text: 'Surfaces curated roles matched to your goals and school' },
  { text: 'Surfaces warm alumni & parent connections far more likely to actually respond' },
  { text: 'Tracks every application automatically — smart reminders so nothing falls through' },
  { text: 'Crafts personalized outreach messages that get real replies instead of silence' },
];

const STORIES = [
  { quote: "I was overwhelmed applying everywhere and getting ghosted. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/c2df92fac_IMG_8456.png", tag: "Landed an internship", color: INDIGO },
  { quote: "I finally felt like I had a system instead of a mess. Before this I had 40 tabs open and no idea where anything stood.", name: "Maya R.", school: "UF '26, Business", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/980f1d142_IMG_8190.png", tag: "Less stress", color: VIOLET },
  { quote: "The warm intro feature made networking feel less random. I actually got a response from an alumna within 48 hours.", name: "Nerissa R.", school: "USC '25, Marketing", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/574cf5430_IMG_8455.png", tag: "Better outreach", color: PINK },
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
  const { user, isLoadingAuth } = useAuth();

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
          >{!isLoadingAuth && user ? 'Dashboard →' : 'Start Free →'}</button>
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
                <span style={{ fontFamily: SF, fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', lineHeight: 1.4 }}>INTERNSHIPS &amp; ENTRY-LEVEL JOBS FOR COLLEGE STUDENTS</span>
              </div>
            )}

            {/* Main headline */}
            {mounted && (
              <div className="hero-animate-2">
                <h1 style={{ fontFamily: SF, fontSize: 'clamp(30px, 8vw, 60px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#030712', margin: '0 0 8px' }}>
                  Mass applying doesn’t work.
                </h1>
              </div>
            )}

            {/* Sub-headline */}
            {mounted && (
              <div className="hero-animate-3">
                <h2 style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 26px)', fontWeight: 600, color: '#334155', margin: '0 0 16px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                  Warm intros do. Your AI agent finds them — you just show up to interviews.
                </h2>
              </div>
            )}

            {/* Body */}
            {mounted && (
              <div className="hero-animate-4">
                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(16px, 3.5vw, 18px)', color: '#4b5563', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 540 }}>
                  Paste any job link and CFF finds alumni &amp; parents who can get you in the door at that company — with a ready-to-send message and a tailored resume.
                </p>
              </div>
            )}

            {/* CTA */}
            {mounted && (
              <div className="hero-animate-5" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <button onClick={go} className="hero-cta-btn" style={{
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
                  See My Matches →
                </button>

                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(13px, 3vw, 14px)', color: '#64748b', margin: '8px 0 0', lineHeight: 1.5 }}>
                  Free to start · See your first matches in 2 minutes
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
              <WarmApplyHeroDemo />
            </div>
          )}
        </div>
      </div>

      {/* ── INTERACTIVE MATCH TEASER ── */}
      <MatchTeaser go={go} />

      {/* ── SCHOOL MARQUEE ── */}
      <SchoolMarquee />

      {/* ── LIVE JOBS ── */}
      <LiveJobsSection go={go} />

      {/* ── OLD WAY VS SMART WAY ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="Stop playing a losing game" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            The Old Way vs.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>The Smart Way</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 28px)' }}>
            {/* Old Way - "Black Hole" box with warning state */}
            <div style={{ background: 'rgba(254,242,242,0.6)', border: `1px solid ${CORAL_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 1px 3px rgba(244,63,94,0.08)' }}>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>The Old Way</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: CORAL, margin: '0 0 20px', letterSpacing: '-0.02em' }}>The Brutal Cycle</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { emoji: '😃', text: 'Start full of hope and optimism' },
                  { emoji: '⏰', text: 'Spend dozens of hours mass-applying to 200+ jobs' },
                  { emoji: '😶', text: 'Get automated rejections or total silence' },
                  { emoji: '😟', text: 'Slowly lose confidence and question your worth' },
                  { emoji: '💔', text: 'Feel discouraged, anxious, stuck in the void' },
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
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>The CFF Way</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: INDIGO, margin: '0 0 20px', letterSpacing: '-0.02em' }}>The Smart Path</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { emoji: '🔥', text: 'Start strategic and confident with CFF' },
                  { emoji: '🔍', text: 'Get matched to roles tailored to your profile' },
                  { emoji: '🤝', text: 'Warm intros from alumni & parents who actually want to help' },
                  { emoji: '🚀', text: 'Move quickly from application to real interviews' },
                  { emoji: '🎉', text: 'Get hired through human connections, not algorithms' },
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
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>Here's what CFF does for you</p>
                <p style={{ fontFamily: SF, fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>From your first scan onward</p>
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

      {/* ── HOW IT WORKS ── */}
      <div id="how-it-works" style={{ background: BG, borderTop: '1px solid #f1f5f9', padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', scrollMarginTop: 80 }}>
        <Reveal><div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel text="How it works" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 7vw, 48px)', textAlign: 'center' }}>
            Three steps to your{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>warm intro.</span>
          </h2>
          <div className="hiw-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { n: '1', icon: Target, title: 'Paste a job link', sub: 'Drop in any posting — CFF reads the role, the company, and what they\u2019re looking for.' },
              { n: '2', icon: Users, title: 'We find your warm intro', sub: 'Alumni & parents at that company surface instantly, with a ready-to-send message.' },
              { n: '3', icon: Rocket, title: 'You send & track', sub: 'A tailored resume, personalized outreach, and automatic pipeline tracking.' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', boxShadow: SHADOW, border: '1px solid #f1f5f9', transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = SHADOW_MD; e.currentTarget.style.borderColor = INDIGO_BORDER; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.borderColor = '#f1f5f9'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 15, fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.25)' }}>{s.n}</div>
                  <s.icon size={20} color={INDIGO} />
                </div>
                <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{s.title}</p>
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

      {/* ── PRICING ── */}
      <div id="pricing" style={{ background: BG, padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', scrollMarginTop: 80 }}>
        <Reveal><div style={{ maxWidth: 560, margin: '0 auto' }}>
          <SectionLabel text="Simple Pricing" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            One focused sprint.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }}>Real results.</span>
          </h2>

          <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(28px, 6vw, 40px)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 'clamp(20px, 5vw, 28px)', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 100, padding: '6px 14px' }}>
                <GraduationCap size={13} color={INDIGO} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Graduation Sprint Plan</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 100, padding: '6px 14px' }}>
                <Zap size={13} color="#854d0e" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: '#854d0e' }}>Less than a latte a week</span>
              </div>
            </div>

            <div style={{ background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '14px 16px', marginBottom: 'clamp(20px, 4vw, 24px)' }}>
              <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: INDIGO_DIM, margin: '0 0 2px', lineHeight: 1.4 }}>
                Start completely free — no card required.
              </p>
              <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
                Upgrade to Premium only when you're ready to accelerate.
              </p>
            </div>

            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>When you upgrade</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SF, fontSize: 'clamp(56px, 14vw, 80px)', fontWeight: 900, color: INDIGO, letterSpacing: '-0.05em', lineHeight: 0.9 }}>$4.99</span>
              <span style={{ fontFamily: SF, fontSize: 'clamp(18px, 5vw, 22px)', color: TEXT, fontWeight: 700 }}>/week</span>
            </div>
            <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: TEXT2, fontWeight: 600, margin: '0 0 clamp(24px, 5vw, 32px)', lineHeight: 1.5 }}>
              That's just <span style={{ color: TEXT, fontWeight: 800 }}>$19.96/month</span> — billed monthly, cancel in 1 tap anytime.
            </p>

            <PricingComparison />

            <CTAButton label="Find My Warm Intros →" fullWidth style={{ marginTop: 'clamp(24px, 5vw, 32px)' }} />
          </div>
        </div></Reveal>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <Reveal><div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>Ready to escape the black hole?</p>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Search Smarter,<br />Not Harder.
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.75)', margin: '0 0 clamp(28px, 6vw, 36px)', lineHeight: 1.65 }}>
            Join 2,400+ students who stopped applying blindly and started getting results.
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
            Start Free →
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
          Your first application package is waiting
        </span>
        <button onClick={go} style={{
          fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#fff',
          background: GRAD_INDIGO, border: 'none', borderRadius: 999,
          padding: '12px clamp(20px, 5vw, 32px)', cursor: 'pointer', minHeight: 48, flexShrink: 0,
          boxShadow: '0 6px 20px rgba(109,40,217,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >{!isLoadingAuth && user ? 'Dashboard →' : 'Claim It Free →'}</button>
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