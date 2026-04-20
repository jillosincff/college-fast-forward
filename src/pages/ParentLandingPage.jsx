import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

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
    quote: "My daughter landed her internship through a connection she never would have found alone.",
    author: "Jennifer S.",
    role: "Penn State Parent",
    initials: "JS",
  },
  {
    quote: "I felt so helpless watching my kid apply and hear nothing back. This gave me something real to do.",
    author: "David K.",
    role: "OSU Parent",
    initials: "DK",
  },
];

const HOW_IT_WORKS = [
  {
    number: "1",
    title: "Fill out a quick profile",
    desc: "Your industry, company, and how you're willing to help. Takes 2 minutes.",
  },
  {
    number: "2",
    title: "Students reach out to you",
    desc: "Only students from your school's network — no spam, no strangers.",
  },
  {
    number: "3",
    title: "You help how you want",
    desc: "A 15-minute call. A LinkedIn intro. A referral. You decide. No pressure.",
  },
  {
    number: "4",
    title: "The network pays it forward",
    desc: "You help one student today — the network helps yours tomorrow.",
  },
];

const FAQS = [
  { q: "Is the parent & alumni network really free?", a: "Yes, completely. Parents and alumni join free and stay free. FastIQ is an optional paid upgrade for students only." },
  { q: "What exactly does FastIQ do?", a: "FastIQ is an AI career engine for students — resume tailoring, alumni search, mock interviews, company intel, and a daily action plan. It's the AI layer on top of the human network." },
  { q: "How does the 7-day trial work?", a: "Students get full FastIQ access for 7 days, no credit card needed. After that it's $14.50/month at the founding rate, or $29/month after April 30." },
  { q: "Can my parents pay FastIQ for me?", a: "Yes. Parents can gift FastIQ to their student directly from their dashboard." },
  { q: "What schools are in the network?", a: "We're building networks at colleges across the country. Whatever school your student attends, that's the network you join." },
  { q: "I'm an alumni — can I join to help?", a: "Absolutely. Alumni are a crucial part of the network. Students specifically look for alumni at their target companies." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '18px 0', background: 'none', border: 'none',
          cursor: 'pointer', minHeight: 'auto',
        }}
      >
        <span style={{
          fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          color: '#111827', lineHeight: 1.4,
        }}>{q}</span>
        <span style={{
          fontSize: 20, color: '#E85D20', flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          display: 'inline-block',
          fontFamily: dmSans,
        }}>+</span>
      </button>
      {open && (
        <p style={{
          fontFamily: dmSans, fontSize: 15,
          color: '#6b7280', lineHeight: 1.7,
          margin: '0 0 18px', maxWidth: 580,
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
  const handleStudent = () => {
    trackEvent('landing_mode_toggle', { mode: 'student' });
    try { localStorage.setItem('lp_mode', 'student'); } catch {}
    if (onStudentClick) onStudentClick(); else navigate('LandingPage');
  };

  return (
    <div style={{
      background: '#ffffff',
      fontFamily: dmSans,
      color: '#111827',
      overflowX: 'hidden',
    }}>

      {/* ── ROLE TOGGLE ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, padding: '10px 16px', background: 'rgba(255,249,246,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(232,93,32,0.12)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', gap: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 100, padding: 4 }}>
          <button
            onClick={handleStudent}
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: 'rgba(0,0,0,0.38)', background: 'none', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.25s ease' }}
          >
            🎓 I need help
          </button>
          <button
            style={{ flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#3b7af5,#4f8cff)', border: 'none', borderRadius: 100, padding: '12px 8px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 22px rgba(79,140,255,0.45)', transition: 'all 0.25s ease' }}
          >
            🤝 I want to help
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(180deg, #fff9f6 0%, #ffffff 100%)',
        padding: '72px 24px 64px',
        textAlign: 'center',
        borderBottom: '1px solid #f3f4f6',
      }}>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,93,32,0.08)',
          border: '1px solid rgba(232,93,32,0.2)',
          borderRadius: 100, padding: '6px 16px',
          marginBottom: 32,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 600,
            color: '#E85D20', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            1,000+ parents & alumni helping students
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(32px, 5vw, 58px)',
          fontWeight: 700, color: '#111827',
          lineHeight: 1.15, letterSpacing: '-0.02em',
          margin: '0 0 10px', maxWidth: 700,
          marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          Your kid isn't lazy.
        </h1>
        <h1 style={{
          fontFamily: playfair,
          fontSize: 'clamp(32px, 5vw, 58px)',
          fontWeight: 700, color: '#E85D20',
          fontStyle: 'italic',
          lineHeight: 1.15, letterSpacing: '-0.02em',
          margin: '0 0 28px', maxWidth: 700,
          marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.15s',
        }}>
          They just don't know the right people yet.
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
          color: '#6b7280', lineHeight: 1.7,
          maxWidth: 540, margin: '0 auto 12px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s ease 0.2s',
        }}>
          Every parent in this network feels exactly the same way you do right now. Frustrated. Helpless. Watching their kid apply and hear nothing back.
        </p>

        <p style={{
          fontFamily: playfair, fontSize: 'clamp(17px, 2vw, 21px)',
          fontWeight: 700, fontStyle: 'italic',
          color: '#111827',
          margin: '0 auto 40px', maxWidth: 540,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s ease 0.25s',
        }}>
          But together — we actually have a shot.
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
            borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.25)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.25)'; }}
          >
            Join free — I'm here to help →
          </button>
          <button onClick={handleStudent} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            color: '#6b7280',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '16px 28px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.color = '#E85D20'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
          >
            I'm a student →
          </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13, color: '#9ca3af',
          margin: 0,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.7s ease 0.35s',
        }}>
          Free to join. No credit card. No obligation.
        </p>
      </div>

      {/* ── THE EMOTIONAL TRUTH ── */}
      <div style={{
        maxWidth: 720, margin: '0 auto',
        padding: '64px 24px',
      }}>
        <div style={{
          background: '#fff9f6',
          border: '1px solid rgba(232,93,32,0.15)',
          borderLeft: '4px solid #E85D20',
          borderRadius: '0 16px 16px 0',
          padding: '32px 36px',
          marginBottom: 48,
        }}>
          <p style={{
            fontFamily: playfair, fontSize: 'clamp(18px, 2.5vw, 24px)',
            fontStyle: 'italic', fontWeight: 700,
            color: '#111827', lineHeight: 1.55, margin: '0 0 16px',
          }}>
            "Every parent in this network made the same choice you're about to make. To show up. To open their contacts. To say — I'll help."
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: '#E85D20', margin: 0,
          }}>
            That's what makes this work.
          </p>
        </div>

        <h2 style={{
          fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 40px)',
          fontWeight: 700, color: '#111827',
          lineHeight: 1.2, letterSpacing: '-0.02em',
          margin: '0 0 20px',
        }}>
          There is no one more motivated<br />than a parent.
        </h2>

        <p style={{
          fontFamily: dmSans, fontSize: 17,
          color: '#6b7280', lineHeight: 1.75,
          margin: '0 0 20px',
        }}>
          We're not professional networkers doing favors. We lie awake at night thinking about our kids' futures. We forward job listings at midnight. We text old colleagues we haven't spoken to in years.
        </p>

        <p style={{
          fontFamily: dmSans, fontSize: 17,
          color: '#6b7280', lineHeight: 1.75,
          margin: '0 0 20px',
        }}>
          You might have deep connections in finance, but your child wants healthcare. Another parent in this network has strong healthcare connections — and their child wants finance.
        </p>

        <p style={{
          fontFamily: dmSans, fontSize: 17, fontWeight: 600,
          color: '#111827', lineHeight: 1.75,
          margin: '0 0 8px',
        }}>
          When you help their student, they help yours.
        </p>

        <p style={{
          fontFamily: playfair, fontSize: 19,
          fontStyle: 'italic', fontWeight: 700,
          color: '#E85D20', margin: '0 0 0',
        }}>
          One conversation really can change everything.
        </p>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{
        background: '#f9fafb',
        borderTop: '1px solid #f3f4f6',
        borderBottom: '1px solid #f3f4f6',
        padding: '64px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.12em',
            textTransform: 'uppercase', margin: '0 0 16px',
          }}>How it works</p>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 700, color: '#111827',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 40px',
          }}>
            Simple, on your terms.<br />
            <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.85em' }}>No commitments. Just helping.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {HOW_IT_WORKS.map(({ number, title, desc }) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(232,93,32,0.1)',
                  border: '1px solid rgba(232,93,32,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#E85D20',
                  marginTop: 2,
                }}>
                  {number}
                </div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                    {title}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <button onClick={handleJoin} style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 700,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 10, padding: '14px 28px', cursor: 'pointer',
              minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.25)',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Join free — 2 minutes, zero obligation →
            </button>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          color: '#9ca3af', letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 32px', textAlign: 'center',
        }}>From the network</p>

        <div style={{
          background: '#fff9f6',
          border: '1px solid rgba(232,93,32,0.15)',
          borderLeft: '4px solid #E85D20',
          borderRadius: '0 16px 16px 0',
          padding: '28px 32px',
          marginBottom: 16,
          minHeight: 120,
        }}>
          <p style={{
            fontFamily: playfair, fontSize: 20,
            fontStyle: 'italic', color: '#111827',
            margin: '0 0 16px', lineHeight: 1.55,
          }}>
            "{TESTIMONIALS[activeTestimonial].quote}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(232,93,32,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20',
            }}>
              {TESTIMONIALS[activeTestimonial].initials}
            </div>
            <div>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>
                {TESTIMONIALS[activeTestimonial].author}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: '#9ca3af', margin: 0 }}>
                {TESTIMONIALS[activeTestimonial].role}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActiveTestimonial(i)} style={{
              width: i === activeTestimonial ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === activeTestimonial ? '#E85D20' : '#e5e7eb',
              border: 'none', cursor: 'pointer', padding: 0,
              minHeight: 'auto', transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* ── VILLAGE ── */}
      <div style={{
        background: '#fff9f6',
        borderTop: '1px solid rgba(232,93,32,0.1)',
        borderBottom: '1px solid rgba(232,93,32,0.1)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#111827',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}>
            It takes a village.
          </h2>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 24px',
          }}>
            And you're a big part of it.
          </h2>
          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: '#6b7280', lineHeight: 1.7,
            margin: '0 auto 32px',
          }}>
            Every parent who joins makes the network stronger — not just for their own student, but for every student in it. The more of us who show up, the more doors get opened.
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600,
            color: '#9ca3af', letterSpacing: '0.06em',
            textTransform: 'uppercase', margin: '0 0 20px',
          }}>
            Whatever school your kid goes to, that's the network you're in.
          </p>
          <button onClick={handleJoin} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            color: '#E85D20', background: 'none',
            border: '1px solid rgba(232,93,32,0.35)',
            borderRadius: 10, padding: '12px 28px',
            cursor: 'pointer', minHeight: 'auto',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; e.currentTarget.style.borderColor = '#E85D20'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; }}
          >
            Help grow the village — join free →
          </button>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          color: '#E85D20', letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 16px',
        }}>Pricing</p>
        <h2 style={{
          fontFamily: playfair, fontSize: 'clamp(24px, 3vw, 38px)',
          fontWeight: 700, color: '#111827',
          lineHeight: 1.2, letterSpacing: '-0.02em',
          margin: '0 0 8px',
        }}>
          Free for helpers.
        </h2>
        <h2 style={{
          fontFamily: playfair, fontSize: 'clamp(24px, 3vw, 38px)',
          fontWeight: 700, color: '#E85D20', fontStyle: 'italic',
          lineHeight: 1.2, letterSpacing: '-0.02em',
          margin: '0 0 32px',
        }}>
          Turbo for students.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Free card */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 16, padding: '24px',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Free Network
            </p>
            <p style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
              $0
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {['Join as a parent or alumni', 'Help students at your school', 'No fees, no obligation ever'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: '#6b7280', margin: 0 }}>{f}</p>
                </div>
              ))}
            </div>
            <button onClick={handleJoin} style={{
              width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: '#374151', background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8, padding: '10px 0',
              cursor: 'pointer', minHeight: 'auto',
            }}>
              Join free →
            </button>
          </div>

          {/* FastIQ card */}
          <div style={{
            background: '#fff9f6',
            border: '2px solid #E85D20',
            borderRadius: 16, padding: '24px',
            position: 'relative',
          }}>
            {foundingActive && (
              <div style={{
                position: 'absolute', top: -12, left: '50%',
                transform: 'translateX(-50%)',
                background: '#E85D20', color: '#fff',
                fontFamily: dmSans, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '4px 12px', borderRadius: 100,
                whiteSpace: 'nowrap',
              }}>
                🏅 Founding Rate{timeLeft ? ` · ${timeLeft} left` : ''}
              </div>
            )}
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#E85D20', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              FastIQ
            </p>
            <p style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: '#E85D20', margin: '0 0 4px' }}>
              $14.50<span style={{ fontSize: 16, color: '#9ca3af' }}>/mo</span>
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>
              $29/mo after April 30
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {['7-day free trial, no credit card', 'Alumni search + AI outreach', 'Resume tailoring + interviews', 'Company intel + daily briefing', 'Parents can gift FastIQ too'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
                  </div>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: '#374151', margin: 0 }}>{f}</p>
                </div>
              ))}
            </div>
            <button onClick={handleStudent} style={{
              width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 700,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 8, padding: '10px 0',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 4px 12px rgba(232,93,32,0.25)',
            }}>
              Try 7 days free →
            </button>
          </div>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13, color: '#9ca3af',
          textAlign: 'center', margin: 0,
        }}>
          No credit card to start. Cancel anytime. Parents can pay on their student's behalf.
        </p>
      </div>

      {/* ── FAQ ── */}
      <div style={{
        background: '#f9fafb',
        borderTop: '1px solid #f3f4f6',
        padding: '64px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 700,
            color: '#E85D20', letterSpacing: '0.12em',
            textTransform: 'uppercase', margin: '0 0 16px',
          }}>FAQ</p>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 700, color: '#111827',
            lineHeight: 1.2, letterSpacing: '-0.02em',
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
        background: '#fff9f6',
        borderTop: '1px solid rgba(232,93,32,0.1)',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🤝</div>
          <h2 style={{
            fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 44px)',
            fontWeight: 700, color: '#111827',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}>
            One intro from you can<br />change everything.
          </h2>
          <p style={{
            fontFamily: dmSans, fontSize: 16,
            color: '#6b7280', lineHeight: 1.7,
            margin: '0 auto 32px',
          }}>
            Free. 2 minutes. No obligation. Students at your school genuinely need you.
          </p>
          <button onClick={handleJoin} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700,
            color: '#fff', background: '#E85D20', border: 'none',
            borderRadius: 12, padding: '16px 36px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 8px 24px rgba(232,93,32,0.25)',
            marginBottom: 12, display: 'block',
            marginLeft: 'auto', marginRight: 'auto',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.25)'; }}
          >
            Join free — help students now →
          </button>
          <button onClick={handleStudent} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: '#9ca3af', background: 'none', border: 'none',
            cursor: 'pointer', minHeight: 'auto', padding: 0,
            display: 'block', margin: '0 auto',
          }}>
            I'm a student — Try FastIQ free →
          </button>
          {foundingActive && (
            <p style={{
              fontFamily: dmSans, fontSize: 12, color: '#E85D20',
              marginTop: 16, fontWeight: 600,
            }}>
              🏅 Founding rate ends April 30 — {timeLeft} remaining
            </p>
          )}
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 520px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}

ParentLandingPage.isPublic = true;