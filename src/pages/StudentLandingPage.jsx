import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import ParentLandingPage from '@/pages/ParentLandingPage';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const CHAT_MESSAGES = [
  { from: 'student', text: "Hi Sarah — I'm a UF junior studying finance. I saw you worked at Goldman and would love 15 min to chat about recruiting 🙏", time: '9:14 AM', delay: 600 },
  { from: 'alumni', text: "Of course! Happy to help a fellow Gator 🐊 Let's connect this week.", time: '9:41 AM', delay: 1400 },
  { from: 'result', text: "✅ Interview scheduled at Goldman Sachs", delay: 2200 },
];

const PAIN_POINTS = [
  "Applied to 200+ jobs. 3 rejections. The rest: silence.",
  "Rewrote my resume 11 times. Still nothing.",
  "My roommate got a job because her dad knew someone.",
  "I have a 3.8 GPA and I can't get a single callback.",
];

const FEATURES = [
  { icon: '🔍', title: 'Find alumni at any company', desc: 'Goldman. Google. Your dream startup. Search by school, role, or industry. Find the exact person who can get you in the door.' },
  { icon: '✍️', title: 'AI writes your outreach', desc: 'Not a template. A real, personalized message that sounds like you wrote it at midnight because you really care. Because you do.' },
  { icon: '📄', title: 'Resume that actually works', desc: 'Upload your resume. Pick the job. FastIQ rewrites it for that specific role and tells you your score before you apply.' },
  { icon: '🎤', title: 'Mock interviews', desc: "Practice for the exact company. Real questions. Real feedback. Show up like you've done it 100 times." },
  { icon: '📊', title: 'Company intel', desc: "Know who's actually hiring before you waste 3 hours on an application that goes nowhere." },
  { icon: '⚡', title: 'Daily action plan', desc: 'Wake up knowing exactly what to do. No more doom-scrolling LinkedIn at 2am.' },
];

const SOCIAL_PROOF = [
  { text: '"One warm intro did more than 50 applications."', name: 'Alex K.', school: "UF, Class of '25", tag: 'Got the job' },
  { text: '"I had 0 connections at my target companies. FastIQ found me 12 alumni in 10 minutes."', name: 'Maya R.', school: "Penn State, Class of '26", tag: 'Interview in 2 days' },
  { text: '"My daughter landed her internship through CFF. She\'d applied 40 times with no response."', name: 'Jennifer S.', school: 'UF Parent', tag: 'It works' },
];

const FAQS = [
  { q: 'Is the 7-day trial actually free?', a: "Yes. No credit card. No catch. Full access to everything. If you don't love it, you never pay a cent." },
  { q: 'How is this different from LinkedIn?', a: "LinkedIn is a database no one responds to. CFF is a warm network — parents and alumni who have literally agreed to help students from your school. That's a completely different conversation." },
  { q: "What if I'm bad at networking?", a: 'FastIQ writes the first message for you. You just review it, personalize it a little, and hit send. The hardest part is already done.' },
  { q: 'Can my parents pay for this?', a: "Yes. They can gift FastIQ directly from their account. Show them this page — they'll get it immediately." },
  { q: "What schools are in the network?", a: "We're building networks at colleges across the country. Your school is probably in there." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '20px 0', background: 'none', border: 'none',
        cursor: 'pointer', minHeight: 'auto',
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontSize: 24, color: '#E85D20', flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1,
        }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 20px' }}>{a}</p>}
    </div>
  );
}

function ChatBubble({ msg }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), msg.delay);
    return () => clearTimeout(t);
  }, []);

  if (msg.from === 'result') {
    return (
      <div style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.5s ease',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.4)',
          borderRadius: 100, padding: '8px 16px',
          fontFamily: dmSans, fontSize: 13, fontWeight: 700,
          color: '#22c55e',
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  const isStudent = msg.from === 'student';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isStudent ? 'flex-end' : 'flex-start',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 0.4s ease',
    }}>
      <div>
        <div style={{
          maxWidth: 260,
          background: isStudent ? '#E85D20' : '#fff',
          color: isStudent ? '#fff' : '#1f2937',
          borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '10px 14px',
          boxShadow: isStudent ? '0 4px 16px rgba(232,93,32,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 4,
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
        </div>
        <p style={{
          fontFamily: dmSans, fontSize: 10, color: 'rgba(255,255,255,0.35)',
          margin: 0, textAlign: isStudent ? 'right' : 'left', paddingBottom: 2,
        }}>{msg.time}</p>
      </div>
    </div>
  );
}

export default function StudentLandingPage({ onParentClick }) {
  const [showParent, setShowParent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [activePain, setActivePain] = useState(0);
  const [activeProof, setActiveProof] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('slp-fonts')) {
      const link = document.createElement('link');
      link.id = 'slp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    const updateCountdown = () => {
      const diff = FOUNDING_DEADLINE - new Date();
      if (diff <= 0) { setTimeLeft(''); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h`);
    };
    updateCountdown();
    const cd = setInterval(updateCountdown, 60000);
    const pain = setInterval(() => setActivePain(p => (p + 1) % PAIN_POINTS.length), 2800);
    const proof = setInterval(() => setActiveProof(p => (p + 1) % SOCIAL_PROOF.length), 4000);
    return () => { clearInterval(cd); clearInterval(pain); clearInterval(proof); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const handleTrial = () => navigate('GetStarted');
  const handleParent = () => { if (onParentClick) onParentClick(); else setShowParent(true); };

  if (showParent) {
    return <ParentLandingPage onStudentClick={() => setShowParent(false)} />;
  }

  return (
    <div style={{ background: '#0f1117', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── ROLE TOGGLE ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, padding: '10px 16px', background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 4 }}>
          <button
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(232,93,32,0.4)', transition: 'all 0.25s ease' }}
          >
            🎓 I need help
          </button>
          <button
            onClick={handleParent}
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.25s ease' }}
          >
            🤝 I want to help
          </button>
        </div>
      </div>

      {/* ── SECTION 1: HERO ── */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '0 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 100, padding: '6px 14px',
            opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Students getting replies right now
            </span>
          </div>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '40px 0',
          maxWidth: 680, margin: '0 auto', width: '100%',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 20px',
            marginBottom: 32, maxWidth: 500,
            opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.1s',
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 14,
              color: 'rgba(255,255,255,0.5)', margin: 0,
              fontStyle: 'italic', lineHeight: 1.5,
              transition: 'all 0.3s ease',
            }}>
              "{PAIN_POINTS[activePain]}"
            </p>
          </div>

          <h1 style={{
            fontFamily: playfair,
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.0, letterSpacing: '-0.03em',
            margin: '0 0 12px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.2s',
          }}>
            {"You're not getting"}
          </h1>
          <h1 style={{
            fontFamily: playfair,
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.0, letterSpacing: '-0.03em',
            margin: '0 0 32px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.25s',
          }}>
            {"ghosted. You're not known."}
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
            maxWidth: 500, margin: '0 0 12px',
            opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s',
          }}>
            70% of jobs are filled through connections. College Fast Forward gets you those connections — through parents and alumni from your school who actually want to help.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 18, fontWeight: 800,
            color: '#22d3ee', margin: '0 0 40px',
            opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s',
            letterSpacing: '-0.01em',
          }}>
            One warm intro beats 100 cold applications.
          </p>

          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: 16,
            opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
          }}>
            <button onClick={handleTrial} style={{
              fontFamily: dmSans, fontSize: 16, fontWeight: 800,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 14, padding: '18px 36px', cursor: 'pointer',
              minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
              transition: 'all 0.2s ease', letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
            >
              Try FastIQ free — 7 days →
            </button>
            <button onClick={handleParent} style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '18px 24px', cursor: 'pointer',
              minHeight: 'auto', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              {"I'm here to help →"}
            </button>
          </div>

          <p style={{
            fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)',
            margin: 0,
            opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.45s',
          }}>
            No credit card · {foundingActive && timeLeft ? `$14.50/mo founding rate · ${timeLeft} left` : '$29/mo after trial'}
          </p>

          <div style={{
            display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center',
            marginTop: 56,
            opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.5s',
          }}>
            {[
              { n: '1,000+', l: 'Helpers ready' },
              { n: '15+', l: 'Universities' },
              { n: '50+', l: 'Industries' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '0 32px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <p style={{ fontFamily: playfair, fontSize: 28, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: CHAT DEMO ── */}
      <div style={{ background: '#161b27', padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>
            This is what it looks like
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>
            They stopped applying cold.
          </h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 48px', textAlign: 'center' }}>
            {"Here's what happened instead."}
          </h2>

          <div style={{ background: '#1e2535', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', marginBottom: 32 }}>
            <div style={{ background: '#252d3d', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #E85D20, #c9471a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff' }}>S</div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>Sarah M. — Goldman Sachs</p>
                <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>UF Alumni · VP, Investment Banking</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Active now</span>
              </div>
            </div>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180 }}>
              {CHAT_MESSAGES.map((msg, i) => (
                <ChatBubble key={i} msg={msg} />
              ))}
            </div>
            <div style={{ background: 'rgba(232,93,32,0.08)', borderTop: '1px solid rgba(232,93,32,0.15)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Message drafted by FastIQ in 8 seconds</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '4px solid #E85D20', borderRadius: '0 14px 14px 0', padding: '22px 24px', marginBottom: 14, minHeight: 100 }}>
            <p style={{ fontFamily: playfair, fontSize: 18, fontStyle: 'italic', color: '#fff', margin: '0 0 12px', lineHeight: 1.55 }}>
              {SOCIAL_PROOF[activeProof].text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,93,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20' }}>
                {SOCIAL_PROOF[activeProof].name[0]}
              </div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{SOCIAL_PROOF[activeProof].name}</p>
                <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{SOCIAL_PROOF[activeProof].school}</p>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '3px 10px' }}>
                <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22c55e' }}>{SOCIAL_PROOF[activeProof].tag}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {SOCIAL_PROOF.map((_, i) => (
              <button key={i} onClick={() => setActiveProof(i)} style={{ width: i === activeProof ? 20 : 6, height: 6, borderRadius: 3, background: i === activeProof ? '#E85D20' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: FEATURES ── */}
      <div style={{ background: '#0f1117', padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FastIQ</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Everything you need.</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 40px' }}>{"Nothing you don't."}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <p style={{ fontSize: 24, margin: '0 0 10px', lineHeight: 1 }}>{f.icon}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{f.title}</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={handleTrial} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.35)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)'; }}
            >
              Start free — no credit card →
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: PRICING ── */}
      <div style={{ background: '#161b27', padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>Pricing</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 4px' }}>Free for helpers.</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.2, margin: '0 0 36px' }}>Turbo for students.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px' }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free Network</p>
              <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1 }}>$0</p>
              {['Browse 1,000+ parent & alumni helpers', "Access your school's network", 'Message helpers directly'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleTrial} style={{ width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', marginTop: 16 }}>
                Join free →
              </button>
            </div>
            <div style={{ background: 'rgba(232,93,32,0.06)', border: '2px solid #E85D20', borderRadius: 16, padding: '28px', position: 'relative', boxShadow: '0 8px 40px rgba(232,93,32,0.15)' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  🏅 Founding Rate{timeLeft ? ` · ${timeLeft} left` : ''}
                </div>
              )}
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FastIQ</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: '#E85D20', margin: 0, lineHeight: 1 }}>$14.50</p>
                <span style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>$29/mo after April 30 · 7-day free trial</p>
              {['Alumni search at any company', 'AI outreach that sounds human', 'Resume tailoring + scoring', 'Mock interviews + company intel', 'Daily action plan', 'Parents can gift FastIQ'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleTrial} style={{ width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 8, padding: '12px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.35)', marginTop: 16, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Try 7 days free — no card needed →
              </button>
            </div>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0 }}>
            No credit card to start. Cancel anytime. Parents can pay on your behalf.
          </p>
        </div>
      </div>

      {/* ── SECTION 5: FAQ ── */}
      <div style={{ background: '#0f1117', padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQ</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 32px' }}>Got questions? Fair.</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* ── SECTION 6: FINAL CTA ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a05 0%, #2d1206 50%, #1a0a05 100%)', padding: '80px 24px', borderTop: '1px solid rgba(232,93,32,0.2)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,93,32,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 20px' }}>Your next move</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Stop applying into</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 24px' }}>the void.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 auto 36px' }}>
            One warm intro changes everything.<br />7 days free. No credit card. No excuses.
          </p>
          <button onClick={handleTrial} style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '18px 40px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 40px rgba(232,93,32,0.5)', marginBottom: 14, display: 'block', marginLeft: 'auto', marginRight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(232,93,32,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(232,93,32,0.5)'; }}
          >
            Try FastIQ free — 7 days →
          </button>
          <button onClick={handleParent} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            {"I'm here to help →"}
          </button>
          {foundingActive && timeLeft && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#E85D20', marginTop: 16, fontWeight: 600 }}>
              🏅 Founding rate ends April 30 — {timeLeft} remaining
            </p>
          )}
        </div>
      </div>

    </div>
  );
}