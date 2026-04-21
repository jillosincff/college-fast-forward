import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

// ── Color system matching student page ──────────────────────────────────────
const C = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  orange: '#E85D20',
  orangeLight: 'rgba(232,93,32,0.08)',
  orangeBorder: 'rgba(232,93,32,0.2)',
  cyan: '#22d3ee',
  cyanLight: 'rgba(34,211,238,0.1)',
  dark: '#1f2937',
  body: '#334155',
  muted: '#6b7280',
  hint: '#9ca3af',
  border: 'rgba(0,0,0,0.08)',
};

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const STATS = [
  { number: '1,000+', label: 'Parents & Alumni' },
  { number: '15+', label: 'Universities' },
  { number: '50+', label: 'Industries' },
];

const TESTIMONIALS = [
  { quote: "A conversation through CFF changed the trajectory of my son's career.", author: "Lisa M.", role: "UF Parent", initials: "LM" },
  { quote: "I felt so helpless watching my kid apply and hear nothing back. This gave me something real to do.", author: "David K.", role: "OSU Parent", initials: "DK" },
  { quote: "My daughter landed her internship through a connection she never would have found alone.", author: "Jennifer S.", role: "Penn State Parent", initials: "JS" },
];

const HOW_IT_WORKS = [
  { number: "01", title: "Fill out a quick profile", desc: "Your industry, company, and how you're willing to help. Takes 2 minutes. Seriously." },
  { number: "02", title: "Students reach out to you", desc: "Only students from your school's network — no spam, no cold outreach from strangers." },
  { number: "03", title: "You respond and help how you want", desc: "A 15-minute call. A LinkedIn intro. A referral. You decide. No pressure ever." },
];

const FAQS = [
  { q: "Is the parent & alumni network really free?", a: "Yes, completely. Parents and alumni join free and stay free. FastIQ is an optional paid upgrade for students only." },
  { q: "What does 'agreeing to respond' mean?", a: "When you join, you're committing to be an active member — if a student reaches out, you'll do your best to respond. Even a quick reply makes a difference. No minimums, no hard obligations." },
  { q: "What exactly does FastIQ do?", a: "FastIQ is an AI career engine for students — resume tailoring, alumni search, mock interviews, company intel, and a daily action plan. It's the AI layer on top of the human network." },
  { q: "Can my parents pay FastIQ for me?", a: "Yes. Parents can gift FastIQ to their student directly from their dashboard." },
  { q: "What schools are in the network?", a: "We're building networks at colleges across the country. Whatever school your student attends, that's the network you join." },
  { q: "I'm an alumni — can I join to help?", a: "Absolutely. Alumni are a crucial part of the network. Students specifically look for alumni at their target companies." },
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
          transition: 'transform 0.2s ease', display: 'inline-block',
          fontFamily: dmSans, lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <p style={{ fontFamily: dmSans, fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 18px' }}>{a}</p>
      )}
    </div>
  );
}

export default function ParentLandingPage({ onStudentClick }) {
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('parent-lp-fonts')) {
      const link = document.createElement('link');
      link.id = 'parent-lp-fonts';
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
  const handleJoin = () => navigate('GetStarted');
  const handleStudent = () => { if (onStudentClick) onStudentClick(); else navigate('LandingPage'); };

  return (
    <div style={{ background: C.bg, fontFamily: dmSans, color: C.dark, overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{
        background: C.bgWhite,
        padding: '80px 24px 72px',
        textAlign: 'center',
        borderBottom: `1px solid ${C.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: `radial-gradient(ellipse, ${C.orangeLight} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.orangeLight, border: `1px solid ${C.orangeBorder}`,
          borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            This has never been done before
          </span>
        </div>

        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(36px, 6vw, 68px)',
          fontWeight: 700, color: C.dark, lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 0 8px', maxWidth: 740, marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.1s', position: 'relative',
        }}>
          Your student needs a job.
        </h1>
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(36px, 6vw, 68px)',
          fontWeight: 700, color: C.orange, fontStyle: 'italic',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          margin: '0 0 28px', maxWidth: 740, marginLeft: 'auto', marginRight: 'auto',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.7s ease 0.15s', position: 'relative',
        }}>
          Parents have connections.
        </h1>

        <p style={{
          fontFamily: dmSans, fontSize: 'clamp(16px, 1.8vw, 19px)', fontWeight: 700, color: C.dark,
          margin: '0 auto 44px',
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.25s', position: 'relative',
        }}>
          Let's pool them together and open doors.
        </p>

        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s', position: 'relative',
        }}>
          <button onClick={handleJoin} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: `0 8px 24px ${C.orangeLight}`,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${C.orangeLight}`; }}
          >
            Join free — add your network →
          </button>
          <button onClick={handleStudent} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            color: C.muted, background: C.bgWhite, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '16px 28px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >
            {"I'm a student →"}
            </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 13, color: C.hint, margin: 0,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s', position: 'relative',
        }}>
          Free to join. No credit card. No obligation.
        </p>

        <div style={{
          display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center',
          marginTop: 56, paddingTop: 40, borderTop: `1px solid ${C.border}`,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s', position: 'relative',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '0 40px',
              borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <p style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: C.orange, margin: '0 0 4px', lineHeight: 1 }}>{s.number}</p>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: C.hint, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUSTED BY ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: '32px 24px',
        textAlign: 'center',
        background: C.bgWhite,
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          color: C.hint, letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 16px',
        }}>
          Trusted by parents & alumni at
        </p>

        {/* School pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: 8,
          marginBottom: 28,
        }}>
          {[
            'University of Florida',
            'Florida State',
            'Ohio State',
            'UCF',
            'USC',
            'Penn State',
            'University of Michigan',
            'Tulane',
            'University of Maryland',
            'And growing...',
          ].map((school, i) => (
            <div key={i} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: i === 9 ? C.orange : C.body,
              background: i === 9 ? C.orangeLight : C.bg,
              border: `1px solid ${i === 9 ? C.orangeBorder : C.border}`,
              borderRadius: 100, padding: '6px 14px',
              fontStyle: i === 9 ? 'italic' : 'normal',
            }}>
              {school}
            </div>
          ))}
        </div>

        {/* Don't see your school */}
        <div style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 14, padding: '20px 24px',
          maxWidth: 480, margin: '0 auto',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            color: C.dark, margin: '0 0 6px',
          }}>
            Don't see your kid's school?
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 14,
            color: C.muted, lineHeight: 1.6,
            margin: '0 0 16px',
          }}>
            We're building networks at colleges across the country.
            Join and help us launch your school's network.
          </p>
          <button
            onClick={() => navigate('GetStarted')}
            style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 700,
              color: C.orange, background: 'none',
              border: `1px solid ${C.orangeBorder}`,
              borderRadius: 8, padding: '10px 20px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orangeLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Help us build it →
          </button>
        </div>
      </div>

      {/* ── FOUNDER'S STORY ── */}
      <div style={{
        maxWidth: 680, margin: '0 auto',
        padding: '64px 24px 0',
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          color: '#E85D20', letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 28px',
        }}>
          Why we built this
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{
            fontFamily: playfair, fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 700, color: '#1f2937',
            lineHeight: 1.4, letterSpacing: '-0.01em', margin: 0,
          }}>
            It's stressful watching your kid apply to hundreds
            of jobs and hear almost nothing back.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: '#334155', lineHeight: 1.75, margin: 0,
          }}>
            You've probably already asked everyone you know —
            <em> "do you know anybody who can help?"</em>
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: '#334155', lineHeight: 1.75, margin: 0,
          }}>
            But that only goes so far.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 17, fontWeight: 700,
            color: '#1f2937', lineHeight: 1.75, margin: 0,
          }}>
            So we decided to change that.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 17,
            color: '#334155', lineHeight: 1.75, margin: 0,
          }}>
            We're on a mission to pool the connections of parents
            at your kid's college — exponentially expanding the warm
            introductions available to every student in the network.
          </p>

          <p style={{
            fontFamily: playfair, fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 700, fontStyle: 'italic',
            color: '#E85D20', lineHeight: 1.4,
            margin: '8px 0 0',
          }}>
            That's College Fast Forward.
          </p>
        </div>
      </div>

      {/* ── THE PREMISE ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, color: C.dark, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Your kid isn't lazy.
        </h2>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
          They just don't know the right people yet.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.75, margin: '0 0 16px' }}>
          70% of Gen Z students are already asking their parents for help finding a job. You're not alone in wanting to do more.

          The problem isn't motivation — it's access. Your network opens doors that no resume ever could.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.75, margin: 0 }}>
          College Fast Forward gives every parent a way to actually do something — not just worry.
        </p>
      </div>

      {/* ── GROW THE NETWORK ── */}
      <div style={{
        background: C.bgWhite,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: '32px 28px',
        margin: '0 0 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          color: C.orange, letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 12px',
        }}>
          Help us grow
        </p>
        <h3 style={{
          fontFamily: playfair, fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 700, color: C.dark,
          lineHeight: 1.3, letterSpacing: '-0.01em',
          margin: '0 0 12px',
        }}>
          Know another parent at your kid's school?
        </h3>
        <p style={{
          fontFamily: dmSans, fontSize: 16,
          color: C.muted, lineHeight: 1.7,
          margin: '0 auto 24px', maxWidth: 460,
        }}>
          The bigger the network, the better the chances for every student — including yours. Invite them to join.
        </p>
        <button
          onClick={() => setShowShareModal(true)}
          style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 10, padding: '14px 28px',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 4px 16px rgba(232,93,32,0.25)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Invite a parent →
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }} onClick={() => setShowShareModal(false)}>
          <div style={{
            background: C.bgWhite, borderRadius: 16, padding: '32px',
            maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Share with other parents
            </p>
            <h2 style={{ fontFamily: playfair, fontSize: 28, fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 20px' }}>
              Grow the network
            </h2>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: C.body, lineHeight: 1.6, margin: '0 0 28px' }}>
              Help us connect more parents at your kid's school.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {/* Facebook Share */}
              <button onClick={() => {
                const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.origin);
                window.open(url, 'facebook-share', 'width=580,height=296');
              }} style={{
                width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                color: '#fff', background: '#1877F2', border: 'none',
                borderRadius: 10, padding: '14px 0', cursor: 'pointer',
                minHeight: 'auto', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Share on Facebook
              </button>

              {/* Copy Message */}
              <button onClick={() => {
                const msg = `Hey! I just learned about College Fast Forward — it's a network of parents at our kid's school who actually help each other's kids find jobs through real connections. No spam, just warm intros. Thought you should check it out: ${window.location.origin}`;
                navigator.clipboard.writeText(msg);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }} style={{
                width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                color: C.dark, background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '14px 0', cursor: 'pointer',
                minHeight: 'auto', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dark; }}
              >
                {copied ? '✓ Message copied!' : 'Copy message'}
              </button>
            </div>

            <button onClick={() => setShowShareModal(false)} style={{
              width: '100%', fontFamily: dmSans, fontSize: 13,
              color: C.muted, background: 'none', border: 'none',
              cursor: 'pointer', minHeight: 'auto', padding: 0,
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── VIDEO SECTION ── */}
      <div style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px', textAlign: 'center' }}>Real parents. Real results.</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px', textAlign: 'center' }}>
            See what happens when parents
          </h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 32px', textAlign: 'center' }}>
            {"show up for each other's kids."}
          </h2>

          <div style={{ background: C.dark, borderRadius: 16, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(232,93,32,0.4)', cursor: 'pointer' }}>
                <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 4 }} />
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center' }}>Add your video here</p>
            </div>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.orange}`, borderRadius: '0 12px 12px 0', padding: '20px 24px' }}>
            <p style={{ fontFamily: playfair, fontSize: 17, fontStyle: 'italic', color: C.dark, margin: '0 0 12px', lineHeight: 1.55 }}>
              "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 10, fontWeight: 700, color: C.orange }}>
                {TESTIMONIALS[activeTestimonial].initials}
              </div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{TESTIMONIALS[activeTestimonial].author}</p>
                <p style={{ fontFamily: dmSans, fontSize: 12, color: C.hint, margin: 0 }}>{TESTIMONIALS[activeTestimonial].role}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? 20 : 6, height: 6, borderRadius: 3, background: i === activeTestimonial ? C.orange : C.border, border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>How it works</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Simple, on your terms.
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 16, fontStyle: 'italic', color: C.hint, margin: '0 0 40px' }}>
          No commitments. Just helping.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 36 }}>
          {HOW_IT_WORKS.map(({ number, title, desc }, i) => (
            <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '24px 0', borderBottom: i < HOW_IT_WORKS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 12, width: 52, height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, fontSize: 14, fontFamily: dmSans, fontWeight: 800, letterSpacing: '0.04em' }}>
                {number}
              </div>
              <div style={{ paddingTop: 12 }}>
                <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: C.dark, margin: '0 0 4px' }}>{title}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 10, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.25)', transition: 'opacity 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Join free — 2 minutes, zero obligation →
        </button>
      </div>

      {/* ── PRICING ── */}
      <div style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>Pricing</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 4px' }}>Free for helpers.</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.2, margin: '0 0 36px' }}>Turbo for students.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Free */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px' }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Free Network</p>
              <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: C.dark, margin: '0 0 20px', lineHeight: 1 }}>$0</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {['Join as a parent or alumni', 'Help students at your school', 'No fees, no obligation. Ever.'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                    </div>
                    <p style={{ fontFamily: dmSans, fontSize: 14, color: C.body, margin: 0 }}>{f}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleJoin} style={{ width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: C.dark, background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: 8, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dark; }}
              >Join free →</button>
            </div>

            {/* FastIQ */}
            <div style={{ background: C.bgWhite, border: `2px solid ${C.orange}`, borderRadius: 16, padding: '28px', position: 'relative', boxShadow: '0 8px 32px rgba(232,93,32,0.1)' }}>
              {foundingActive && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: '#fff', fontFamily: dmSans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  🏅 Founding Rate{timeLeft ? ` · ${timeLeft} left` : ''}
                </div>
              )}
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FastIQ — For Students</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <p style={{ fontFamily: playfair, fontSize: 38, fontWeight: 700, color: C.orange, margin: 0, lineHeight: 1 }}>$14.50</p>
                <span style={{ fontFamily: dmSans, fontSize: 14, color: C.hint }}>/mo</span>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: C.hint, margin: '0 0 20px' }}>$29/mo after April 30</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {['7-day free trial, no credit card', 'Alumni search + AI outreach', 'Resume tailoring + mock interviews', 'Company intel + daily action plan', 'Parents can gift FastIQ too'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                    </div>
                    <p style={{ fontFamily: dmSans, fontSize: 14, color: C.body, margin: 0 }}>{f}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleStudent} style={{ width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 8, padding: '11px 0', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(232,93,32,0.3)', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >Try 7 days free →</button>
            </div>
          </div>

          <p style={{ fontFamily: dmSans, fontSize: 13, color: C.hint, textAlign: 'center', margin: 0 }}>
            No credit card to start. Cancel anytime. Parents can pay on their student's behalf.
          </p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQ</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 32px' }}>Got questions? Fair.</h2>
        {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ background: C.dark, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 20px' }}>Your best move</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>One intro from you</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px' }}>can change everything.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 auto 36px' }}>
            Free. 2 minutes. No obligation.<br />Students at your school genuinely need you.
          </p>
          <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 12, padding: '16px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(232,93,32,0.35)', marginBottom: 12, display: 'block', marginLeft: 'auto', marginRight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(232,93,32,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,93,32,0.35)'; }}
          >
            Join free — add your network →
          </button>
          <button onClick={handleStudent} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            {"I'm a student — Try FastIQ free →"}
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