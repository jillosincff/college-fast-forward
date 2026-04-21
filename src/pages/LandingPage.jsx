import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';
import PromptsToTry from '@/components/landing/PromptsToTry';
import VideoTestimonials from '@/components/landing/VideoTestimonials';
import ShareSection from '@/components/landing/ShareSection';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const STUDENT_STORIES = [
  {
    initials: 'KM',
    name: 'Kayla M.',
    school: 'UF · Finance · Junior',
    quote: 'I sent 40 applications and heard nothing. FastIQ wrote one message to a UF alum at Goldman. She replied in 2 days. TWO DAYS.',
    win: '☕ Reply in 48h → offer',
    color: '#a8ff3e',
    rotate: '-1.5deg',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=160&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=60&auto=format&fit=crop',
  },
  {
    initials: 'JR',
    name: 'Jake R.',
    school: 'OSU · Marketing · Senior',
    quote: 'A parent in the network literally forwarded my resume to their friend at P&G. I had zero connection to that person. This is real.',
    win: '🚀 Referral → interview',
    color: '#818cf8',
    rotate: '1deg',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=60&auto=format&fit=crop',
  },
  {
    initials: 'AL',
    name: 'Alyssa L.',
    school: 'USC · Tech · Junior',
    quote: 'OK so I booked 3 coffee chats in my first week. My roommate still has zero interviews. I feel kind of guilty lol',
    win: '🎉 3 chats in week 1',
    color: '#38bdf8',
    rotate: '-0.8deg',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=60&auto=format&fit=crop',
  },
  {
    initials: 'TW',
    name: 'Tyler W.',
    school: 'UGA · Consulting · Sophomore',
    quote: 'The AI literally wrote a better message than anything I could have come up with. 60% reply rate. I want to cry.',
    win: '✉️ 60% reply rate',
    color: '#fb923c',
    rotate: '1.2deg',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=60&auto=format&fit=crop',
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
  { icon: '⚡', num: '04', title: 'FastIQ turns it into a job', desc: "Finds alumni, writes your outreach, preps your answers. It's genuinely ridiculous how much faster this is.", ai: true },
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
  { icon: '📊', label: 'Company Intel', desc: "Know who's actively hiring before you even apply" },
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

// ── Animated typing phone mockup ──
function PhoneMockup() {
  const messages = [
    { from: 'ai', text: "Found 3 Goldman alumni at UF who reply to outreach 🎯" },
    { from: 'ai', text: "Drafting your message now..." },
    { from: 'sent', text: "Hey Sarah, I'm a UF finance junior — saw you're in IBD. Would love 15 min of your time." },
    { from: 'reply', text: "Hi! Happy to chat — Thursday 2pm work? ✅" },
  ];
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (shown >= messages.length) return;
    setTyping(true);
    const delays = [900, 800, 1500];
    const t = setTimeout(() => { setShown(s => s + 1); setTyping(false); }, delays[shown - 1] || 1200);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div style={{ width: 252, margin: '0 auto', background: '#0f0f18', borderRadius: 38, border: '2.5px solid rgba(255,255,255,0.13)', padding: '16px 13px 20px', boxShadow: '0 28px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.09)', position: 'relative' }}>
      <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, margin: '0 auto 16px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E85D20,#ff9a6c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 0 14px rgba(232,93,32,0.5)' }}>⚡</div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', fontFamily: dm }}>FastIQ</div>
          <div style={{ fontSize: 9, color: '#4ade80', fontFamily: dm, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80', animation: 'glowPulse 2s ease infinite' }} />
            Working for you
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 200 }}>
        {messages.slice(0, shown).map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === 'sent' ? 'flex-end' : 'flex-start', maxWidth: '90%', background: m.from === 'sent' ? 'linear-gradient(135deg,#E85D20,#ff7340)' : m.from === 'reply' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.07)', borderRadius: m.from === 'sent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 12px', border: m.from === 'reply' ? '1px solid rgba(74,222,128,0.3)' : 'none', animation: 'msgIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <p style={{ fontFamily: dm, fontSize: 10.5, color: m.from === 'reply' ? '#4ade80' : '#fff', margin: 0, lineHeight: 1.5, opacity: m.from === 'ai' ? 0.72 : 1 }}>{m.text}</p>
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }} />)}
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 22, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.2)', fontFamily: dm, flex: 1 }}>FastIQ is writing your next move...</span>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#E85D20,#ff7340)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>→</div>
      </div>
    </div>
  );
}

// ── Imperfect student testimonial card ──
function StudentCard({ story }) {
  const accentIsLight = story.color === '#a8ff3e' || story.color === '#78ff44';
  return (
    <div style={{
      width: 252, flexShrink: 0,
      borderRadius: 24,
      overflow: 'hidden',
      transform: `rotate(${story.rotate})`,
      boxShadow: `0 20px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07), 0 0 40px ${story.color}18`,
      scrollSnapAlign: 'start',
      position: 'relative',
    }}>
      {/* Blurred background photo */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={story.bg} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.22) saturate(0.65)', transform: 'scale(1.12)' }} />
      </div>
      {/* Color top accent bar — thicker + glowing */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${story.color}, ${story.color}88, transparent)`, boxShadow: `0 0 16px ${story.color}99` }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px 17px' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2.5px solid ${story.color}`, boxShadow: `0 0 18px ${story.color}66` }}>
            <img src={story.photo} alt={story.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.style.background=story.color; e.target.parentNode.innerHTML=`<span style="font-size:15px;font-weight:900;color:#000;display:flex;align-items:center;justify-content:center;height:100%">${story.initials}</span>`; }} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', fontFamily: dm, lineHeight: 1.2 }}>{story.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', fontFamily: dm, marginTop: 1 }}>{story.school}</div>
          </div>
          {/* Live green dot */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a8ff3e', boxShadow: '0 0 10px #a8ff3e', flexShrink: 0, animation: 'glowPulse 2s ease infinite' }} />
          </div>
        </div>
        {/* Quote */}
        <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: '0 0 15px', fontStyle: 'italic', letterSpacing: '-0.01em' }}>
          "{story.quote}"
        </p>
        {/* Win pill — electric accent */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${story.color}22`, border: `1.5px solid ${story.color}66`, borderRadius: 100, padding: '6px 14px', backdropFilter: 'blur(10px)', boxShadow: `0 0 12px ${story.color}33` }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: story.color, fontFamily: dm, textShadow: `0 0 12px ${story.color}88` }}>{story.win}</span>
        </div>
      </div>
    </div>
  );
}

function Countdown({ timeLeft }) {
  if (!timeLeft) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: 100, padding: '5px 15px', fontSize: 12, fontWeight: 700, color: '#c9a84c', fontFamily: dm }}>
      ⏱ {timeLeft} left at $14.50/mo
    </span>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, minHeight: 'auto' }}>
        <span style={{ fontFamily: dm, fontSize: 15, fontWeight: 600, color: '#1f2937', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: '#E85D20', flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dm, fontSize: 14, color: '#334155', lineHeight: 1.75, margin: '0 0 18px', paddingRight: 20 }}>{a}</p>}
    </div>
  );
}

function RoleToggle({ mode, onChange }) {
  return (
    <div style={{ position: 'sticky', top: 53, zIndex: 90, padding: '10px 16px', background: 'rgba(224,242,254,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(34,211,238,0.18)' }}>
      <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 100, padding: 4 }}>
        <button
          onClick={() => onChange('student')}
          style={{ flex: 1, fontFamily: dm, fontSize: 14, fontWeight: 800, color: mode === 'student' ? '#0f172a' : 'rgba(0,0,0,0.38)', background: mode === 'student' ? '#22d3ee' : 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: mode === 'student' ? '0 4px 22px rgba(34,211,238,0.5)' : 'none', transition: 'all 0.25s ease' }}
        >
          🎓 I need help
        </button>
        <button
          onClick={() => onChange('helper')}
          style={{ flex: 1, fontFamily: dm, fontSize: 14, fontWeight: 800, color: mode === 'helper' ? '#fff' : 'rgba(0,0,0,0.38)', background: mode === 'helper' ? 'linear-gradient(135deg,#3b7af5,#4f8cff)' : 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: mode === 'helper' ? '0 4px 22px rgba(79,140,255,0.45)' : 'none', transition: 'all 0.25s ease' }}
        >
          🤝 I want to help
        </button>
      </div>
    </div>
  );
}

// ── Hero photo collage (casual, warm, real) ──
function HeroPhotoStrip() {
  const photos = [
    { src: 'https://media.base44.com/images/public/684474c5723dc90efce23588/a6cbf8906_image.png', label: 'got the reply 🎉', rotate: '-2deg', flex: '1.15', pos: 'center 15%' },
    { src: 'https://media.base44.com/images/public/684474c5723dc90efce23588/ef8274082_IMG_0004.jpg', label: '48h turnaround ✅', rotate: '1deg', flex: '1', pos: 'center center' },
    { src: 'https://media.base44.com/images/public/684474c5723dc90efce23588/dadeb9101_IMG_0005.jpg', label: '3 chats booked 🚀', rotate: '2.5deg', flex: '1.1', pos: 'center 20%' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, height: 138, marginBottom: 18 }}>
      {photos.map((p, i) => (
        <div key={i} style={{ flex: p.flex, position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.55)', transform: `rotate(${p.rotate})`, flexShrink: 0 }}>
          <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos || 'center', filter: 'saturate(0.95) brightness(0.8)' }} />
          {/* Grain overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '32px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 7, left: 8, right: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: dm, textShadow: '0 1px 4px rgba(0,0,0,0.9)', letterSpacing: '0.01em' }}>{p.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showFoundingBanner, setShowFoundingBanner] = useState(true);
  const [activeWin, setActiveWin] = useState(0);
  const [mode, setMode] = useState('student');

  const handleModeChange = (newMode) => {
    trackEvent('landing_mode_toggle', { mode: newMode });
    setMode(newMode);
    try { localStorage.setItem('lp_mode', newMode); } catch {}
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
        @keyframes msgIn { from { opacity:0; transform:translateY(10px) scale(0.94); } to { opacity:1; transform:none; } }
        @keyframes dotBounce { 0%,60%,100% { transform:translateY(0); opacity:0.35; } 30% { transform:translateY(-6px); opacity:1; } }
        @keyframes floatPhone { 0%,100% { transform:translateY(0) rotate(-1.5deg); } 50% { transform:translateY(-12px) rotate(2deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(232,93,32,0.55); } 50% { box-shadow:0 0 0 10px rgba(232,93,32,0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
        @keyframes iconPop { 0% { opacity:0; transform:scale(0.5) rotate(-12deg); } 70% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:none; } }
        @keyframes heroPulse { 0%,100% { opacity:0.55; } 50% { opacity:1; } }
        @keyframes badgeFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes ctaShine { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes modeFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes grainAnim { 0%,100% { transform:translate(0,0); } 25% { transform:translate(-1%,1%); } 50% { transform:translate(1%,-1%); } 75% { transform:translate(-0.5%,0.5%); } }
        @keyframes ctaPop { 0%,100% { transform:scale(1); } 50% { transform:scale(1.015); } }
        @keyframes tickerSlide { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
        @keyframes limeGlow { 0%,100% { box-shadow:0 0 0 0 rgba(168,255,62,0.5); } 50% { box-shadow:0 0 0 10px rgba(168,255,62,0); } }
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
    const t2 = setInterval(() => setActiveWin(w => (w + 1) % WINS.length), 3800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const isStudent = mode === 'student';
  const modeAnim = { animation: 'modeFade 0.32s ease both' };

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

      <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: dm, overflowX: 'hidden' }}>

        {/* Ambient color blobs — electric energy */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: isStudent
            ? 'radial-gradient(ellipse 100% 55% at 50% -8%, rgba(34,211,238,0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 92% 20%, rgba(168,255,62,0.20) 0%, transparent 50%), radial-gradient(ellipse 45% 35% at 5% 70%, rgba(232,93,32,0.10) 0%, transparent 50%)'
            : 'radial-gradient(ellipse 100% 55% at 50% -8%, rgba(59,122,245,0.22) 0%, transparent 55%), radial-gradient(ellipse 45% 32% at 92% 22%, rgba(124,58,237,0.14) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 5% 65%, rgba(34,211,238,0.10) 0%, transparent 50%)',
          transition: 'background 0.8s ease',
        }} />
        {/* Subtle paper texture */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.035, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(7,7,13,0.93)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E85D20', animation: 'glowPulse 2.5s ease infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>CFF</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.36)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 4px' }}>Sign in</button>
            <button onClick={isStudent ? onStudentJoin : onParentJoin} style={{ fontSize: 13, fontWeight: 800, color: isStudent ? '#0f172a' : '#fff', background: isStudent ? '#22d3ee' : 'rgba(79,140,255,0.28)', border: isStudent ? 'none' : '1px solid rgba(79,140,255,0.45)', borderRadius: 11, padding: '9px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: isStudent ? '0 4px 20px rgba(34,211,238,0.4)' : 'none' }}>
              {isStudent ? 'Try free →' : 'Join free →'}
            </button>
          </div>
        </nav>

        {/* ── ROLE TOGGLE ── */}
        <RoleToggle mode={mode} onChange={handleModeChange} />

        {/* ── HERO GRADIENT BAND ── */}
        <div style={{ position: 'absolute', top: 96, left: 0, right: 0, height: 480, pointerEvents: 'none', zIndex: 1,
          background: isStudent
            ? 'linear-gradient(180deg, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0.10) 50%, rgba(248,249,250,0) 100%)'
            : 'linear-gradient(180deg, rgba(59,122,245,0.22) 0%, rgba(124,58,237,0.08) 50%, rgba(248,249,250,0) 100%)',
          transition: 'background 0.7s ease',
        }} />

        {/* ── HERO ── */}
        <div key={mode} style={{ position: 'relative', zIndex: 2, padding: '44px 20px 24px', maxWidth: 640, margin: '0 auto', textAlign: 'center', ...modeAnim }}>
          {/* Color block behind headline */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 560, height: 420, borderRadius: '50%', background: isStudent ? 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(168,255,62,0.18) 40%, transparent 70%)' : 'radial-gradient(circle, rgba(59,122,245,0.24) 0%, rgba(124,58,237,0.12) 50%, transparent 70%)', pointerEvents: 'none', filter: 'blur(56px)', animation: 'heroPulse 5s ease-in-out infinite' }} />

          {/* Live badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: isStudent ? 'rgba(22,163,74,0.12)' : 'rgba(37,99,235,0.12)', border: `1.5px solid ${isStudent ? 'rgba(22,163,74,0.38)' : 'rgba(37,99,235,0.38)'}`, borderRadius: 100, padding: '8px 20px', animation: 'badgeFloat 3.5s ease-in-out infinite', boxShadow: isStudent ? '0 2px 12px rgba(22,163,74,0.15)' : '0 2px 12px rgba(37,99,235,0.15)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: isStudent ? '#16a34a' : '#2563eb', boxShadow: `0 0 8px ${isStudent ? '#16a34a' : '#2563eb'}` }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: isStudent ? '#14532d' : '#1e3a8a', letterSpacing: '-0.01em' }}>
                {isStudent ? 'Real students landing intros right now' : 'Join 1,000+ parents & alumni helping students'}
              </span>
            </div>
          </div>

          {/* Main headline */}
          <h1 style={{ fontSize: 'clamp(28px, 7.5vw, 52px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.038em', color: '#1f2937', margin: '0 0 17px', position: 'relative' }}>
            {isStudent ? (
              <>
                Finding an internship or job<br />
                <span style={{ color: '#E85D20' }}>without a personal connection</span>{' '}
                <span style={{ color: 'rgba(0,0,0,0.65)', fontWeight: 800 }}>seems impossible.</span>
              </>
            ) : (
              <>
                Imagine you had{' '}
                <span style={{ color: '#2563eb' }}>1,000+ best friends</span>{' '}
                helping your kid land a job.
              </>
            )}

          </h1>

          {/* "Well, now you do." standalone line — parent mode only */}
          {!isStudent && (
            <p style={{ fontFamily: dm, fontSize: 'clamp(22px, 5.5vw, 36px)', fontWeight: 900, color: '#E85D20', fontStyle: 'italic', letterSpacing: '-0.025em', margin: '0 0 18px', lineHeight: 1.1 }}>
              Well, now you do.
            </p>
          )}

          {/* Clarity line */}
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#0891b2', background: 'rgba(34,211,238,0.09)', border: '1px solid rgba(34,211,238,0.28)', borderRadius: 100, padding: '7px 18px', display: 'inline-block', margin: '0 0 18px' }}>
            {isStudent
              ? <>The parent &amp; alumni network is 100% free. FastIQ is the optional AI upgrade.</>
              : <>The parent &amp; alumni network is 100% free and specific to your kid's school. FastIQ is the optional AI upgrade.</>
            }
          </p>

          {/* Sub */}
          <p style={{ fontSize: 16, color: '#334155', lineHeight: 1.72, maxWidth: 460, margin: '0 auto 18px', textAlign: 'center' }}>
            {isStudent ? (
              <>You actually have thousands of personal connections that want to help right now.</>
            ) : (
              <>
                The more of us who join, the stronger the opportunities become for every student —{' '}
                <strong style={{ color: '#1f2937', fontWeight: 700 }}>including your own.</strong>
              </>
            )}
          </p>

          {/* Stat pill — helper mode only */}
          {!isStudent && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.08)', border: '1.5px solid rgba(37,99,235,0.25)', borderRadius: 14, padding: '10px 18px', margin: '0 auto 22px', maxWidth: 460, textAlign: 'left' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📊</span>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#1e3a8a', margin: 0, lineHeight: 1.55 }}>
                <strong>70–80% of jobs are filled through personal connections</strong> — not cold applications. We make those warm intros real and easy.
              </p>
            </div>
          )}

          {/* ── MAIN CTA — big, electric, unmissable ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            {isStudent ? (
              <>
                <button
                  onClick={onStudentJoin}
                  style={{
                    fontSize: 20, fontWeight: 900, color: '#0f172a',
                    background: '#22d3ee',
                    backgroundSize: '220% auto',
                    border: 'none', borderRadius: 22,
                    padding: '26px 36px',
                    cursor: 'pointer', width: '100%', maxWidth: 480,
                    minHeight: 'auto',
                    boxShadow: '0 10px 15px -3px rgba(34,211,238,0.3), 0 20px 40px rgba(34,211,238,0.2), 0 2px 0 rgba(255,255,255,0.3) inset',
                    letterSpacing: '-0.02em', lineHeight: 1.2,
                    animation: 'ctaPop 4s ease-in-out infinite',
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#67e8f9'; e.currentTarget.style.boxShadow='0 20px 25px -5px rgba(34,211,238,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#22d3ee'; e.currentTarget.style.boxShadow='0 10px 15px -3px rgba(34,211,238,0.3), 0 20px 40px rgba(34,211,238,0.2)'; }}
                >
                  🎓 I'm a student — Try FastIQ free for 7 days (no card needed)
                </button>
                <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.45)', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: '14px 32px', cursor: 'pointer', width: '100%', maxWidth: 480, minHeight: 'auto' }}>
                  🤝 I'm a parent/alumni — Join the free network
                </button>
              </>
            ) : (
              <>
                <button onClick={onParentJoin} style={{ fontSize: 20, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #3b7af5 0%, #4f8cff 50%, #7c3aed 100%)', border: 'none', borderRadius: 22, padding: '26px 36px', cursor: 'pointer', width: '100%', maxWidth: 480, minHeight: 'auto', boxShadow: '0 16px 56px rgba(79,140,255,0.5)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  🤝 Join free — 2 minutes, zero obligation
                </button>
                <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.45)', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: '14px 32px', cursor: 'pointer', width: '100%', maxWidth: 480, minHeight: 'auto' }}>
                  🎓 I'm a student — Try FastIQ free
                </button>
              </>
            )}
          </div>

          {/* Social proof line */}
          <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', textAlign: 'center' }}>
            <span style={{ color: isStudent ? '#15803d' : '#1d4ed8', fontWeight: 700 }}>● Real students getting replies right now</span>
            {' · '}1,000+ helpers across 15+ schools
          </p>

          {/* Trust row */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {isStudent && foundingActive && <Countdown timeLeft={timeLeft} />}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(isStudent
                ? ['No credit card', 'Cancel anytime', '2 min to set up']
                : ['No fee ever', 'You control who you talk to', 'Join in 2 min']
              ).map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
            {isStudent && foundingActive && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)' }}>Founding Rate $14.50/mo locks in → goes to $29 after April 30</span>}
          </div>
        </div>

        {/* ── HERO VISUAL: photo strip + phone (student mode) ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 16px 44px', maxWidth: 640, margin: '0 auto' }}>
            <HeroPhotoStrip />
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', animation: mounted ? 'floatPhone 5.5s ease-in-out infinite' : 'none' }}>
                <PhoneMockup />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', margin: '10px 0 0', fontStyle: 'italic' }}>↑ FastIQ found the alum, wrote the message, she replied. Real story.</p>
            </div>
          </div>
        )}

        {/* ── HELPER QUICK WINS ── */}
        {!isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 52px', maxWidth: 640, margin: '0 auto', animation: 'modeFade 0.32s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '❤️', title: 'Real people who care', desc: 'Real parents and alumni who actually want to help — not just another cold connection.' },
                { icon: '🚪', title: 'Warm intros change everything', desc: 'One warm introduction from someone who genuinely cares can open doors that cold applications never will.' },
                { icon: '🔄', title: 'The network pays it forward', desc: 'You help one student today. The network helps yours tomorrow.' },
                { icon: '🏫', title: '15+ universities & growing', desc: 'Trusted by parents & alumni from UF, Ohio State, Penn State, and growing across 15+ schools.' },
              ].map((b, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid rgba(34,211,238,0.25)', borderRadius: 18, padding: '20px 16px', animation: mounted ? `iconPop 0.4s ease ${i * 0.07}s both` : 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 26, display: 'block', marginBottom: 9 }}>{b.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1f2937', margin: '0 0 5px' }}>{b.title}</p>
                  <p style={{ fontSize: 11.5, color: '#334155', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PARENT SCHOOL TRUST STRIP ── */}
        {!isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 0 48px', maxWidth: 640, margin: '0 auto', animation: 'modeFade 0.32s ease both' }}>
            <div style={{ padding: '0 20px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.32)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>Trusted by parents &amp; alumni from University of Florida, Ohio State, Penn State, and growing across 15+ universities</p>
            </div>
            {/* Horizontal scroll badges */}
            <div style={{
              display: 'flex', gap: 10,
              paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              {[
                { abbr: 'UF', name: 'University of Florida', color: '#0021A5', accent: '#FA4616' },
                { abbr: 'OSU', name: 'Ohio State University', color: '#BA0C2F', accent: '#666' },
                { abbr: 'PSU', name: 'Penn State', color: '#1E407C', accent: '#fff' },
                { abbr: 'UGA', name: 'University of Georgia', color: '#BA0C2F', accent: '#000' },
                { abbr: 'USC', name: 'Univ. of South Carolina', color: '#73000A', accent: '#fff' },
                { abbr: 'UM', name: 'University of Miami', color: '#005030', accent: '#F47321' },
                { abbr: 'FSU', name: 'Florida State', color: '#782F40', accent: '#CEB888' },
              ].map((s) => (
                <div key={s.abbr} style={{
                  flexShrink: 0, scrollSnapAlign: 'start',
                  background: '#fff',
                  border: '1.5px solid rgba(0,0,0,0.09)',
                  borderTop: `3px solid ${s.color}`,
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  minWidth: 100,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: '#fff',
                    letterSpacing: '-0.02em',
                  }}>{s.abbr}</div>
                  <p style={{ fontSize: 9.5, fontWeight: 600, color: '#334155', margin: 0, textAlign: 'center', lineHeight: 1.35 }}>{s.name}</p>
                </div>
              ))}
              {/* More coming placeholder */}
              <div style={{
                flexShrink: 0, scrollSnapAlign: 'start',
                background: 'rgba(0,0,0,0.03)',
                border: '1.5px dashed rgba(0,0,0,0.12)',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                minWidth: 100,
              }}>
                <p style={{ fontSize: 18, margin: 0 }}>+</p>
                <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(0,0,0,0.3)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>More schools joining</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', textAlign: 'center', margin: '14px 20px 0', lineHeight: 1.5 }}>
              1,000+ parents &amp; alumni helping students across 15+ universities
            </p>
          </div>
        )}

        {/* ── PROMPTS TO TRY ── */}
        {isStudent && <PromptsToTry onStudentJoin={onStudentJoin} />}

        {/* ── VIDEO TESTIMONIALS ── */}
        {isStudent && <VideoTestimonials onStudentJoin={onStudentJoin} />}

        {/* ── REAL STUDENT RESULTS (redesigned — raw + warm) ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 0 60px', maxWidth: 640, margin: '0 auto' }}>
            {/* Section header */}
            <div style={{ padding: '0 20px', marginBottom: 22 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(21,128,61,0.10)', border: '1.5px solid rgba(21,128,61,0.35)', borderRadius: 100, padding: '6px 16px', marginBottom: 13, boxShadow: '0 2px 12px rgba(21,128,61,0.12)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#15803d', boxShadow: '0 0 8px #15803d', animation: 'glowPulse 2s ease infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#14532d', letterSpacing: '0.04em' }}>Real students. Real results.</span>
              </div>
              <h2 style={{ fontSize: 'clamp(25px, 6.5vw, 38px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.032em', lineHeight: 1.1, margin: '0 0 9px' }}>
                They stopped applying cold.<br />
                <span style={{ color: 'rgba(0,0,0,0.38)', fontWeight: 400, fontSize: '0.9em' }}>Here's what happened instead.</span>
              </h2>
              <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.32)', margin: 0, fontStyle: 'italic' }}>Unfiltered. Raw iPhone videos coming soon — quotes below are real.</p>
            </div>

            {/* Horizontal scroll cards */}
            <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', alignItems: 'flex-start' }}>

              {/* Video placeholder — iPhone-style vertical card */}
              <div style={{
                width: 155, flexShrink: 0,
                borderRadius: 22, overflow: 'hidden',
                aspectRatio: '9/16',
                position: 'relative',
                scrollSnapAlign: 'start',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}>
                <img src="https://media.base44.com/images/public/684474c5723dc90efce23588/58e169aae_image.png" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4) saturate(0.7)' }} />
                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.4, margin: '0 0 6px', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>Raw student video<br />dropping soon</p>
                    <div style={{ background: 'rgba(232,93,32,0.9)', borderRadius: 100, padding: '3px 12px', display: 'inline-block' }}>
                      <span style={{ fontFamily: dm, fontSize: 8.5, fontWeight: 800, color: '#fff', letterSpacing: '0.07em' }}>REAL STUDENT</span>
                    </div>
                  </div>
                </div>
              </div>

              {STUDENT_STORIES.map((story, i) => (
                <StudentCard key={i} story={story} />
              ))}
            </div>

            {/* Rotating win ticker */}
            <div style={{ padding: '0 20px' }}>
              <div style={{ background: '#1a1a2e', border: '1.5px solid rgba(168,255,62,0.3)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, minHeight: 74, boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(168,255,62,0.08)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,255,62,0.15)', border: '1px solid rgba(168,255,62,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{WINS[activeWin].emoji}</div>
                <div style={{ flex: 1 }}>
                  <p key={activeWin} style={{ fontSize: 13.5, fontWeight: 700, color: '#f0ede8', margin: '0 0 3px', lineHeight: 1.35, animation: 'tickerSlide 0.3s ease' }}>"{WINS[activeWin].text}"</p>
                  <p style={{ fontSize: 11, color: '#a8ff3e', margin: 0, fontWeight: 600 }}>{WINS[activeWin].school}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                {WINS.map((_, i) => (
                  <button key={i} onClick={() => setActiveWin(i)} style={{ width: i === activeWin ? 24 : 6, height: 6, borderRadius: 3, background: i === activeWin ? '#E85D20' : 'rgba(0,0,0,0.15)', border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS BAR ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 56px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(34,211,238,0.35)', background: 'linear-gradient(135deg, #fff 0%, rgba(240,249,255,0.8) 100%)', boxShadow: '0 8px 32px rgba(34,211,238,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)' }}>
            {[['1,000+', 'helpers in the network'], ['15+', 'universities'], ['50+', 'industries']].map(([n, l], i) => (
              <div key={l} style={{ textAlign: 'center', flex: 1, padding: '22px 8px', borderLeft: i > 0 ? '1.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0e7490', letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 10.5, color: '#334155', marginTop: 5, lineHeight: 1.35 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div key={`steps-${mode}`} style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto', animation: 'modeFade 0.32s ease both' }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(25px, 6.5vw, 40px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 24px' }}>
            {isStudent
              ? <>From zero to interview.<br /><span style={{ color: 'rgba(0,0,0,0.35)', fontWeight: 400, fontSize: '0.84em' }}>Days, not months. Seriously.</span></>
              : <>Simple, on your terms.<br /><span style={{ color: 'rgba(0,0,0,0.35)', fontWeight: 400, fontSize: '0.84em' }}>No commitments. Just helping.</span></>
            }
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: (isStudent && i === 3) ? 'rgba(255,237,225,0.9)' : '#fff', border: `1px solid ${(isStudent && i === 3) ? 'rgba(232,93,32,0.35)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 18, padding: '18px 16px', borderLeft: `4px solid ${(isStudent && i === 3) ? '#E85D20' : 'rgba(34,211,238,0.6)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 900, color: 'rgba(232,93,32,0.8)', letterSpacing: '0.1em' }}>{s.num}</span>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1f2937', margin: 0 }}>{s.title}</p>
                    {s.ai && <span style={{ fontSize: 8.5, fontWeight: 800, color: '#E85D20', background: 'rgba(232,93,32,0.12)', borderRadius: 100, padding: '2px 8px', border: '1px solid rgba(232,93,32,0.3)', whiteSpace: 'nowrap' }}>AI POWERED</span>}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#334155', margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FASTIQ FEATURES ── */}
        {isStudent && (
          <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>FastIQ unlocks</p>
            <h2 style={{ fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 8px' }}>Want to turbocharge your job search?</h2>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#E85D20', margin: '0 0 8px', lineHeight: 1.4 }}>Meet FastIQ, your personal career agent available 24/7.</p>
            <p style={{ fontSize: 14, color: '#334155', margin: '0 0 22px', lineHeight: 1.65 }}>FastIQ finds alumni, crafts personalized outreach, tailors your resume, spots hiring signals, and turns those warm connections into real interviews and offers.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {FASTIQ_FEATURES.map((f, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '17px 14px', animation: mounted ? `iconPop 0.4s ease ${0.05 + i * 0.06}s both` : 'none', borderTop: `3px solid ${i % 2 === 0 ? '#22d3ee' : '#E85D20'}`, boxShadow: '0 6px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 26, display: 'block', marginBottom: 9, lineHeight: 1 }}>{f.icon}</span>
                  <p style={{ fontSize: 12.5, fontWeight: 800, color: '#1f2937', margin: '0 0 4px', lineHeight: 1.2 }}>{f.label}</p>
                  <p style={{ fontSize: 11, color: '#334155', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <button onClick={onStudentJoin} style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', background: '#22d3ee', border: 'none', borderRadius: 13, padding: '14px 30px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 10px 15px -3px rgba(34,211,238,0.3)' }}>
                Get all of this free for 7 days →
              </button>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(25px, 5.5vw, 38px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 22px' }}>
            Free for helpers.<br /><span style={{ color: '#E85D20' }}>Turbo for students.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 22, padding: '24px 16px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 30, marginBottom: 12 }}>🏫</span>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>Free Network</p>
              <p style={{ fontSize: 34, fontWeight: 900, color: '#1f2937', margin: '0 0 2px', letterSpacing: '-0.04em' }}>$0</p>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', margin: '0 0 16px' }}>Forever free</p>
              <div style={{ flex: 1, marginBottom: 18 }}>
                {['Join as parent or alumni', 'Help students at your school', 'No fee, no obligation, ever'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#16a34a', fontSize: 11, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.5)', lineHeight: 1.45 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onParentJoin} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.55)', background: 'rgba(0,0,0,0.05)', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 13, padding: '12px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto' }}>
                Join free →
              </button>
            </div>
            <div style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(255,230,210,0.5) 100%)', border: '2px solid rgba(232,93,32,0.4)', borderRadius: 22, padding: '24px 16px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 32px rgba(232,93,32,0.18)' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -12, right: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#92600a', background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 100, padding: '3px 11px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🏅 Founding</span>
                </div>
              )}
              <span style={{ fontSize: 30, marginBottom: 12 }}>⚡</span>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>FastIQ AI</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 2 }}>
                <p style={{ fontSize: 34, fontWeight: 900, color: '#E85D20', margin: 0, letterSpacing: '-0.04em' }}>{foundingActive ? '$14.50' : '$29'}</p>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>/mo</span>
              </div>
              {foundingActive && <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', margin: '0 0 16px' }}>$29 after April 30</p>}
              <div style={{ flex: 1, marginBottom: 18 }}>
                {['7-day free trial, no card', 'Alumni search + AI outreach', 'Resume, mock interviews & intel'].map(b => (
                  <div key={b} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#E85D20', fontSize: 11, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.5)', lineHeight: 1.45 }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onStudentJoin} style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', background: '#22d3ee', border: 'none', borderRadius: 13, padding: '12px 14px', cursor: 'pointer', width: '100%', minHeight: 'auto', boxShadow: '0 10px 15px -3px rgba(34,211,238,0.3)' }}>
                Try 7 days free →
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.35)', textAlign: 'center', margin: '14px 0 0' }}>No credit card · Cancel anytime · Parents can gift FastIQ too</p>
        </div>

        {/* ── FAQ ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '48px 20px 64px', maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 10.5, fontWeight: 800, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>FAQs</p>
          <h2 style={{ fontSize: 'clamp(22px, 5.5vw, 34px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.03em', margin: '0 0 22px' }}>Got questions? Fair.</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px 84px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: isStudent ? 'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.12) 100%)' : 'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(59,122,245,0.15) 100%)', border: `2px solid ${isStudent ? 'rgba(34,211,238,0.45)' : 'rgba(59,122,245,0.3)'}`, borderRadius: 26, padding: '52px 24px 48px', position: 'relative', overflow: 'hidden', boxShadow: isStudent ? '0 12px 56px rgba(34,211,238,0.18), inset 0 1px 0 rgba(255,255,255,0.8)' : '0 12px 56px rgba(59,122,245,0.16), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
            {/* Organic shape accent */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', background: isStudent ? 'rgba(34,211,238,0.12)' : 'rgba(79,140,255,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%', background: isStudent ? 'rgba(232,93,32,0.07)' : 'rgba(124,58,237,0.06)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 46, marginBottom: 16, position: 'relative' }}>{isStudent ? '🚀' : '🤝'}</div>
            <h2 style={{ fontSize: 'clamp(27px, 6.5vw, 46px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.035em', lineHeight: 1.08, margin: '0 0 14px', position: 'relative' }}>
              {isStudent ? <>Your next opportunity is<br />literally one intro away.</> : <>One intro from you can<br />change everything.</>}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.45)', lineHeight: 1.68, margin: '0 auto 30px', maxWidth: 340, position: 'relative' }}>
              {isStudent ? 'No credit card. No BS. Just real intros and AI that actually works.' : 'Free. 2 minutes. No obligation. Students at your school genuinely need you.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', position: 'relative' }}>
              {isStudent ? (
                <>
                  <button onClick={onStudentJoin} style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', background: '#22d3ee', border: 'none', borderRadius: 18, padding: '22px 36px', cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto', boxShadow: '0 10px 15px -3px rgba(34,211,238,0.3), 0 20px 25px -5px rgba(34,211,238,0.2)' }}>
                    🎓 Try FastIQ free — 7 days
                  </button>
                  <button onClick={onParentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.45)', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: '16px 36px', cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto' }}>
                    🤝 Join as parent/alumni — free
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onParentJoin} style={{ fontSize: 17, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%)', border: 'none', borderRadius: 18, padding: '22px 36px', cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto', boxShadow: '0 12px 48px rgba(79,140,255,0.42)' }}>
                    🤝 Join free — help students now
                  </button>
                  <button onClick={onStudentJoin} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.45)', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, padding: '16px 36px', cursor: 'pointer', width: '100%', maxWidth: 420, minHeight: 'auto' }}>
                    🎓 I'm a student — Try FastIQ free
                  </button>
                </>
              )}
              {foundingActive && <div style={{ marginTop: 4 }}><Countdown timeLeft={timeLeft} /></div>}
            </div>
          </div>
        </div>

        {/* ── SHARE SECTION ── */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto' }}>
          <ShareSection />
        </div>

        {/* ── FOOTER ── */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(0,0,0,0.08)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.28)' }}>© 2026 College Fast Forward</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#Terms" style={{ fontSize: 12, color: 'rgba(0,0,0,0.28)', textDecoration: 'none' }}>Terms</a>
            <a href="#Privacy" style={{ fontSize: 12, color: 'rgba(0,0,0,0.28)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;