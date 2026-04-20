import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const WINS = [
  { emoji: '🎉', text: 'Got a reply from a Goldman alum in 2 days', school: 'UF · Finance · Junior' },
  { emoji: '💼', text: 'Landed my internship through a parent intro', school: 'OSU · Marketing · Senior' },
  { emoji: '🚀', text: 'Had 3 coffee chats booked in my first week', school: 'USC · Tech · Junior' },
  { emoji: '✉️', text: 'FastIQ wrote my outreach — got a 60% reply rate', school: 'UGA · Consulting · Sophomore' },
];

const STEPS = [
  { icon: '🏫', num: '01', title: 'Free network at your school', desc: 'Parents & alumni at 15+ universities who actually want to help. Not a cold job board.' },
  { icon: '📝', num: '02', title: 'Post what you need', desc: 'Referral, mock interview, advice — just say it. Real humans see it.' },
  { icon: '🤝', num: '03', title: 'Get warm intros', desc: 'Skip the applicant pile. Talk to people already inside.' },
  { icon: '⚡', num: '04', title: 'FastIQ turns it into a job', desc: 'AI finds alumni, writes your message, preps you for the interview. You just show up.' },
];

const FASTIQ_FEATURES = [
  { icon: '🔍', label: 'Alumni Search', desc: 'Find anyone at any company in seconds' },
  { icon: '✉️', label: 'Smart Outreach', desc: 'Messages that actually get replied to' },
  { icon: '📄', label: 'Resume Tailoring', desc: 'Role-specific rewrite in 30 seconds' },
  { icon: '🎤', label: 'Mock Interviews', desc: 'Practice with real AI feedback' },
  { icon: '📊', label: 'Company Intel', desc: "Know who's hiring before you apply" },
  { icon: '🗺️', label: 'Daily Action Plan', desc: 'Tells you exactly what to do next' },
];

const FAQS = [
  { q: "Is the network actually free?", a: "Yes — 100% free for parents and alumni, forever. No membership fee, no catch. FastIQ is the optional AI upgrade for students who want to move faster." },
  { q: "What exactly is FastIQ?", a: "FastIQ is AI that searches alumni at your target companies, drafts personalized outreach, tailors your resume for any role, runs mock interviews, and builds your daily action plan. It supercharges the free network." },
  { q: "How does the 7-day trial work?", a: "Sign up and start using FastIQ immediately — no credit card needed. After 7 days, continue at $14.50/mo (Founding Rate until April 30, then $29/mo). Cancel anytime, no questions asked." },
  { q: "Can my parents pay for FastIQ?", a: "Yes. Either you or a parent can unlock it. Parents can gift FastIQ directly from their account — a lot of them do." },
  { q: "What schools are in the network?", a: "15+ universities and growing — UF, Ohio State, USC, UGA, Penn State, and more. If your school isn't listed yet, you can still join and we'll add it." },
  { q: "I'm alumni — can I join to help?", a: "Absolutely. Alumni are huge. Students specifically search for alumni at target companies. Your experience is exactly what they need." },
];

// ── Phone mockup with typing animation ──────────────────────────────────
function PhoneMockup() {
  const messages = [
    { from: 'ai', text: "Hey Alex, I found 3 Goldman alumni at your school who responded to cold outreach last month..." },
    { from: 'ai', text: "Drafting your message now ✍️" },
    { from: 'sent', text: "Hey Sarah, I'm a UF finance junior — I saw you work at Goldman in IBD and would love 15 minutes..." },
    { from: 'reply', text: "Hi! Happy to chat — does Thursday at 2pm work? ✅" },
  ];
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= messages.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown === 1 ? 1200 : shown === 2 ? 900 : 1400);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div style={{
      width: 260, margin: '0 auto',
      background: '#111318', borderRadius: 28, border: '2px solid rgba(255,255,255,0.12)',
      padding: '16px 12px 20px', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      {/* Phone notch */}
      <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, margin: '0 auto 14px' }} />
      {/* App header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#E85D20,#ff9a6c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: dm }}>FastIQ</div>
          <div style={{ fontSize: 9, color: '#4ade80', fontFamily: dm }}>● Live</div>
        </div>
      </div>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 180 }}>
        {messages.slice(0, shown).map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === 'sent' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: m.from === 'sent' ? '#E85D20' : m.from === 'reply' ? '#1a3a1a' : 'rgba(255,255,255,0.07)',
            borderRadius: m.from === 'sent' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
            padding: '8px 10px',
            border: m.from === 'reply' ? '1px solid rgba(74,222,128,0.3)' : 'none',
            animation: 'fadeSlideIn 0.3s ease',
          }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: m.from === 'reply' ? '#4ade80' : '#fff', margin: 0, lineHeight: 1.4, opacity: m.from === 'ai' ? 0.75 : 1 }}>{m.text}</p>
          </div>
        ))}
        {shown < messages.length && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 3, padding: '8px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 3px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>
      {/* Bottom bar */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '7px 12px' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: dm, flex: 1 }}>FastIQ is typing for you...</span>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>→</div>
      </div>
    </div>
  );
}

function Countdown({ timeLeft }) {
  if (!timeLeft) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#c9a84c', fontFamily: dm }}>
      ⏱ {timeLeft} left at $14.50/mo
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
        <span style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: '#E85D20', flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 18px', paddingRight: 20 }}>{a}</p>}
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
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';
      document.head.appendChild(link);
    }

    // Keyframes for phone mockup animations
    if (!document.getElementById('lp-keyframes')) {
      const style = document.createElement('style');
      style.id = 'lp-keyframes';
      style.textContent = `
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dot-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(232,93,32,0.4); } 50% { box-shadow: 0 0 0 8px rgba(232,93,32,0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      `;
      document.head.appendChild(style);
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
    const t2 = setInterval(() => setActiveWin(w => (w + 1) % WINS.length), 3200);
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

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <>
      <FoundingMemberBanner show={showFoundingBanner} onUpgrade={() => navigate('GetStarted')} onDismiss={() => setShowFoundingBanner(false)} />
      <SocialMetaTags
        title="College Fast Forward — Stop cold-applying. Get warm intros + FastIQ AI."
        description="Free parent & alumni network at your school. FastIQ AI turns connections into interviews and jobs. 7-day free trial, no credit card needed."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div style={{ minHeight: '100vh', background: '#07070d', fontFamily: dm, position: 'relative', overflowX: 'hidden' }}>

        {/* Ambient background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -5%, rgba(232,93,32,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 50%, rgba(0,33,165,0.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(74,222,128,0.04) 0%, transparent 50%)
          ` }} />

        {/* ── NAV ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(7,7,13,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E85D20', boxShadow: '0 0 12px rgba(232,93,32,0.8)', animation: 'pulse-glow 2s ease infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>CFF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 4px' }}>Sign in</button>
            <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.35)' }}>
              Try free →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '52px 20px 40px', maxWidth: 620, margin: '0 auto' }}>

          {/* Live badge */}
          <div style={{ ...fadeIn(0), display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '6px 16px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.04em' }}>Real students landing intros & interviews now</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            ...fadeIn(0.08),
            fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.035em', color: '#fff',
            margin: '0 0 20px', textAlign: 'center',
          }}>
            Stop cold-applying.<br />
            <span style={{ color: '#E85D20', WebkitTextStroke: '0px' }}>Get warm intros</span>{' '}
            from real people at your school.
          </h1>

          {/* Subheadline */}
          <p style={{
            ...fadeIn(0.16),
            fontSize: 17, color: 'rgba(255,255,255,0.58)', lineHeight: 1.6,
            maxWidth: 460, margin: '0 auto 32px', textAlign: 'center',
          }}>
            Free parent & alumni network at your school.<br />FastIQ AI turns those connections into real interviews. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>No BS.</strong>
          </p>

          {/* CTAs */}
          <div style={{ ...fadeIn(0.22), display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            <button onClick={onStudentJoin} style={{
              fontSize: 16, fontWeight: 800, color: '#fff',
              background: 'linear-gradient(135deg, #E85D20 0%, #ff7340 100%)',
              border: 'none', borderRadius: 16, padding: '18px 32px', cursor: 'pointer',
              width: '100%', maxWidth: 400, minHeight: 'auto',
              boxShadow: '0 8px 40px rgba(232,93,32,0.45)',
              letterSpacing: '-0.01em',
            }}>
              🎓 I'm a student — Try FastIQ free (7 days)
            </button>
            <button onClick={onParentJoin} style={{
              fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 16, padding: '16px 32px', cursor: 'pointer',
              width: '100%', maxWidth: 400, minHeight: 'auto',
            }}>
              🤝 I'm a parent/alumni — Join free to help
            </button>
          </div>

          {/* Trust line */}
          <div style={{ ...fadeIn(0.28), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {foundingActive && <Countdown timeLeft={timeLeft} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['No credit card', 'Cancel anytime', 'Takes 2 min'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {t}
                </span>
              ))}
            </div>
            {foundingActive && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Founding Rate $14.50/mo → jumps to $29 after April 30</span>}
          </div>

          {/* Stats row */}
          <div style={{ ...fadeIn(0.34), display: 'flex', justifyContent: 'center', gap: 0, marginTop: 36 }}>
            {[['1,000+', 'helpers in network'], ['15+', 'universities'], ['50+', 'industries covered']].map(([n, l], i) => (
              <div key={l} style={{
                textAlign: 'center', flex: 1, padding: '0 12px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#E85D20', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHONE HERO VISUAL ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 56px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ ...fadeIn(0.4), animation: mounted ? 'float 4s ease-in-out infinite' : 'none' }}>
            <PhoneMockup />
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>↑ FastIQ just wrote that message for you</p>
        </div>

        {/* ── WINS TICKER ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 60px', maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>Real student wins</p>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16,
            minHeight: 88, transition: 'all 0.3s ease',
          }}>
            <div style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{WINS[activeWin].emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 5px', lineHeight: 1.35 }}>
                "{WINS[activeWin].text}"
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{WINS[activeWin].school}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            {WINS.map((_, i) => (
              <button key={i} onClick={() => setActiveWin(i)} style={{
                width: i === activeWin ? 24 : 6, height: 6, borderRadius: 3,
                background: i === activeWin ? '#E85D20' : 'rgba(255,255,255,0.15)',
                border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 28px' }}>
            From zero to interview<br /><span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>in days, not months.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: i === 3 ? 'rgba(232,93,32,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 3 ? 'rgba(232,93,32,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 18, padding: '20px 20px',
              }}>
                <div style={{ fontSize: 30, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#E85D20', letterSpacing: '0.1em' }}>{s.num}</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{s.title}</p>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FREE vs FASTIQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 24px' }}>
            Free for helpers.<br /><span style={{ color: '#E85D20' }}>Turbo for students.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Free card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '24px 18px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, marginBottom: 12 }}>🏫</span>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Free Network</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>$0</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>Forever free</p>
              <div style={{ flex: 1, margin: '12px 0 16px' }}>
                {['Join as parent or alumni', 'Help students at your school', 'No obligation, no fee ever'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ color: '#4ade80', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onParentJoin} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 12, padding: '11px 16px', cursor: 'pointer', width: '100%', minHeight: 'auto' }}>
                Join free →
              </button>
            </div>
            {/* FastIQ card */}
            <div style={{ background: 'rgba(232,93,32,0.07)', border: '2px solid rgba(232,93,32,0.35)', borderRadius: 20, padding: '24px 18px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -11, right: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#c9a84c', background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🏅 Founding</span>
                </div>
              )}
              <span style={{ fontSize: 28, marginBottom: 12 }}>⚡</span>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>FastIQ AI</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 2 }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#E85D20', margin: 0, letterSpacing: '-0.03em' }}>{foundingActive ? '$14.50' : '$29'}</p>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>/mo</span>
              </div>
              {foundingActive && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '0 0 0' }}>$29 after April 30</p>}
              <div style={{ flex: 1, margin: '12px 0 16px' }}>
                {['7-day free trial', 'Alumni search + outreach AI', 'Resume, interviews, intel'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ color: '#E85D20', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '11px 16px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.4)' }}>
                Try 7 days free →
              </button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '14px 0 0' }}>
            No credit card for trial · Cancel anytime · Parents can gift FastIQ too
          </p>
        </div>

        {/* ── FASTIQ FEATURES ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>FastIQ unlocks</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 8px' }}>
            Everything your job<br />search is missing.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', lineHeight: 1.5 }}>One tool. All of it. Your edge.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FASTIQ_FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '18px 16px',
                transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>{f.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 5px', lineHeight: 1.2 }}>{f.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.45 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.35)', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              Unlock all of this free for 7 days →
            </button>
          </div>
        </div>

        {/* ── PARENT / ALUMNI SECTION ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24, padding: '32px 24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,33,165,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>Parents & Alumni</p>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 14px' }}>
              One intro from you<br />can change everything.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 10px' }}>
              You've built a network. Students at your school are searching for exactly what you know.
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)', margin: '0 0 24px' }}>
              You help one student → their network helps yours. That's the whole thing.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '13px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.3)' }}>
                Join free →
              </button>
              {['No fee ever', 'No obligation', '2 min setup'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>FAQs</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 24px' }}>Got questions?</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 80px', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(232,93,32,0.14) 0%, rgba(0,33,165,0.1) 100%)',
            border: '1px solid rgba(232,93,32,0.25)', borderRadius: 28, padding: '48px 24px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,93,32,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>
              Your next opportunity<br />is one intro away.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 360 }}>
              Start your free trial. No credit card. No BS. Just real intros and AI that works.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button onClick={onStudentJoin} style={{
                fontSize: 16, fontWeight: 800, color: '#fff',
                background: 'linear-gradient(135deg, #E85D20 0%, #ff7340 100%)',
                border: 'none', borderRadius: 16, padding: '18px 36px', cursor: 'pointer',
                width: '100%', maxWidth: 380, minHeight: 'auto',
                boxShadow: '0 8px 40px rgba(232,93,32,0.45)',
              }}>
                🎓 Try FastIQ free — 7 days
              </button>
              <button onClick={onParentJoin} style={{
                fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16, padding: '15px 36px', cursor: 'pointer',
                width: '100%', maxWidth: 380, minHeight: 'auto',
              }}>
                🤝 Join as parent/alumni — free
              </button>
              {foundingActive && <div style={{ marginTop: 6 }}><Countdown timeLeft={timeLeft} /></div>}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>© 2026 College Fast Forward</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#Terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Terms</a>
            <a href="#Privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;