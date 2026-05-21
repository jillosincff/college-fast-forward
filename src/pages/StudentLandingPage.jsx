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
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const ORANGE = '#F97316';
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
  'Upload your resume once.',
  'Get modern, tailored versions for every job.',
  'Track all applications automatically with smart reminders.',
  'Get outreach support when it makes sense.',
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
          background: CARD, borderRadius: R, boxShadow: SHADOW_MD,
          borderLeft: `4px solid ${BLUE}`,
          padding: '32px 32px 28px', cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.06}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 160, position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '4px 12px', marginBottom: 16 }}>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(15px, 1.8vw, 18px)', fontWeight: 500, color: TEXT, lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: `2px solid ${BLUE_BORDER}` }}>
            <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{s.name}</p>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>{s.school}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STORIES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? BLUE : '#CBD5E1', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: `1px solid #E2E8F0`, fontSize: 13, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
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
    try {
      if (schoolName) localStorage.setItem('cff_college', schoolName);
      localStorage.removeItem('cff_onboarding_screen');
    } catch {}
    setFunnelStartScreen(null);
    setShowFunnel(true);
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
      fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
      background: `linear-gradient(to bottom, ${GREEN}, #059669)`,
      border: 'none', borderRadius: 8, padding: '16px 36px',
      cursor: 'pointer', minHeight: 'auto',
      transition: 'all 0.2s ease',
      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
      width: fullWidth ? '100%' : 'auto',
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
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
          College <span style={{ color: BLUE }}>Fast Forward</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={parent} style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 12px' }}>For Parents</button>
          <button onClick={go} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(0,102,255,0.25)', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{!isLoadingAuth && user ? 'Go to Dashboard →' : 'Get Started →'}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 60%)',
      }}>
        {/* Avatar row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
          marginBottom: 36, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ display: 'flex' }}>
            {[
              'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
            ].map((src, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${BG}`, overflow: 'hidden', marginLeft: i === 0 ? 0 : -10, position: 'relative', zIndex: 5 - i, boxShadow: SHADOW }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, fontWeight: 500 }}>
            Joined by <strong style={{ color: TEXT, fontWeight: 700 }}>2,400+</strong> students
          </span>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`,
          borderRadius: 100, padding: '7px 18px', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.1s',
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>The CFF AI Agent</span>
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s', maxWidth: 760, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 900, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>
            Exclusively for College Students
          </span>
          <div style={{ fontFamily: FONT, fontSize: 'clamp(28px, 5vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            <div style={{ color: '#94A3B8', marginBottom: 4 }}>Stop spamming apps.</div>
            <div style={{ background: 'linear-gradient(135deg, #0066FF 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', paddingBottom: '0.15em' }}>
              Start landing interviews.
            </div>
          </div>
        </div>

        <p style={{
          fontFamily: FONT, fontSize: 'clamp(14px, 1.6vw, 17px)',
          fontWeight: 500, color: TEXT2,
          lineHeight: 1.8, maxWidth: 540, margin: '24px auto 0',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.2s',
        }}>
          Job hunting sucks when you're blindly applying to hundreds of jobs and getting ghosted. <strong style={{ color: BLUE, fontWeight: 700 }}>CLiFF</strong> — your AI career agent — gives you a smarter, targeted approach: a focused strategy paired with real campus insiders <strong style={{ color: TEXT }}>10X more likely to land you interviews fast.</strong>
        </p>

        <div style={{ width: '100%', maxWidth: 400, marginTop: 40, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button onClick={go} style={{
            width: '100%', fontFamily: FONT, fontSize: 16, fontWeight: 900, color: '#fff',
            background: BLUE, border: 'none', borderRadius: 16, padding: '18px 32px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 12px 32px rgba(0,102,255,0.35)',
            transition: 'all 0.2s ease', letterSpacing: '0.01em',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#0052CC'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = BLUE; }}
          >⚡ Get Interviews Faster – Start for Free</button>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            🔒 Free Student Workspace · Takes 30 seconds
          </span>
          <div style={{ marginTop: 14, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: FONT, fontSize: 12, color: '#065F46', fontWeight: 600 }}>
              Join 3,412 students from top campuses nationwide stepping out of the crowd today.
            </span>
          </div>
        </div>

        {/* Hero Card Preview */}
        <div style={{
          marginTop: 56, maxWidth: 560, width: '100%',
          background: CARD, borderRadius: 16, boxShadow: SHADOW_LG, padding: '24px',
          textAlign: 'left', opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.5s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
            <div>
              <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>The Agent is working for you</p>
              <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, margin: 0 }}>Updated just now</p>
            </div>
            <div style={{ marginLeft: 'auto', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: GREEN }}>Live</span>
            </div>
          </div>
          {PROOF_CALLOUTS.map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < PROOF_CALLOUTS.length - 1 ? `1px solid #F1F5F9` : 'none' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: GREEN }}>✓</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0, fontWeight: 500 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── APP SHOWCASE ── */}
      <AppShowcase />

      {/* ── DATA CONTRAST GRID (moved above fold) ── */}
      <div style={{ padding: '72px 24px', background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <SectionLabel text="Why the old way isn't working" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 36px', textAlign: 'center' }}>
            The numbers don't lie.
          </h2>
          <style>{`@media (max-width: 640px) { .metrics-grid { flex-direction: column !important; } }`}</style>
          <div className="metrics-grid" style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#991B1B', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>❌ The Old Way — Blind Numbers Game</p>
              {[
                { stat: '2%', label: 'Response rate plugging generic resumes into public job boards and praying.' },
                { stat: '40+', label: 'Hours wasted on application screens, spreadsheets, and cover letters written from scratch.' },
                { stat: '~75%', label: 'Of resumes auto-rejected by ATS filters before a human ever reads them.' },
              ].map(({ stat, label }, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#991B1B', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: '#F0FDF4', border: '1px solid #6EE7B7', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#065F46', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>🎉 The Fast Forward Sprint — The Inside Track</p>
              {[
                { stat: '18%+', label: 'Response rate via unadvertised portals and direct warm alumni introductions.' },
                { stat: '4 hrs', label: 'Total — the Agent automates tracking, sources internal leads, and drafts outreach for you.' },
                { stat: '100%', label: 'Verified campus network routing — every connection is a real school-matched insider.' },
              ].map(({ stat, label }, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#065F46', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CAMPUS VAULT WIDGET (replaces 6-box feature grid) ── */}
      <CampusVaultWidget go={go} onSchoolSelect={launchWithSchool} FONT={FONT} TEXT={TEXT} TEXT2={TEXT2} TEXT3={TEXT3} CARD={CARD} BG={BG} BLUE={BLUE} BLUE_LIGHT={BLUE_LIGHT} BLUE_BORDER={BLUE_BORDER} GREEN={GREEN} GREEN_LIGHT={GREEN_LIGHT} GREEN_BORDER={GREEN_BORDER} SHADOW={SHADOW} SHADOW_MD={SHADOW_MD} R={R} />

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionLabel text="What the Agent does for you" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 36px', textAlign: 'center' }}>
            One scan. Your entire edge, unlocked.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { emoji: '🗂️', title: 'Zero Application Chaos', desc: 'Your entire search timeline, tailored assets, and response notes beautifully organized in one workspace. No messy spreadsheets, no lost tracking lines.' },
              { emoji: '🚀', title: 'Bypass the Masses', desc: 'Skip the public portals entirely. Route your custom profile straight into exclusive, unlisted job tracks hidden from the generic campus pile.' },
              { emoji: '🔑', title: 'The 10x Inside Track', desc: 'Stop cold messaging strangers on LinkedIn. CliFF aligns your assets directly with verified parent and insider channels ready to pull you in.' },
              { emoji: '⚡', title: 'Prepared to Win Quickly', desc: 'Get role-specific practice tracks, asset customization, and high-velocity outreach lines engineered to land responses fast.' },
            ].map((item, i) => (
              <div key={i} style={{ background: BG, borderRadius: R, padding: '22px 20px', boxShadow: SHADOW, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>{item.emoji}</span>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{item.title}</p>
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#0F172A', borderRadius: R, padding: '20px 28px', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 1.6vw, 16px)', fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.5 }}>
              💬 <span style={{ color: GREEN }}>"I was overwhelmed applying everywhere. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks."</span> — Marcus, Penn State '27
            </p>
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Students like you" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 36px', textAlign: 'center' }}>
            Real results. Real students.
          </h2>
          <StoriesCarousel />
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, textAlign: 'center', margin: '24px 0 0', lineHeight: 1.7 }}>
            Students use CFF to stay organized, reduce stress, and move through the search with more traction.
          </p>
        </div>
      </div>



      {/* ── PRICING ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Pricing" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 40px', textAlign: 'center' }}>
            One focused sprint.<br />Real results.
          </h2>

          {/* Sprint Card */}
          <div style={{ background: CARD, borderRadius: 16, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', border: `1px solid ${BLUE_BORDER}`, position: 'relative' }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <span style={{ fontSize: 12 }}>🎓</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Graduation Sprint Plan</span>
            </div>

            {/* Comparison badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 100, padding: '5px 14px', marginBottom: 20, marginLeft: 8 }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: '#92400E' }}>Less than a single delivery meal for 14 days</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 52, fontWeight: 800, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>$4.99</span>
              <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT3, fontWeight: 400 }}>/week</span>
            </div>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 28px' }}>
              Billed monthly ($19.96) · Cancel in 1-tap anytime
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, color: GREEN, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{f}</p>
                </div>
              ))}
            </div>

            <CTAButton label="⚡ Check My ATS Match Score" fullWidth />
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, textAlign: 'center', margin: '14px 0 0' }}>
              No credit card required to start.
            </p>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: '88px 24px 72px', textAlign: 'center', background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Ready to escape the black hole?" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Search Smarter,<br />
            <span style={{ color: BLUE }}>Not Harder.</span>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 32px', lineHeight: 1.7 }}>
            Join 2,400+ students who stopped applying blindly and started getting results.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <CTAButton label="⚡ Optimize My Resume File" />
          </div>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0 }}>No credit card required to start.</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: '28px 24px', textAlign: 'center', background: CARD }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT2}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0 }}>
          © {new Date().getFullYear()} College Fast Forward · Helping students land faster with less stress.
        </p>
      </div>
    </div>
  );
}