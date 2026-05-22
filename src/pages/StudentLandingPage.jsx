import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import CampusVaultWidget from '@/components/landing/CampusVaultWidget';
import AppShowcase from '@/components/landing/AppShowcase';

// ── Design Tokens — Light Mode / Gen Z ─────────────────────────
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const FONT = SF;

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

// Indigo — primary accent
const INDIGO       = '#4f46e5';
const INDIGO_DIM   = '#4338ca';
const INDIGO_LIGHT = 'rgba(79,70,229,0.08)';
const INDIGO_BORDER= 'rgba(79,70,229,0.20)';

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
const GRAD_INDIGO = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
const GRAD_WARM   = 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)';

// Shadows
const SHADOW    = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.06)';
const SHADOW_LG = '0 20px 40px rgba(79,70,229,0.14), 0 4px 12px rgba(0,0,0,0.08)';

// Aliases for backward compat (CampusVaultWidget passes these as props)
const MINT        = INDIGO;
const MINT_DIM    = INDIGO_DIM;
const MINT_DARK   = INDIGO_DIM;
const MINT_LIGHT  = INDIGO_LIGHT;
const MINT_BORDER = INDIGO_BORDER;
const GREEN       = TEAL;
const GREEN_LIGHT = TEAL_LIGHT;
const GREEN_BORDER= TEAL_BORDER;
const BLUE        = INDIGO;
const BLUE_LIGHT  = INDIGO_LIGHT;
const BLUE_BORDER = INDIGO_BORDER;
const R = 16;

const PRO_FEATURES = ['Unlimited AI Agent', 'Advanced tailoring + modern templates', 'Smart reminders + interview prep', 'Most students upgrade once they see results'];
const PROOF_CALLOUTS = [
  { text: 'Upload once — get perfectly tailored resume versions for every job you target' },
  { text: 'Discovers hidden jobs most students never see, including unlisted internal roles' },
  { text: 'Surfaces warm alumni & parent connections far more likely to actually respond' },
  { text: 'Tracks every application automatically — smart reminders so nothing falls through' },
  { text: 'Crafts personalized outreach messages that get real replies instead of silence' },
];

const STORIES = [
  { quote: "I was overwhelmed applying everywhere and getting ghosted. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=96&h=96&fit=crop&crop=face", tag: "🎉 Landed an internship", color: INDIGO },
  { quote: "I finally felt like I had a system instead of a mess. Before this I had 40 tabs open and no idea where anything stood.", name: "Maya R.", school: "UF '26, Business", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face", tag: "😮‍💨 Less stress", color: VIOLET },
  { quote: "The warm intro feature made networking feel less random. I actually got a response from an alumna within 48 hours.", name: "Alex P.", school: "USC '25, Marketing", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", tag: "🤝 Better outreach", color: PINK },
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
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? st.color : '#e2e8f0', border: 'none', cursor: 'pointer', padding: 0, minHeight: 44, transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: CARD2, border: '1px solid #e2e8f0', fontSize: 14, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 44, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = INDIGO_LIGHT; e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.color = INDIGO; }}
              onMouseLeave={e => { e.currentTarget.style.background = CARD2; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = TEXT2; }}
            >{arrow}</button>
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
  const { user, isLoadingAuth } = useAuth();

  const launchWithSchool = (schoolName) => {
    if (!user) {
      try {
        if (schoolName) localStorage.setItem('cff_college', schoolName);
        localStorage.removeItem('cff_onboarding_screen');
        localStorage.removeItem('cff_seeking');
        localStorage.removeItem('cff_blockers');
      } catch {}
      setFunnelStartScreen(null);
      setShowFunnel(true);
    }
  };

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
      base44.auth.loginWithProvider('google', window.location.origin + '/#GatorAuth');
    }
  };

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  const SectionLabel = ({ text, color = INDIGO }) => (
    <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>{text}</p>
  );

  const CTAButton = ({ label = 'Get Hired →', onClick = go, fullWidth = false, style: extra = {} }) => (
    <button onClick={onClick} style={{
      fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 700, color: '#fff',
      background: GRAD_INDIGO, border: 'none', borderRadius: 14,
      padding: 'clamp(14px, 4vw, 17px) clamp(28px, 6vw, 40px)',
      cursor: 'pointer', minHeight: 52,
      boxShadow: `0 8px 28px rgba(79,70,229,0.28)`,
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
      ...extra,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(79,70,229,0.40)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.28)'; }}
    >{label}</button>
  );

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
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(248,249,255,0.90)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.10)',
        padding: '0 clamp(16px,5vw,32px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: SF, fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>
          College{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Fast Forward
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={parent} style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 12px' }}>For Parents</button>
          <button onClick={go} style={{
            fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 10,
            padding: '10px 20px', cursor: 'pointer', minHeight: 44,
            boxShadow: '0 4px 14px rgba(79,70,229,0.30)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{!isLoadingAuth && user ? 'Dashboard →' : 'Get Started →'}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(100px, 15vw, 130px) clamp(20px, 5vw, 40px) clamp(60px, 10vw, 80px)',
        background: GRAD_HERO, position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating blobs */}
        <div style={{ position: 'absolute', top: '8%', left: '-8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-6%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(79,70,229,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', opacity: 0.6 }} />

        <div style={{ maxWidth: 780, position: 'relative', zIndex: 1, textAlign: 'center' }}>

          {/* Eyebrow badge */}
          {mounted && (
            <div className="hero-animate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e0e7ff', borderRadius: 999, padding: '8px 20px', marginBottom: 32, boxShadow: '0 2px 16px rgba(79,70,229,0.10)' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: PINK, animation: 'pulseGreen 1.8s ease-in-out infinite' }} />
              <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: INDIGO, letterSpacing: '0.04em' }}>2,400+ students already getting hired faster</span>
            </div>
          )}

          {/* Main headline */}
          {mounted && (
            <div className="hero-animate-2">
              <h1 style={{ fontFamily: SF, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95, margin: '0 0 20px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: 'clamp(42px, 10vw, 84px)', color: TEXT }}>
                  Tired of the
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(42px, 10vw, 84px)', background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 40%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  black hole?
                </span>
              </h1>
            </div>
          )}

          {/* Sub-headline */}
          {mounted && (
            <div className="hero-animate-3">
              <h2 style={{ fontFamily: SF, fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, color: TEXT, lineHeight: 1.25, margin: '0 auto 16px', maxWidth: 620, letterSpacing: '-0.02em' }}>
                CFF finds the path around it.
              </h2>
              <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 400, color: TEXT2, lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 620 }}>
                We help you bypass the void: hidden opportunities, warm connections from alumni &amp; parents, and real human introductions — because once a person sees your resume, the algorithm stops mattering.
              </p>
            </div>
          )}

          {/* CTA row */}
          {mounted && (
            <div className="hero-animate-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={go} style={{
                  fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: '#fff',
                  background: GRAD_INDIGO, border: 'none', borderRadius: 14,
                  padding: 'clamp(16px, 4vw, 18px) clamp(36px, 7vw, 52px)',
                  cursor: 'pointer', minHeight: 56,
                  boxShadow: '0 10px 36px rgba(79,70,229,0.32)',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 18px 48px rgba(79,70,229,0.42)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(79,70,229,0.32)'; }}
                >
                  Start for Free →
                </button>

              </div>

              {/* Social proof avatars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex' }}>
                  {STORIES.map((s, i) => (
                    <img key={i} src={s.photo} alt={s.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i > 0 ? -10 : 0 }} />
                  ))}
                </div>
                <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: 0 }}>
                  <span style={{ color: TEXT, fontWeight: 700 }}>2,400+</span> students hired faster
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '20px clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 'clamp(12px, 4vw, 32px)', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { emoji: '🎓', stat: '2,400+', label: 'Students' },
            { emoji: '🏢', stat: '500+', label: 'Companies Accessed' },
            { emoji: '🤝', stat: '3 weeks', label: 'Avg. Time to Offer' },
            { emoji: '⭐', stat: '4.9/5', label: 'Student Rating' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <div>
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>{item.stat}</p>
                <p style={{ fontFamily: SF, fontSize: 11, color: TEXT3, margin: 0, fontWeight: 500 }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HONEST SECTION ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: BG }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="The real talk" color={PINK} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6vw, 44px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px', textAlign: 'center' }}>
            The modern job hunt is a<br />
            <span style={{ background: GRAD_WARM, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>literal nightmare 😮‍💨</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 18px)', color: TEXT2, lineHeight: 1.75, margin: '0 0 24px', textAlign: 'center' }}>
            Spending hours tailoring a resume just to get screened out by a bot is exhausting. CFF brings hidden jobs, warm networking, and smart tools into one place.
          </p>

          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: SHADOW_MD, padding: 'clamp(24px, 6vw, 36px)', marginBottom: 28 }}>
            <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>The Bottom Line</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>❌</span>
                <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 800, color: CORAL, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>More applications won't save you.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🎯</span>
                <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 800, color: INDIGO, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>More interviews will.</p>
              </div>
            </div>
            <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', color: TEXT3, lineHeight: 1.6, margin: '16px 0 0' }}>
              We're here to help you skip the line and get real results.
            </p>
          </div>

          <button onClick={go} style={{
            width: '100%', fontFamily: SF, fontSize: 'clamp(15px, 4.5vw, 17px)', fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 14, padding: 'clamp(16px, 5vw, 20px)',
            cursor: 'pointer', minHeight: 52, boxShadow: '0 8px 28px rgba(79,70,229,0.28)',
            transition: 'all 0.2s ease', touchAction: 'manipulation',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(79,70,229,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.28)'; }}
          >
            Start for Free →
          </button>
        </div>
      </div>

      {/* ── OLD WAY VS SMART WAY ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="Stop playing a losing game" color={VIOLET} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            The Old Way vs <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>The Smart Way</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Old Way */}
            <div style={{ background: '#fff5f7', border: `1.5px solid ${CORAL_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)' }}>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>🕳️ The Old Way</p>
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
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{item.emoji}</span>
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#9f1239', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: CORAL_LIGHT, borderRadius: 10, padding: '10px 14px', textAlign: 'center', border: `1px solid ${CORAL_BORDER}` }}>
                <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: CORAL }}>❌ 98% of cold apps get ghosted</span>
              </div>
            </div>

            {/* Smart Way */}
            <div style={{ background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)' }}>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 8px' }}>⚡ The CFF Way</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: INDIGO, margin: '0 0 20px', letterSpacing: '-0.02em' }}>The Smart Path</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { emoji: '🔥', text: 'Start strategic and confident with CFF' },
                  { emoji: '🔍', text: 'Uncover hidden jobs most students never see' },
                  { emoji: '🤝', text: 'Warm intros from alumni & parents who actually want to help' },
                  { emoji: '🚀', text: 'Move quickly from application to real interviews' },
                  { emoji: '🎉', text: 'Get hired through human connections, not algorithms' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{item.emoji}</span>
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: INDIGO_DIM, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 10, padding: '10px 14px', textAlign: 'center', border: `1px solid ${INDIGO_BORDER}` }}>
                <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO }}>✅ 1 warm intro = 10x more interviews</span>
              </div>
            </div>
          </div>

          {/* CFF proof list */}
          <div style={{ marginTop: 28, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 20, boxShadow: SHADOW_MD, padding: 'clamp(20px, 5vw, 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>CFF is already working for you</p>
                <p style={{ fontFamily: SF, fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>Scanning opportunities right now</p>
              </div>
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 100, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulseGreen 1.5s ease-in-out infinite' }} />
                <span style={{ fontFamily: SF, fontSize: 10, fontWeight: 800, color: '#15803d', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
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
        </div>
      </div>

      {/* ── APP SHOWCASE ── */}
      <AppShowcase />

      {/* ── CAMPUS VAULT WIDGET ── */}
      <CampusVaultWidget go={go} onSchoolSelect={launchWithSchool} FONT={FONT} TEXT={TEXT} TEXT2={TEXT2} TEXT3={TEXT3} CARD={CARD} BG={BG2} BLUE={BLUE} BLUE_LIGHT={BLUE_LIGHT} BLUE_BORDER={BLUE_BORDER} GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} GREEN_BORDER={GREEN_BORDER} SHADOW={SHADOW} SHADOW_MD={SHADOW_MD} R={R} />

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: BG, borderTop: '1px solid #f1f5f9', padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionLabel text="What the Agent does for you" color={TEAL_DARK} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(24px, 6vw, 40px)', textAlign: 'center' }}>
            One scan. Your entire edge,{' '}
            <span style={{ background: 'linear-gradient(90deg, #06b6d4, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>unlocked.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { emoji: '⚡', label: 'Auto-extract insider contact lanes', color: VIOLET },
              { emoji: '🎯', label: 'Real-time ATS formatting repair', color: INDIGO },
              { emoji: '🔗', label: 'Campus alumni mapped to open reqs', color: TEAL_DARK },
              { emoji: '📋', label: 'Hiring CRM — zero spreadsheets', color: PINK },
              { emoji: '✉️', label: 'Outreach drafted in your voice', color: VIOLET },
              { emoji: '🏆', label: 'Interview prep from real questions', color: INDIGO },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 'clamp(12px, 3vw, 18px)', boxShadow: SHADOW, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{item.emoji}</span>
                <p style={{ fontFamily: SF, fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700, color: item.color, margin: 0, lineHeight: 1.3 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: 'clamp(16px, 4vw, 20px) clamp(20px, 5vw, 28px)', textAlign: 'center' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 600, color: INDIGO_DIM, margin: 0, lineHeight: 1.5 }}>
              💬 "I was overwhelmed applying everywhere. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks." — Marcus, Penn State '27
            </p>
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Students like you" color={VIOLET} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(24px, 6vw, 36px)', textAlign: 'center' }}>
            Real results.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Real students.</span>
          </h2>
          <StoriesCarousel />
          <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textAlign: 'center', margin: 'clamp(16px, 4vw, 24px) 0 0', lineHeight: 1.6 }}>
            Students use CFF to stay organized, reduce stress, and move through the search with more traction.
          </p>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ background: BG, borderTop: '1px solid #f1f5f9', padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Pricing" color={INDIGO} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            One focused sprint.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Real results.</span>
          </h2>

          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px, 6vw, 40px)', boxShadow: SHADOW_LG, border: `2px solid ${INDIGO_BORDER}`, position: 'relative', overflow: 'hidden' }}>
            {/* Top gradient accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: GRAD_INDIGO }} />

            <div style={{ display: 'flex', gap: 8, marginBottom: 'clamp(16px, 4vw, 24px)', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '5px 14px' }}>
                <span style={{ fontSize: 12 }}>🎓</span>
                <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Graduation Sprint Plan</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 100, padding: '5px 14px' }}>
                <span style={{ fontSize: 12 }}>⚡</span>
                <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: '#92400e' }}>Less than a delivery meal for 14 days</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: SF, fontSize: 'clamp(40px, 10vw, 56px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>$4.99</span>
              <span style={{ fontFamily: SF, fontSize: 16, color: TEXT3, fontWeight: 500 }}>/week</span>
            </div>
            <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '0 0 clamp(20px, 5vw, 28px)', lineHeight: 1.4 }}>
              Billed monthly ($19.96) · Cancel in 1-tap anytime
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'clamp(20px, 5vw, 28px)' }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: SF, fontSize: 'clamp(12px, 3.5vw, 14px)', color: TEXT, margin: 0, lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>

            <CTAButton label="⚡ Check My ATS Match Score" fullWidth />
            <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.4 }}>
              No credit card required to start.
            </p>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: 'clamp(56px, 12vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>Ready to escape the black hole?</p>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Search Smarter,<br />Not Harder.
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.75)', margin: '0 0 clamp(28px, 6vw, 36px)', lineHeight: 1.65 }}>
            Join 2,400+ students who stopped applying blindly and started getting results.
          </p>
          <button onClick={go} style={{
            fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: INDIGO,
            background: '#fff', border: 'none', borderRadius: 14,
            padding: 'clamp(16px, 4vw, 20px) clamp(40px, 8vw, 56px)',
            cursor: 'pointer', minHeight: 56,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transition: 'all 0.2s ease', touchAction: 'manipulation',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'; }}
          >
            ⚡ Optimize My Resume File
          </button>
          <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '16px 0 0', lineHeight: 1.4 }}>No credit card required to start.</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: 'clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)', textAlign: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s' }}
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