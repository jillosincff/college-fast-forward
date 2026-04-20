import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const TESTIMONIALS = [
  {
    quote: "A conversation through CFF changed the trajectory of my son's career.",
    author: "Lisa M.",
    role: "UF Parent",
    initials: "LM",
  },
  {
    quote: "I felt so helpless watching my kid apply and hear nothing back. This gave me something real to do.",
    author: "David K.",
    role: "OSU Parent",
    initials: "DK",
  },
  {
    quote: "My daughter landed her internship through a connection she never would have found alone.",
    author: "Jennifer S.",
    role: "Penn State Parent",
    initials: "JS",
  },
];

const FAQS = [
  {
    q: "Is the parent & alumni network really free?",
    a: "Yes, completely. Parents and alumni join free and stay free. FastIQ is an optional paid upgrade for students only.",
  },
  {
    q: "What does 'agreeing to respond' mean?",
    a: "When you join, you're committing to be an active member — if a student reaches out, you'll do your best to respond. Even a quick reply makes a difference. No minimums, no hard obligations.",
  },
  {
    q: "What exactly does FastIQ do?",
    a: "FastIQ is an AI career engine for students — resume tailoring, alumni search, mock interviews, company intel, and a daily action plan. The AI layer on top of the human network.",
  },
  {
    q: "Can parents pay FastIQ for their student?",
    a: "Yes. Parents can gift FastIQ to their student directly from their dashboard.",
  },
  {
    q: "What schools are in the network?",
    a: "We're building networks at colleges across the country. Whatever school your student attends, that's the network you join.",
  },
  {
    q: "I'm an alumni — can I join to help?",
    a: "Absolutely. Students specifically look for alumni at their target companies. Your career path is exactly what they need.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '20px 0', background: 'none', border: 'none',
          cursor: 'pointer', minHeight: 'auto',
        }}
      >
        <span style={{
          fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          color: '#fff', lineHeight: 1.4,
        }}>{q}</span>
        <span style={{
          fontSize: 22, color: '#E85D20', flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          display: 'inline-block', lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <p style={{
          fontFamily: dmSans, fontSize: 15,
          color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
          margin: '0 0 20px',
        }}>{a}</p>
      )}
    </div>
  );
}

export default function ParentLandingPage({ onStudentClick }) {
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    setMounted(true);
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
  const handleJoin = () => navigate('GetStarted');
  const handleStudent = () => { if (onStudentClick) onStudentClick(); else navigate('GetStarted'); };

  return (
    <div style={{ background: '#0a0a0a', fontFamily: dmSans, color: '#fff', overflowX: 'hidden' }}>

      {/* ── ROLE TOGGLE ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, padding: '10px 16px', background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: 4 }}>
          <button
            onClick={handleStudent}
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.25s ease' }}
          >
            🎓 I need help
          </button>
          <button
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#E85D20,#ff7a3d)', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 22px rgba(232,93,32,0.45)', transition: 'all 0.25s ease' }}
          >
            🤝 I want to help
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative',
        padding: '80px 24px 72px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>

        {/* Background effects */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,93,32,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Provocation */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(232,93,32,0.12)',
            border: '1px solid rgba(232,93,32,0.3)',
            borderRadius: 6,
            padding: '6px 14px',
            marginBottom: 32,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}>
            <span style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 700,
              color: '#E85D20', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              This has never been done before
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: dmSans,
            fontSize: 'clamp(38px, 7vw, 80px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.0, letterSpacing: '-0.04em',
            margin: '0 0 16px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s ease 0.1s',
          }}>
            The people who care most<br />
            <span style={{
              color: 'transparent',
              WebkitTextStroke: '2px #E85D20',
            }}>
              have been left out.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 8px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.2s',
          }}>
            Every career platform was built for recruiters and job seekers. Nobody built one for parents — the most motivated people on earth when it comes to their kids' success.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(18px, 2.5vw, 24px)',
            fontWeight: 700, color: '#E85D20',
            margin: '0 auto 44px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.25s',
          }}>
            We're changing that.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 16,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.3s',
          }}>
            <button onClick={handleJoin} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 700,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 8, padding: '16px 32px', cursor: 'pointer',
              minHeight: 'auto', boxShadow: '0 0 40px rgba(232,93,32,0.4)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(232,93,32,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(232,93,32,0.4)'; }}
            >
              Join free — add your network →
            </button>
            <button onClick={handleStudent} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '16px 28px', cursor: 'pointer',
              minHeight: 'auto', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              I'm a student →
            </button>
          </div>

          <p style={{
            fontFamily: dmSans, fontSize: 13,
            color: 'rgba(255,255,255,0.3)', margin: 0,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.35s',
          }}>
            Free to join. No credit card. No obligation.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 0, flexWrap: 'wrap',
            justifyContent: 'center', marginTop: 56,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 40,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s ease 0.4s',
          }}>
            {[
              { number: '1,000+', label: 'Parents & Alumni' },
              { number: '15+', label: 'Universities' },
              { number: '50+', label: 'Industries' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', flex: '1 1 120px',
                padding: '0 24px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <p style={{
                  fontFamily: dmSans, fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 700, color: '#E85D20',
                  margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.02em',
                }}>{s.number}</p>
                <p style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)', margin: 0,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THE IDEA ── */}
      <div style={{
        background: '#111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>The idea</p>

          <h2 style={{
            fontFamily: dmSans,
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 32px',
          }}>
            We all want the same thing.<br />
            <span style={{ color: '#E85D20' }}>Our kids to succeed.</span>
          </h2>

          <p style={{
            fontFamily: dmSans, fontSize: 18,
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.75,
            margin: '0 0 24px',
          }}>
            College Fast Forward is a network of parents and alumni who've agreed to open their connections for each other's students.
          </p>

          {/* The trade */}
          <div style={{
            background: 'rgba(232,93,32,0.08)',
            border: '1px solid rgba(232,93,32,0.2)',
            borderRadius: 12, padding: '24px 28px',
            marginBottom: 24,
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 16,
              color: 'rgba(255,255,255,0.7)', lineHeight: 1.7,
              margin: '0 0 14px',
            }}>
              You have finance connections. Your kid wants healthcare.<br />
              Another parent has healthcare connections. Their kid wants finance.
            </p>
            <p style={{
              fontFamily: dmSans, fontSize: 18, fontWeight: 700,
              color: '#fff', margin: '0 0 4px',
            }}>
              When you help their student, they help yours.
            </p>
            <p style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              color: '#E85D20', margin: 0,
            }}>
              The larger the network, the better the chances.
            </p>
          </div>

          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
            margin: 0,
          }}>
            70% of Gen Z students already ask their parents for help finding a job. The problem isn't motivation — it's access. Your connections open doors that no resume can.
          </p>
        </div>
      </div>

      {/* ── VIDEO PLACEHOLDER ── */}
      <div style={{
        background: '#0a0a0a',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>Real parents. Real results.</p>
          <h2 style={{
            fontFamily: dmSans, fontSize: 'clamp(24px, 3.5vw, 44px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 32px',
          }}>
            See what happens when parents<br />
            <span style={{ color: '#E85D20' }}>show up for each other's kids.</span>
          </h2>

          {/* Video embed area */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 32,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              {/* Play button */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#E85D20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(232,93,32,0.5)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{
                  width: 0, height: 0,
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '20px solid #fff',
                  marginLeft: 4,
                }} />
              </div>
              <p style={{
                fontFamily: dmSans, fontSize: 14,
                color: 'rgba(255,255,255,0.4)', margin: 0,
              }}>
                Add your video here
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '3px solid #E85D20',
            borderRadius: '0 12px 12px 0',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: 14,
            minHeight: 100,
          }}>
            <p style={{
              fontFamily: playfair, fontSize: 18,
              fontStyle: 'italic', color: 'rgba(255,255,255,0.85)',
              margin: '0 0 12px', lineHeight: 1.55,
            }}>
              "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(232,93,32,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: '#E85D20',
              }}>
                {TESTIMONIALS[activeTestimonial].initials}
              </div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
                  {TESTIMONIALS[activeTestimonial].author}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  {TESTIMONIALS[activeTestimonial].role}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 20 : 6, height: 6,
                borderRadius: 3,
                background: i === activeTestimonial ? '#E85D20' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{
        background: '#111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>How it works</p>
          <h2 style={{
            fontFamily: dmSans, fontSize: 'clamp(24px, 3.5vw, 44px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 12px',
          }}>
            Simple, on your terms.
          </h2>
          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: 'rgba(255,255,255,0.4)', margin: '0 0 40px',
          }}>
            No commitments. Just helping.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 40 }}>
            {[
              { n: '01', title: 'Fill out a quick profile', desc: 'Your industry, company, and how you\'re willing to help. Takes 2 minutes.' },
              { n: '02', title: 'Students reach out to you', desc: 'Only students from your school\'s network — no spam, no cold outreach from strangers.' },
              { n: '03', title: 'You respond and help how you want', desc: 'A 15-minute call. A LinkedIn intro. A referral. You decide. No pressure ever.' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{
                display: 'flex', alignItems: 'flex-start', gap: 20,
                padding: '20px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{
                  fontFamily: dmSans, fontSize: 13, fontWeight: 700,
                  color: '#E85D20', flexShrink: 0, marginTop: 2,
                  letterSpacing: '0.04em',
                }}>{n}</span>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                    {title}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleJoin} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 700,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 8, padding: '14px 28px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 0 30px rgba(232,93,32,0.35)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Join free — 2 minutes →
          </button>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>Pricing</p>
          <h2 style={{
            fontFamily: dmSans, fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.05, letterSpacing: '-0.03em',
            margin: '0 0 40px',
          }}>
            Free for helpers.<br />
            <span style={{ color: '#E85D20' }}>Turbo for students.</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16, marginBottom: 20,
          }}>
            {/* Free */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '28px',
            }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Free Network
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 42, fontWeight: 700, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
                $0
              </p>
              {['Join as a parent or alumni', 'Help students at your school', 'No fees. No obligation. Ever.'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', flexShrink: 0 }} />
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleJoin} style={{
                width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '11px 0', cursor: 'pointer',
                minHeight: 'auto', marginTop: 20,
              }}>
                Join free →
              </button>
            </div>

            {/* FastIQ */}
            <div style={{
              background: 'rgba(232,93,32,0.08)',
              border: '2px solid #E85D20',
              borderRadius: 16, padding: '28px',
              position: 'relative',
            }}>
              {foundingActive && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#E85D20', color: '#fff',
                  fontFamily: dmSans, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '4px 14px', borderRadius: 100,
                  whiteSpace: 'nowrap',
                }}>
                  🏅 Founding Rate{timeLeft ? ` · ${timeLeft} left` : ''}
                </div>
              )}
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                FastIQ — For Students
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 42, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
                $14.50<span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>/mo</span>
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>
                $29/mo after April 30
              </p>
              {['7-day free trial, no credit card', 'Alumni search + AI outreach', 'Resume tailoring + mock interviews', 'Company intel + daily action plan', 'Parents can gift FastIQ too'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', flexShrink: 0 }} />
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{f}</p>
                </div>
              ))}
              <button onClick={handleStudent} style={{
                width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 700,
                color: '#fff', background: '#E85D20', border: 'none',
                borderRadius: 8, padding: '11px 0', cursor: 'pointer',
                minHeight: 'auto', boxShadow: '0 0 20px rgba(232,93,32,0.3)',
                marginTop: 20,
              }}>
                Try 7 days free →
              </button>
            </div>
          </div>

          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
            No credit card to start. Cancel anytime. Parents can pay on their student's behalf.
          </p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{
        background: '#111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>FAQ</p>
          <h2 style={{
            fontFamily: dmSans, fontSize: 'clamp(24px, 3.5vw, 44px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 32px',
          }}>
            Got questions? Fair.
          </h2>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(232,93,32,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>Your next move</p>
          <h2 style={{
            fontFamily: dmSans, fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.0, letterSpacing: '-0.04em',
            margin: '0 0 20px',
          }}>
            One intro from you<br />
            <span style={{ color: '#E85D20' }}>can change everything.</span>
          </h2>
          <p style={{
            fontFamily: dmSans, fontSize: 16,
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
            margin: '0 auto 36px', maxWidth: 400,
          }}>
            Free. 2 minutes. No obligation.<br />Students at your school genuinely need you.
          </p>
          <button onClick={handleJoin} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 8, padding: '18px 40px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 0 60px rgba(232,93,32,0.45)',
            marginBottom: 16, display: 'block',
            marginLeft: 'auto', marginRight: 'auto',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 80px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(232,93,32,0.45)'; }}
          >
            Join free — add your network →
          </button>
          <button onClick={handleStudent} style={{
            fontFamily: dmSans, fontSize: 13,
            color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto',
          }}>
            I'm a student — Try FastIQ free →
          </button>
          {foundingActive && timeLeft && (
            <p style={{
              fontFamily: dmSans, fontSize: 12, color: '#E85D20',
              marginTop: 20, fontWeight: 600,
            }}>
              🏅 Founding rate ends April 30 — {timeLeft} remaining
            </p>
          )}
        </div>
      </div>

    </div>
  );
}