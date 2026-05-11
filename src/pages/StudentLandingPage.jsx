import { useState, useEffect, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';
import SuccessStoriesCarousel from '@/components/landing/SuccessStoriesCarousel';

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
    desc: 'Resume & cover letter tailoring that beats ATS filters, plus LinkedIn optimization that gets noticed.',
  },
  {
    number: '03',
    icon: '💬',
    title: 'Get Replies',
    desc: 'The Agent finds alumni from your school at your target companies and writes outreach messages that actually work.',
  },
];

const FREE_FEATURES = [
  'Basic resume help',
  'Limited Agent searches',
  'Application tracker',
  'Perfect for getting started',
];

const PRO_FEATURES = [
  'Unlimited Agent usage',
  'Smart alumni + opportunity matching',
  'Advanced resume & LinkedIn optimization',
  'Mock interviews + outreach messages',
  'Daily hiring signals & follow-up nudges',
];

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

  const go = () => {
    localStorage.setItem('pending_intent', 'seeker');
    navigate('GatorAuth');
  };

  const parent = () => {
    if (onParentClick) { onParentClick(); return; }
    localStorage.setItem('pending_intent', 'helper');
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('ParentLandingPage');
  };

  return (
    <div style={{ background: '#08080f', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(232,93,32,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.25)',
          borderRadius: 100, padding: '7px 18px', marginBottom: 36,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85D20', animation: 'glow 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            AI Job Search Agent for College Students
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(34px, 6vw, 78px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.05, letterSpacing: '-0.03em',
          margin: '0 0 28px', maxWidth: 860,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          The All-in-One AI Job Search Agent{' '}
          <span style={{ color: '#E85D20', fontStyle: 'italic' }}>for College Students</span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 20px)',
          fontWeight: 500, color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.65, maxWidth: 600, margin: '0 auto 12px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          Resume tailoring. LinkedIn optimization. Outreach messages. Interview prep. Application tracking.
        </p>
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 20px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.5, maxWidth: 540, margin: '0 auto 44px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          Everything you need to go from stressed to hired — in one place.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
          marginBottom: 20,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s',
        }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 40px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
            animation: 'ctaPulse 3s ease-in-out infinite',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Try the Agent Free
          </button>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '18px 28px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            See how it works →
          </button>
        </div>

        {/* Trust line */}
        <p style={{
          fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)',
          margin: 0, lineHeight: 1.6,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
        }}>
          Free to start. No credit card required. Built for students at UF, UCF, Penn State, USC & more.
        </p>

        {/* Helper link */}
        <button onClick={parent} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, minHeight: 'auto', marginTop: 24,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
        >
          I'm here to help →
        </button>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '88px 24px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 12px', textAlign: 'center' }}>
            The Agent helps you at every stage
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '0 0 56px' }}>
            From finding the right jobs to landing the interview.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.number} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '32px 28px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.04, lineHeight: 1, pointerEvents: 'none' }}>
                  {step.number}
                </div>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{step.icon}</div>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Step {step.number}
                </p>
                <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.3 }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Callout quote */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,93,32,0.1) 0%, rgba(232,93,32,0.04) 100%)',
            border: '1px solid rgba(232,93,32,0.2)',
            borderRadius: 16, padding: '24px 32px',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: playfair, fontSize: 'clamp(18px, 2.5vw, 24px)', fontStyle: 'italic', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>
              "Stop doing it all manually. Let the Agent do the heavy lifting."
            </p>
          </div>
        </div>
      </div>

      {/* ── AGENT IN ACTION ── */}
      <div style={{ padding: '88px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px' }}>
          ⚡ SEE THE AGENT IN ACTION
        </p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
          Watch the Agent find alumni and draft real messages in seconds
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '0 0 40px', lineHeight: 1.65 }}>
          Type what you're looking for. The Agent finds the right people from your school — and writes the message for you.
        </p>

        {/* Demo screen */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          marginBottom: 24,
        }}>
          <div style={{
            background: '#0d1117', padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              ⚡ College Fast Forward — AI Job Search Agent
            </div>
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', margin: 0 }}>🔍 Find Penn State alumni in marketing at Disney and draft an outreach message.</p>
            </div>

            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'left' }}>
              ✓ Found 3 people from your school — message drafted
            </p>

            {[
              { initials: 'JM', name: 'Jennifer Martinez', title: 'VP Marketing · Disney', grad: "Penn State '98", msg: true },
              { initials: 'RC', name: 'Ryan Chen', title: 'Brand Marketing · Disney+', grad: "Penn State '03", msg: false },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #E85D20, #c9471a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {r.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{r.name}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{r.title} · {r.grad}</p>
                </div>
                <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: r.msg ? '#fff' : '#22d3ee', background: r.msg ? '#E85D20' : 'rgba(34,211,238,0.1)', border: r.msg ? 'none' : '1px solid rgba(34,211,238,0.25)', borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap' }}>
                  {r.msg ? 'Message drafted →' : 'Connect →'}
                </div>
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

        {/* Real result callout */}
        <div style={{
          background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)',
          borderRadius: 14, padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎯</span>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff', fontWeight: 700 }}>Real student result:</strong> One UF student went from 0 responses to landing an internship at Disney after using the Agent for outreach.
          </p>
        </div>
      </div>

      {/* ── SUCCESS STORIES ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '88px 24px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
            SUCCESS STORIES
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 40px', textAlign: 'center' }}>
            Students just like you.
          </h2>
          <SuccessStoriesCarousel />
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ padding: '88px 24px', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' }}>
          PRICING
        </p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 12px', textAlign: 'center' }}>
          Choose your advantage.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 auto 52px', maxWidth: 480, lineHeight: 1.6 }}>
          Start free. Upgrade when you're ready to accelerate.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Free */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FREE</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#fff' }}>$0</span>
            </div>
            <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>The Foundation</p>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{f}</p>
              </div>
            ))}
            <button onClick={go} style={{ marginTop: 28, width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >Get started free</button>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 100%)', border: '2px solid rgba(34,211,238,0.3)', borderRadius: 20, padding: '32px 28px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 100, padding: '4px 12px' }}>
              <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>RECOMMENDED</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>AI AGENT</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#22d3ee' }}>$29</span>
              <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
            </div>
            <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>The Accelerator</p>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{f}</p>
              </div>
            ))}
            <button onClick={go} style={{ marginTop: 28, width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.35)'; }}
            >Start free, upgrade anytime →</button>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '28px 0 0' }}>
          One-click upgrade anytime. Cancel anytime.
        </p>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        padding: '96px 24px 108px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(30px, 4.5vw, 60px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 10px',
          }}>
            Get in front of the right opportunities —
          </h2>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(30px, 4.5vw, 60px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 28px',
          }}>
            and actually get hired.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 460 }}>
            Join thousands of students using College Fast Forward to simplify their job search.
          </p>

          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 17, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '20px 52px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
            display: 'block', margin: '0 auto 16px',
            transition: 'all 0.2s ease',
            animation: 'ctaPulse 3s ease-in-out infinite',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Start Free Today
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Free to start. No credit card required.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 6px #E85D20; }
          50% { box-shadow: 0 0 16px #E85D20, 0 0 32px rgba(232,93,32,0.3); }
        }
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(232,93,32,0.4); }
          50% { transform: scale(1.02); box-shadow: 0 8px 48px rgba(232,93,32,0.6); }
        }
        @media (max-width: 560px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}