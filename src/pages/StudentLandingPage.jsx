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
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';
const SHADOW_LG = '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)';
const R = 12;

const STORIES = [
  { quote: "I activated my sprint plan on a Monday. By Thursday I had an alumni from my school at Google send my resume directly to the hiring manager. Never would've happened on LinkedIn alone.", name: "Rachel B.", school: "FSU '26 · Got hired at Nexo Agency within 9 days", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=face", tag: "Direct internal referral", accent: '#0066FF' },
  { quote: "I stopped spraying applications everywhere. The backdoor pipeline showed me 3 unadvertised roles at agencies I actually wanted. Got an offer from one 2 weeks later.", name: "Marcus T.", school: "Penn State '27 · Finance → Wealth Management", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=96&h=96&fit=crop&crop=face", tag: "Unadvertised role landed", accent: '#10B981' },
  { quote: "The pre-written outreach message they generated for me got a 100% reply rate from the 3 alumni it sent to. All 3 replied within 48 hours. That never happened with my own cold messages.", name: "Alex P.", school: "USC '25 · Marketing", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", tag: "3/3 alumni replied in 48h", accent: '#7C3AED' },
];

const FREE_FEATURES = ['Basic resume tools', 'Limited Agent usage', 'Application tracker', 'Perfect for getting started'];
const PRO_FEATURES = ['Unlimited AI Agent', 'Advanced tailoring + modern templates', 'Smart reminders + interview prep', 'Most students upgrade once they see results'];

// ── ATS Toggle Preview Component ──────────────────────────────
function ATSTogglePreview() {
  const [optimized, setOptimized] = useState(false);
  const [animating, setAnimating] = useState(false);
  const score = optimized ? 97 : 18;
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (score / 100) * circumference;

  const toggle = () => {
    setAnimating(true);
    setTimeout(() => { setOptimized(o => !o); setAnimating(false); }, 150);
  };

  return (
    <div style={{ background: CARD, borderRadius: 20, boxShadow: SHADOW_LG, padding: '28px 24px', border: `1px solid #E2E8F0`, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>ATS Match Score</p>
        <button onClick={toggle} style={{
          fontFamily: FONT, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', borderRadius: 100,
          padding: '6px 14px', minHeight: 'auto', transition: 'all 0.2s',
          background: optimized ? GREEN_LIGHT : '#FEF2F2',
          color: optimized ? GREEN : '#EF4444',
        }}>
          {optimized ? '✅ Optimized Profile' : '❌ Current Resume'} — Switch
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', transition: 'all 0.6s ease', opacity: animating ? 0.4 : 1 }}>
            <circle cx="55" cy="55" r="46" fill="none" stroke="#F1F5F9" strokeWidth="10" />
            <circle cx="55" cy="55" r="46" fill="none"
              stroke={score >= 80 ? GREEN : score >= 50 ? '#F97316' : '#EF4444'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, color: score >= 80 ? GREEN : '#EF4444', letterSpacing: '-0.04em', lineHeight: 1, transition: 'color 0.4s' }}>{score}</span>
            <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3, fontWeight: 600 }}>/ 100</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {optimized ? (
            <>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: GREEN, margin: '0 0 6px' }}>97% ATS Match 🎉</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 10px', lineHeight: 1.6 }}>Your resume passes every automated filter. Recruiters see it.</p>
              {['Keywords injected', 'Format ATS-safe', 'Tailored to role'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: GREEN, fontSize: 11, fontWeight: 700 }}>✓</span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT2 }}>{t}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#EF4444', margin: '0 0 6px' }}>18% ATS Match 😬</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 10px', lineHeight: 1.6 }}>Your resume is invisible. Automated filters reject it before a human sees it.</p>
              {['Missing keywords', 'Wrong format', 'Generic content'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#EF4444', fontSize: 11, fontWeight: 700 }}>✗</span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT2 }}>{t}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '16px 0 0', textAlign: 'center', fontStyle: 'italic' }}>
        Tap "Switch" to see what CFF does to your resume automatically.
      </p>
    </div>
  );
}

// ── Backdoor Card Preview ──────────────────────────────────────
function BackdoorPreviewCard() {
  return (
    <div style={{ background: CARD, borderRadius: 20, boxShadow: SHADOW_LG, border: `1.5px solid ${BLUE_BORDER}`, overflow: 'hidden', maxWidth: 440, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BLUE_LIGHT}, #F0FDF4)`, padding: '16px 20px', borderBottom: `1px solid #E2E8F0` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, animation: 'blink 1.5s infinite' }} />
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Internal Signal</span>
          <span style={{ marginLeft: 'auto', fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 100, padding: '2px 8px' }}>Not on Job Boards</span>
        </div>
      </div>

      {/* Job info */}
      <div style={{ padding: '18px 20px 14px' }}>
        <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Brand Marketing Manager</p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px' }}>Spotify · New York, NY · Hybrid</p>

        {/* Alumni connection */}
        <div style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: BLUE, margin: '0 0 8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎓 Alumni Insider from Your School</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${BLUE_BORDER}`, flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=72&h=72&fit=crop&crop=face" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Sarah K. · Marketing Director</p>
              <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, margin: 0 }}>UF '19 · 94% LinkedIn reply rate</p>
            </div>
            <div style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>→</div>
          </div>
        </div>

        {/* Frosted outreach */}
        <div style={{ position: 'relative' }}>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: `1px solid #E2E8F0`, filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT, margin: '0 0 6px', fontWeight: 600 }}>Hi Sarah — I noticed you went to UF too...</p>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.5 }}>I'm a junior studying Marketing and saw the Brand Manager opening at Spotify. Given your path from UF into the industry, I'd love to hear your perspective on...</p>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', borderRadius: 10 }}>
            <div style={{ background: CARD, border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: SHADOW_MD }}>
              <span style={{ fontSize: 13 }}>🔒</span>
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: BLUE }}>Unlock pre-written outreach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Alumni vs Cold Bar Chart ───────────────────────────────────
function AlumniDataChart() {
  return (
    <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '28px 24px', border: `1px solid #E2E8F0` }}>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 24px', textAlign: 'center' }}>Response Rate Comparison</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 48, height: 160, marginBottom: 16 }}>
        {/* Cold bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: 52, height: 16, borderRadius: '4px 4px 0 0', background: '#E2E8F0' }}>
            <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3 }}>1%</span>
          </div>
        </div>
        {/* Alumni bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: 72, height: 140, borderRadius: '8px 8px 0 0', background: `linear-gradient(to top, #059669, ${BLUE})`, boxShadow: `0 8px 24px rgba(0,102,255,0.22)` }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: FONT, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>10x</span>
            <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE }}>10%</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '2px solid #E2E8F0', marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: TEXT3, margin: 0, textAlign: 'center' }}>Cold<br />Connections</p>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, margin: 0, textAlign: 'center' }}>Alumni<br />Connections</p>
      </div>
    </div>
  );
}

// ── Stories Carousel ───────────────────────────────────────────
function StoriesCarousel({ go }) {
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
          borderLeft: `4px solid ${s.accent}`,
          padding: '28px 28px 24px', cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.06}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 180, position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '4px 12px', marginBottom: 14 }}>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: s.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 17px)', fontWeight: 500, color: TEXT, lineHeight: 1.75, margin: '0 0 20px', fontStyle: 'italic' }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: `2px solid ${BLUE_BORDER}` }}>
            <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{s.name}</p>
            <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT2, margin: 0 }}>{s.school}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
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
  const [signalCount] = useState(14);

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

  return (
    <div style={{ background: BG, fontFamily: FONT, color: TEXT, overflowX: 'hidden' }}>
      {showOnboarding && <OnboardingFlow onClose={() => setShowOnboarding(false)} />}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,102,255,0.15)} 50%{box-shadow:0 0 0 8px rgba(0,102,255,0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes signalPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.3)} 50%{box-shadow:0 0 0 8px rgba(16,185,129,0)} }
        @media (max-width:768px) {
          .hero-split { flex-direction: column !important; }
          .hero-right { display: none !important; }
        }
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

      {/* ── HERO: SPLIT SCREEN ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 24px 60px',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 50%, #F8FAFC 100%)',
      }}>
        <div className="hero-split" style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 60 }}>

          {/* LEFT: Copy */}
          <div style={{ flex: 1, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            {/* Social proof strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ display: 'flex' }}>
                {[
                  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
                ].map((src, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid #fff`, overflow: 'hidden', marginLeft: i === 0 ? 0 : -8, position: 'relative', zIndex: 4 - i }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, fontWeight: 500 }}>
                Joined by <strong style={{ color: TEXT }}>2,400+</strong> students
              </span>
            </div>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 13 }}>🚪</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Backdoor Access</span>
            </div>

            <h1 style={{ fontFamily: FONT, fontSize: 'clamp(38px, 5.5vw, 76px)', fontWeight: 800, color: TEXT, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
              The Front Door<br />is Clogged.<br />
              <span style={{ color: GREEN }}>Take the Backdoor.</span>
            </h1>

            <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.5vw, 17px)', color: TEXT2, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 520 }}>
              98% of college applications get swallowed by automated corporate filters. College Fast Forward bypasses the queues, surfaces non-advertised roles, and automatically hooks you up with alumni insiders who can refer you.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <button onClick={go} style={{
                fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff',
                background: `linear-gradient(to bottom, ${GREEN}, #059669)`,
                border: 'none', borderRadius: 10, padding: '18px 36px',
                cursor: 'pointer', minHeight: 'auto',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                transition: 'all 0.2s ease', animation: 'signalPulse 3s infinite',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
              >
                Access the Backdoor →
              </button>
              <button onClick={() => {}} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: TEXT2, background: CARD, border: `1px solid #E2E8F0`, borderRadius: 10, padding: '18px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: SHADOW }}>
                Watch 45-sec demo
              </button>
            </div>

            {/* Live signal counter */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '10px 18px', boxShadow: SHADOW }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, animation: 'blink 1.5s infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: GREEN }}>⚡ {signalCount} active internal signals detected in your region this morning</span>
            </div>

            <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '14px 0 0' }}>
              No credit card required · Built for students at UF, UCF, Penn State, USC &amp; more
            </p>
          </div>

          {/* RIGHT: Floating UI asset */}
          <div className="hero-right" style={{ flex: '0 0 auto', width: 440, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
            <BackdoorPreviewCard />
          </div>
        </div>
      </div>

      {/* ── PROBLEM STRIP ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel text="The reality" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            98% of applications get<br />filtered before a human sees them.
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.6vw, 17px)', color: TEXT2, lineHeight: 1.75, margin: '0 auto', maxWidth: 520 }}>
            You're not failing. The system is broken. Automated filters, ghost jobs, and closed networks block most students before they even get a chance.
          </p>
        </div>
      </div>

      {/* ── BACKDOOR ECOSYSTEM SECTION ── */}
      <div style={{ padding: '88px 24px', maxWidth: 1040, margin: '0 auto' }}>
        <SectionLabel text="The Flagship System" />
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.1 }}>
          Stop Applying to 500-Applicant Postings.
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.6vw, 18px)', color: TEXT2, textAlign: 'center', margin: '0 auto 56px', maxWidth: 600, lineHeight: 1.7 }}>
          Access Unadvertised Internal Pipelines.
        </p>

        {/* Block 1: ATS Shield */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'center', marginBottom: 48 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 100, padding: '4px 14px', marginBottom: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EF4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Block 1 · ATS Shield</span>
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              The Automated 98% ATS Shield
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.75, margin: '0 0 20px' }}>
              Your current resume is invisible to automated filters. Toggle between your current profile and the CFF-optimized version to see the difference live.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Keyword injection for every specific role', 'ATS-safe formatting applied automatically', 'Score jumps from ~18% → 97% in seconds'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: GREEN, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
          <ATSTogglePreview />
        </div>

        {/* Block 2 & 3: Backdoor Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'center', marginBottom: 48 }}>
          <BackdoorPreviewCard />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '4px 14px', marginBottom: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Block 2 · Institutional Backdoor</span>
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              The Internal Portal Crawler + Alumni Bridge
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.75, margin: '0 0 20px' }}>
              We crawl hidden company career APIs for unadvertised roles, match them to alumni from your exact school who work there, then auto-generate a pre-written outreach message — with a frosted preview to keep it exclusive.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Hidden roles not on LinkedIn or Indeed', 'Alumni insider matched from your school', 'Pre-written message with 10x reply rate'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: BLUE, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ALUMNI DATA ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionLabel text="The data is clear" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 40px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 12px', textAlign: 'center' }}>
            Double Down on the Alumni Advantage.
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.5vw, 17px)', color: TEXT2, textAlign: 'center', lineHeight: 1.75, margin: '0 auto 40px', maxWidth: 600 }}>
            Cold applications have a 1% response rate. A warm hand-off from an alum from your school scales your interview probability by <strong style={{ color: TEXT }}>10x</strong>. We do the digging, match the profiles, and write the script for you automatically.
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <AlumniDataChart />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS (ATS Sprint toggle) ── */}
      <div style={{ padding: '80px 24px', maxWidth: 860, margin: '0 auto' }}>
        <SectionLabel text="How it works" />
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 48px', textAlign: 'center' }}>
          One Agent. Everything organized.<br />Real progress.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { number: '01', icon: '🛡️', title: 'Automated ATS Shield', desc: 'Upload once. Every application gets a tailored, recruiter-ready resume that passes every filter.' },
            { number: '02', icon: '🚪', title: 'Internal Pipeline Access', desc: 'We surface unadvertised roles from hidden company APIs — before they hit the public job boards.' },
            { number: '03', icon: '🎓', title: 'Alumni Backdoor Bridge', desc: 'Match to an alum from your school at your target company. We write the message. You send it.' },
          ].map((step) => (
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
          <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 1.8vw, 16px)', fontWeight: 600, color: BLUE, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
            💡 "The Agent handles the chaos so you can focus on getting hired."
          </p>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="Students like you" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 36px', textAlign: 'center' }}>
            Real results. Real students.
          </h2>
          <StoriesCarousel go={go} />
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, textAlign: 'center', margin: '24px 0 0', lineHeight: 1.7 }}>
            Students use CFF to stop sending cold applications into the void — and start getting warm responses through the backdoor.
          </p>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <SectionLabel text="Pricing" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 12px', textAlign: 'center' }}>
            Choose your advantage.
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 auto 40px', maxWidth: 460, lineHeight: 1.7 }}>
            Frame your job search as a sprint, not a slog.
          </p>
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

            {/* Sprint Plan */}
            <div style={{ background: CARD, borderRadius: R, padding: '32px 28px', boxShadow: SHADOW_MD, border: `2px solid ${GREEN_BORDER}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 16, background: GREEN, borderRadius: 6, padding: '4px 12px' }}>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RECOMMENDED</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>GRADUATION SPRINT</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>$4.99</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT3 }}>/week</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>14-Day Sprint Action Plan</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 20px', lineHeight: 1.5 }}>Backdoor signals · Alumni bridge · ATS optimizer</p>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 8, color: GREEN, fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{f}</p>
                </div>
              ))}
              <button onClick={go} style={{ marginTop: 24, width: '100%', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', background: `linear-gradient(to bottom, ${GREEN}, #059669)`, border: 'none', borderRadius: 8, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.3)'; }}
              >Start My 14-Day Sprint →</button>
              <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '12px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
                Cancel anytime. Total cost of a 14-day sprint is less than a single delivery meal — resulting in direct internal referrals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: '88px 24px 72px', textAlign: 'center', background: 'linear-gradient(180deg, #F0FDF4 0%, #EFF6FF 100%)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <SectionLabel text="Ready to take the backdoor?" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4vw, 52px)', fontWeight: 800, color: TEXT, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Stop applying blind.<br />
            <span style={{ color: GREEN }}>Go through the backdoor.</span>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 32px', lineHeight: 1.7 }}>
            Join 2,400+ students who bypassed the queue and landed jobs through warm alumni referrals and unadvertised roles.
          </p>
          <button onClick={go} style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff',
            background: `linear-gradient(to bottom, ${GREEN}, #059669)`,
            border: 'none', borderRadius: 10, padding: '20px 52px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
            display: 'block', margin: '0 auto 12px', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(16,185,129,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
          >
            Access the Backdoor — Free →
          </button>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0 }}>No credit card required · Built for college students</p>
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