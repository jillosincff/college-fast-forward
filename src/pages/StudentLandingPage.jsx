import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import ParentLandingPage from '@/pages/ParentLandingPage';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const C = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  orange: '#E85D20',
  orangeLight: 'rgba(232,93,32,0.08)',
  orangeBorder: 'rgba(232,93,32,0.2)',
  cyan: '#22d3ee',
  cyanLight: 'rgba(34,211,238,0.08)',
  cyanBorder: 'rgba(34,211,238,0.25)',
  dark: '#1f2937',
  body: '#334155',
  muted: '#6b7280',
  hint: '#9ca3af',
  border: 'rgba(0,0,0,0.08)',
};

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const STEPS = [
  {
    number: '01',
    title: 'Find your network',
    desc: 'Search alumni at any company in your target industry. Filter by school, role, or sector. Find the exact person who can open the door.',
    tag: 'Alumni Search',
    tagColor: C.cyan,
    tagBg: C.cyanLight,
  },
  {
    number: '02',
    title: 'Start the conversation',
    desc: 'FastIQ drafts your outreach in seconds — personalized, professional, and warm. Not a cold email. A real introduction.',
    tag: 'AI Outreach',
    tagColor: C.orange,
    tagBg: C.orangeLight,
  },
  {
    number: '03',
    title: 'FastIQ keeps you moving',
    desc: 'Resume tailoring, mock interviews, company intel, and a daily action plan. Every day you know exactly what to do next.',
    tag: 'Full Career Engine',
    tagColor: C.cyan,
    tagBg: C.cyanLight,
  },
];

const FEATURES = [
  { icon: '🔍', title: 'Alumni Search', desc: 'Find alumni at any company in your target industry. One search, instant warm connection.' },
  { icon: '✍️', title: 'AI Outreach Drafts', desc: "Personalized messages that don't sound like ChatGPT. Real, warm, and specific to each person." },
  { icon: '📄', title: 'Resume Tailoring', desc: "Score and rewrite your resume for specific roles. Know exactly what's missing before you apply." },
  { icon: '🎤', title: 'Mock Interviews', desc: 'Practice with AI that knows the company and role. Get feedback that actually helps.' },
  { icon: '📊', title: 'Company Intel', desc: "Real-time hiring signals. Know who's actually hiring before you spend hours applying." },
  { icon: '⚡', title: 'Daily Briefing', desc: 'Wake up knowing exactly what to do today. No more staring at a blank screen wondering where to start.' },
];

const TESTIMONIALS = [
  { quote: 'One warm intro did more than 50 applications.', author: 'Student, Class of 2025', initials: 'AK' },
  { quote: "My daughter landed her internship through a connection she never would have found alone.", author: 'UF Parent', initials: 'LM' },
  { quote: "A conversation through CFF changed the trajectory of my son's career.", author: 'CFF Member', initials: 'JS' },
];

const FAQS = [
  { q: 'Is this actually free to try?', a: '7 days free, no credit card needed. Full access to everything — alumni search, outreach drafts, resume tailoring, mock interviews, company intel. After 7 days it\'s $14.50/month at our founding rate.' },
  { q: 'How is this different from LinkedIn?', a: "LinkedIn is a database. College Fast Forward is a warm network. The parents and alumni here have actively agreed to help students from their school. That's a fundamentally different conversation." },
  { q: 'What schools are in the network?', a: "We're building networks at colleges across the country. Whatever school you attend, that's the community you're connected to." },
  { q: 'Can my parents pay for FastIQ?', a: 'Yes. Parents can gift FastIQ directly from their dashboard. A lot of parents would rather do something concrete than just worry.' },
  { q: "What if I'm an alumni looking for a job?", a: 'FastIQ works for recent grads too. The alumni search, outreach tools, and career engine are built for anyone in an active job search.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16,
        padding: '18px 0', background: 'none', border: 'none',
        cursor: 'pointer', minHeight: 'auto',
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: C.dark, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontSize: 22, color: C.orange, flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <p style={{ fontFamily: dmSans, fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 18px' }}>{a}</p>
      )}
    </div>
  );
}

export default function StudentLandingPage({ onParentClick }) {
  const [showParent, setShowParent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('student-lp-fonts')) {
      const link = document.createElement('link');
      link.id = 'student-lp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
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
    const countdown = setInterval(updateCountdown, 60000);
    const quotes = setInterval(() => setActiveTestimonial(q => (q + 1) % TESTIMONIALS.length), 5000);
    return () => { clearInterval(countdown); clearInterval(quotes); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const handleTrial = () => navigate('GetStarted');
  const handleParent = () => { if (onParentClick) onParentClick(); else setShowParent(true); };

  if (showParent) {
    return <ParentLandingPage onStudentClick={() => setShowParent(false)} />;
  }

  return (
    <div style={{ background: C.bg, fontFamily: dmSans, color: C.dark, overflowX: 'hidden' }}>

      {/* ── ROLE TOGGLE ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, padding: '10px 16px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 5, background: C.bg, borderRadius: 100, padding: 4, border: `1px solid ${C.border}` }}>
          <button
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: C.orange, border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(232,93,32,0.3)', transition: 'all 0.25s ease' }}
          >
            🎓 I need help
          </button>
          <button
            onClick={handleParent}
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: C.muted, background: 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.25s ease' }}
          >
            🤝 I want to help
          </button>
        </div>
      </div>

      {/* ── SECTION 1: HERO ── */}
      <div style={{
        background: C.bgWhite,
        padding: '80px 24px 72px',
        textAlign: 'center',
        borderBottom: `1px solid ${C.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: `radial-gradient(ellipse, ${C.cyanLight} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.cyanLight, border: `1px solid ${C.cyanBorder}`,
          borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
          position: 'relative',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Real students getting replies right now
          </span>
        </div>

        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(34px, 5.5vw, 64px)',
          fontWeight: 700, color: C.dark,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 0 10px', maxWidth: 720,
          marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.1s',
          position: 'relative',
        }}>
          You've applied to hundreds of jobs.
        </h1>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(34px, 5.5vw, 64px)',
          fontWeight: 700, color: C.orange, fontStyle: 'italic',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 0 32px', maxWidth: 720,
          marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.15s',
          position: 'relative',
        }}>
          The silence is not your fault.
        </h1>

        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
          color: C.body, lineHeight: 1.75,
          maxWidth: 520, margin: '0 auto 12px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
          position: 'relative',
        }}>
          The job market isn't broken. The <em>access</em> is broken. 70% of jobs are filled through personal connections — and nobody built a tool that gives students those connections.
        </p>

        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 1.8vw, 18px)',
          fontWeight: 700, color: C.cyan,
          margin: '0 auto 44px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
          position: 'relative',
        }}>
          Until now.
        </p>

        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: 14,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s',
          position: 'relative',
        }}>
          <button onClick={handleTrial} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.25)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.25)'; }}
          >
            Try FastIQ free — 7 days →
          </button>
          <button onClick={handleParent} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            color: C.muted, background: C.bgWhite,
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '16px 28px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >
            I'm here to help →
          </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13, color: C.hint, margin: 0,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s',
          position: 'relative',
        }}>
          No credit card needed. {foundingActive && timeLeft ? `Founding rate $14.50/mo — ${timeLeft} left.` : '$29/mo after trial.'}
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', marginTop: 56,
          paddingTop: 40, borderTop: `1px solid ${C.border}`,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
          position: 'relative',
        }}>
          {[
            { number: '1,000+', label: 'Helpers in network' },
            { number: '15+', label: 'Universities' },
            { number: '50+', label: 'Industries' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '0 40px',
              borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
            }}>
              <p style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: C.orange, margin: '0 0 4px', lineHeight: 1 }}>{s.number}</p>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: C.hint, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          How it works
        </p>
        <h2 style={{
          fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)',
          fontWeight: 700, color: C.dark,
          lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          From zero to interview.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, fontStyle: 'italic', color: C.hint, margin: '0 0 40px' }}>
          Days, not months. Seriously.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map(({ number, title, desc, tag, tagColor, tagBg }, i) => (
            <div key={number} style={{
              display: 'flex', alignItems: 'flex-start', gap: 20,
              padding: '28px 0',
              borderBottom: i < STEPS.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: C.orangeLight, border: `1px solid ${C.orangeBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 13, fontWeight: 800,
                color: C.orange, letterSpacing: '0.04em', marginTop: 2,
              }}>
                {number}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: C.dark, margin: 0 }}>{title}</p>
                  <span style={{
                    fontFamily: dmSans, fontSize: 10, fontWeight: 700,
                    color: tagColor, background: tagBg,
                    border: `1px solid ${tagColor}40`,
                    borderRadius: 100, padding: '2px 10px',
                    letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{tag}</span>
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <button onClick={handleTrial} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 10, padding: '14px 28px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.25)',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Start free — no credit card →
          </button>
        </div>
      </div>

      {/* ── SECTION 3: SOCIAL PROOF ── */}
      <div style={{
        background: C.bgWhite,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: '64px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>
            Real students. Real results.
          </p>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)',
            fontWeight: 700, color: C.dark,
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 8px', textAlign: 'center',
          }}>
            They stopped applying cold.
          </h2>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)',
            fontWeight: 700, color: C.orange, fontStyle: 'italic',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 40px', textAlign: 'center',
          }}>
            Here's what happened instead.
          </h2>

          <div style={{
            background: C.dark, borderRadius: 16,
            aspectRatio: '16/9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: C.orange,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(232,93,32,0.4)', cursor: 'pointer',
              }}>
                <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 4 }} />
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Add your video here</p>
            </div>
          </div>

          <div style={{
            background: C.bg, border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${C.orange}`,
            borderRadius: '0 14px 14px 0',
            padding: '22px 28px', marginBottom: 14,
          }}>
            <p style={{ fontFamily: playfair, fontSize: 19, fontStyle: 'italic', color: C.dark, margin: '0 0 14px', lineHeight: 1.55 }}>
              "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: C.orangeLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: C.orange,
              }}>
                {TESTIMONIALS[activeTestimonial].initials}
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: C.body, margin: 0, fontWeight: 500 }}>
                {TESTIMONIALS[activeTestimonial].author}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 20 : 6, height: 6, borderRadius: 3,
                background: i === activeTestimonial ? C.orange : C.border,
                border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: FEATURES ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          FastIQ — Your AI career engine
        </p>
        <h2 style={{
          fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)',
          fontWeight: 700, color: C.dark,
          lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          Everything your job search is missing.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, color: C.muted, margin: '0 0 40px', lineHeight: 1.6 }}>
          Not just another AI tool. A complete career engine built specifically for students with a warm network behind it.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: C.bgWhite, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '20px 18px', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orangeBorder; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,93,32,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <p style={{ fontSize: 24, margin: '0 0 10px', lineHeight: 1 }}>{f.icon}</p>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: C.dark, margin: '0 0 6px' }}>{f.title}</p>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: C.muted, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 5: PRICING ── */}
      <div style={{
        background: C.bgWhite,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: '64px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>Pricing</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 4px' }}>
            Free for helpers.
          </h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.2, margin: '0 0 36px' }}>
            Turbo for students.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px' }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free Network</p>
              <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: C.dark, margin: '0 0 20px', lineHeight: 1 }}>$0</p>
              {["Browse 1,000+ parent & alumni helpers", "Access your school's network", "Message helpers directly"].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: C.body, margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleTrial} style={{
                width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                color: C.dark, background: C.bgWhite, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', marginTop: 16,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dark; }}
              >
                Join free →
              </button>
            </div>

            <div style={{ background: C.bgWhite, border: `2px solid ${C.orange}`, borderRadius: 16, padding: '28px', position: 'relative', boxShadow: '0 8px 32px rgba(232,93,32,0.1)' }}>
              {foundingActive && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%',
                  transform: 'translateX(-50%)',
                  background: C.orange, color: '#fff',
                  fontFamily: dmSans, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap',
                }}>
                  🏅 Founding Rate{timeLeft ? ` · ${timeLeft} left` : ''}
                </div>
              )}
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FastIQ</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: C.orange, margin: 0, lineHeight: 1 }}>$14.50</p>
                <span style={{ fontFamily: dmSans, fontSize: 14, color: C.hint }}>/mo</span>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: C.hint, margin: '0 0 20px' }}>$29/mo after April 30 · 7-day free trial</p>
              {['Alumni search at any company', 'AI outreach that sounds human', 'Resume tailoring + scoring', 'Mock interviews + company intel', 'Daily action plan', 'Parents can gift FastIQ'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: C.body, margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleTrial} style={{
                width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 700,
                color: '#fff', background: C.orange, border: 'none',
                borderRadius: 8, padding: '11px 0', cursor: 'pointer',
                minHeight: 'auto', boxShadow: '0 4px 12px rgba(232,93,32,0.3)', marginTop: 16,
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Try 7 days free →
              </button>
            </div>
          </div>

          <p style={{ fontFamily: dmSans, fontSize: 13, color: C.hint, textAlign: 'center', margin: 0 }}>
            No credit card to start. Cancel anytime. Parents can pay on your behalf.
          </p>
        </div>
      </div>

      {/* ── SECTION 6: FAQ ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQ</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 32px' }}>
          Got questions? Fair.
        </h2>
        {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
      </div>

      {/* ── SECTION 7: FINAL CTA ── */}
      <div style={{ background: C.dark, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Your next move
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Your next opportunity
          </h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            is one intro away.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 auto 36px' }}>
            Stop applying cold. Start connecting warm.<br />
            7 days free. No credit card. Cancel anytime.
          </p>
          <button onClick={handleTrial} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 12, padding: '16px 36px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.35)',
            marginBottom: 12, display: 'block', marginLeft: 'auto', marginRight: 'auto',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.35)'; }}
          >
            Try FastIQ free — 7 days →
          </button>
          <button onClick={handleParent} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto', transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            I'm here to help →
          </button>
          {foundingActive && timeLeft && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: C.orange, marginTop: 16, fontWeight: 600 }}>
              🏅 Founding rate ends April 30 — {timeLeft} remaining
            </p>
          )}
        </div>
      </div>

    </div>
  );
}