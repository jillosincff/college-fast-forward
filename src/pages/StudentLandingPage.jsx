import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const NETWORK_FEATURES = [
  'Parents, alumni, and families from your school',
  'People who actually want to help',
  'Search by company, industry, or role',
  'Ask for advice, referrals, or introductions',
  'No more cold outreach into the void',
];

const FASTIQ_FEATURES = [
  'Finds the right people at target companies',
  'Drafts messages that sound human',
  'Tailors your resume before you apply',
  'Preps you for interviews',
  'Gives you a daily action plan',
];

function AlumniSearchDemo() {
  const [typed, setTyped] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCards, setShowCards] = useState([]);
  const query = 'Find me Penn State alumni in marketing at Disney.';

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

        {showResults && (
          <div style={{ marginBottom: 0 }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: '#22d3ee', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              ✓ Found 3 alumni ready to connect
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
    const updateTime = () => {
      const diff = FOUNDING_DEADLINE - new Date();
      if (diff > 0) {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        setTimeLeft(`${d}d ${h}h`);
      }
    };
    updateTime();
    const cd = setInterval(updateTime, 60000);
    return () => clearInterval(cd);
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const go = () => navigate('StudentOnboarding');
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
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

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
            Students getting replies right now
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(40px, 8vw, 92px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.0, letterSpacing: '-0.04em',
          margin: '0 0 4px', maxWidth: 800,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          This is how people
        </h1>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(40px, 8vw, 92px)',
          fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
          lineHeight: 1.0, letterSpacing: '-0.04em',
          margin: '0 0 24px', maxWidth: 800,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.15s',
        }}>
          actually get hired.
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(18px, 2.5vw, 23px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.4, maxWidth: 540, margin: '0 auto 10px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          {"It's all about who you know."}
        </p>
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
          maxWidth: 500, margin: '0 auto 48px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          Find alumni at your target companies. Get introduced. Know exactly what to say.
        </p>

        {/* CTA */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 14,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s',
        }}>
          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 44px', cursor: 'pointer',
            minHeight: 'auto',
            boxShadow: '0 8px 32px rgba(232,93,32,0.4)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
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
          fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s',
        }}>
          No credit card. {foundingActive && timeLeft ? `FastIQ founding rate: $14.50/mo through Apr 30.` : 'FastIQ available inside.'}
        </p>
      </div>

      {/* ── SEE IT WORK — directly under hero ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 20px 64px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
            Real results
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>
            See it work.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: '0 0 36px' }}>
            60 seconds. No hype. Just the product.
          </p>

          <AlumniSearchDemo />

          {/* Testimonial — directly under demo */}
          <div style={{
            marginTop: 24,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '4px solid #E85D20',
            borderRadius: '0 16px 16px 0',
            padding: '28px 32px',
          }}>
            <p style={{
              fontFamily: playfair, fontSize: 'clamp(20px, 2.5vw, 26px)',
              fontStyle: 'italic', color: '#fff',
              margin: '0 0 20px', lineHeight: 1.5,
            }}>
              "Found a Disney alum from my school in like 2 minutes. She actually responded."
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
                <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#22c55e' }}>📅 Interview booked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO POWERS ── */}
      <div style={{ padding: '80px 20px', maxWidth: 900, margin: '0 auto' }}>
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
                  <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Your school network</p>
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
                  <p style={{ fontFamily: playfair, fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>AI that turns connections into opportunities</p>
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
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        padding: '80px 20px 100px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(32px, 5.5vw, 68px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 10px',
          }}>
            Start getting in front of
          </h2>
          <h2 style={{
            fontFamily: playfair,
            fontSize: 'clamp(32px, 5.5vw, 68px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 24px',
          }}>
            the people who actually hire.
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 auto 40px', maxWidth: 420 }}>
            Find the right people. Know what to say. Get closer to the job.
          </p>

          <button onClick={go} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 800,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 14, padding: '18px 44px', cursor: 'pointer',
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

          <button onClick={parent} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto', transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >
            {"I'm here to help →"}
          </button>

          {foundingActive && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 24, fontWeight: 400 }}>
              Founding rate available through Apr 30 — limited spots remaining.
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