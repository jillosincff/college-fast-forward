import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import CampusVaultWidget from '@/components/landing/CampusVaultWidget';
import AppShowcase from '@/components/landing/AppShowcase';

// ── Design Tokens ──────────────────────────────────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const TEXT3 = '#94A3B8';
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const CYAN = '#06B6D4';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const ORANGE = '#F97316';
const CORAL = '#FF6B6B';
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';
const SHADOW_LG = '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)';
const R = 12;

const BENEFIT_CARDS = [
  { icon: '📄', title: 'Tailored Resumes', desc: 'Automatically adapt your resume for each role so you apply faster and with more confidence.' },
  { icon: '🎯', title: 'Relevant Opportunities', desc: 'Surface jobs that better match your background, goals, and interests.' },
  { icon: '📊', title: 'Application Tracking', desc: 'Keep every application organized in one place with clear status updates.' },
  { icon: '🔔', title: 'Follow-Up Reminders', desc: 'Never miss the right moment to check in again.' },
  { icon: '💼', title: 'LinkedIn Optimization', desc: 'Improve your profile so recruiters and connections can find you more easily.' },
  { icon: '🤝', title: 'Warm Intros', desc: 'Find alumni and parent connections who can open warmer paths into companies.' },
];

const HOW_IT_WORKS = [
  { number: '01', icon: '🎯', title: 'Know What to Apply For', desc: 'Smart matching + daily opportunities tailored to your goals.' },
  { number: '02', icon: '✨', title: 'Stand Out', desc: 'Modern resumes and LinkedIn optimization that actually get noticed by recruiters.' },
  { number: '03', icon: '📋', title: 'Stay on Track', desc: 'Track every application, get smart reminders, and reach the right connections.' },
];

const STORIES = [
  { quote: "I was overwhelmed applying everywhere and getting ghosted. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=96&h=96&fit=crop&crop=face", tag: "Landed an internship" },
  { quote: "I finally felt like I had a system instead of a mess. Before this I had 40 tabs open and no idea where anything stood.", name: "Maya R.", school: "UF '26, Business", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face", tag: "Less stress" },
  { quote: "The warm intro feature made networking feel less random. I actually got a response from an alumna within 48 hours.", name: "Alex P.", school: "USC '25, Marketing", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", tag: "Better outreach" },
];

const FREE_FEATURES = ['Basic resume tools', 'Limited Agent usage', 'Application tracker', 'Perfect for getting started'];
const PRO_FEATURES = ['Unlimited AI Agent', 'Advanced tailoring + modern templates', 'Smart reminders + interview prep', 'Most students upgrade once they see results'];
const PROOF_CALLOUTS = [
  { icon: '✓', text: 'Upload once — get perfectly tailored resume versions for every job you target' },
  { icon: '✓', text: 'Discovers hidden jobs most students never see, including unlisted internal roles' },
  { icon: '✓', text: 'Surfaces warm alumni & parent connections far more likely to actually respond' },
  { icon: '✓', text: 'Tracks every application automatically — smart reminders so nothing falls through' },
  { icon: '✓', text: 'Crafts personalized outreach messages that get real replies instead of silence' },
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
          background: CARD, borderRadius: 12, boxShadow: SHADOW_MD,
          borderLeft: `4px solid ${BLUE}`,
          padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)', cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.06}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 140, position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: 'clamp(3px, 1vw, 4px) clamp(8px, 2vw, 12px)', marginBottom: 14, maxWidth: '100%' }}>
          <span style={{ fontFamily: FONT, fontSize: 'clamp(9px, 2.5vw, 10px)', fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 500, color: TEXT, lineHeight: 1.6, margin: '0 0 clamp(16px, 4vw, 20px)', fontStyle: 'italic' }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 'clamp(36px, 10vw, 44px)', height: 'clamp(36px, 10vw, 44px)', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: `2px solid ${BLUE_BORDER}` }}>
            <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{s.name}</p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: TEXT2, margin: '2px 0 0', lineHeight: 1.3 }}>{s.school}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STORIES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 3, background: i === active ? BLUE : '#CBD5E1', border: 'none', cursor: 'pointer', padding: 0, minHeight: '44px', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: `1px solid #E2E8F0`, fontSize: 13, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '44px', transition: 'all 0.15s', touchAction: 'manipulation' }}
              onMouseEnter={e => { e.currentTarget.style.background = BLUE_LIGHT; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.color = BLUE; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = TEXT2; }}
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
    // Only show funnel for unauthenticated users
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
    // For authenticated users, do nothing here - they stay on the landing page to view results
    // Navigation happens separately via the "Go to Dashboard" button or action buttons in results
  };

  useEffect(() => {
    setMounted(true);
    // Capture referrer ID from ?r= param so OnboardingFlow can fire the milestone
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const referrerId = urlParams.get('r') || hashParams.get('r');
      if (referrerId) {
        localStorage.setItem('cff_referrer_id', referrerId);
      }
    } catch {}
    if (!document.getElementById('slp-inter')) {
      const link = document.createElement('link');
      link.id = 'slp-inter';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Redirect any logged-in user straight to their dashboard
  useEffect(() => {
    if (isLoadingAuth || !user) return;
    if (user.persona === 'parent' || user.roles?.includes('parent')) {
      navigate('ParentHome');
    } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
      navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
    } else if (user.persona || user.roles?.length > 0) {
      navigate('FreeTierDashboard');
    }
  }, [user, isLoadingAuth]);

  // Smart "Get Hired" handler — any logged-in user goes straight to their dashboard, new users hit Google auth
  const go = () => {
    if (!isLoadingAuth && user) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('ParentHome');
      } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
        navigate(user.alumni_intent === 'giving_help' ? 'AlumniHome' : 'FreeTierDashboard');
      } else {
        navigate('FreeTierDashboard');
      }
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

  const SectionLabel = ({ text }) => (
    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>{text}</p>
  );

  const CTAButton = ({ label = 'Get Hired →', onClick = go, fullWidth = false }) => (
    <button onClick={onClick} style={{
      fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 16px)', fontWeight: 700, color: '#fff',
      background: `linear-gradient(to bottom, ${GREEN}, #059669)`,
      border: 'none', borderRadius: 12, padding: 'clamp(16px, 4vw, 20px) clamp(24px, 6vw, 36px)',
      cursor: 'pointer', minHeight: '48px',
      transition: 'all 0.2s ease',
      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
      width: fullWidth ? '100%' : 'auto',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.4)'; e.currentTarget.style.background = `linear-gradient(to bottom, #059669, #047857)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.3)'; e.currentTarget.style.background = `linear-gradient(to bottom, ${GREEN}, #059669)`; }}
    >{label}</button>
  );

  return (
    <div style={{ background: BG, fontFamily: FONT, color: TEXT, overflowX: 'hidden' }}>
      {showFunnel && <OnboardingFlow onClose={() => { setShowFunnel(false); setFunnelStartScreen(null); }} resumeAtScreen={funnelStartScreen} />}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,102,255,0.15)} 50%{box-shadow:0 0 0 8px rgba(0,102,255,0)} }
        @keyframes pulseGreen { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes badgeGlow { 0%,100%{box-shadow:0 0 0 0 rgba(0,102,255,0.4)} 50%{box-shadow:0 0 16px 4px rgba(0,102,255,0.15)} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes drift { 0%{transform:translate(0,0)} 25%{transform:translate(6px,-4px)} 50%{transform:translate(-4px,6px)} 75%{transform:translate(4px,2px)} 100%{transform:translate(0,0)} }
        @keyframes checkIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
          College <span style={{ color: BLUE }}>Fast Forward</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={parent} style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 13px)', color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: '44px', padding: '8px 10px', WebkitTapHighlightColor: 'transparent' }}>For Parents</button>
          <button onClick={go} style={{ fontFamily: FONT, fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: 10, padding: '10px clamp(14px, 4vw, 20px)', cursor: 'pointer', minHeight: '44px', boxShadow: '0 4px 12px rgba(0,102,255,0.25)', transition: 'all 0.15s', touchAction: 'manipulation' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{!isLoadingAuth && user ? 'Dashboard →' : 'Get Started →'}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px, 15vw, 120px) 16px clamp(60px, 10vw, 80px)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 30%, #0A2444 55%, #071A33 80%, #0A1628 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Floating connection dots */}
        {[
          { top: '20%', left: '15%', size: 5, color: CYAN, delay: '0s' },
          { top: '35%', left: '5%', size: 4, color: ORANGE, delay: '1s' },
          { top: '65%', left: '12%', size: 6, color: '#10B981', delay: '2s' },
          { top: '25%', right: '12%', size: 5, color: CYAN, delay: '0.5s' },
          { top: '60%', right: '8%', size: 4, color: ORANGE, delay: '1.5s' },
          { top: '78%', right: '20%', size: 5, color: BLUE, delay: '0.8s' },
        ].map((dot, i) => (
          <div key={i} style={{ position: 'absolute', top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size, borderRadius: '50%', background: dot.color, opacity: 0.6, animation: `drift 8s ease-in-out ${dot.delay} infinite`, pointerEvents: 'none', boxShadow: `0 0 ${dot.size * 2}px ${dot.color}` }} />
        ))}
        {/* Avatar row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          marginBottom: 24, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex' }}>
            {[
              'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
            ].map((src, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BG}`, overflow: 'hidden', marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: 5 - i, boxShadow: SHADOW }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <span style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 13px)', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Joined by <strong style={{ color: '#fff', fontWeight: 700 }}>2,400+</strong> students
          </span>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(6,182,212,0.12)', border: `1px solid rgba(6,182,212,0.35)`,
          borderRadius: 100, padding: '7px 18px', marginBottom: 24,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.1s',
          maxWidth: '100%', animation: 'badgeGlow 3s ease-in-out infinite',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontFamily: FONT, fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 700, color: CYAN, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🎓 Built for College Students</span>
          <span style={{ fontSize: 14 }}>⚡</span>
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s', maxWidth: 720, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 'clamp(30px, 8vw, 68px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#FFFFFF', margin: '0 0 12px' }}>
            The job search is a black hole.
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(20px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 20px', background: `linear-gradient(90deg, ${CYAN}, ${BLUE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            CFF finds the path around it.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 auto 14px', maxWidth: 600 }}>
            We help you bypass the void: hidden opportunities, warm connections from alumni & parents, and real human introductions — because once a person sees your resume, the algorithm stops mattering.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: 440, marginTop: 'clamp(28px, 8vw, 44px)', opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          <button onClick={go} style={{
            width: '100%', fontFamily: FONT, fontSize: 'clamp(16px, 4.5vw, 18px)', fontWeight: 900, color: '#fff',
            background: `linear-gradient(135deg, ${BLUE} 0%, ${CYAN} 100%)`,
            border: 'none', borderRadius: 16, padding: 'clamp(18px, 5vw, 22px) clamp(24px, 6vw, 36px)',
            cursor: 'pointer', minHeight: '56px',
            boxShadow: `0 16px 48px rgba(0,102,255,0.5), 0 4px 12px rgba(6,182,212,0.3)`,
            transition: 'all 0.25s ease', letterSpacing: '0.01em',
            touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,102,255,0.6), 0 6px 16px rgba(6,182,212,0.4)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,102,255,0.5), 0 4px 12px rgba(6,182,212,0.3)`; }}
          >
            ⚡ Start for Free →
          </button>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4, textAlign: 'center' }}>
            8–12 min setup · No credit card required
          </p>
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: 'clamp(6px, 2vw, 9px) clamp(12px, 3vw, 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: '100%' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulseGreen 1.8s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: '#6EE7B7', fontWeight: 600, lineHeight: 1.4 }}>
              3,412 students from top campuses are already getting interviews.
            </span>
          </div>
        </div>

      </div>

      {/* ── HONEST SECTION ── */}
      <div style={{ padding: 'clamp(48px, 10vw, 80px) 16px', background: CARD, borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 16px' }}>
            Let's be honest: the modern job hunt is a literal nightmare.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 400, color: TEXT2, lineHeight: 1.7, margin: '0 0 24px' }}>
            Spending hours tailoring a resume just to get screened out by a bot is exhausting and demoralizing.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 4.5vw, 22px)', fontWeight: 800, color: BLUE, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 16px' }}>
            CFF eliminates the headache.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 400, color: TEXT2, lineHeight: 1.7, margin: '0 0 32px' }}>
            We bring organization, hidden job listings, and warm networking (via alumni and parents) into one place — so you stop shouting into the void.
          </p>

          <div style={{ borderLeft: `4px solid ${BLUE}`, paddingLeft: 'clamp(16px, 4vw, 24px)', marginBottom: 32 }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 600, color: TEXT, lineHeight: 1.6, margin: '0 0 10px' }}>
              CFF isn't just another digital filing cabinet.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 800, color: TEXT, lineHeight: 1.4, margin: '0 0 10px' }}>
              It's a career accelerator.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 3.5vw, 17px)', fontWeight: 400, color: TEXT2, lineHeight: 1.7, margin: 0 }}>
              It takes a cold, soul-crushing process and makes it human again.
            </p>
          </div>

          <div style={{ background: '#0F172A', borderRadius: 16, padding: 'clamp(24px, 6vw, 36px) clamp(20px, 5vw, 32px)', marginBottom: 28 }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>The Bottom Line</p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 800, color: '#F87171', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 8px' }}>
              More applications won't save you.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 800, color: GREEN, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 16px' }}>
              More interviews will.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
              We're here to help you skip the line and get real results.
            </p>
          </div>

          <button onClick={go} style={{
            width: '100%', fontFamily: FONT, fontSize: 'clamp(15px, 4.5vw, 17px)', fontWeight: 900, color: '#fff',
            background: BLUE, border: 'none', borderRadius: 14, padding: 'clamp(16px, 5vw, 20px)',
            cursor: 'pointer', minHeight: '52px', boxShadow: '0 12px 32px rgba(0,102,255,0.3)',
            transition: 'all 0.2s ease', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#0052CC'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = BLUE; }}
          >
            Start for Free →
          </button>
        </div>
      </div>

      {/* ── OLD WAY VS SMART WAY ── */}
      <div style={{ padding: 'clamp(48px, 10vw, 80px) 16px', background: CARD, borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="Stop playing a losing game" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 6vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            The Old Way vs The Smart Way
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

            {/* Old Way */}
            <div style={{ background: 'linear-gradient(160deg, #1C0A0A 0%, #2D0F0F 100%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🕳️</span>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(10px, 2.5vw, 11px)', fontWeight: 700, color: '#FCA5A5', letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0 }}>The Old Way</p>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 900, color: '#FCA5A5', margin: '0 0 clamp(18px, 4vw, 24px)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>The Brutal Cycle</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 16px)' }}>
                {[
                  { emoji: '😃', text: 'Start full of hope and optimism' },
                  { emoji: '⏰', text: 'Spend dozens of hours mass-applying to 200+ random jobs' },
                  { emoji: '😶', text: 'Get automated rejections or total silence' },
                  { emoji: '😟', text: 'Slowly lose confidence and question your worth' },
                  { emoji: '💔', text: 'Feel discouraged, anxious, stuck in the void' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 'clamp(18px, 5vw, 20px)', flexShrink: 0, lineHeight: 1.3, filter: 'saturate(0.5)' }}>{item.emoji}</span>
                    <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 3.5vw, 14px)', color: 'rgba(252,165,165,0.8)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#FCA5A5' }}>❌ 98% of cold apps get ghosted</span>
              </div>
            </div>

            {/* Smart Way */}
            <div style={{ background: 'linear-gradient(160deg, #031A0E 0%, #062918 100%)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 20, padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(10px, 2.5vw, 11px)', fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0 }}>The CFF Way</p>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 900, color: '#6EE7B7', margin: '0 0 clamp(18px, 4vw, 24px)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>The Smart Path</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 16px)' }}>
                {[
                  { emoji: '🔥', text: 'Start strategic and confident with CFF' },
                  { emoji: '🔍', text: 'Uncover hidden jobs most students never see' },
                  { emoji: '🤝', text: 'Warm intros from alumni & parents who actually want to help' },
                  { emoji: '🚀', text: 'Move quickly from application to real interviews' },
                  { emoji: '🎉', text: 'Get hired through human connections, not algorithms' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 'clamp(18px, 5vw, 20px)', flexShrink: 0, lineHeight: 1.3 }}>{item.emoji}</span>
                    <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 3.5vw, 14px)', color: 'rgba(110,231,183,0.9)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: 'rgba(16,185,129,0.12)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#6EE7B7' }}>✅ 1 warm intro = 10x more interviews</span>
              </div>
            </div>

          </div>

          {/* Bottom callout */}
          <div style={{ marginTop: 'clamp(20px, 5vw, 28px)', background: 'linear-gradient(135deg, #0A1628, #0D1F3C)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, padding: 'clamp(18px, 4vw, 26px) clamp(20px, 5vw, 32px)', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 4.5vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 8px', background: `linear-gradient(90deg, #FFFFFF, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              One warm introduction beats 100 cold applications.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 14px)', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
              This is how the real world actually works.
            </p>
          </div>

          {/* ── CLiFF IS ALREADY WORKING FOR YOU ── */}
          <div style={{ marginTop: 'clamp(24px, 6vw, 36px)', background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 100%)', borderRadius: 20, boxShadow: `0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(6,182,212,0.2)`, padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, rgba(0,102,255,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                  CFF is already working for you
                </p>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(10px, 2.5vw, 11px)', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', lineHeight: 1.3 }}>Scanning your opportunities right now</p>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 100, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulseGreen 1.5s ease-in-out infinite' }} />
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#6EE7B7', whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
              </div>
            </div>
            {/* Items */}
            {PROOF_CALLOUTS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 'clamp(9px, 2.5vw, 12px) 0', borderBottom: i < PROOF_CALLOUTS.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none', animation: `checkIn 0.4s ease ${i * 0.1}s both` }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: `1px solid rgba(16,185,129,0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: '#6EE7B7', fontWeight: 800 }}>✓</span>
                </div>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3.5vw, 13px)', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
            {/* Bottom teaser */}
            <div style={{ marginTop: 18, background: `linear-gradient(90deg, rgba(0,102,255,0.15), rgba(6,182,212,0.15))`, border: `1px solid rgba(6,182,212,0.25)`, borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: CYAN, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                🚀 Your personalized plan is being built right now — you're already ahead of 95% of applicants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── APP SHOWCASE ── */}
      <AppShowcase />

      {/* ── CAMPUS VAULT WIDGET (replaces 6-box feature grid) ── */}
      <CampusVaultWidget go={go} onSchoolSelect={launchWithSchool} FONT={FONT} TEXT={TEXT} TEXT2={TEXT2} TEXT3={TEXT3} CARD={CARD} BG={BG} BLUE={BLUE} BLUE_LIGHT={BLUE_LIGHT} BLUE_BORDER={BLUE_BORDER} GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} GREEN_BORDER={GREEN_BORDER} SHADOW={SHADOW} SHADOW_MD={SHADOW_MD} R={R} />

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: 'clamp(48px, 10vw, 72px) 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionLabel text="What the Agent does for you" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 5vw, 38px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(24px, 6vw, 36px)', textAlign: 'center' }}>
            One scan. Your entire edge, unlocked.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
            {[
              { emoji: '⚡', label: 'Auto-extract insider contact lanes' },
              { emoji: '🎯', label: 'Real-time ATS formatting repair' },
              { emoji: '🔗', label: 'Campus alumni mapped to open reqs' },
              { emoji: '📋', label: 'Hiring CRM — zero spreadsheets' },
              { emoji: '✉️', label: 'Outreach drafted in your voice' },
              { emoji: '🏆', label: 'Interview prep from real questions' },
            ].map((item, i) => (
              <div key={i} style={{ background: BG, borderRadius: 10, padding: 'clamp(12px, 3vw, 16px)', boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 'clamp(18px, 5vw, 20px)', flexShrink: 0 }}>{item.emoji}</span>
                <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.3 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#0F172A', borderRadius: 12, padding: 'clamp(16px, 4vw, 20px) clamp(20px, 5vw, 28px)', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3.5vw, 15px)', fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.5 }}>
              💬 <span style={{ color: GREEN }}>"I was overwhelmed applying everywhere. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks."</span> — Marcus, Penn State '27
            </p>
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: 'clamp(48px, 10vw, 80px) 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Students like you" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(24px, 6vw, 36px)', textAlign: 'center' }}>
            Real results. Real students.
          </h2>
          <StoriesCarousel />
          <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 13px)', color: TEXT3, textAlign: 'center', margin: 'clamp(16px, 4vw, 24px) 0 0', lineHeight: 1.6 }}>
            Students use CFF to stay organized, reduce stress, and move through the search with more traction.
          </p>
        </div>
      </div>



      {/* ── PRICING ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: 'clamp(48px, 10vw, 80px) 16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Pricing" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            One focused sprint.<br />Real results.
          </h2>

          {/* Sprint Card */}
          <div style={{ background: CARD, borderRadius: 14, padding: 'clamp(24px, 6vw, 36px) clamp(20px, 5vw, 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', border: `1px solid ${BLUE_BORDER}`, position: 'relative' }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: 'clamp(4px, 1vw, 5px) clamp(10px, 3vw, 14px)', marginBottom: 'clamp(16px, 4vw, 24px)', maxWidth: '100%' }}>
              <span style={{ fontSize: 'clamp(11px, 3vw, 12px)' }}>🎓</span>
              <span style={{ fontFamily: FONT, fontSize: 'clamp(9px, 2.5vw, 10px)', fontWeight: 700, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Graduation Sprint Plan</span>
            </div>

            {/* Comparison badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 100, padding: 'clamp(4px, 1vw, 5px) clamp(10px, 3vw, 14px)', marginBottom: 'clamp(14px, 4vw, 20px)', marginLeft: 0 }}>
              <span style={{ fontSize: 'clamp(11px, 3vw, 12px)' }}>⚡</span>
              <span style={{ fontFamily: FONT, fontSize: 'clamp(9px, 2.5vw, 10px)', fontWeight: 600, color: '#92400E', whiteSpace: 'nowrap' }}>Less than a delivery meal for 14 days</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FONT, fontSize: 'clamp(36px, 10vw, 52px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>$4.99</span>
              <span style={{ fontFamily: FONT, fontSize: 'clamp(14px, 4vw, 16px)', color: TEXT3, fontWeight: 400 }}>/week</span>
            </div>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: TEXT3, margin: '0 0 clamp(20px, 5vw, 28px)', lineHeight: 1.4 }}>
              Billed monthly ($19.96) · Cancel in 1-tap anytime
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'clamp(20px, 5vw, 28px)' }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 'clamp(16px, 4vw, 18px)', height: 'clamp(16px, 4vw, 18px)', borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 'clamp(7px, 2vw, 9px)', color: GREEN, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3.5vw, 13px)', color: TEXT, margin: 0, lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>

            <CTAButton label="⚡ Check My ATS Match Score" fullWidth />
            <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: TEXT3, textAlign: 'center', margin: 'clamp(12px, 3vw, 14px) 0 0', lineHeight: 1.4 }}>
              No credit card required to start.
            </p>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: 'clamp(48px, 10vw, 88px) 16px clamp(48px, 10vw, 72px)', textAlign: 'center', background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Ready to escape the black hole?" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 6vw, 48px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Search Smarter,<br />
            <span style={{ color: BLUE }}>Not Harder.</span>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 4vw, 15px)', color: TEXT2, margin: '0 0 clamp(24px, 6vw, 32px)', lineHeight: 1.6 }}>
            Join 2,400+ students who stopped applying blindly and started getting results.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <CTAButton label="⚡ Optimize My Resume File" />
          </div>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: TEXT3, margin: 0, lineHeight: 1.4 }}>No credit card required to start.</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: 'clamp(20px, 5vw, 28px) 16px', textAlign: 'center', background: CARD }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: FONT, fontSize: 'clamp(12px, 3vw, 13px)', color: TEXT3, textDecoration: 'none', transition: 'color 0.15s', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT2}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 3vw, 12px)', color: TEXT3, margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} College Fast Forward · Helping students land faster with less stress.
        </p>
      </div>
    </div>
  );
}