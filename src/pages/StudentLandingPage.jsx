import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const satoshi = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const BENEFIT_CARDS = [
  { icon: '📄', title: 'Tailored resumes', desc: 'Automatically adapt your resume for each role so you can apply faster and with more confidence.' },
  { icon: '🎯', title: 'Relevant opportunities', desc: 'Surface jobs that better match your background, goals, and interests.' },
  { icon: '📊', title: 'Application tracking', desc: 'Keep every application organized in one place with clear status updates.' },
  { icon: '🔔', title: 'Follow-up reminders', desc: 'Never miss the right time to check in again.' },
  { icon: '💼', title: 'LinkedIn optimization', desc: 'Improve your profile so recruiters and connections can find you more easily.' },
  { icon: '🤝', title: 'Warm intros', desc: 'Find alumni and parent connections who may help create warmer paths into companies.' },
];

const HOW_IT_WORKS = [
  { number: '01', icon: '🎯', title: 'Know What to Apply For', desc: 'Smart matching + daily opportunities tailored to your goals.' },
  { number: '02', icon: '✨', title: 'Stand Out', desc: 'Modern resumes and LinkedIn optimization that actually get noticed.' },
  { number: '03', icon: '📋', title: 'Stay on Track & Move Forward', desc: 'Track every application, get smart reminders, and reach the right connections.' },
];

const STORIES = [
  { quote: "I was overwhelmed applying everywhere and getting ghosted. The Agent organized everything, fixed my resume, and helped me reach the right people. Landed an internship in 3 weeks.", name: "Marcus", school: "Penn State '27, Finance", initials: "M", tag: "Landed an internship" },
  { quote: "I finally felt like I had a system instead of a mess.", name: "Maya R.", school: "Business student", initials: "MR", tag: "Less stress" },
  { quote: "The warm intro feature made networking feel less random.", name: "Alex P.", school: "Marketing student", initials: "AP", tag: "Better outreach" },
];

const FREE_FEATURES = [
  'Basic resume tools',
  'Limited Agent usage',
  'Application tracker',
  'Perfect for getting started',
];

const PRO_FEATURES = [
  'Unlimited AI Agent',
  'Advanced tailoring + modern templates',
  'Smart reminders + interview prep',
  'Most students upgrade once they see real results',
];

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
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderLeft: '4px solid #E85D20', borderRadius: '0 20px 20px 0',
          padding: '36px 36px 32px', cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.07}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 170, position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: 20, fontFamily: playfair, fontSize: 90, lineHeight: 1, color: 'rgba(255,255,255,0.05)', fontWeight: 700, pointerEvents: 'none' }}>"</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.tag}</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 20px)', fontStyle: 'italic', fontWeight: 600, color: '#fff', lineHeight: 1.6, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
          "{s.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #22d3ee, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: satoshi, fontSize: 14, fontWeight: 900, color: '#fff', boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}>{s.initials}</div>
          <div>
            <p style={{ fontFamily: satoshi, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{s.name}</p>
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
    }
    if (!document.getElementById('slp-satoshi')) {
      const satoshiLink = document.createElement('link');
      satoshiLink.id = 'slp-satoshi';
      satoshiLink.rel = 'stylesheet';
      satoshiLink.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap';
      document.head.appendChild(satoshiLink);
    }
  }, []);

  const go = () => navigate('GatorAuth');

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  const sectionLabel = (text) => (
    <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>{text}</p>
  );

  const ctaBtn = (label, primary = true, onClick = go) => (
    <button onClick={onClick} style={{
      fontFamily: dmSans, fontSize: primary ? 16 : 15, fontWeight: primary ? 800 : 600,
      color: primary ? '#fff' : 'rgba(255,255,255,0.75)',
      background: primary ? '#E85D20' : 'rgba(255,255,255,0.06)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
      borderRadius: 14, padding: primary ? '18px 40px' : '18px 28px',
      cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease',
      boxShadow: primary ? '0 8px 32px rgba(232,93,32,0.4)' : 'none',
    }}
      onMouseEnter={e => {
        if (primary) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }
        else { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }
      }}
      onMouseLeave={e => {
        if (primary) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }
        else { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }
      }}
    >{label}</button>
  );

  return (
    <div style={{ background: '#06070d', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Deep void radial gradient — dark navy to true black */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0c1a2e 0%, #06070d 70%)', pointerEvents: 'none' }} />
        {/* Cyan glow behind the text — the only "light source" */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Subtle grain texture overlay */}
        <style>{`
          @keyframes grainShift { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-1px,1px)} 50%{transform:translate(1px,-1px)} 75%{transform:translate(-1px,-1px)} }
          .hero-grain::before { content:''; position:absolute; inset:-50%; width:200%; height:200%; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); opacity:0.35; animation:grainShift 0.5s steps(1) infinite; pointer-events:none; }
        `}</style>
        <div className="hero-grain" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 100, padding: '8px 20px', marginBottom: 36,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
          position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            The CFF AI Agent
          </span>
        </div>

        <h1 style={{
          fontFamily: satoshi, fontSize: 'clamp(36px, 8vw, 108px)',
          fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.05em',
          margin: '0 0 8px', maxWidth: 900,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.7s ease 0.1s', position: 'relative', zIndex: 1,
        }}>
          Job Boards are a
        </h1>
        <div style={{
          fontFamily: satoshi,
          fontWeight: 900,
          fontSize: 'clamp(48px, 12vw, 148px)',
          letterSpacing: '-0.06em',
          lineHeight: 1.05,
          margin: '0 0 44px',
          maxWidth: 760,
          background: 'linear-gradient(90deg, #22d3ee 0%, #67e8f9 60%, #a5f3fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(34,211,238,0.45))',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.1s',
          position: 'relative', zIndex: 1,
        }}>
          Black Hole.
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.75vw, 18px)',
          fontWeight: 500, color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.65, maxWidth: 600, margin: '0 auto 40px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.15s',
          position: 'relative', zIndex: 1,
        }}>
          Don't get sucked in. College Fast Forward gives you the tools to get seen, get interviewed,
          and get hired.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 8, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s', position: 'relative', zIndex: 1 }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff',
            background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 44px',
            cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease',
            boxShadow: '0 8px 32px rgba(232,93,32,0.5)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.5)'; }}
          >Escape the Black Hole →</button>
          {ctaBtn('Watch 45-second demo →', false)}
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.28)', margin: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s', position: 'relative', zIndex: 1 }}>
          No credit card required. Built for college students at UF, UCF, Penn State, USC &amp; more.
        </p>

        <button onClick={parent} style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', marginTop: 28, transition: 'color 0.15s', position: 'relative', zIndex: 1 }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
        >
          I'm here to help students →
        </button>
      </div>

      {/* ── PROBLEM STRIP ── */}
      <div style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          {sectionLabel('You are not alone')}
          <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(34px, 5.5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 28px' }}>
            Applying shouldn't feel<br />this exhausting.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            You're not alone. Students are sending hundreds of applications, getting ghosted or rejected, and burning out. We built a smarter system so you don't have to do it all manually.
          </p>
        </div>
      </div>

      {/* ── BENEFIT CARDS ── */}
      <div style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
        {sectionLabel('Why students use College Fast Forward')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginTop: 40 }}>
          {BENEFIT_CARDS.map((card, i) => (
            <div key={i} style={{
              gridColumn: i === 0 ? 'span 4' : i === 1 ? 'span 2' : i === 2 || i === 3 ? 'span 3' : 'span 2',
              background: i === 0 ? 'linear-gradient(135deg, rgba(34,211,238,0.07), rgba(34,211,238,0.02))' : 'rgba(255,255,255,0.04)',
              border: i === 0 ? '1px solid rgba(34,211,238,0.18)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: i === 0 ? '36px 32px' : '28px 26px',
            }}>
              <div style={{ fontSize: i === 0 ? 32 : 26, marginBottom: 14 }}>{card.icon}</div>
              <p style={{ fontFamily: satoshi, fontSize: i === 0 ? 22 : 17, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>{card.title}</p>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{card.desc}</p>
              {i === 0 && <p style={{ fontFamily: dmSans, fontSize: 12, fontStyle: 'italic', color: 'rgba(34,211,238,0.7)', margin: '14px 0 0' }}>"This alone saved me hours." — UF '26</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '88px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {sectionLabel('How it works')}
          <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 52px', textAlign: 'center' }}>
            One Agent. Everything organized. Real progress.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.number} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -16, right: -8, fontSize: 72, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', fontFamily: playfair, fontWeight: 700 }}>{step.number}</div>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{step.icon}</div>
                <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>Step {step.number}</p>
                <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{step.title}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(232,93,32,0.08), rgba(232,93,32,0.03))', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 16, padding: '22px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: satoshi, fontSize: 'clamp(17px, 2.2vw, 22px)', fontStyle: 'italic', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>
              "The Agent handles the chaos so you can focus on getting hired."
            </p>
          </div>
        </div>
      </div>

      {/* ── PRODUCT PROOF ── */}
      <div style={{ padding: '88px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        {sectionLabel('See it in action')}
        <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '14px 0 16px' }}>
          The Agent manages your entire search.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 520 }}>
          Real result: Students using the Agent go from feeling lost and ghosted to landing interviews faster.
        </p>

        {/* Mock screen */}
        <div style={{ background: 'linear-gradient(135deg, #111827, #1a1f2e)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ background: '#0d1117', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              ⚡ College Fast Forward — Job Search Dashboard
            </div>
          </div>
          <div style={{ padding: '28px 28px 24px' }}>
            {PROOF_CALLOUTS.map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < PROOF_CALLOUTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>
          Built to reduce the chaos of job searching and help students get hired faster.
        </p>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '88px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {sectionLabel('Students like you')}
          <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 40px', textAlign: 'center' }}>
            Students just like you.
          </h2>
          <StoriesCarousel />
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '32px 0 0', lineHeight: 1.7 }}>
            Students use College Fast Forward to stay organized, reduce stress, and move through the search with more traction.
          </p>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ padding: '88px 24px', maxWidth: 860, margin: '0 auto' }}>
        {sectionLabel('Pricing')}
        <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 52px', textAlign: 'center' }}>
          Choose your advantage.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Free */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>FREE</p>
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
            >Start free</button>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.07), rgba(34,211,238,0.02))', border: '2px solid rgba(34,211,238,0.28)', borderRadius: 20, padding: '32px 28px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 100, padding: '4px 12px' }}>
              <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>RECOMMENDED</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>ACCELERATOR</p>
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
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{f}</p>
              </div>
            ))}
            <button onClick={go} style={{ marginTop: 28, width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.35)'; }}
            >Start free, upgrade anytime →</button>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '24px 0 0' }}>
          Cancel anytime. No credit card required to get started.
        </p>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: '96px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: satoshi, fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 36px' }}>
            Search Smarter,<br />
            <span style={{ color: '#22d3ee', textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>Not Harder.</span>
          </h2>
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
            Built for students. No credit card required.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          College Fast Forward helps students manage the job search with less stress and more structure.
        </p>
      </div>

    </div>
  );
}