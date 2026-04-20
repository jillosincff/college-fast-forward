import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

// Real student story cards (raw, authentic vibe)
const STUDENT_STORIES = [
  {
    initials: 'KM',
    name: 'Kayla M.',
    school: 'UF · Finance · Junior',
    quote: 'I sent 40 applications and heard nothing. FastIQ wrote one message to a UF alum at Goldman. She replied in 2 days. TWO DAYS.',
    win: '☕ Coffee chat → offer',
    color: '#E85D20',
    rotate: '-1.2deg',
  },
  {
    initials: 'JR',
    name: 'Jake R.',
    school: 'OSU · Marketing · Senior',
    quote: 'A parent in the network literally forwarded my resume to their friend at P&G. I had zero connection to that person. This is real.',
    win: '🚀 Referral → interview',
    color: '#7c3aed',
    rotate: '0.8deg',
  },
  {
    initials: 'AL',
    name: 'Alyssa L.',
    school: 'USC · Tech · Junior',
    quote: 'OK so I booked 3 coffee chats in my first week. My roommate still has zero interviews. I feel kind of guilty lol',
    win: '🎉 3 chats in week 1',
    color: '#0891b2',
    rotate: '-0.5deg',
  },
  {
    initials: 'TW',
    name: 'Tyler W.',
    school: 'UGA · Consulting · Sophomore',
    quote: 'The AI literally wrote a better message than anything I could have come up with. 60% reply rate. I want to cry.',
    win: '✉️ 60% reply rate',
    color: '#059669',
    rotate: '1.1deg',
  },
];

const WINS = [
  { emoji: '🎉', text: 'Got a reply from a Goldman alum in 2 days', school: 'UF · Finance · Junior' },
  { emoji: '💼', text: 'Landed my internship through a parent intro', school: 'OSU · Marketing · Senior' },
  { emoji: '🚀', text: 'Had 3 coffee chats booked in my first week', school: 'USC · Tech · Junior' },
  { emoji: '✉️', text: 'FastIQ wrote my outreach — got a 60% reply rate', school: 'UGA · Consulting · Sophomore' },
];

const STEPS_STUDENT = [
  { icon: '🏫', num: '01', title: 'Free network at your school', desc: 'Parents & alumni at 15+ universities who actually want to help. Not fake LinkedIn connections. Real people.' },
  { icon: '📝', num: '02', title: 'Post what you need', desc: 'Referral, mock interview, honest advice — real humans see it and respond.' },
  { icon: '🤝', num: '03', title: 'Get warm intros', desc: 'Skip the applicant pile. Get inside the building before anyone else.' },
  { icon: '⚡', num: '04', title: 'FastIQ turns it into a job', desc: 'Finds alumni, writes your outreach, preps your answers. It\'s genuinely ridiculous how much faster this is.', ai: true },
];

const STEPS_HELPER = [
  { icon: '✍️', num: '01', title: 'Create your free profile', desc: 'Tell students your industry, company, and what you can offer. Takes 2 minutes. Seriously.' },
  { icon: '📬', num: '02', title: 'Students reach out to you', desc: 'Only the ones whose needs actually match your background. No spam, no randoms.' },
  { icon: '☕', num: '03', title: 'Help how you want', desc: 'A 15-minute call. A LinkedIn reply. A referral. You decide. No pressure ever.' },
  { icon: '🔄', num: '04', title: 'The network pays it forward', desc: 'You help one student — their network helps yours. Simple math. Real results.' },
];

const FASTIQ_FEATURES = [
  { icon: '🔍', label: 'Alumni Search', desc: 'Find anyone at any company in seconds. Like, actually anyone.' },
  { icon: '✉️', label: 'Smart Outreach', desc: 'Messages that sound human and actually get replied to' },
  { icon: '📄', label: 'Resume Tailoring', desc: 'Role-specific rewrite in 30 seconds (not a joke)' },
  { icon: '🎤', label: 'Mock Interviews', desc: 'Practice until you stop saying "um" every 3 words' },
  { icon: '📊', label: 'Company Intel', desc: "Know who\'s actively hiring before you even apply" },
  { icon: '🗺️', label: 'Daily Action Plan', desc: 'Tells you exactly what to do next. No more paralysis.' },
];

const FAQS = [
  { q: "Wait — is the network actually free?", a: "Yes. 100% free for parents and alumni, forever. No membership fee, no \"premium tier\", no catch. FastIQ is the optional AI upgrade for students who want to go faster." },
  { q: "What exactly does FastIQ do?", a: "It searches alumni at your target companies, drafts personalized outreach that sounds like you (not a robot), tailors your resume for specific roles, runs mock interviews, and builds your daily action plan. It's a lot." },
  { q: "How does the 7-day trial work?", a: "Sign up and start immediately — no credit card needed. After 7 days, continue at $14.50/mo (Founding Rate, locked in until April 30, then it goes to $29/mo). Cancel anytime, for any reason." },
  { q: "Can my parents pay for FastIQ for me?", a: "Yes! Parents can gift FastIQ directly from their account. A lot of parents are doing this — it's a pretty thoughtful move honestly." },
  { q: "What schools are in the network?", a: "15+ universities and growing — UF, Ohio State, USC, UGA, Penn State, UM, Delaware, and more. If your school isn't listed, you can still join and we'll expand to you." },
  { q: "I'm alumni — can I join to help?", a: "Please do. Students specifically search for alumni at their exact target companies. Your experience is literally what they're looking for. 15 minutes can change someone's trajectory." },
];

// ── Animated phone mockup ──
function PhoneMockup() {
  const messages = [
    { from: 'ai', text: "Found 3 Goldman alumni at UF who reply to outreach 🎯" },
    { from: 'ai', text: "Drafting your message now..." },
    { from: 'sent', text: "Hey Sarah, I'm a UF finance junior — saw you're in IBD. Would love 15 min of your time." },
    { from: 'reply', text: "Hi! Happy to chat — Thursday 2pm work? ✅" },
  ];
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= messages.length) return;
    const delays = [1000, 900, 1600];
    const t = setTimeout(() => setShown(s => s + 1), delays[shown - 1] || 1200);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div style={{ width: 248, margin: '0 auto', background: '#111118', borderRadius: 36, border: '2px solid rgba(255,255,255,0.12)', padding: '16px 13px 20px', boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)', position: 'relative' }}>
      {/* Notch */}
      <div style={{ width: 64, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, margin: '0 auto 16px' }} />
      {/* App header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#E85D20,#ff9a6c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 0 12px rgba(232,93,32,0.4)' }}>⚡</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: dm, letterSpacing: '-0.01em' }}>FastIQ</div>
          <div style={{ fontSize: 9, color: '#4ade80', fontFamily: dm, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            Working for you
          </div>
        </div>
      </div>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 196 }}>
        {messages.slice(0, shown).map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === 'sent' ? 'flex-end' : 'flex-start', maxWidth: '88%', background: m.from === 'sent' ? 'linear-gradient(135deg,#E85D20,#ff7340)' : m.from === 'reply' ? 'rgba(74,222,128,0.13)' : 'rgba(255,255,255,0.08)', borderRadius: m.from === 'sent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 11px', border: m.from === 'reply' ? '1px solid rgba(74,222,128,0.3)' : 'none', animation: 'msgIn 0.3s ease' }}>
            <p style={{ fontFamily: dm, fontSize: 10.5, color: m.from === 'reply' ? '#4ade80' : '#fff', margin: 0, lineHeight: 1.5, opacity: m.from === 'ai' ? 0.75 : 1 }}>{m.text}</p>
          </div>
        ))}
        {shown < messages.length && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '9px 13px', background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }} />)}
          </div>
        )}
      </div>
      {/* Input bar */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: '8px 11px' }}>
        <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.22)', fontFamily: dm, flex: 1 }}>FastIQ is writing your next move...</span>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>→</div>
      </div>
    </div>
  );
}

// ── Real Student Story Card ──
function StudentCard({ story }) {
  return (
    <div style={{
      width: 230, flexShrink: 0,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.1)`,
      borderRadius: 20,
      padding: '20px 18px',
      transform: `rotate(${story.rotate})`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
      position: 'relative',
      scrollSnapAlign: 'start',
    }}>
      {/* Subtle color accent top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: story.color, borderRadius: '20px 20px 0 0', opacity: 0.8 }} />
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: story.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: `0 4px 12px ${story.color}55` }}>
          {story.initials}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: dm, lineHeight: 1.2 }}>{story.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: dm, marginTop: 1 }}>{story.school}</div>
        </div>
      </div>
      {/* Quote */}
      <p style={{ fontFamily: dm, fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 14px', fontStyle: 'italic' }}>
        &ldquo;{story.quote}&rdquo;
      </p>
      {/* Win badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${story.color}18`, border: `1px solid ${story.color}44`, borderRadius: 100, padding: '5px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: story.color, fontFamily: dm }}>{story.win}</span>
      </div>
      {/* Coming soon overlay note */}
      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 100, padding: '2px 8px', backdropFilter: 'blur(4px)' }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: dm, letterSpacing: '0.08em', textTransform: 'uppercase' }}>verified</span>
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
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, minHeight: 'auto' }}>
        <span style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: '#E85D20', flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: '0 0 18px', paddingRight: 20 }}>{a}</p>}
    </div>
  );
}

function RoleToggle({ mode, onChange }) {
  return (
    <div style={{ position: 'sticky', top: 53, zIndex: 90, padding: '10px 16px', background: 'rgba(7,7,13,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: 4 }}>
        <button
          onClick={() => onChange('student')}
          style={{ flex: 1, fontFamily: dm, fontSize: 14, fontWeight: 800, color: mode === 'student' ? '#fff' : 'rgba(255,255,255,0.4)', background: mode === 'student' ? 'linear-gradient(135deg,#E85D20,#ff7340)' : 'none', border: 'none', borderRadius: 100, padding: '11px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: mode === 'student' ? '0 4px 20px rgba(232,93,32,0.4)' : 'none', transition: 'all 0.25s ease' }}
        >
          🎓 I need help
        </button>
        <button
          onClick={() => onChange('helper')}
          style={{ flex: 1, fontFamily: dm, fontSize: 14, fontWeight: 800, color: mode === 'helper' ? '#fff' : 'rgba(255,255,255,0.4)', background: mode === 'helper' ? 'rgba(79,140,255,0.22)' : 'none', border: mode === 'helper' ? '1px solid rgba(79,140,255,0.4)' : '1px solid transparent', borderRadius: 100, padding: '11px 8px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.25s ease' }}
        >
          🤝 I want to help
        </button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showFoundingBanner, setShowFoundingBanner] = useState(true);
  const [activeWin, setActiveWin] = useState(0);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('lp_mode') || 'student'; } catch { return 'student'; }
  });

  const handleModeChange = (newMode) => {
    setMode(newMode);
    try { localStorage.setItem('lp_mode', newMode); } catch {}
    trackEvent('landing_mode_toggle', { mode: newMode });
  };

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
        @keyframes msgIn { from { opacity:0; transform:translateY(8px) scale(0.96); } to { opacity:1; transform:none; } }
        @keyframes dotBounce { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-5px); opacity:1; } }
        @keyframes floatPhone { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-10px) rotate(1.5deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(232,93,32,0.5); } 50% { box-shadow:0 0 0 10px rgba(232,93,32,0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:none; } }
        @keyframes iconPop { 0% { opacity:0; transform:scale(0.5) rotate(-10deg); } 70% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:none; } }
        @keyframes heroPulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes badgeFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        @keyframes ctaShine { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes modeFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes cardDrift { 0%,100% { transform:translateY(0) rotate(var(--r,0deg)); } 50% { transform:translateY(-4px) rotate(var(--r,0deg)); } }
        @keyframes grainAnim { 0%,100% { transform:translate(0,0); } 25% { transform:translate(-1%,1%); } 50% { transform:translate(1%,-1%); } 75% { transform:translate(-0.5%,0.5%); } }
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
    const t2 = setInterval(() => setActiveWin(w => (w + 1) % WINS.length), 3500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const isStudent = mode === 'student';

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

  const modeAnim = { animation: 'modeFade 0.35s ease both' };
  const steps = isStudent ? STEPS_STUDENT : STEPS_HELPER;

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

        {/* Ambient bg */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: isStudent
            ? `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,93,32,0.18) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 88% 40%, rgba(0,33,165,0.08) 0%, transparent 50%)`
            : `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,140,255,0.13) 0%, transparent 55%), radial-gradient(ellipse 45% 35% at 12% 40%, rgba(74,222,128,0.06) 0%, transparent 50%)`,
          transition: 'background 0.7s ease',
        }} />

        {/* Subtle grain texture */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px', animation: 'grainAnim 8s steps(10) infinite' }} />

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(7,7,13,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E85D20', animation: 'glowPulse 2.5s ease infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>CFF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.38)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 4px' }}>Sign in</button>
            <button onClick={isStudent ? onStudentJoin : onParentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: isStudent ? 'linear-gradient(135deg,#E85D20,#ff7340)' : 'rgba(79,140,255,0.28)', border: isStudent ? 'none' : '1px solid rgba(79,140,255,0.45)', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', boxShadow: isStudent ? '0 4px 16px rgba(232,93,32,0.4)' : 'none' }}>
              {isStudent ? 'Try free →' : 'Join free →'}
            </button>
          </div>
        </nav>

        {/* ── ROLE TOGGLE ── */}
        <RoleToggle mode={mode} onChange={handleModeChange} />

        {/* ── HERO ── */}
        <div key={mode} style={{ position: 'relative', zIndex: 2, padding: '48px 20px 28px', maxWidth: 640, margin: '0 auto', textAlign: 'center', ...modeAnim }}>

          {/* Glow */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 480, height: 380, borderRadius: '50%', background: isStudent ? 'radial-gradient(circle, rgba(232,93,32,0.1) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(48px)', animation: 'heroPulse 5s ease-in-out infinite' }} />

          {/* Live badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: isStudent ? 'rgba(74,222,128,0.08)' : 'rgba(79,140,255,0.08)', border: `1px solid ${isStudent ? 'rgba(74,222,128,0.25)' : 'rgba(79,140,255,0.25)'}`, borderRadius: 100, padding: '7px 18px', animation: 'badgeFloat 3.5s ease-in-out infinite' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: isStudent ? '#4ade80' : '#4f8cff', boxShadow: `0 0 8px ${isStudent ? '#4ade80' : '#4f8cff'}` }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isStudent ? '#4ade80' : '#4f8cff' }}>
                {isStudent ? 'Real students landing intros right now' : 'Join 1,000+ parents & alumni helping students'}
              </span>
            </div>
          </div>

          {/* Headline — intentionally slightly asymmetric */}
          <h1 style={{ fontSize: 'clamp(31px, 8.5vw, 56px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 16px', position: 'relative' }}>
            {isStudent ? (
              <>
                Tired of ghosted applications?<br />
                <span style={{ color: '#E85D20' }}>Yeah, us too.</span>{' '}
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88em', fontWeight: 700 }}>Get warm intros instead.</span>
              </>
            ) : (
              <>
                One intro from you<br />
                <span style={{ color: '#4f8cff' }}>can actually change</span>{' '}
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>a student&apos;s whole path.</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px', textAlign: 'center' }}>
            {isStudent ? (
              <>Free parent &amp; alumni network at your school. FastIQ AI writes your outreach, finds alumni, and preps you for interviews. <strong style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>No BS. No cold apps.</strong></>
            ) : (
              <>Free to join, zero obligation. The more parents and alumni connect, the stronger the whole community gets — including for your own kids.</>
            )}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center', marginBottom: 20 }}>
            {isStudent ? (
              <>
                <button onClick={onStudentJoin} style={{ fontSize: 17, fontWeight: 900, color: '#fff', background: 'linear-gradient(105deg, #E85D20 0%, #ff6b35 50%, #ffab40 100%)', backgroundSize: '200% auto', border: 'none', borderRadius: 18, padding: '20px 32px', cursor: 'pointer', width: '100%', maxWidth: 440, minHeight: 'auto', boxShadow: '0 10px 48px rgba(232,93,32,0.5), 0 2px 0 rgba(255,255,255,0.12) inset', letterSpacing: '-0.01em', lineHeight: 1.25, animation: 'ctaShine 3.5s linear infinite' }}>
                  🎓 Try FastIQ free — 7 days, no card needed
                </button>
                <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '14px 32px', cursor: 'pointer', width: '100%', maxWidth: 440, minHeight: 'auto' }}>
                  🤝 I&apos;m a parent/alumni — Join free to help
                </button>
              </>
            ) : (
              <>
                <button onClick={onParentJoin} style={{ fontSize: 17, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%)', border: 'none', borderRadius: 18, padding: '20px 32px', cursor: 'pointer', width: '100%', maxWidth: 440, minHeight: 'auto', boxShadow: '0 10px 44px rgba(79,140,255,0.38)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                  🤝 Join free — 2 minutes, zero obligation
                </button>
                <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '14px 32px', cursor: 'pointer', width: '100%', maxWidth: 440, minHeight: 'auto' }}>
                  🎓 I&apos;m a student — Try FastIQ free
                </button>
              </>
            )}
          </div>

          {/* Trust signals */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {isStudent && foundingActive && <Countdown timeLeft={timeLeft} />}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(isStudent
                ? ['No credit card', 'Cancel anytime', '2 min to set up']
                : ['No fee ever', 'You control who you talk to', 'Join in 2 min']
              ).map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {t}
                </span>
              ))}
            </div>
            {isStudent && foundingActive && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Founding Rate $14.50/mo locks in → goes to $29 after April 30</span>}
          </div>
        </div>

        {/* ── PHONE MOCKUP (student only) ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '8px 20px 44px', maxWidth: 640, margin: '0 auto', textAlign: 'center', ...modeAnim }}>
            <div style={{ display: 'inline-block', animation: mounted ? 'floatPhone 5s ease-in-out infinite' : 'none' }}>
              <PhoneMockup />
            </div>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', margin: '12px 0 0', fontStyle: 'italic' }}>↑ FastIQ just wrote that outreach for you. For real.</p>
          </div>
        )}

        {/* ── HELPER QUICK WINS (helper mode) ── */}
        {!isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 48px', maxWidth: 640, margin: '0 auto', ...modeAnim }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '⏱', title: '15 min/month', desc: 'That\'s genuinely all it takes. One call can change someone\'s direction.' },
                { icon: '🔒', title: 'You control everything', desc: 'Reply to who you want. No pressure, no spam, ever.' },
                { icon: '🔄', title: 'Pay it forward', desc: 'You help students → their network later helps yours.' },
                { icon: '🏫', title: '15+ universities', desc: 'Real community across schools and industries.' },
              ].map((b, i) => (
                <div key={i} style={{ background: 'rgba(79,140,255,0.04)', border: '1px solid rgba(79,140,255,0.12)', borderRadius: 18, padding: '20px 16px', animation: mounted ? `iconPop 0.4s ease ${i * 0.08}s both` : 'none' }}>
                  <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{b.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 5px', fontFamily: dm }}>{b.title}</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5, fontFamily: dm }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REAL STUDENT STORIES (student only) ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 0 56px', maxWidth: 640, margin: '0 auto', ...modeAnim }}>
            <div style={{ padding: '0 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: dm }}>Real students. Real results.</p>
              <h2 style={{ fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 6px' }}>
                In their own words.{' '}
                <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 400, fontSize: '0.82em' }}>(no PR polish here)</span>
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: dm }}>Video testimonials coming soon — for now, the quotes are real.</p>
            </div>
            {/* Horizontal scroll cards */}
            <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingBottom: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', alignItems: 'flex-start' }}>
              {STUDENT_STORIES.map((story, i) => (
                <StudentCard key={i} story={story} />
              ))}
            </div>
            {/* Rotating win ticker */}
            <div style={{ padding: '0 20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, minHeight: 72 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{WINS[activeWin].emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', margin: '0 0 3px', lineHeight: 1.35, animation: 'slideIn 0.3s ease', fontFamily: dm }}>"{WINS[activeWin].text}"</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', margin: 0, fontFamily: dm }}>{WINS[activeWin].school}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                {WINS.map((_, i) => (
                  <button key={i} onClick={() => setActiveWin(i)} style={{ width: i === activeWin ? 22 : 6, height: 6, borderRadius: 3, background: i === activeWin ? '#E85D20' : 'rgba(255,255,255,0.12)', border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS BAR ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 52px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[['1,000+', 'helpers in the network'], ['15+', 'universities'], ['50+', 'industries']].map(([n, l], i) => (
              <div key={l} style={{ textAlign: 'center', flex: 1, padding: '18px 8px', background: i === 1 ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#E85D20', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: dm }}>{n}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 4, lineHeight: 1.3, fontFamily: dm }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div key={`steps-${mode}`} style={{ position: 'relative', zIndex: 2, padding: '0 20px 60px', maxWidth: 640, margin: '0 auto', ...modeAnim }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: dm }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(24px, 6vw, 38px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 22px' }}>
            {isStudent
              ? <>From zero to interview.<br /><span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 400, fontSize: '0.85em' }}>Days, not months. Seriously.</span></>
              : <>Simple, on your terms.<br /><span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 400, fontSize: '0.85em' }}>No commitments. Just helping.</span></>
            }
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: (isStudent && i === 3) ? 'rgba(232,93,32,0.06)' : 'rgba(255,255,255,0.025)', border: `1px solid ${(isStudent && i === 3) ? 'rgba(232,93,32,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '18px 16px', borderLeft: i % 2 === 0 ? `3px solid ${(isStudent && i === 3) ? '#E85D20' : 'rgba(255,255,255,0.1)'}` : undefined }}>
                <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 900, color: 'rgba(232,93,32,0.7)', letterSpacing: '0.1em', fontFamily: dm }}>{s.num}</span>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, fontFamily: dm }}>{s.title}</p>
                    {s.ai && <span style={{ fontSize: 8.5, fontWeight: 800, color: '#E85D20', background: 'rgba(232,93,32,0.12)', borderRadius: 100, padding: '2px 8px', border: '1px solid rgba(232,93,32,0.25)', whiteSpace: 'nowrap', fontFamily: dm }}>AI POWERED</span>}
                  </div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.44)', margin: 0, lineHeight: 1.55, fontFamily: dm }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FASTIQ FEATURES (student only) ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 60px', maxWidth: 640, margin: '0 auto', ...modeAnim }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: dm }}>FastIQ unlocks</p>
            <h2 style={{ fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 4px' }}>Everything your job search is missing.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px', lineHeight: 1.5, fontFamily: dm }}>One tool. All of it. No more juggling 8 tabs and a spreadsheet.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {FASTIQ_FEATURES.map((f, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 14, padding: '16px 13px', animation: mounted ? `iconPop 0.4s ease ${0.05 + i * 0.06}s both` : 'none', borderTop: `2px solid rgba(232,93,32,${0.1 + i * 0.04})` }}>
                  <span style={{ fontSize: 26, display: 'block', marginBottom: 9, lineHeight: 1 }}>{f.icon}</span>
                  <p style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1.2, fontFamily: dm }}>{f.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)', margin: 0, lineHeight: 1.5, fontFamily: dm }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button onClick={onStudentJoin} style={{ fontSize: 13.5, fontWeight: 800, color: '#E85D20', background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 12, padding: '13px 28px', cursor: 'pointer', minHeight: 'auto', fontFamily: dm }}>
                Get all of this free for 7 days →
              </button>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: dm }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(24px, 5.5vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
            Free for helpers.<br /><span style={{ color: '#E85D20' }}>Turbo for students.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Free */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '22px 16px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, marginBottom: 12 }}>🏫</span>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px', fontFamily: dm }}>Free Network</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.04em', fontFamily: dm }}>$0</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '0 0 14px', fontFamily: dm }}>Forever free</p>
              <div style={{ flex: 1, marginBottom: 16 }}>
                {['Join as parent or alumni', 'Help students at your school', 'No fee, no obligation, ever'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 7 }}>
                    <span style={{ color: '#4ade80', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', lineHeight: 1.45, fontFamily: dm }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onParentJoin} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto', fontFamily: dm }}>
                Join free →
              </button>
            </div>
            {/* FastIQ */}
            <div style={{ background: 'rgba(232,93,32,0.07)', border: '2px solid rgba(232,93,32,0.35)', borderRadius: 20, padding: '22px 16px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -11, right: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#c9a84c', background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: dm }}>🏅 Founding</span>
                </div>
              )}
              <span style={{ fontSize: 28, marginBottom: 12 }}>⚡</span>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px', fontFamily: dm }}>FastIQ AI</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 2 }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#E85D20', margin: 0, letterSpacing: '-0.04em', fontFamily: dm }}>{foundingActive ? '$14.50' : '$29'}</p>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: dm }}>/mo</span>
              </div>
              {foundingActive && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '0 0 14px', fontFamily: dm }}>$29 after April 30</p>}
              <div style={{ flex: 1, marginBottom: 16 }}>
                {['7-day free trial, no card', 'Alumni search + AI outreach', 'Resume, mock interviews & intel'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 7 }}>
                    <span style={{ color: '#E85D20', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', lineHeight: 1.45, fontFamily: dm }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#E85D20,#ff7340)', border: 'none', borderRadius: 12, padding: '11px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 4px 18px rgba(232,93,32,0.38)', fontFamily: dm }}>
                Try 7 days free →
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '12px 0 0', fontFamily: dm }}>No credit card · Cancel anytime · Parents can gift FastIQ too</p>
        </div>

        {/* ── FAQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 60px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: dm }}>FAQs</p>
          <h2 style={{ fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 20px', fontFamily: dm }}>
            Got questions? Fair.
          </h2>
          {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 80px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: isStudent ? 'linear-gradient(155deg, rgba(232,93,32,0.12) 0%, rgba(0,33,165,0.08) 100%)' : 'linear-gradient(155deg, rgba(79,140,255,0.1) 0%, rgba(124,58,237,0.08) 100%)', border: `1px solid ${isStudent ? 'rgba(232,93,32,0.22)' : 'rgba(79,140,255,0.2)'}`, borderRadius: 24, padding: '48px 24px 44px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>{isStudent ? '🚀' : '🤝'}</div>
            <h2 style={{ fontSize: 'clamp(26px, 6.5vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1, margin: '0 0 12px', fontFamily: dm }}>
              {isStudent ? <>Your next opportunity is literally one intro away.</> : <>One intro from you can change everything.</>}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: '0 auto 28px', maxWidth: 340, fontFamily: dm }}>
              {isStudent ? 'No credit card. No BS. Just real intros and AI that actually works.' : 'Free. 2 minutes. No obligation. Students at your school genuinely need you.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center' }}>
              {isStudent ? (
                <>
                  <button onClick={onStudentJoin} style={{ fontSize: 16, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #E85D20 0%, #ff6b35 100%)', border: 'none', borderRadius: 16, padding: '19px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto', boxShadow: '0 10px 44px rgba(232,93,32,0.48)', fontFamily: dm }}>
                    🎓 Try FastIQ free — 7 days
                  </button>
                  <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto', fontFamily: dm }}>
                    🤝 Join as parent/alumni — free
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onParentJoin} style={{ fontSize: 16, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%)', border: 'none', borderRadius: 16, padding: '19px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto', boxShadow: '0 10px 44px rgba(79,140,255,0.38)', fontFamily: dm }}>
                    🤝 Join free — help students now
                  </button>
                  <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 36px', cursor: 'pointer', width: '100%', maxWidth: 400, minHeight: 'auto', fontFamily: dm }}>
                    🎓 I&apos;m a student — Try FastIQ free
                  </button>
                </>
              )}
              {foundingActive && <div style={{ marginTop: 4 }}><Countdown timeLeft={timeLeft} /></div>}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', fontFamily: dm }}>© 2026 College Fast Forward</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#Terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', textDecoration: 'none', fontFamily: dm }}>Terms</a>
            <a href="#Privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', textDecoration: 'none', fontFamily: dm }}>Privacy</a>
          </div>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;