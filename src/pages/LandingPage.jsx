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

const VIDEO_TESTIMONIALS = [
  { school: 'UF · Junior', win: 'Got a reply in 48 hrs using the AI draft', initials: 'KM', color: '#E85D20' },
  { school: 'OSU · Senior', win: 'Landed my internship through a parent intro', initials: 'JR', color: '#7c3aed' },
  { school: 'USC · Junior', win: '3 coffee chats booked in week one', initials: 'AL', color: '#0891b2' },
  { school: 'UGA · Sophomore', win: '60% reply rate on cold outreach', initials: 'TW', color: '#059669' },
];

const STEPS = [
  { icon: '🏫', num: '01', title: 'Free network at your school', desc: 'Parents & alumni at 15+ universities who actually want to help.' },
  { icon: '📝', num: '02', title: 'Post what you need', desc: 'Referral, mock interview, advice — real humans see it.' },
  { icon: '🤝', num: '03', title: 'Get warm intros', desc: 'Skip the applicant pile. Talk to people already inside.' },
  { icon: '⚡', num: '04', title: 'FastIQ turns it into a job', desc: 'AI finds alumni, writes your message, preps your interview.' },
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
  { q: "Is the network actually free?", a: "Yes — 100% free for parents and alumni, forever. No membership fee, no catch. FastIQ is the optional AI upgrade for students." },
  { q: "What exactly is FastIQ?", a: "FastIQ is AI that searches alumni at your target companies, drafts personalized outreach, tailors your resume, runs mock interviews, and builds your daily action plan." },
  { q: "How does the 7-day trial work?", a: "Sign up and start immediately — no credit card needed. After 7 days, continue at $14.50/mo (Founding Rate until April 30, then $29/mo). Cancel anytime." },
  { q: "Can my parents pay for FastIQ?", a: "Yes. Either you or a parent can unlock it. Parents can gift FastIQ directly from their account." },
  { q: "What schools are in the network?", a: "15+ universities and growing — UF, Ohio State, USC, UGA, Penn State, and more." },
  { q: "I'm alumni — can I join to help?", a: "Absolutely. Students specifically search for alumni at their target companies. Your experience is exactly what they need." },
];

// ── Animated phone mockup ───────────────────────────────────────────────
function PhoneMockup() {
  const messages = [
    { from: 'ai', text: "Found 3 Goldman alumni at UF who reply to outreach 🎯" },
    { from: 'ai', text: "Drafting your message now..." },
    { from: 'sent', text: "Hey Sarah, I'm a UF finance junior — I saw you work in IBD and would love 15 minutes to hear your story." },
    { from: 'reply', text: "Hi! Happy to chat — Thursday 2pm? ✅" },
  ];
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= messages.length) return;
    const delays = [1000, 900, 1500];
    const t = setTimeout(() => setShown(s => s + 1), delays[shown - 1] || 1200);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div style={{
      width: 240, margin: '0 auto',
      background: 'linear-gradient(180deg, #13131f 0%, #0e0e18 100%)',
      borderRadius: 32, border: '2px solid rgba(255,255,255,0.1)',
      padding: '14px 12px 18px',
      boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <div style={{ width: 56, height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, margin: '0 auto 14px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#E85D20,#ff9a6c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: dm, lineHeight: 1 }}>FastIQ</div>
          <div style={{ fontSize: 9, color: '#4ade80', fontFamily: dm, marginTop: 2 }}>● Working for you</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 190 }}>
        {messages.slice(0, shown).map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === 'sent' ? 'flex-end' : 'flex-start',
            maxWidth: '88%',
            background: m.from === 'sent' ? 'linear-gradient(135deg,#E85D20,#ff7340)' : m.from === 'reply' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.07)',
            borderRadius: m.from === 'sent' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
            padding: '8px 10px',
            border: m.from === 'reply' ? '1px solid rgba(74,222,128,0.3)' : 'none',
            animation: 'msgIn 0.25s ease',
          }}>
            <p style={{ fontFamily: dm, fontSize: 10, color: m.from === 'reply' ? '#4ade80' : '#fff', margin: 0, lineHeight: 1.45, opacity: m.from === 'ai' ? 0.8 : 1 }}>{m.text}</p>
          </div>
        ))}
        {shown < messages.length && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 3, padding: '8px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 3px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }} />)}
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '7px 10px' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: dm, flex: 1 }}>FastIQ is writing for you...</span>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>→</div>
      </div>
    </div>
  );
}

// ── Video testimonial card (placeholder) ───────────────────────────────
function VideoCard({ item }) {
  return (
    <div style={{
      width: 160, flexShrink: 0,
      background: `linear-gradient(160deg, ${item.color}22 0%, rgba(0,0,0,0.6) 100%)`,
      border: `1px solid ${item.color}44`,
      borderRadius: 20, overflow: 'hidden',
      aspectRatio: '9/16', position: 'relative',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '16px 14px',
    }}>
      {/* Play icon area */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: 18 }}>▶</span>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 14, fontWeight: 800, color: '#fff' }}>{item.initials}</div>
        </div>
      </div>
      {/* Caption */}
      <div>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', margin: '0 0 3px', lineHeight: 1.3 }}>"{item.win}"</p>
        <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{item.school}</p>
      </div>
      {/* Coming soon badge */}
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 100, padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
        <span style={{ fontFamily: dm, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>SOON</span>
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
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, minHeight: 'auto' }}>
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
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';
      document.head.appendChild(link);
    }
    if (!document.getElementById('lp-keyframes')) {
      const s = document.createElement('style');
      s.id = 'lp-keyframes';
      s.textContent = `
        @keyframes msgIn { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes dotBounce { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-4px); opacity:1; } }
        @keyframes floatPhone { 0%,100% { transform:translateY(0px) rotate(-1deg); } 50% { transform:translateY(-10px) rotate(1deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(232,93,32,0.5); } 50% { box-shadow:0 0 0 10px rgba(232,93,32,0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
      `;
      document.head.appendChild(s);
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
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
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
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  });

  return (
    <>
      <FoundingMemberBanner show={showFoundingBanner} onUpgrade={() => navigate('GetStarted')} onDismiss={() => setShowFoundingBanner(false)} />
      <SocialMetaTags
        title="College Fast Forward — Stop cold-applying. Get warm intros + FastIQ AI."
        description="Free parent & alumni network at your school. FastIQ AI turns connections into interviews. 7-day free trial, no credit card needed."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div style={{ minHeight: '100vh', background: '#07070d', fontFamily: dm, overflowX: 'hidden' }}>

        {/* ── Ambient BG ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse 90% 55% at 50% -5%, rgba(232,93,32,0.2) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 40% at 90% 45%, rgba(0,33,165,0.1) 0%, transparent 50%),
                       radial-gradient(ellipse 35% 30% at 5% 85%, rgba(74,222,128,0.05) 0%, transparent 50%)` }} />

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(7,7,13,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E85D20', animation: 'glowPulse 2.5s ease infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>CFF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 4px' }}>Sign in</button>
            <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#E85D20,#ff7340)', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.4)' }}>
              Try free →
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '56px 20px 32px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>

          {/* Live social proof badge */}
          <div style={{ ...fadeIn(0), display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '7px 18px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.03em' }}>Real students landing intros & interviews now</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ ...fadeIn(0.07), fontSize: 'clamp(34px, 9vw, 60px)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 18px' }}>
            Stop cold-applying.<br />
            <span style={{ color: '#E85D20' }}>Get warm intros</span>{' '}
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>from real people at your school.</span>
          </h1>

          {/* Subheadline */}
          <p style={{ ...fadeIn(0.14), fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto 30px' }}>
            Free network at your school. FastIQ AI turns those connections into real replies and interviews. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>No BS.</strong>
          </p>

          {/* Primary CTA */}
          <div style={{ ...fadeIn(0.2), display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <button onClick={onStudentJoin} style={{
              fontSize: 17, fontWeight: 900, color: '#fff',
              background: 'linear-gradient(135deg, #E85D20 0%, #ff6b35 100%)',
              border: 'none', borderRadius: 18, padding: '20px 32px',
              cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto',
              boxShadow: '0 10px 48px rgba(232,93,32,0.5)',
              letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              🎓 I'm a student — Try FastIQ free (7 days)
            </button>
            <button onClick={onParentJoin} style={{
              fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 18, padding: '17px 32px',
              cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto',
            }}>
              🤝 I'm a parent/alumni — Join free to help
            </button>
          </div>

          {/* Social proof micro-line */}
          <div style={{ ...fadeIn(0.25), marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.02em' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>1,000+ helpers</span> · <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>15+ schools</span> · Real students getting replies
            </p>
          </div>

          {/* Urgency */}
          <div style={{ ...fadeIn(0.28), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {foundingActive && <Countdown timeLeft={timeLeft} />}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['No credit card', 'Cancel anytime', '2 min to set up'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {t}
                </span>
              ))}
            </div>
            {foundingActive && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>Founding Rate $14.50/mo → goes to $29 after April 30</span>}
          </div>
        </div>

        {/* ── PHONE HERO ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '12px 20px 48px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...fadeIn(0.32), display: 'inline-block', animation: mounted ? 'floatPhone 5s ease-in-out infinite' : 'none' }}>
            <PhoneMockup />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: '14px 0 0', letterSpacing: '0.02em' }}>↑ FastIQ just wrote that outreach message for you</p>
        </div>

        {/* ── STATS BAR ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 52px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0 }}>
            {[['1,000+', 'helpers in network'], ['15+', 'universities'], ['50+', 'industries']].map(([n, l], i) => (
              <div key={l} style={{ textAlign: 'center', flex: 1, padding: '16px 8px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: i === 0 ? 'rgba(232,93,32,0.04)' : i === 1 ? 'rgba(0,33,165,0.04)' : 'rgba(74,222,128,0.03)', borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#E85D20', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4, lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── VIDEO TESTIMONIALS ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 0 60px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 8px' }}>Real student wins</p>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: 0 }}>
              See how students are<br /><span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>actually landing jobs.</span>
            </h2>
          </div>
          {/* Horizontal scroll video cards */}
          <div style={{ display: 'flex', gap: 12, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {VIDEO_TESTIMONIALS.map((item, i) => (
              <div key={i} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <VideoCard item={item} />
              </div>
            ))}
          </div>
          {/* Win ticker below */}
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14, minHeight: 76 }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{WINS[activeWin].emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px', lineHeight: 1.3, animation: 'slideIn 0.3s ease' }}>"{WINS[activeWin].text}"</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{WINS[activeWin].school}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
              {WINS.map((_, i) => (
                <button key={i} onClick={() => setActiveWin(i)} style={{ width: i === activeWin ? 24 : 6, height: 6, borderRadius: 3, background: i === activeWin ? '#E85D20' : 'rgba(255,255,255,0.15)', border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 24px' }}>
            Zero to interview.<br /><span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Days, not months.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: i === 3 ? 'rgba(232,93,32,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 3 ? 'rgba(232,93,32,0.22)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 18, padding: '20px 18px',
              }}>
                <span style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#E85D20', letterSpacing: '0.1em' }}>{s.num}</span>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>{s.title}</p>
                    {i === 3 && <span style={{ fontSize: 9, fontWeight: 700, color: '#E85D20', background: 'rgba(232,93,32,0.15)', borderRadius: 100, padding: '2px 8px', border: '1px solid rgba(232,93,32,0.3)', whiteSpace: 'nowrap' }}>AI POWERED</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FREE vs FASTIQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(26px, 6vw, 38px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 22px' }}>
            Free for helpers.<br /><span style={{ color: '#E85D20' }}>Turbo for students.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Free */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: '22px 16px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 30, marginBottom: 12 }}>🏫</span>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Free Network</p>
              <p style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.04em' }}>$0</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 14px' }}>Forever free</p>
              <div style={{ flex: 1, marginBottom: 16 }}>
                {['Join as parent or alumni', 'Help students at your school', 'No fee, no obligation'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 7 }}>
                    <span style={{ color: '#4ade80', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onParentJoin} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '11px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto' }}>
                Join free →
              </button>
            </div>
            {/* FastIQ */}
            <div style={{ background: 'rgba(232,93,32,0.08)', border: '2px solid rgba(232,93,32,0.38)', borderRadius: 22, padding: '22px 16px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -12, right: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#c9a84c', background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🏅 Founding</span>
                </div>
              )}
              <span style={{ fontSize: 30, marginBottom: 12 }}>⚡</span>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>FastIQ AI</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 2 }}>
                <p style={{ fontSize: 34, fontWeight: 900, color: '#E85D20', margin: 0, letterSpacing: '-0.04em' }}>{foundingActive ? '$14.50' : '$29'}</p>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>/mo</span>
              </div>
              {foundingActive && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', margin: '0 0 14px' }}>$29 after April 30</p>}
              <div style={{ flex: 1, marginBottom: 16 }}>
                {['7-day free trial', 'Alumni search + AI outreach', 'Resume, interviews & intel'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 7 }}>
                    <span style={{ color: '#E85D20', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#E85D20,#ff7340)', border: 'none', borderRadius: 12, padding: '11px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.4)' }}>
                Try 7 days free →
              </button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textAlign: 'center', margin: '14px 0 0' }}>No credit card · Cancel anytime · Parents can gift FastIQ too</p>
        </div>

        {/* ── FASTIQ FEATURES ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>FastIQ unlocks</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 6px' }}>
            Everything your job<br />search is missing.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: '0 0 22px', lineHeight: 1.5 }}>One tool. All of it. Your edge.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FASTIQ_FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 14px' }}>
                <span style={{ fontSize: 26, display: 'block', marginBottom: 10 }}>{f.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 5px', lineHeight: 1.2 }}>{f.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.45 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 800, color: '#E85D20', background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 14, padding: '13px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              Get all of this free for 7 days →
            </button>
          </div>
        </div>

        {/* ── PARENT / ALUMNI ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 22px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,33,165,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>Parents & Alumni</p>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 12px' }}>One intro from you<br />can change everything.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.6, margin: '0 0 8px' }}>You've built a network. Students at your school are looking for exactly what you know. 2 minutes to set up. Zero obligation.</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.72)', margin: '0 0 22px' }}>You help one student → their network helps yours. That's the whole thing.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '13px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.35)' }}>
                Join free →
              </button>
              {['No fee ever', 'No obligation', '2 min setup'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>FAQs</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 22px' }}>Got questions?</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 88px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(145deg, rgba(232,93,32,0.15) 0%, rgba(0,33,165,0.1) 100%)', border: '1px solid rgba(232,93,32,0.28)', borderRadius: 28, padding: '52px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 110%, rgba(232,93,32,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 44, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 'clamp(28px, 7vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.08, margin: '0 0 14px' }}>
              Your next opportunity<br />is one intro away.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 360 }}>
              Start free. No credit card. No BS. Just real intros and AI that works for you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button onClick={onStudentJoin} style={{ fontSize: 17, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #E85D20 0%, #ff6b35 100%)', border: 'none', borderRadius: 18, padding: '20px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto', boxShadow: '0 10px 48px rgba(232,93,32,0.5)' }}>
                🎓 Try FastIQ free — 7 days
              </button>
              <button onClick={onParentJoin} style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.58)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '17px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto' }}>
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
            <a href="#Terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none' }}>Terms</a>
            <a href="#Privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;