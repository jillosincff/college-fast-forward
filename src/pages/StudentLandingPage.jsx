import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const PAIN = [
  '"Applied to 200 jobs. 4 replies. All rejections."',
  '"My roommate got hired because her dad knew someone."',
  '"3.8 GPA. Zero callbacks. I don\'t understand."',
  '"I rewrote my resume 11 times. Still ghosted."',
];

const NETWORK_FEATURES = [
  '1,000+ parents & alumni from your school',
  'Every industry. Every company.',
  'They agreed to help. For real.',
  "Whatever school you go to — you're in.",
  'Message any helper directly — no gatekeepers.',
  'Warm intros, not cold emails into the void.',
];

const FASTIQ_FEATURES = [
  'Find alumni at any company instantly',
  'AI writes your outreach — sounds human',
  'Resume tailored per job, scored before you apply',
  'Mock interviews for the exact role',
  "Company intel — know who's actually hiring",
  'Daily action plan — wake up knowing what to do',
];

const TESTIMONIALS = [
  {
    quote: "I was shocked. I messaged three parents and they all got right back to me.",
    name: 'Kayla M.',
    detail: 'UF · Junior · Communications',
    tag: '💬 3 replies same day',
  },
  {
    quote: "I had no clue how to start my job search. FastIQ literally gave me a step-by-step plan.",
    name: 'Tyler B.',
    detail: 'Penn State · Senior · Business',
    tag: '⚡ Got the plan',
  },
  {
    quote: "Found a Disney alumni from my school in like 2 minutes. She actually responded.",
    name: 'Jordan T.',
    detail: 'OSU · Junior · Marketing',
    tag: '📅 Interview booked',
  },
];

function AlumniSearchDemo() {
  const [typed, setTyped] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCards, setShowCards] = useState([]);
  const query = 'Find me Penn State alumni who are marketing VPs at Disney';

  const RESULTS = [
    { initials: 'JM', name: 'Jennifer Martinez', title: 'VP Marketing', company: 'Disney', grad: "Penn State '98" },
    { initials: 'RC', name: 'Ryan Chen', title: 'VP Brand Marketing', company: 'Disney+', grad: "Penn State '03" },
    { initials: 'SL', name: 'Sarah Liu', title: 'VP Marketing Strategy', company: 'Disney Parks', grad: "Penn State '01" },
  ];

  useEffect(() => {
    let i = 0;
    const type = setInterval(() => {
      if (i <= query.length) {
        setTyped(query.slice(0, i));
        i++;
      } else {
        clearInterval(type);
        setTimeout(() => {
          setShowResults(true);
          RESULTS.forEach((_, idx) => {
            setTimeout(() => setShowCards(c => [...c, idx]), idx * 300);
          });
        }, 600);
      }
    }, 45);
    return () => clearInterval(type);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111827 0%, #1a1f2e 100%)',
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      marginBottom: 28,
    }}>
      {/* Header bar */}
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
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '4px 12px',
          fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)',
        }}>
          ⚡ FastIQ Alumni Search
        </div>
      </div>

      {/* Search input */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: 'rgba(34,211,238,0.05)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', margin: 0, flex: 1, lineHeight: 1.4 }}>
            {typed}
            <span style={{
              display: 'inline-block', width: 2, height: 16,
              background: '#22d3ee', marginLeft: 2, verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }} />
          </p>
        </div>

        {/* Results */}
        {showResults && (
          <div style={{ marginBottom: 0 }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: '#22d3ee', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              ✓ Found {RESULTS.length} alumni — ready to connect
            </p>
            {RESULTS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < RESULTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                opacity: showCards.includes(i) ? 1 : 0,
                transform: showCards.includes(i) ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.4s ease',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #E85D20, #c9471a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff',
                }}>
                  {r.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{r.name}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                    {r.title} · {r.company} · {r.grad}
                  </p>
                </div>
                <button style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 700,
                  color: i === 0 ? '#fff' : '#22d3ee',
                  background: i === 0 ? '#E85D20' : 'rgba(34,211,238,0.1)',
                  border: i === 0 ? 'none' : '1px solid rgba(34,211,238,0.25)',
                  borderRadius: 8, padding: '6px 12px',
                  cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {i === 0 ? 'Message →' : 'Connect →'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FastIQ badge */}
        <div style={{
          background: 'rgba(232,93,32,0.06)',
          borderTop: '1px solid rgba(232,93,32,0.12)',
          padding: '10px 0', marginTop: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            FastIQ found 3 Penn State alumni at Disney in 4 seconds
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StudentLandingPage({ onParentClick }) {
  const [mounted, setMounted] = useState(false);
  const [activePain, setActivePain] = useState(0);
  const [activeProof, setActiveProof] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('slp-fonts')) {
      const link = document.createElement('link');
      link.id = 'slp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    const cd = setInterval(() => {
      const diff = FOUNDING_DEADLINE - new Date();
      if (diff > 0) {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        setTimeLeft(`${d}d ${h}h`);
      }
    }, 60000);
    const diff = FOUNDING_DEADLINE - new Date();
    if (diff > 0) {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setTimeLeft(`${d}d ${h}h`);
    }
    const pain = setInterval(() => setActivePain(p => (p + 1) % PAIN.length), 2500);
    const proof = setInterval(() => setActiveProof(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => { clearInterval(cd); clearInterval(pain); clearInterval(proof); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const go = () => navigate('StudentLandingPage');
  const parent = () => { if (onParentClick) onParentClick(); else navigate('ParentLandingPage'); };

  return (
    <div style={{ background: '#08080f', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px 60px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '15%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Live pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 100, padding: '7px 16px', marginBottom: 40,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
          position: 'relative',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee', animation: 'glow 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Students getting replies right now
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(44px, 9vw, 96px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.0, letterSpacing: '-0.04em',
          margin: '0 0 4px', maxWidth: 800,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          The real way
        </h1>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(44px, 9vw, 96px)',
          fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
          lineHeight: 1.0, letterSpacing: '-0.04em',
          margin: '0 0 20px', maxWidth: 800,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.15s',
        }}>
          to find a job.
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(17px, 2.5vw, 22px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.6, maxWidth: 560, margin: '0 auto 8px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          {"It's all about who you know."}
        </p>
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(17px, 2.5vw, 22px)',
          color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
          maxWidth: 560, margin: '0 auto 48px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          CFF combines your school's parent network with the precision of AI to open doors to jobs and internships.
        </p>

        {/* CTA */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 16,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s',
        }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 40px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 0 0 0 rgba(232,93,32,0.4), 0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
          }}>
            Join free →
          </button>
          <button onClick={parent} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '18px 24px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            {"I'm here to help →"}
          </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
        }}>
          No credit card · {foundingActive && timeLeft ? `$14.50/mo founding rate · ${timeLeft} left` : '$29/mo after trial'}
        </p>

        {/* Rotating pain */}
        <div style={{
          marginTop: 64, maxWidth: 480, width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '16px 20px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.5s',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Sound familiar?
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', margin: 0, lineHeight: 1.5, transition: 'all 0.3s ease', minHeight: 42 }}>
            {PAIN[activePain]}
          </p>
        </div>
      </div>

      {/* ── TWO POWERS ── */}
      <div style={{
        padding: '0 20px 80px',
        maxWidth: 900, margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }} className="powers-grid">

          {/* Network card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,93,32,0.08) 0%, rgba(232,93,32,0.03) 100%)',
            border: '1px solid rgba(232,93,32,0.2)',
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(232,93,32,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤝</div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your Network</p>
                  <p style={{ fontFamily: playfair, fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Human connections</p>
                </div>
              </div>
              {NETWORK_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FastIQ card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 100%)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>FastIQ</p>
                  <p style={{ fontFamily: playfair, fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>AI that gets sh*t done</p>
                </div>
              </div>
              {FASTIQ_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 14,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center', margin: '16px 0 0',
        }}>
          Free to join. FastIQ available inside — 7 days free, no credit card.
        </p>
      </div>

      {/* ── VIDEO + PROOF ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 20px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>Real results</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>
            See it work.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '0 0 36px' }}>
            60 seconds. No hype. Just the product.
          </p>

          <AlumniSearchDemo />

          {/* Testimonials — separate section */}
          <div style={{
            background: 'rgba(34,211,238,0.03)',
            border: '1px solid rgba(34,211,238,0.08)',
            borderRadius: 20,
            padding: '32px 28px',
            marginTop: 16,
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: '#22d3ee', letterSpacing: '0.12em',
              textTransform: 'uppercase', margin: '0 0 20px',
              textAlign: 'center',
            }}>
              What students are saying
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: '3px solid #E85D20',
              borderRadius: '0 14px 14px 0',
              padding: '20px 24px', marginBottom: 14,
            }}>
              <p style={{ fontFamily: playfair, fontSize: 18, fontStyle: 'italic', color: '#fff', margin: '0 0 12px', lineHeight: 1.55 }}>
                {TESTIMONIALS[activeProof].quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20' }}>
                    {TESTIMONIALS[activeProof].name[0]}
                  </div>
                  <div>
                    <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{TESTIMONIALS[activeProof].name}</p>
                    <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{TESTIMONIALS[activeProof].detail}</p>
                  </div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100, padding: '4px 12px' }}>
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{TESTIMONIALS[activeProof].tag}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveProof(i)} style={{
                  width: i === activeProof ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === activeProof ? '#E85D20' : 'rgba(255,255,255,0.12)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  minHeight: 'auto', transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        padding: '80px 20px 100px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 10px',
          }}>
            Stop sending resumes
          </h2>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 28px',
          }}>
            into the void.
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 400 }}>
            One warm intro beats 100 cold applications.
            7 days free. No credit card. No excuses.
          </p>

          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 40px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 0 0 0 rgba(232,93,32,0.4), 0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
            display: 'block', marginLeft: 'auto', marginRight: 'auto',
            marginBottom: 16,
          }}>
            Join free →
          </button>

          <button onClick={parent} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto', transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
          >
            {"I'm here to help →"}
          </button>

          {foundingActive && timeLeft && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#E85D20', marginTop: 20, fontWeight: 600 }}>
              🏅 Founding rate $14.50/mo ends April 30 — {timeLeft} remaining
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 6px #22d3ee; }
          50% { box-shadow: 0 0 16px #22d3ee, 0 0 32px rgba(34,211,238,0.3); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (max-width: 560px) {
          .powers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}