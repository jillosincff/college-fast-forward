import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import Reveal from '@/components/landing/Reveal';
import CliffPlanDemo from '@/components/landing/CliffPlanDemo';
import CareerIntelligenceSection from '@/components/landing/CareerIntelligenceSection';
import TrajectorySection from '@/components/landing/TrajectorySection';
import IntelligenceStackSection from '@/components/landing/IntelligenceStackSection';
import RoommateSection from '@/components/landing/RoommateSection';
import SchoolMarquee from '@/components/landing/SchoolMarquee';
import CareerMiniPlanDemo from '@/components/landing/CareerMiniPlanDemo';
import MorningBriefSection from '@/components/landing/MorningBriefSection';

// ── Design Tokens — Light Mode / Gen Z ─────────────────────────
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

const BG   = '#f8f9ff';
const CARD  = '#ffffff';
const CARD2 = '#f1f5ff';
const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

const INDIGO       = '#6d28d9';
const INDIGO_DIM   = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER= 'rgba(109,40,217,0.20)';

const CORAL       = '#f43f5e';
const CORAL_BORDER= 'rgba(244,63,94,0.22)';

const GRAD_HERO   = 'linear-gradient(145deg, #f0f4ff 0%, #fdf2ff 50%, #f0fbff 100%)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const SHADOW    = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

const STORIES = [
  { quote: "I stopped wondering what I should do every day. CLIFF always had the next move ready — and I landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/c2df92fac_IMG_8456.png", tag: "Landed an internship", color: '#6d28d9' },
  { quote: "CLIFF kept me on track without me constantly checking everything. I finally felt like someone was actually helping me.", name: "Maya R.", school: "UF '26, Business", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/980f1d142_IMG_8190.png", tag: "Off my mind", color: '#7c3aed' },
  { quote: "I spent less time searching and more time getting interviews. I heard back from an alumna within 48 hours.", name: "Nerissa R.", school: "USC '25, Marketing", photo: "https://media.base44.com/images/public/684474c5723dc90efce23588/574cf5430_IMG_8455.png", tag: "More interviews, less searching", color: '#ec4899' },
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

  // Lock background scrolling while the onboarding overlay is open — otherwise
  // the landing page scrolls behind the flow on mobile.
  useEffect(() => {
    if (!showFunnel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showFunnel]);

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

  // Allow viewing the marketing page while logged in via ?preview=1 (search or hash params)
  const isPreview = (() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      return searchParams.get('preview') === '1' || hashParams.get('preview') === '1';
    } catch { return false; }
  })();

  useEffect(() => {
    if (isLoadingAuth || !user || isPreview) return;
    if (user.persona === 'parent' || user.roles?.includes('parent')) navigate('ParentAllSet');
    else if (user.persona === 'alumni' || user.roles?.includes('alumni'))
      navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
    else if (user.persona || user.roles?.length > 0) navigate('FreeTierDashboard');
  }, [user, isLoadingAuth]);

  // Test/preview harness: ?preview=1&funnel=1 opens the onboarding flow overlay
  // even for already-onboarded users, so the flow can be QA'd end-to-end.
  useEffect(() => {
    if (!isPreview) return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const hp = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      if (sp.get('funnel') === '1' || hp.get('funnel') === '1') setShowFunnel(true);
    } catch {}
  }, [isPreview]);

  const go = () => {
    if (!isLoadingAuth && user) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) navigate('ParentAllSet');
      else if (user.persona === 'alumni' || user.roles?.includes('alumni'))
        navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
      else navigate('FreeTierDashboard');
    } else {
      try {
        localStorage.setItem('pending_invite_role', 'student');
        sessionStorage.setItem('cff_onboarding_type', 'student');
      } catch (e) {}
      // Value first: run the onboarding flow (resume read + plan) before asking
      // for an account. The flow handles auth itself at the end.
      // Resume where they left off — otherwise a returning student who dropped
      // off mid-flow has to answer every question again.
      let savedScreen = null;
      try { savedScreen = parseInt(localStorage.getItem('cff_onboarding_screen') || '', 10) || null; } catch {}
      setFunnelStartScreen(savedScreen);
      setShowFunnel(true);
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

  const CTAButton = ({ label, onClick = go, fullWidth = false, style: extra = {} }) => (
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
  const willRedirect = !isPreview && !isLoadingAuth && user && (user.persona || user.roles?.length > 0);
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hero-animate { animation: fadeUp 0.7s ease both; }
        .hero-animate-2 { animation: fadeUp 0.7s 0.12s ease both; }
        .hero-animate-3 { animation: fadeUp 0.7s 0.24s ease both; }
        .hero-animate-5 { animation: fadeUp 0.7s 0.48s ease both; }
        .hero-animate-6 { animation: fadeUp 0.7s 0.60s ease both; }
        @media (max-width: 640px) {
          .nav-secondary-link { font-size: 12px !important; padding: 8px 6px !important; }
          .nav-cta-btn { padding: 10px 14px !important; font-size: 13px !important; }
          .nav-jump-link { display: none !important; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { order: 3; min-height: 280px !important; margin-top: 8px; }
          .hero-text { order: 1; }
        }
        @media (min-width: 769px) {
          .hero-section { min-height: auto !important; }
        }
        @media (max-width: 640px) {
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
          <button onClick={() => scrollToSection('how-cliff-works')} className="nav-secondary-link nav-jump-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>How it Works</button>
          <button onClick={() => scrollToSection('pricing')} className="nav-secondary-link nav-jump-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Pricing</button>
          {!(!isLoadingAuth && user) && (
            <button onClick={login} className="nav-secondary-link" style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Log In</button>
          )}
          <button onClick={go} className="nav-cta-btn" style={{
            fontFamily: SF, fontSize: 14, fontWeight: 700, color: INDIGO,
            background: 'transparent', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999,
            padding: '10px 20px', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; e.currentTarget.style.borderColor = INDIGO; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = INDIGO_BORDER; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{!isLoadingAuth && user ? 'Dashboard →' : 'Build My Career Plan →'}</button>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <div className="hero-section" style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(80px, 12vw, 112px) clamp(20px, 5vw, 40px) clamp(48px, 7vw, 64px)',
        background: GRAD_HERO, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', right: '0%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', transform: 'translate(-20%, -50%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 'clamp(40px, 8vw, 80px)', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left Column - Text */}
          <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

            {/* Headline */}
            {mounted && (
              <div className="hero-animate-2">
                <h1 style={{ fontFamily: SF, fontSize: 'clamp(32px, 8.5vw, 62px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: '#030712', margin: '0 0 clamp(20px, 5vw, 28px)' }}>
                  Getting your first job is brutal.
                </h1>
                <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 10px', background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Meet CLIFF.
                </h2>
                <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 500, color: '#334155', lineHeight: 1.4, letterSpacing: '-0.01em', margin: '0 0 clamp(24px, 6vw, 36px)' }}>
                  He does the work while you sleep.
                </p>
              </div>
            )}

            {/* Checklist */}
            {mounted && (
              <div className="hero-animate-3" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 3.5vw, 18px)', margin: '0 0 clamp(36px, 8vw, 48px)' }}>
                {[
                  'Finds the job worth applying to.',
                  'Tailors your resume to it overnight.',
                  'Finds the insider who can refer you.',
                  'Writes the intro before you wake up.',
                  'You hit send.',
                ].map((item, i) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14, animation: `fadeUp 0.5s ${0.35 + i * 0.15}s ease both` }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={16} color={INDIGO} strokeWidth={3} />
                    </span>
                    <span style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 20px)', fontWeight: 600, color: '#334155', lineHeight: 1.4, letterSpacing: '-0.01em' }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {mounted && (
              <div className="hero-animate-5" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={go} className="hero-cta-btn" style={{
                  fontFamily: SF, fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 600, color: '#fff',
                  background: GRAD_INDIGO, border: 'none', borderRadius: 999,
                  padding: 'clamp(18px, 4.5vw, 22px) clamp(48px, 8vw, 64px)',
                  cursor: 'pointer', minHeight: 62,
                  boxShadow: '0 20px 48px rgba(109,40,217,0.35)',
                  transition: 'all 0.3s ease',
                  touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                  alignSelf: 'flex-start',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)'; e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 24px 56px rgba(109,40,217,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GRAD_INDIGO; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(109,40,217,0.35)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                >
                  Build My Career Plan →
                </button>
                <button onClick={() => scrollToSection('how-cliff-works')} className="hero-cta-btn" style={{
                  fontFamily: SF, fontSize: 'clamp(15px, 3.5vw, 16px)', fontWeight: 700, color: INDIGO,
                  background: 'transparent', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999,
                  padding: 'clamp(14px, 3.5vw, 18px) clamp(28px, 6vw, 40px)',
                  cursor: 'pointer', minHeight: 56, transition: 'all 0.2s ease',
                  touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                  marginBottom: 8,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; e.currentTarget.style.borderColor = INDIGO; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = INDIGO_BORDER; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  See How CLIFF Works
                </button>
                </div>

                {/* Social proof / trust anchor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                  <div style={{ display: 'flex', flexShrink: 0 }}>
                    {STORIES.map((st, i) => (
                      <img key={i} src={st.photo} alt={st.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0, boxShadow: SHADOW }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: SF, fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                    Join 5,000+ students building their future with CLIFF
                  </p>
                </div>

                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(12px, 3vw, 13px)', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  No credit card required.
                </p>

              </div>
            )}
          </div>

          {/* Right Column - 2. HERO PRODUCT DEMO */}
          {mounted && (
            <div className="hero-animate-6 hero-visual" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: '-10%', background: 'radial-gradient(circle at 50% 50%, rgba(109,40,217,0.10) 0%, transparent 70%)', borderRadius: 24, pointerEvents: 'none' }} />
              <CliffPlanDemo onContinue={go} />
            </div>
          )}
        </div>
      </div>

      {/* ── INTERACTIVE PROOF: Career Intelligence mini-plan ── */}
      <CareerMiniPlanDemo go={go} />

      {/* ── THE WOW MOMENT: the 7am overnight brief ── */}
      <MorningBriefSection go={go} />

      {/* ── SCHOOL MARQUEE ── */}
      <SchoolMarquee />

      {/* ── 3. PROBLEM VS SOLUTION ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="Signal, not noise" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            The internet gives you thousands of jobs.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF tells you which ones actually matter.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 28px)' }}>
            {/* Traditional Job Search */}
            <div style={{ background: 'rgba(254,242,242,0.6)', border: `1px solid ${CORAL_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 1px 3px rgba(244,63,94,0.08)' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: CORAL, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Traditional Job Search</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Endless scrolling', 'Same resume everywhere', 'Guessing', 'Miss deadlines', 'No plan'].map((text) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <X size={15} color={CORAL} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#9f1239', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CLIFF */}
            <div style={{ background: 'rgba(245,243,255,0.8)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: SHADOW_MD }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: INDIGO, margin: '0 0 20px', letterSpacing: '-0.02em' }}>CLIFF</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Personalized career plan', 'Best opportunities only', 'Tailored applications', 'Right timing', 'One clear next move'].map((text) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={15} color={INDIGO} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: INDIGO_DIM, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 900, color: TEXT, textAlign: 'center', margin: 'clamp(28px, 7vw, 40px) 0 0', letterSpacing: '-0.02em' }}>
            Less searching.{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>More progress.</span>
          </p>
        </div></Reveal>
      </div>

      {/* ── 4. CAREER INTELLIGENCE ── */}
      <CareerIntelligenceSection />

      {/* ── 5. CAREER TRAJECTORY ── */}
      <TrajectorySection />

      {/* ── 6. INTELLIGENCE STACK ── */}
      <IntelligenceStackSection />

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Student Stories" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(24px, 6vw, 36px)', textAlign: 'center' }}>
            Real results.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }}>Real students.</span>
          </h2>
          <StoriesCarousel />
        </div></Reveal>
      </div>

      {/* ── 7. NETWORKING (one capability, not the product) ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: BG, borderTop: '1px solid #f1f5f9' }}>
        <Reveal><div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel text="Networking Intelligence" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 14px' }}>
            When networking helps,{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF knows.</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', color: TEXT2, margin: '0 auto', maxWidth: 540, lineHeight: 1.65 }}>
            Sometimes networking gives you a real advantage. Sometimes it doesn't. CLIFF tells you the difference — and taps trusted parents and alumni only when they genuinely improve your chances.
          </p>
        </div></Reveal>
      </div>

      {/* ── 8. CLIFFING CAMPAIGN ── */}
      <RoommateSection go={go} />

      {/* ── 9. PRICING ── */}
      <div id="pricing" style={{ background: BG, padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', scrollMarginTop: 80 }}>
        <Reveal><div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel text="Simple Pricing" />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            Two ways to work<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>with CLIFF.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 4vw, 24px)', alignItems: 'stretch' }}>
            {/* Free — you drive */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 32px)', border: '1px solid #e2e8f0', boxShadow: SHADOW, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: TEXT, margin: '0 0 4px' }}>Free</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: TEXT, margin: '0 0 14px', letterSpacing: '-0.01em' }}>You drive. CLIFF helps.</p>
              <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: '0 0 12px', lineHeight: 1.65 }}>
                You decide what to work on. CLIFF builds your plan, ranks your opportunities, and preps your next move whenever you show up.
              </p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: '0 0 24px', lineHeight: 1.6, fontStyle: 'italic' }}>
                Includes your daily job matches and one complete CLIFF-powered application — on us.
              </p>
              <button onClick={go} style={{ marginTop: 'auto', fontFamily: SF, fontSize: 15, fontWeight: 700, color: INDIGO, background: '#fff', border: `1.5px solid ${INDIGO}`, borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 52, width: '100%', transition: 'all 0.15s ease', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Start Free
              </button>
            </div>

            {/* Pro — CLIFF keeps working */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 32px)', border: `2px solid ${INDIGO}`, boxShadow: SHADOW_MD, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: GRAD_INDIGO, color: '#fff', fontFamily: SF, fontSize: 11, fontWeight: 800, borderRadius: 100, padding: '4px 14px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>MOST STUDENTS CHOOSE PRO</span>
              <p style={{ fontFamily: SF, fontSize: 20, fontWeight: 900, color: INDIGO, margin: '0 0 4px' }}>Pro</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: TEXT, margin: '0 0 14px', letterSpacing: '-0.01em' }}>CLIFF keeps working.</p>
              <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: '0 0 12px', lineHeight: 1.65 }}>
                CLIFF works in the background — watching deadlines, finding better opportunities, preparing everything ahead of time, and bringing you back only when something matters.
              </p>
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: '0 0 14px', lineHeight: 1.6, fontStyle: 'italic' }}>
                The value isn't more tools. It's less thinking.
              </p>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: SF, fontSize: 34, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em' }}>$4.99</span>
                  <span style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, color: TEXT3 }}>/week</span>
                </div>
                <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: TEXT3, margin: '4px 0 0' }}>Billed $19.96/month · cancel anytime</p>
              </div>
              <CTAButton label="Keep CLIFF Working" fullWidth style={{ marginTop: 'auto' }} />
            </div>
          </div>

          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 800, color: TEXT, textAlign: 'center', margin: 'clamp(24px, 6vw, 32px) 0 0' }}>
            Free helps you make progress.{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro makes sure you never lose momentum.</span>
          </p>
        </div></Reveal>
      </div>

      {/* ── 10. FINAL CTA ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <Reveal><div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>Let CLIFF become your career agent</p>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Stop job searching.<br />Start CLIFFing.
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.75)', margin: '0 0 clamp(28px, 6vw, 36px)', lineHeight: 1.65 }}>
            The future belongs to students who spend less time wondering what to do — and more time making meaningful progress.
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
            Build My Career Plan →
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
          CLIFF preps your next application tonight
        </span>
        <button onClick={go} style={{
          fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#fff',
          background: GRAD_INDIGO, border: 'none', borderRadius: 999,
          padding: '12px clamp(20px, 5vw, 32px)', cursor: 'pointer', minHeight: 48, flexShrink: 0,
          boxShadow: '0 6px 20px rgba(109,40,217,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >{!isLoadingAuth && user ? 'Dashboard →' : 'Build My Career Plan →'}</button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: 'clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)', paddingBottom: 'calc(clamp(20px, 5vw, 28px) + 76px + env(safe-area-inset-bottom, 0px))', textAlign: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Pricing', '#/pricing'], ['About', '#/about'], ['Customer Stories', '#/customers'], ['Log In', null, login], ['Parents & Alumni', null, parent], ['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com?subject=College%20Fast%20Forward%20Support']].map(([label, href, handler]) => (
            <a key={label} href={href || undefined} onClick={!href ? (e) => { e.preventDefault(); handler && handler(); } : undefined} style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} College Fast Forward · Your AI Career Agent for internships and first jobs.
        </p>
      </div>
    </div>
  );
}