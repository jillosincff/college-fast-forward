import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';

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
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('slp-inter')) {
      const link = document.createElement('link');
      link.id = 'slp-inter';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const go = () => setShowOnboarding(true);

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  const SectionLabel = ({ text }) => (
    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>{text}</p>
  );

  const CTAButton = ({ label, onClick = go, variant = 'primary', fullWidth = false }) => {
    const isPrimary = variant === 'primary';
    const isGreen = variant === 'green';
    return (
      <button onClick={onClick} style={{
        fontFamily: FONT,
        fontSize: 15, fontWeight: 700,
        color: '#fff',
        background: isGreen
          ? `linear-gradient(to bottom, ${GREEN}, #059669)`
          : isPrimary
            ? `linear-gradient(to bottom, ${BLUE}, #0052CC)`
            : '#F1F5F9',
        border: isPrimary || isGreen ? 'none' : `1px solid #E2E8F0`,
        borderRadius: 8,
        padding: '16px 36px',
        cursor: 'pointer', minHeight: 'auto',
        transition: 'all 0.2s ease',
        boxShadow: isPrimary
          ? '0 8px 24px rgba(0,102,255,0.3)'
          : isGreen
            ? '0 8px 24px rgba(16,185,129,0.3)'
            : 'none',
        width: fullWidth ? '100%' : 'auto',
        color: isPrimary || isGreen ? '#fff' : TEXT2,
      }}
        onMouseEnter={e => {
          if (isPrimary || isGreen) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isPrimary ? '0 14px 32px rgba(0,102,255,0.4)' : '0 14px 32px rgba(16,185,129,0.4)'; }
          else { e.currentTarget.style.background = '#E2E8F0'; }
        }}
        onMouseLeave={e => {
          if (isPrimary || isGreen) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isPrimary ? '0 8px 24px rgba(0,102,255,0.3)' : '0 8px 24px rgba(16,185,129,0.3)'; }
          else { e.currentTarget.style.background = '#F1F5F9'; }
        }}
      >{label}</button>
    );
  };

  return (
    <div style={{ background: BG, fontFamily: FONT, color: TEXT, overflowX: 'hidden' }}>
      {showOnboarding && <OnboardingFlow onClose={() => setShowOnboarding(false)} />}

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
          >Get Started →</button>
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

        <h1 style={{
          fontFamily: FONT, fontSize: 'clamp(36px, 7vw, 80px)',
          fontWeight: 800, color: TEXT, lineHeight: 1.05, letterSpacing: '-0.03em',
          margin: '0 0 8px', maxWidth: 820,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease 0.1s',
        }}>
          Job Boards Are a<br />
          <span style={{ color: BLUE }}>Black Hole.</span>
        </h1>

        <p style={{
          fontFamily: FONT, fontSize: 'clamp(15px, 1.8vw, 19px)',
          fontWeight: 400, color: TEXT2,
          lineHeight: 1.7, maxWidth: 560, margin: '20px auto 36px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.2s',
        }}>
          Don't get sucked in. College Fast Forward gives you the tools to get seen, get interviewed, and get hired — without the chaos.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
          <CTAButton label="Get My Career Plan →" />
          <button onClick={() => {}} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, color: TEXT2, background: CARD, border: `1px solid #E2E8F0`, borderRadius: 8, padding: '16px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: SHADOW }}>Watch 45-sec demo</button>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}>
          No credit card required · Built for students at UF, UCF, Penn State, USC &amp; more
        </p>

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

      {/* ── PROBLEM STRIP ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '72px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel text="You are not alone" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            Applying shouldn't feel<br />this exhausting.
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.6vw, 17px)', color: TEXT2, lineHeight: 1.75, margin: '0 auto', maxWidth: 520 }}>
            Students are sending hundreds of applications, getting ghosted, and burning out. We built a smarter system so you don't have to do it all manually.
          </p>
        </div>
      </div>

      {/* ── BENEFIT CARDS ── */}
      <div style={{ padding: '80px 24px', maxWidth: 980, margin: '0 auto' }}>
        <SectionLabel text="Why students use College Fast Forward" />
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.2 }}>
          Everything you need to get hired.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {BENEFIT_CARDS.map((card, i) => (
            <div key={i} style={{
              background: CARD, borderRadius: R, boxShadow: SHADOW,
              padding: '24px',
              border: i === 0 ? `1.5px solid ${BLUE_BORDER}` : 'none',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_MD; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{card.icon}</div>
              <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{card.title}</p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.7 }}>{card.desc}</p>
              {i === 0 && (
                <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 8, padding: '10px 12px', marginTop: 14 }}>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#059669', margin: 0, fontWeight: 500, fontStyle: 'italic' }}>"This alone saved me hours." — UF '26</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="How it works" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 48px', textAlign: 'center' }}>
            One Agent. Everything organized.<br />Real progress.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.number} style={{ background: BG, borderRadius: R, padding: '28px 24px', position: 'relative', overflow: 'hidden', boxShadow: SHADOW }}>
                <div style={{ position: 'absolute', top: -12, right: 12, fontSize: 64, opacity: 0.06, lineHeight: 1, fontWeight: 800, pointerEvents: 'none', color: BLUE }}>{step.number}</div>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{step.icon}</div>
                <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Step {step.number}</p>
                <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{step.title}</p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: R, padding: '20px 28px', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 17px)', fontWeight: 600, color: BLUE, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
              💡 "The Agent handles the chaos so you can focus on getting hired."
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
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <SectionLabel text="Pricing" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 48px', textAlign: 'center' }}>
            Choose your advantage.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Free */}
            <div style={{ background: BG, borderRadius: R, padding: '32px 28px', boxShadow: SHADOW }}>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>FREE</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>$0</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 24px' }}>The Foundation</p>
              {FREE_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEXT3 }} />
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>{f}</p>
                </div>
              ))}
              <button onClick={go} style={{ marginTop: 24, width: '100%', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT, background: CARD, border: `1px solid #E2E8F0`, borderRadius: 8, padding: '14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s', boxShadow: SHADOW }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = CARD}
              >Start free</button>
            </div>

            {/* Pro */}
            <div style={{ background: CARD, borderRadius: R, padding: '32px 28px', boxShadow: SHADOW_MD, border: `2px solid ${BLUE_BORDER}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 16, background: BLUE, borderRadius: 6, padding: '4px 12px' }}>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RECOMMENDED</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>ACCELERATOR</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>$29</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT3 }}>/mo</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 24px' }}>The Accelerator</p>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 8, color: GREEN, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{f}</p>
                </div>
              ))}
              <button onClick={go} style={{ marginTop: 24, width: '100%', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', background: `linear-gradient(to bottom, ${BLUE}, #0052CC)`, border: 'none', borderRadius: 8, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 20px rgba(0,102,255,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,102,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.3)'; }}
              >Start free, upgrade anytime →</button>
            </div>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, textAlign: 'center', margin: '20px 0 0' }}>
            Cancel anytime. No credit card required to get started.
          </p>
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
          <button onClick={go} style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff',
            background: `linear-gradient(to bottom, ${GREEN}, #059669)`,
            border: 'none', borderRadius: 8, padding: '20px 52px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
            display: 'block', margin: '0 auto 16px', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
          >
            Get My Free Career Plan →
          </button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0 }}>Built for students. No credit card required.</p>
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