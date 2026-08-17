import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { Check } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import Reveal from '@/components/landing/Reveal';

// ── Design Tokens ───────────────────────────────────────────────
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

const BG    = '#f8f9ff';
const TEXT  = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

const INDIGO        = '#6d28d9';
const INDIGO_DIM    = '#5b21b6';
const INDIGO_LIGHT  = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';

const GRAD_HERO   = 'linear-gradient(160deg, #f5f3ff 0%, #faf5ff 45%, #f0f4ff 100%)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const STEPS = [
  'Target the right job',
  'Get a tailored resume',
  'See alumni at that company',
  'Send the warm outreach',
  'Track what happens next',
];

const PROOF = [
  '"Got an interview in 4 days."',
  '"Finally stopped applying cold."',
  '"The alumni note got a reply."',
];

const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT,
  border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px',
  fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO,
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18,
};

function PrimaryCTA({ label, onClick, fullWidth = true, dark = false, style: extra = {} }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, color: '#fff',
      background: dark ? '#0f172a' : GRAD_INDIGO, border: 'none', borderRadius: 999,
      padding: 'clamp(16px, 4.5vw, 19px) clamp(36px, 7vw, 52px)',
      cursor: 'pointer', minHeight: 58, width: fullWidth ? '100%' : 'auto',
      boxShadow: dark ? '0 14px 44px rgba(15,23,42,0.40), 0 0 0 4px rgba(255,255,255,0.18)' : '0 14px 40px rgba(109,40,217,0.32)',
      transition: 'all 0.2s ease', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
      ...extra,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = dark ? '0 20px 56px rgba(15,23,42,0.50), 0 0 0 4px rgba(255,255,255,0.28)' : '0 20px 52px rgba(109,40,217,0.42)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = dark ? '0 14px 44px rgba(15,23,42,0.40), 0 0 0 4px rgba(255,255,255,0.18)' : '0 14px 40px rgba(109,40,217,0.32)'; }}
    >{label}</button>
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

  // Lock background scrolling while the onboarding overlay is open.
  useEffect(() => {
    if (!showFunnel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showFunnel]);

  // Sticky CTA appears after the hero, hides near the final CTA.
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.6;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 640;
      setShowStickyCTA(scrolled && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const login = () => navigate('GatorAuth');

  const ctaLabel = (!isLoadingAuth && user) ? 'Dashboard →' : 'Build My Career Plan →';

  // While auth resolves or a logged-in user is about to redirect, don't paint
  // the marketing page — it would flash before the redirect fires.
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
      {showFunnel && (
        <OnboardingFlow
          onClose={() => { setShowFunnel(false); setFunnelStartScreen(null); }}
          resumeAtScreen={funnelStartScreen}
        />
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .hero-1 { animation: fadeUp 0.6s 0.05s ease both; }
        .hero-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .hero-3 { animation: fadeUp 0.6s 0.25s ease both; }
        .hero-4 { animation: fadeUp 0.6s 0.35s ease both; }
        @media (max-width: 640px) {
          .nav-cta { padding: 10px 14px !important; font-size: 13px !important; }
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SF, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
          <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/5181e2c8e_generated_image.png" alt="College Fast Forward" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
          <span>College{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fast Forward</span>
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!(!isLoadingAuth && user) && (
            <button onClick={login} style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 10px', whiteSpace: 'nowrap' }}>Log In</button>
          )}
          <button onClick={go} className="nav-cta" style={{
            fontFamily: SF, fontSize: 14, fontWeight: 800, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 999,
            padding: '11px 20px', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap',
            boxShadow: '0 6px 18px rgba(109,40,217,0.28)', transition: 'all 0.15s',
          }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{ctaLabel}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(96px, 14vw, 120px) clamp(20px, 5vw, 32px) clamp(48px, 7vw, 64px)',
        background: GRAD_HERO, position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.10) 0%, transparent 70%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, width: '100%', position: 'relative', zIndex: 1 }}>
          {mounted && (
            <>
              <h1 className="hero-1" style={{ fontFamily: SF, fontSize: 'clamp(34px, 9vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#030712', margin: '0 0 18px' }}>
                Getting your first job is brutal.
              </h1>

              <p className="hero-2" style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 500, color: TEXT2, lineHeight: 1.45, margin: '0 auto clamp(28px, 6vw, 36px)', maxWidth: 620 }}>
                Most students apply into the void.<br />
                <span style={{ color: TEXT, fontWeight: 700 }}>CLIFF gives you a real plan — and the warm intro most people never get.</span>
              </p>

              {/* Benefit lines */}
              <div className="hero-3" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2.5vw, 14px)', margin: '0 auto clamp(32px, 7vw, 44px)', maxWidth: 480, textAlign: 'left' }}>
                {[
                  'Finds jobs actually worth your time',
                  'Tailors your resume for that role',
                  'Surfaces alumni and writes the outreach for you',
                ].map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={16} color={INDIGO} strokeWidth={3} />
                    </span>
                    <span style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 600, color: TEXT, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{b}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="hero-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 420, margin: '0 auto' }}>
                <PrimaryCTA label={ctaLabel} onClick={go} />
                <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: 0, fontWeight: 600 }}>
                  Free to start · No credit card required
                </p>
              </div>

              {/* Light social proof */}
              <p className="hero-4" style={{ fontFamily: SF, fontSize: 13.5, color: TEXT3, margin: 'clamp(20px, 5vw, 28px) 0 0', fontWeight: 600 }}>
                Join 5,000+ students using CLIFF
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: 'clamp(64px, 12vw, 96px) clamp(20px, 5vw, 32px)', background: '#fff', borderTop: '1px solid #f1f5f9', scrollMarginTop: 80 }}>
        <Reveal>
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
            <span style={badgeStyle}>How it works</span>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 42px)', fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(28px, 6vw, 36px)' }}>
              One clear plan
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 16px)', textAlign: 'left', maxWidth: 460, margin: '0 auto' }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ flex: '0 0 auto', width: 32, height: 32, borderRadius: '50%', background: GRAD_INDIGO, color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <span style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 19px)', fontWeight: 600, color: TEXT, letterSpacing: '-0.01em' }}>{s}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 700, color: INDIGO_DIM, margin: 'clamp(28px, 6vw, 36px) 0 0', lineHeight: 1.5 }}>
              CLIFF runs the first full cycle for you for free.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── THE REAL DIFFERENCE ── */}
      <section style={{ padding: 'clamp(64px, 12vw, 96px) clamp(20px, 5vw, 32px)', background: BG, borderTop: '1px solid #f1f5f9' }}>
        <Reveal>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <span style={badgeStyle}>The real difference</span>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6.5vw, 40px)', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 clamp(20px, 5vw, 26px)' }}>
              <span style={{ display: 'block', color: TEXT3 }}>Most tools help you apply.</span>
              <span style={{ display: 'block', background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF helps you get seen.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 19px)', color: TEXT2, lineHeight: 1.55, margin: 0 }}>Anyone can generate a resume.</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 19px)', color: TEXT2, lineHeight: 1.55, margin: 0 }}>Almost no one finds you the person on the inside and writes the message.</p>
              <p style={{ fontFamily: SF, fontSize: 'clamp(16px, 4vw, 19px)', color: TEXT, fontWeight: 700, lineHeight: 1.55, margin: 0 }}>That’s the part that actually changes your odds.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SIMPLE PROOF ── */}
      <section style={{ padding: 'clamp(56px, 10vw, 88px) clamp(20px, 5vw, 32px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <Reveal>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: TEXT3, letterSpacing: '0.10em', textTransform: 'uppercase', textAlign: 'center', margin: '0 0 22px' }}>From students on CLIFF</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px, 3vw, 18px)' }}>
              {PROOF.map((line) => (
                <div key={line} style={{ background: BG, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 16, padding: '20px 18px', textAlign: 'center' }}>
                  <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 3.8vw, 17px)', fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(72px, 14vw, 112px) clamp(20px, 5vw, 32px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <Reveal>
          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(30px, 8vw, 50px)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 clamp(24px, 6vw, 32px)' }}>
              Stop applying into the void.
            </h2>
            <PrimaryCTA label={ctaLabel} onClick={go} dark />
            <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.8vw, 16px)', fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 'clamp(16px, 4vw, 22px) 0 0', lineHeight: 1.5 }}>
              Free to start · Takes less than 2 minutes
            </p>
            <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 'clamp(20px, 5vw, 28px) 0 0', lineHeight: 1.6 }}>
              A parent or alum who can help students land?{' '}
              <button onClick={parent} style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 800, color: '#fff', background: 'none', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.5)', padding: 0, cursor: 'pointer', minHeight: 'auto' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')}
              >Join as a Parent or Alum →</button>
            </p>
          </div>
        </Reveal>
      </section>

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
          Stop applying into the void.
        </span>
        <button onClick={go} style={{
          fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#fff',
          background: GRAD_INDIGO, border: 'none', borderRadius: 999,
          padding: '12px clamp(20px, 5vw, 30px)', cursor: 'pointer', minHeight: 48, flexShrink: 0,
          boxShadow: '0 6px 20px rgba(109,40,217,0.35)', transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >{ctaLabel}</button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: 'clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)', paddingBottom: 'calc(clamp(20px, 5vw, 28px) + 76px + env(safe-area-inset-bottom, 0px))', textAlign: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Log In', null, login], ['Parents & Alumni', null, parent], ['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com?subject=College%20Fast%20Forward%20Support']].map(([label, href, handler]) => (
            <a key={label} href={href || undefined} onClick={!href ? (e) => { e.preventDefault(); handler && handler(); } : undefined} style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT3)}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} College Fast Forward
        </p>
      </div>
    </div>
  );
}