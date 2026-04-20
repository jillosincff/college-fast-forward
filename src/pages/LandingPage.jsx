import React, { useState, useEffect, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';

const dm = "'DM Sans', system-ui, sans-serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const WINS = [
  { emoji: '🎉', text: 'Got a reply from a Goldman alum in 2 days', school: 'UF · Finance' },
  { emoji: '💼', text: 'Landed my internship through a parent intro', school: 'OSU · Marketing' },
  { emoji: '🚀', text: 'Had 3 coffee chats set up in my first week', school: 'USC · Tech' },
  { emoji: '✉️', text: 'FastIQ wrote my outreach — got a 60% reply rate', school: 'UGA · Consulting' },
];

const STEPS = [
  { icon: '🏫', title: 'Free network at your school', desc: 'Parents & alumni who actually want to help — not a cold job board.' },
  { icon: '📝', title: 'Post what you need', desc: 'Looking for a referral, mock interview, or just advice? Say it.' },
  { icon: '🤝', title: 'Get warm intros', desc: 'Real humans reach out. Skip the applicant pile.' },
  { icon: '⚡', title: 'FastIQ turbocharges it', desc: 'AI finds alumni, writes your outreach, preps you for the interview.' },
];

const FASTIQ_FEATURES = [
  { icon: '🔍', label: 'Alumni Search', desc: 'Find anyone at your target companies' },
  { icon: '✉️', label: 'Smart Outreach', desc: 'AI drafts messages that actually get replies' },
  { icon: '📄', label: 'Resume Tailoring', desc: 'Rewrite for any role in 30 seconds' },
  { icon: '🎤', label: 'Mock Interviews', desc: 'Practice with real AI feedback' },
  { icon: '📊', label: 'Company Intel', desc: 'Know who's actually hiring right now' },
  { icon: '🗺️', label: 'Daily Action Plan', desc: 'AI tells you exactly what to do next' },
];

const FAQS = [
  { q: "Is the network actually free?", a: "Yes — 100% free for parents and alumni, forever. No membership fee, no catch. FastIQ is the optional AI upgrade for students." },
  { q: "What's FastIQ?", a: "FastIQ is AI that searches alumni at your target companies, drafts personalized outreach, tailors your resume, runs mock interviews, and tells you exactly what to do next. It supercharges the free network." },
  { q: "How does the 7-day trial work?", a: "Sign up, start using FastIQ — no credit card needed. After 7 days, it's $14.50/mo (Founding Rate until April 30, then $29/mo). Cancel anytime." },
  { q: "Can my parents pay for FastIQ?", a: "Yes. Either you or a parent can unlock it. Parents can gift FastIQ directly from their account." },
  { q: "What schools are in the network?", a: "15+ universities and growing. UF, Ohio State, USC, UGA, Penn State, and more. Any school can join." },
  { q: "I'm alumni — can I join to help?", a: "Absolutely. Alumni are a huge part of the network. Students specifically search for alumni at their target companies." },
];

function Countdown({ timeLeft }) {
  if (!timeLeft) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#c9a84c', fontFamily: dm }}>
      ⏱ {timeLeft} left at this price
    </span>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, minHeight: 'auto',
      }}>
        <span style={{ fontFamily: dm, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: '#E85D20', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 18px', paddingRight: 24 }}>{a}</p>}
    </div>
  );
}

// Animated typing effect for the hero
function TypingDemo() {
  const messages = [
    "Hey [Alumni Name], I'm a junior at UF studying finance...",
    "I saw you worked at Goldman — I'd love 15 minutes...",
    "FastIQ drafted this. Sent. ✓ Reply in 18 hours.",
  ];
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const full = messages[lineIdx];
    if (typing) {
      if (text.length < full.length) {
        timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 28);
      } else {
        timeout = setTimeout(() => setTyping(false), 1400);
      }
    } else {
      timeout = setTimeout(() => {
        setText('');
        setLineIdx((lineIdx + 1) % messages.length);
        setTyping(true);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [text, typing, lineIdx]);

  const colors = ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.7)', '#4ade80'];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '20px 20px', maxWidth: 400, margin: '0 auto',
      fontFamily: dm, fontSize: 14, lineHeight: 1.6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FastIQ live</span>
      </div>
      <p style={{ color: colors[lineIdx], margin: 0, minHeight: 44, lineHeight: 1.55 }}>
        {text}<span style={{ opacity: typing ? 1 : 0, color: '#E85D20' }}>|</span>
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showFoundingBanner, setShowFoundingBanner] = useState(true);
  const [activeWin, setActiveWin] = useState(0);

  useEffect(() => {
    if (!document.getElementById('lp-fonts')) {
      const link = document.createElement('link');
      link.id = 'lp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap';
      document.head.appendChild(link);
    }
    sessionStorage.removeItem('oauth_redirect_in_progress');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_error') === 'timeout') {
      toast.error('Sign-in timed out. Please try again.', { duration: 6000 });
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
    setMounted(true);

    const updateCountdown = () => {
      const diff = FOUNDING_DEADLINE - new Date();
      if (diff <= 0) { setTimeLeft(''); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else setTimeLeft(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const t1 = setInterval(updateCountdown, 30000);
    const t2 = setInterval(() => setActiveWin(w => (w + 1) % WINS.length), 3000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;

  const onStudentJoin = () => {
    trackEvent('cta_student_clicked');
    localStorage.setItem('pending_intent', 'seeker');
    base44.auth.redirectToLogin(window.location.origin + '/#GatorWelcome');
  };

  const onParentJoin = () => {
    trackEvent('cta_parent_clicked');
    localStorage.setItem('pending_intent', 'helper');
    base44.auth.redirectToLogin(window.location.origin + '/#GatorWelcome');
  };

  const fade = { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.6s ease' };

  return (
    <>
      <FoundingMemberBanner show={showFoundingBanner} onUpgrade={() => navigate('GetStarted')} onDismiss={() => setShowFoundingBanner(false)} />
      <SocialMetaTags
        title="College Fast Forward — Stop cold-applying. Get warm intros + FastIQ AI."
        description="Free parent & alumni network at your school. FastIQ AI turns connections into interviews and jobs. 7-day free trial, no credit card needed."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: dm, position: 'relative', overflowX: 'hidden' }}>

        {/* Ambient gradients */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(232,93,32,0.12) 0%, transparent 60%),
                       radial-gradient(ellipse 40% 30% at 80% 60%, rgba(0,33,165,0.08) 0%, transparent 50%)` }} />

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E85D20', boxShadow: '0 0 10px rgba(232,93,32,0.7)' }} />
            <span style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>CFF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontFamily: dm, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 4px' }}>Sign in</button>
            <button onClick={onStudentJoin} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto' }}>
              Try free →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '60px 20px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>

          {/* Social proof pill */}
          <div style={{ ...fade, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', letterSpacing: '0.06em' }}>1,000+ parents & alumni ready to help</span>
          </div>

          {/* Main headline */}
          <h1 style={{
            ...fade, transition: 'all 0.6s ease 0.1s',
            fontSize: 'clamp(30px, 7vw, 52px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px',
          }}>
            Stop cold-applying.<br />
            <span style={{ color: '#E85D20' }}>Get warm intros</span> from<br />
            real people at your school.
          </h1>

          <p style={{
            ...fade, transition: 'all 0.6s ease 0.2s',
            fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 32px',
          }}>
            Free parent & alumni network + FastIQ AI that turns connections into interviews. No BS.
          </p>

          {/* CTAs */}
          <div style={{ ...fade, transition: 'all 0.6s ease 0.3s', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <button onClick={onStudentJoin} style={{
              fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff',
              background: 'linear-gradient(135deg, #E85D20, #ff7b42)',
              border: 'none', borderRadius: 14, padding: '17px 32px', cursor: 'pointer',
              width: '100%', maxWidth: 380, minHeight: 'auto',
              boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
              letterSpacing: '-0.01em',
            }}>
              🎓 I'm a student — Try FastIQ free (7 days)
            </button>
            <button onClick={onParentJoin} style={{
              fontFamily: dm, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '15px 32px', cursor: 'pointer',
              width: '100%', maxWidth: 380, minHeight: 'auto',
            }}>
              🤝 I'm a parent/alumni — Join free to help
            </button>
          </div>

          {/* Urgency + no CC */}
          <div style={{ ...fade, transition: 'all 0.6s ease 0.4s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {foundingActive && <Countdown timeLeft={timeLeft} />}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No credit card needed · Cancel anytime</span>
            {foundingActive && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Founding Rate $14.50/mo → goes to $29 after April 30</span>}
          </div>

          {/* Typing demo */}
          <div style={{ ...fade, transition: 'all 0.6s ease 0.5s', marginTop: 40 }}>
            <TypingDemo />
          </div>

          {/* Stats row */}
          <div style={{ ...fade, transition: 'all 0.6s ease 0.6s', display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36, flexWrap: 'wrap' }}>
            {[['1,000+', 'helpers'], ['15+', 'schools'], ['50+', 'industries']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#E85D20', letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WINS TICKER ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 56px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 20px', minHeight: 80, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{WINS[activeWin].emoji}</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>"{WINS[activeWin].text}"</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{WINS[activeWin].school}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {WINS.map((_, i) => (
              <button key={i} onClick={() => setActiveWin(i)} style={{
                width: i === activeWin ? 20 : 6, height: 6, borderRadius: 3,
                background: i === activeWin ? '#E85D20' : 'rgba(255,255,255,0.15)',
                border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 28px' }}>
            From zero to interview<br />in days, not months.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
                <div style={{
                  marginLeft: 'auto', flexShrink: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#E85D20',
                }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FREE vs FASTIQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 24px' }}>
            Free for helpers.<br />Turbo for students.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Free */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 20px' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>🏫</div>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Free Network</p>
              <p style={{ fontFamily: dm, fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>$0</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: '0 0 16px' }}>Parents & alumni join free. Help students at your school.</p>
              <button onClick={onParentJoin} style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', width: '100%', minHeight: 'auto' }}>
                Join free →
              </button>
            </div>
            {/* FastIQ */}
            <div style={{ background: 'rgba(232,93,32,0.06)', border: '2px solid rgba(232,93,32,0.3)', borderRadius: 18, padding: '24px 20px', position: 'relative' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -10, right: 12 }}>
                  <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#c9a84c', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🏅 Founding</span>
                </div>
              )}
              <div style={{ fontSize: 24, marginBottom: 10 }}>⚡</div>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>FastIQ AI</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                <p style={{ fontFamily: dm, fontSize: 30, fontWeight: 800, color: '#E85D20', margin: 0 }}>{foundingActive ? '$14.50' : '$29'}</p>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
              </div>
              {foundingActive && <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 10px' }}>$29 after April 30</p>}
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: '0 0 16px' }}>AI that finds intros, writes outreach, and preps you to win.</p>
              <button onClick={onStudentJoin} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.3)' }}>
                Try 7 days free →
              </button>
            </div>
          </div>
          <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '14px 0 0' }}>
            No credit card for trial · Cancel anytime
          </p>
        </div>

        {/* ── FASTIQ FEATURES ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>FastIQ unlocks</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 24px' }}>
            Everything your job search<br />is missing.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FASTIQ_FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 16px' }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: '8px 0 4px' }}>{f.label}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PARENT / ALUMNI SECTION ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>Parents & Alumni</p>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 14px' }}>
              One intro from you<br />can change everything.
            </h2>
            <p style={{ fontFamily: dm, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 8px' }}>
              You've built a network. Students at your school are looking for exactly what you know. Joining is free and takes 2 minutes.
            </p>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 24px' }}>
              You help one student → their parents help yours. That's the whole thing.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onParentJoin} style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '13px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.3)' }}>
                Join free →
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {['No fee ever', 'No obligation', '2 min setup'].map(t => (
                  <span key={t} style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>✓ {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQs</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 24px' }}>Got questions?</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 80px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(232,93,32,0.12) 0%, rgba(0,33,165,0.08) 100%)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 24, padding: '48px 24px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 7vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 14px' }}>
              Your next opportunity<br />is one intro away.
            </h2>
            <p style={{ fontFamily: dm, fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 380 }}>
              Students: start your free trial. Parents & alumni: join the network. No credit card. No BS.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button onClick={onStudentJoin} style={{
                fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff',
                background: 'linear-gradient(135deg, #E85D20, #ff7b42)',
                border: 'none', borderRadius: 14, padding: '17px 36px', cursor: 'pointer',
                width: '100%', maxWidth: 360, minHeight: 'auto',
                boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
              }}>
                🎓 Try FastIQ free — 7 days
              </button>
              <button onClick={onParentJoin} style={{
                fontFamily: dm, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '15px 36px', cursor: 'pointer',
                width: '100%', maxWidth: 360, minHeight: 'auto',
              }}>
                🤝 Join as parent/alumni — free
              </button>
              {foundingActive && (
                <div style={{ marginTop: 4 }}>
                  <Countdown timeLeft={timeLeft} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 College Fast Forward</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#Terms" style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Terms</a>
            <a href="#Privacy" style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;