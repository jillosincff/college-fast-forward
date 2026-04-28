import { useState, useEffect, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';
import SocialProofToasts from '@/components/landing/SocialProofToasts';
import SuccessStoriesCarousel from '@/components/landing/SuccessStoriesCarousel';

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
  const [visibleResults, setVisibleResults] = useState([]);
  const [demoVisible, setDemoVisible] = useState(false);
  const demoRef = useRef(null);
  const query = 'Find Penn State alumni in marketing at Disney.';

  const RESULTS = [
    { initials: 'JM', name: 'Jennifer Martinez', title: 'VP Marketing', company: 'Disney', grad: "Penn State '98" },
    { initials: 'RC', name: 'Ryan Chen', title: 'Brand Marketing', company: 'Disney+', grad: "Penn State '03" },
    { initials: 'SL', name: 'Sarah Liu', title: 'Marketing Strategy', company: 'Disney Parks', grad: "Penn State '01" },
  ];

  // Scroll-to-trigger animation
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !demoVisible) {
        setDemoVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.25, rootMargin: '50px' });

    if (demoRef.current) observer.observe(demoRef.current);
    return () => observer.disconnect();
  }, [demoVisible]);

  // Typing animation when demo becomes visible
  useEffect(() => {
    if (!demoVisible) return;
    
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
            setTimeout(() => {
              setVisibleResults(v => [...v, idx]);
            }, idx * 100);
          });
        }, 400);
      }
    }, 40);
    return () => clearInterval(type);
  }, [demoVisible]);

  return (
    <div ref={demoRef} style={{
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
                opacity: visibleResults.includes(i) ? 1 : 0,
                transform: visibleResults.includes(i) ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
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
      <SocialProofToasts />

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
          <span style={{ color: '#E85D20', fontStyle: 'italic', fontFamily: playfair }}>feels impossible</span> without a personal connection.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(17px, 2.2vw, 22px)',
          fontWeight: 600, color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.5, maxWidth: 580, margin: '0 auto 16px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          Access thousands of parents at your school ready to open doors for you.
        </p>

        {/* Clarifying line */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
          maxWidth: 460, margin: '0 auto 20px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          The Parent Network is 100% free and specific to your school.
        </p>

        {/* Social proof line */}
        {/* School ticker */}
        <div style={{
          maxWidth: '100%', overflow: 'hidden', marginBottom: 44,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s',
        }}>
          <div className="marquee-scroll" style={{
            display: 'flex', gap: 24, animation: 'marquee 20s linear infinite',
            width: 'max-content',
          }}>
            {['UF', 'UCF', 'Penn State', 'USC', 'Ohio State', 'FSU', 'Indiana', 'Texas', 'UF', 'UCF', 'Penn State', 'USC'].map((school, i) => (
              <span key={i} style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                color: '#22d3ee', whiteSpace: 'nowrap',
                opacity: 0.7,
              }}>
                {school} {i < 11 ? '·' : ''}
              </span>
            ))}
          </div>
        </div>

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
            Help me get in front of the right people →
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
             FastIQ helps you reach the right people — and get responses.
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
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 14px',
            textAlign: 'center',
          }}>
            ⚡ THE AHA MOMENT
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
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.6,
            margin: '0 auto 44px',
            maxWidth: 540,
          }}>
            Alumni are <strong style={{ color: '#fff', fontWeight: 700 }}>far more likely to respond</strong> — especially when you share a school connection. FastIQ finds them at the companies you care about—like a <strong style={{ color: '#fff', fontWeight: 700 }}>VP of Marketing at Disney</strong>—and researches exactly how they can help you get in.
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
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
            ⚡ THE AHA MOMENT
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 14px', textAlign: 'center' }}>
            See the 'Alumni Shortcut' in action
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: '0 0 40px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
            FastIQ scans thousands of companies in your target industry to find the exact alumni who can help you—then researches their background and drafts the perfect message to get you a referral.
          </p>

          <AlumniSearchDemo />

          {/* Success Stories Section */}
          <div style={{ marginTop: 28 }}>
            <p style={{
              fontFamily: dmSans,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#E85D20',
              margin: '0 0 20px',
            }}>
              Success Stories
            </p>
            <SuccessStoriesCarousel />
          </div>
        </div>
      </div>

      {/* ── WHY THIS WORKS ── */}
      <div style={{ padding: '88px 20px 0', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 12px' }}>
             PRICING
           </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Choose your advantage.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.65 }}>
             Join the community for free, or activate your personal agent to accelerate the results.
           </p>
        </div>
      </div>

      {/* ── TWO CARDS ── */}
      <div style={{ padding: '48px 20px 88px', maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }} className="powers-grid">

      {/* Foundation card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,93,32,0.08) 0%, rgba(232,93,32,0.03) 100%)',
        border: '1px solid rgba(232,93,32,0.2)',
        borderRadius: 20, padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(232,93,32,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px' }}>FREE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤝</div>
            <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>The Foundation</p>
          </div>
              {['Start here: search the Parent Network and send your first message.', 'Highly Responsive: Connect with people who care about your success and actually respond.', 'The "Parent" Bond: Access a community that is genuinely motivated to help you succeed.', 'Lifelong Networks: Tap into extensive connections across every major industry.', 'Warm Introductions: Skip the cold application and get your resume in front of the people who hire.'].map((f, i) => {
                const [boldPart, restPart] = f.split(': ');
                return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: '#A0A0A0', margin: 0, lineHeight: 1.6 }}>
                     <span style={{ fontWeight: 700, color: '#fff' }}>{boldPart}:</span> {restPart}
                   </p>
                </div>
                );
              })}
            </div>
          </div>

          {/* Accelerator card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 100%)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 20, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 100, padding: '4px 12px' }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.15em', textTransform: 'uppercase' }}>50% OFF</span>
            </div>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                <span style={{ fontFamily: playfair, fontSize: 24, fontWeight: 700, color: '#22d3ee' }}>$14.50</span>
                <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>~~$29~~</span>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(34,211,238,0.5)', margin: '0 0 20px', fontStyle: 'italic' }}>Increases to $29/mo on April 30th</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
                <p style={{ fontFamily: playfair, fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>The Accelerator</p>
              </div>
              {['Alumni Shortcut: We scan thousands of companies to find the exact matches for your goals.', 'AI Outreach: We research their background and draft the perfect message to get you a referral.', 'Instant Optimization: Auto-tailor your Resume and LinkedIn to any job description in seconds.', 'Smart Nudging: Automated follow-ups and hiring signals so you never miss an opportunity.'].map((f, i) => {
                const [boldPart, restPart] = f.split(': ');
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee' }} />
                    </div>
                    <p style={{ fontFamily: dmSans, fontSize: 14, color: '#A0A0A0', margin: 0, lineHeight: 1.6 }}>
                       <span style={{ fontWeight: 700, color: '#fff' }}>{boldPart}:</span> {restPart}
                     </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '32px 0 0' }}>
          Early bird pricing ($14.50) expires at midnight on April 30th.
        </p>
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
            Start for free. Finish with a referral.
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
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic', fontFamily: playfair,
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 28px',
          }}>
            and actually get hired.
          </h2>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 440 }}>
            Join your school's parent network for free today. Activate your personal agent whenever you're ready to accelerate your search.
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
            animation: 'ctaPulse 3s ease-in-out infinite',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >
            Join for free →
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>
            Always free to join. Early bird Agent pricing ($14.50/mo) available until <span style={{ animation: 'dateGlow 2s ease-in-out infinite' }}>April 30th</span>.
          </p>




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
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(232,93,32,0.4); }
          50% { transform: scale(1.03); box-shadow: 0 8px 48px rgba(232,93,32,0.65), 0 0 20px rgba(232,93,32,0.4); }
        }
        @keyframes dateGlow {
          0%, 100% { color: rgba(255,255,255,0.3); text-shadow: 0 0 0 rgba(239,68,68,0); }
          50% { color: rgba(239,68,68,0.5); text-shadow: 0 0 12px rgba(239,68,68,0.4); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-scroll {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @media (max-width: 560px) {
          .powers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}