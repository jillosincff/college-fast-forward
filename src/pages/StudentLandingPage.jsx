import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const PARENT_NETWORK_FEATURES = [
  'Parents who care about helping students succeed',
  'People you can search and contact directly',
  'A trusted environment, not cold outreach',
  'Built to open doors that can lead to jobs',
];

const ALUMNI_FEATURES = [
  'Find alumni at companies you care about',
  'Know who is most relevant to contact',
  'Get help writing messages that get responses',
  'Turn conversations into referrals, interviews, and opportunities',
];

const WHY_BULLETS = [
  'Parents in the network care about helping students succeed',
  'Alumni remember being in your position',
  'A shared school connection builds trust faster',
  'More responses lead to more conversations',
  'More conversations can lead to referrals, interviews, and jobs',
];

function AlumniSearchDemo() {
  const [typed, setTyped] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCards, setShowCards] = useState([]);
  const query = 'Find Penn State alumni in marketing at Disney.';

  const RESULTS = [
    { initials: 'JM', name: 'Jennifer Martinez', title: 'VP Marketing', company: 'Disney', grad: "Penn State '98" },
    { initials: 'RC', name: 'Ryan Chen', title: 'Brand Marketing', company: 'Disney+', grad: "Penn State '03" },
    { initials: 'SL', name: 'Sarah Liu', title: 'Marketing Strategy', company: 'Disney Parks', grad: "Penn State '01" },
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
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '4px 12px',
          fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)',
        }}>
          ⚡ College Fast Forward — Alumni Search
        </div>
      </div>

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

        {showResults && (
          <div>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: '#22d3ee', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              ✓ Found 3 people from your school
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

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 0 20px', marginTop: 12,
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
            A response is just the start.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            The right person can get your resume seen, point you to the right role, or offer a direct referral.
          </p>
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
      document.head.appendChild(link);
    }
  }, []);

  const go = () => navigate('GetStarted');
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
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(232,93,32,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Live pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 100, padding: '7px 16px', marginBottom: 40,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee', animation: 'glow 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Students getting responses right now
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(32px, 6vw, 76px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.05, letterSpacing: '-0.03em',
          margin: '0 0 28px', maxWidth: 820,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          Landing a job{' '}
          <span style={{ color: '#E85D20', fontStyle: 'italic' }}>feels impossible</span> without a personal connection.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(17px, 2.2vw, 22px)',
          fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.5, maxWidth: 580, margin: '0 auto 16px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          Access thousands of parents at your school ready to open doors for you.
        </p>

        {/* Clarifying line */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
          maxWidth: 460, margin: '0 auto 20px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          The Parent Network is 100% free and specific to your school.
        </p>

        {/* Social proof line */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(15px, 1.6vw, 17px)',
          fontWeight: 500, color: '#22d3ee', lineHeight: 1.6,
          maxWidth: 460, margin: '0 auto 44px',
          letterSpacing: '0.3px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s',
        }}>
          Growing parent networks at UF, UCF, Penn State, USC, Ohio State, and more.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          marginBottom: 20, width: '100%', maxWidth: 480,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s',
        }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 36px', cursor: 'pointer',
            minHeight: 'auto', width: '100%',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            I need a job
          </button>
          <button onClick={parent} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '16px 24px', cursor: 'pointer',
            minHeight: 'auto', width: '100%', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            I'm here to help
          </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 12, color: '#22d3ee', margin: 0,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
        }}>
          Free to join. No obligation.
        </p>
      </div>

      {/* ── ALUMNI ADVANTAGE: BRIDGE HEADLINE ── */}
      <div style={{
        padding: '88px 20px 48px',
        textAlign: 'center',
        background: '#08080f',
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p style={{
            fontFamily: playfair,
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}>
            The parent network is powerful.
          </p>
          <p style={{
            fontFamily: dmSans,
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800,
            color: '#E85D20',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            margin: '0 0 24px',
          }}>
            FastIQ makes you unstoppable.
          </p>
          <p style={{
            fontFamily: dmSans,
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75,
            margin: 0,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            We've covered every base. The Parent Network gives you a community of warm connections, and FastIQ <strong style={{ color: '#fff', fontWeight: 700 }}>handles</strong> your entire job search.
          </p>
        </div>
      </div>

      {/* ── FEATURE SPOTLIGHT: ALUMNI SHORTCUT ── */}
      <div style={{
        padding: '56px 20px 72px',
        textAlign: 'center',
        background: '#08080f',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans,
            fontSize: 11,
            fontWeight: 700,
            color: '#E85D20',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: '0 0 14px',
            textAlign: 'center',
          }}>
            ⚡ The Aha Moment
          </p>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(26px, 3.5vw, 44px)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}>
            Activate the Alumni Advantage
          </h2>
          <p style={{
            fontFamily: dmSans,
            fontSize: 'clamp(16px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            margin: '0 auto 44px',
            maxWidth: 540,
          }}>
            Alumni are <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>10x more likely to help</strong> a fellow student than a stranger. FastIQ finds them at the companies you care about—like a <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>VP of Marketing at Disney</strong>—and researches exactly how they can help you get in.
          </p>
        </div>
      </div>

      {/* ── DEMO ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 20px 72px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
            ⚡ See the Advantage
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 14px', textAlign: 'center' }}>
            Activate the Alumni Advantage
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '0 0 40px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
            Alumni are 10x more likely to help you than a stranger. FastIQ finds them at your dream companies and researches exactly how they can help.
          </p>

          <AlumniSearchDemo />

          {/* Testimonial */}
          <div style={{
            marginTop: 28,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '4px solid #E85D20',
            borderRadius: '0 16px 16px 0',
            padding: '28px 32px',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              What students are saying
            </p>
            <p style={{
              fontFamily: playfair, fontSize: 'clamp(20px, 2.5vw, 27px)',
              fontStyle: 'italic', color: '#fff',
              margin: '0 0 24px', lineHeight: 1.5,
            }}>
              "I found a Disney alum from my school in 2 minutes. She actually responded."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E85D20, #c9471a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff',
                }}>J</div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Jordan T.</p>
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>ODU · Junior · Marketing</p>
                </div>
              </div>
              <div style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 100, padding: '6px 16px',
              }}>
                <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#22c55e' }}>✉️ Response received</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY THIS WORKS ── */}
      <div style={{ padding: '88px 20px 0', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            The reason it works
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Why this works
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.65 }}>
            People from your school are more likely to respond — and{' '}
            <span style={{ color: '#E85D20', fontWeight: 600 }}>that's how you get in front of the people who hire.</span>
          </p>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'left' }}>
            {WHY_BULLETS.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TWO CARDS ── */}
      <div style={{ padding: '48px 20px 88px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }} className="powers-grid">

          {/* Parent network card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,93,32,0.08) 0%, rgba(232,93,32,0.03) 100%)',
            border: '1px solid rgba(232,93,32,0.2)',
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(232,93,32,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤝</div>
                <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>Your school's parent network</p>
              </div>
              {PARENT_NETWORK_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alumni card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 100%)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
                <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>Alumni who can help you get hired</p>
              </div>
              {ALUMNI_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        padding: '88px 20px 108px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.11) 0%, transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(15px, 1.8vw, 18px)',
            fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '-0.01em', margin: '0 0 24px',
            lineHeight: 1.5,
          }}>
            You don't need more applications.<br />You need more responses.
          </p>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(28px, 4.5vw, 60px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}>
            Get in front of the right people —
          </h2>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(28px, 4.5vw, 60px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 28px',
          }}>
            and actually get hired.
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 440 }}>
            Find people from your school. Reach out with confidence. Start conversations that can lead to jobs.
          </p>

          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 48px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
            display: 'block', marginLeft: 'auto', marginRight: 'auto',
            marginBottom: 16,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Join free →
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: '0 0 20px' }}>
            No credit card required.
          </p>

          <button onClick={parent} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto', transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >
            I'm here to help →
          </button>
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