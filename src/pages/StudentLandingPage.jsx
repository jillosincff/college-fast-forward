import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: '🎯',
    title: 'Know What to Apply For',
    desc: 'Smart opportunity matching + daily hiring signals so you always know your next best move.',
  },
  {
    number: '02',
    icon: '✨',
    title: 'Stand Out',
    desc: 'AI agents for resume versions, cover letters & LinkedIn optimization.',
  },
  {
    number: '03',
    icon: '📋',
    title: 'Stay Organized & Move Forward',
    desc: 'Track every application, manage resume versions per company, send outreach, and prepare for interviews — all in one workspace.',
  },
];

const STORIES = [
  {
    quote: "I finally had one place for everything. The Agent helped me stay organized and I landed an internship in 3 weeks.",
    name: "Chris C.",
    school: "USC '27",
    initials: "CC",
    tag: "Internship locked",
    tagIcon: "🎯",
  },
  {
    quote: "I found a Disney alum from my school in 2 minutes. She actually responded.",
    name: "Jordan T.",
    school: "USC '27 · Marketing",
    initials: "J",
    tag: "Response received",
    tagIcon: "✉️",
  },
  {
    quote: "I literally had no clue how to start my job search. The Agent gave me a clear plan and kept everything organized.",
    name: "Marcus",
    school: "Penn State · Senior · Finance",
    initials: "M",
    tag: "3 interviews booked",
    tagIcon: "📅",
  },
  {
    quote: "I applied to over 100 jobs and got zero responses. I reached out to one parent from my school and he got me an interview by the following Monday.",
    name: "Sarah K.",
    school: "University of Michigan · Junior · Engineering",
    initials: "S",
    tag: "Got the role",
    tagIcon: "🎯",
  },
];

const FREE_FEATURES = [
  'Basic resume help',
  'Limited Agent usage',
  'Application tracker + workspace',
  'Perfect for getting started',
];

const PRO_FEATURES = [
  'Unlimited AI agents',
  'Full resume version history & tracking',
  'Advanced optimization + outreach',
  'Daily signals and interview prep',
  'Most students upgrade once they experience the organized workspace',
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
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderLeft: '4px solid #E85D20',
          borderRadius: '0 20px 20px 0',
          padding: '36px 36px 32px',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.07}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 190, position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: 20, fontFamily: playfair, fontSize: 90, lineHeight: 1, color: 'rgba(255,255,255,0.05)', fontWeight: 700, pointerEvents: 'none' }}>"</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
          <span style={{ fontSize: 12 }}>{s.tagIcon}</span>
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 'clamp(17px, 2.2vw, 22px)', fontStyle: 'italic', fontWeight: 700, color: '#fff', lineHeight: 1.55, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #E85D20, #c9471a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {s.initials}
          </div>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{s.name}</p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{s.school}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STORIES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 24 : 6, height: 6, borderRadius: 3, background: i === active ? '#E85D20' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.2)'; e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.color = '#E85D20'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            >{arrow}</button>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '10px 0 0' }}>
        swipe or drag · {active + 1} of {total}
      </p>
    </div>
  );
}

export default function StudentLandingPage({ onParentClick }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('slp-fonts')) {
      const link = document.createElement('link');
      link.id = 'slp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const go = () => navigate('GatorAuth');

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  return (
    <div style={{ background: '#08080f', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(232,93,32,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.25)',
          borderRadius: 100, padding: '7px 18px', marginBottom: 36,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            AI Job Search Agent for College Students
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(40px, 7vw, 88px)',
          fontWeight: 700, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.03em',
          margin: '0 0 16px', maxWidth: 760,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          Your Job Search<br />
          <span style={{ color: '#E85D20', fontStyle: 'italic' }}>Workspace</span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 17px)',
          fontWeight: 700, color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.4, maxWidth: 500, margin: '0 auto 10px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.15s',
        }}>
          One organized platform with built-in AI agents.
        </p>
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 17px)',
          fontWeight: 400, color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7, maxWidth: 600, margin: '0 auto 44px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          Manage applications, track resume versions per job, write outreach, optimize LinkedIn, prep for interviews — everything in a single dashboard.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s' }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 40px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Try the Agent Free
          </button>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
            padding: '18px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            Watch 45-second demo →
          </button>
        </div>

        {/* Trust line */}
        <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s' }}>
          Free to start &nbsp;•&nbsp; No credit card needed &nbsp;•&nbsp; Built for students at UF, UCF, Penn State, USC & more
        </p>

        {/* Helper link */}
        <button onClick={parent} style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.22)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', marginTop: 24, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}
        >
          I'm here to help students →
        </button>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '88px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>HOW IT WORKS</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 52px', textAlign: 'center' }}>
            Your workspace. Built-in agents. Real progress.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.number} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -16, right: -8, fontSize: 72, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', fontFamily: playfair, fontWeight: 700 }}>{step.number}</div>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{step.icon}</div>
                <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>Step {step.number}</p>
                <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{step.title}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(232,93,32,0.08), rgba(232,93,32,0.03))', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 16, padding: '22px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontSize: 'clamp(17px, 2.2vw, 22px)', fontStyle: 'italic', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>
              "Stop jumping between tabs and docs. Keep your entire job search in one organized workspace."
            </p>
          </div>
        </div>
      </div>

      {/* ── AGENT IN ACTION ── */}
      <div style={{ padding: '88px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px' }}>⚡ SEE THE AGENT IN ACTION</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
          Watch the workspace in action
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 40px', lineHeight: 1.65 }}>
          Upload your resume → Tell the Agent the job → Get a tailored version that's automatically saved and tracked.
        </p>

        {/* Mock screen */}
        <div style={{ background: 'linear-gradient(135deg, #111827, #1a1f2e)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', marginBottom: 24 }}>
          <div style={{ background: '#0d1117', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              ⚡ College Fast Forward — AI Job Search Agent
            </div>
          </div>
          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', margin: 0 }}>🔍 Find Penn State alumni in marketing at Disney and draft an outreach message.</p>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'left' }}>✓ Found 3 people from your school — message drafted</p>
            {[
              { initials: 'JM', name: 'Jennifer Martinez', title: 'VP Marketing · Disney', grad: "Penn State '98", cta: 'Message drafted →', ctaColor: true },
              { initials: 'RC', name: 'Ryan Chen', title: 'Brand Marketing · Disney+', grad: "Penn State '03", cta: 'Connect →', ctaColor: false },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #E85D20, #c9471a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.initials}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{r.name}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{r.title} · {r.grad}</p>
                </div>
                <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#fff', background: r.ctaColor ? '#E85D20' : 'rgba(34,211,238,0.1)', border: r.ctaColor ? 'none' : '1px solid rgba(34,211,238,0.25)', borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap' }}>{r.cta}</div>
              </div>
            ))}
            <div style={{ marginTop: 20, background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 10, padding: '14px 16px', textAlign: 'left' }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✍️ Draft message ready</p>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Hi Jennifer — I'm a Penn State marketing senior hoping to break into entertainment. I'd love 15 minutes to hear about your path at Disney..."
              </p>
            </div>
          </div>
        </div>

        {/* Real result */}
        <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 14, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🎯</span>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.65 }}>
            <strong style={{ color: '#fff' }}>The real advantage:</strong> Every resume version, every application, every message — all organized and searchable in your personal workspace.
          </p>
        </div>
      </div>

      {/* ── SUCCESS STORIES ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '88px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>SUCCESS STORIES</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 40px', textAlign: 'center' }}>
            Students just like you.
          </h2>
          <StoriesCarousel />
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ padding: '88px 24px', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>PRICING</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 52px', textAlign: 'center' }}>
          Choose your advantage.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Free */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>FREE</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: '#fff' }}>$0</span>
            </div>
            <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>The Foundation</p>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{f}</p>
              </div>
            ))}
            <button onClick={go} style={{ marginTop: 28, width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >Get started free</button>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.07), rgba(34,211,238,0.02))', border: '2px solid rgba(34,211,238,0.28)', borderRadius: 20, padding: '32px 28px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 100, padding: '4px 12px' }}>
              <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>RECOMMENDED</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>AI AGENT</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: '#22d3ee' }}>$29</span>
              <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/mo</span>
            </div>
            <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>The Accelerator</p>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: i === PRO_FEATURES.length - 1 ? '#22d3ee' : 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5, fontStyle: i === PRO_FEATURES.length - 1 ? 'italic' : 'normal', fontWeight: i === PRO_FEATURES.length - 1 ? 600 : 400 }}>{f}</p>
              </div>
            ))}
            <button onClick={go} style={{ marginTop: 28, width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.35)'; }}
            >Start free, upgrade anytime →</button>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '24px 0 0' }}>
          One-click upgrade anytime. Cancel anytime.
        </p>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: '96px 24px 110px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4.5vw, 58px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 28px' }}>
            Your job search workspace<br />
            <span style={{ color: '#E85D20', fontStyle: 'italic' }}>with built-in agents.</span>
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 420 }}>
            Join thousands of students using College Fast Forward to stay organized and get hired faster.
          </p>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '20px 52px', cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)', display: 'block', margin: '0 auto 16px',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Start Free Today
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            Free to start. No credit card required.
          </p>
        </div>
      </div>

    </div>
  );
}