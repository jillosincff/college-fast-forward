import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import SocialMetaTags from '@/components/common/SocialMetaTags';
import { toast } from 'sonner';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const STATS = [
  { number: '1,000+', label: 'Parents & Alumni' },
  { number: '15+', label: 'Universities' },
  { number: '50+', label: 'Industries' },
];

const HOW_IT_WORKS = [
  { step: '1', text: 'Fill out a short profile — your industry, company, and how you\'re willing to help.' },
  { step: '2', text: 'Students in the network find you and reach out when they need guidance.' },
  { step: '3', text: 'You decide if and how you want to help. No commitment, no obligation.' },
];

const SOCIAL_PROOF = [
  { quote: "A conversation through CFF changed the trajectory of my son's career.", author: 'UF Parent' },
  { quote: 'My daughter landed her internship through a connection she never would have found alone.', author: 'CFF Member' },
  { quote: 'One warm intro did more than 50 applications.', author: 'Student, Class of 2025' },
];

const FASTIQ_FEATURES = [
  { icon: '🔍', label: 'Alumni Search', desc: 'Find alumni at target companies and get AI-drafted outreach that sounds human' },
  { icon: '📄', label: 'Resume Tailoring', desc: 'Score and rewrite your resume for specific roles and companies' },
  { icon: '🎤', label: 'Mock Interviews', desc: 'Practice with AI feedback tailored to the role and company' },
  { icon: '📊', label: 'Company Intel', desc: 'Real-time hiring signals so you know who is actually hiring' },
  { icon: '⚡', label: 'Daily Briefing', desc: 'Tells your student exactly what to do next in their search' },
];

function Section({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative',
      zIndex: 2,
      padding: '80px 24px',
      maxWidth: 720,
      margin: '0 auto',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      }} />
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);
  const [showFoundingBanner, setShowFoundingBanner] = useState(true);

  useEffect(() => {
    if (!document.getElementById('lp-fonts')) {
      const link = document.createElement('link');
      link.id = 'lp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
    sessionStorage.removeItem('oauth_redirect_in_progress');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_error') === 'timeout') {
      toast.error('Sign-in timed out. Please try again or use Magic Link.', { duration: 6000 });
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
    setMounted(true);
    const interval = setInterval(() => {
      setActiveQuote(q => (q + 1) % SOCIAL_PROOF.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const onParentJoin = () => {
    trackEvent('cta_parent_clicked');
    try { localStorage.setItem('pending_invite_role', 'parent'); } catch (e) {}
    try { sessionStorage.setItem('pending_invite_role', 'parent'); } catch (e) {}
    const callbackUrl = window.location.origin + '/#ParentAllSet';
    base44.auth.redirectToLogin(callbackUrl);
  };

  const onStudentJoin = () => {
    trackEvent('cta_student_clicked');
    navigate('StudentOnboarding');
  };

  return (
    <>
      <FoundingMemberBanner
        show={showFoundingBanner}
        onUpgrade={() => navigate('GetStarted')}
        onDismiss={() => setShowFoundingBanner(false)}
      />

      <SocialMetaTags
        title="College Fast Forward — FastIQ: Direction, Action, and Real Progress for Your Student"
        description="College Fast Forward connects students with parents and alumni who want to help. Free to join. FastIQ AI upgrade from $29/month."
        image="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
        url="https://www.collegefastforward.com"
      />

      <div style={{ minHeight: '100vh', background: '#0d1117', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,93,32,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 70%, rgba(8,33,165,0.06) 0%, transparent 50%)
          `,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Grid texture */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* NAV */}
        <nav style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#E85D20',
              boxShadow: '0 0 12px rgba(232,93,32,0.6)',
            }} />
            <span style={{ fontFamily: playfair, fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
              College Fast Forward
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('GetStarted')} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              color: 'rgba(255,255,255,0.45)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
            }}>Sign In</button>
            <button onClick={onParentJoin} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 8, padding: '8px 18px', cursor: 'pointer', minHeight: 'auto',
            }}>Join Free</button>
          </div>
        </nav>

        {/* SECTION 1: HERO */}
        <Section style={{ padding: '100px 24px 80px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 40,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.6s ease',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#E85D20', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              1,000+ Parents & Alumni Ready to Help
            </span>
          </div>

          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(38px, 6vw, 74px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 10px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.1s',
          }}>
            "I've asked everyone I know.
          </h1>
          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(38px, 6vw, 74px)',
            fontWeight: 700, color: '#E85D20', lineHeight: 1.1, letterSpacing: '-0.03em',
            margin: '0 0 40px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.15s',
          }}>
            My kid still doesn't have a job lead."
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.65,
            maxWidth: 540, margin: '0 auto 16px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.2s',
          }}>
            You're not alone. College Fast Forward connects you with 1,000+ parents
            and alumni who are ready to open their networks for your student.
          </p>

          <p style={{
            fontFamily: playfair, fontSize: 'clamp(18px, 2vw, 22px)',
            fontWeight: 700, color: '#fff', fontStyle: 'italic',
            margin: '0 0 52px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.25s',
          }}>
            One warm intro changes everything.
          </p>

          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72,
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease 0.3s',
          }}>
            <button onClick={onParentJoin} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 700,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
              minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.35)', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)'; }}
            >
              Join as a Parent or Alumni — Free →
            </button>
            <button onClick={onStudentJoin} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
              minHeight: 'auto', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            >
              I'm a Student →
            </button>
          </div>

          <div style={{
            display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center',
            opacity: mounted ? 1 : 0, transition: 'all 0.7s ease 0.4s',
          }}>
            {STATS.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: playfair, fontSize: 34, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', lineHeight: 1 }}>{stat.number}</p>
                <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 2: HOW IT WORKS */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
            Kids need jobs.<br />
            Personal connections get them hired.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 560 }}>
            We pool our networks — parents and alumni across every industry — to maximize every student's chances of finding the right person at the right company.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, margin: '0 0 36px', maxWidth: 520 }}>
            {HOW_IT_WORKS.map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}>
                  <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20' }}>{step}</span>
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, margin: 0, maxWidth: 560, fontStyle: 'italic' }}>
            Not a job board. Not an algorithm. Real people who already want to help — because their kid is in the same boat.
          </p>
        </Section>

        <Divider />

        {/* SECTION 3: THE VILLAGE */}
        <Section style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(232,93,32,0.05)', border: '1px solid rgba(232,93,32,0.15)', borderRadius: 20, padding: '52px 40px' }}>
            <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              It takes a village.
            </h2>
            <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
              And you're a big part of it.
            </h2>
            <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 auto 36px', maxWidth: 480 }}>
              Every parent who joins makes the network stronger — not just for their own student, but for every student in it. The more of us who show up, the more doors get opened.
            </p>
            <button onClick={onParentJoin} style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              color: '#E85D20', background: 'none', border: '1px solid rgba(232,93,32,0.4)',
              borderRadius: 10, padding: '12px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.1)'; e.currentTarget.style.borderColor = '#E85D20'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'; }}
            >
              Help grow the village — join free →
            </button>
          </div>
        </Section>

        <Divider />

        {/* SECTION 4: FASTIQ */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>
            For students who want to go further
          </p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            A warm network alone isn't always enough.<br />
            So we built FastIQ.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 16px', maxWidth: 560 }}>
            FastIQ is an AI career engine that helps students activate their connections faster, craft better outreach, tailor their resume, and know exactly what to do next.
          </p>
          <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', margin: '0 0 48px' }}>
            The network opens the door.<br />
            FastIQ helps them walk through it.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 40 }}>
            {FASTIQ_FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '20px 18px', transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <p style={{ fontSize: 24, margin: '0 0 10px' }}>{f.icon}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{f.label}</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                FastIQ — 7 days free, no credit card
              </p>
              <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>
                Then $14.50/mo — founding rate
              </p>
            </div>
            <button onClick={onStudentJoin} style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 10, padding: '12px 24px', cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 4px 16px rgba(232,93,32,0.3)', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Start Free Trial →
            </button>
          </div>
        </Section>

        <Divider />

        {/* SECTION 5: SOCIAL PROOF */}
        <Section style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 32px' }}>
            From the network
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: '3px solid #E85D20', borderRadius: '0 16px 16px 0',
            padding: '24px 28px', textAlign: 'left',
            maxWidth: 560, margin: '0 auto 16px', transition: 'all 0.5s ease',
          }}>
            <p style={{ fontFamily: playfair, fontSize: 19, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px', lineHeight: 1.55 }}>
              "{SOCIAL_PROOF[activeQuote].quote}"
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {SOCIAL_PROOF[activeQuote].author}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {SOCIAL_PROOF.map((_, i) => (
              <button key={i} onClick={() => setActiveQuote(i)} style={{
                width: i === activeQuote ? 20 : 6, height: 6, borderRadius: 3,
                background: i === activeQuote ? '#E85D20' : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 6: FINAL CTA */}
        <Section style={{ textAlign: 'center', padding: '80px 24px 100px' }}>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Your student's next opportunity<br />
            is one introduction away.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 440 }}>
            Join the network. Add your connections. Help a student get hired — maybe even your own.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onParentJoin} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 700,
              color: '#fff', background: '#E85D20', border: 'none',
              borderRadius: 12, padding: '16px 36px', cursor: 'pointer',
              minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.35)', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)'; }}
            >
              Join as a Parent or Alumni — Free →
            </button>
            <button onClick={onStudentJoin} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '16px 32px', cursor: 'pointer',
              minHeight: 'auto', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              I'm a Student →
            </button>
          </div>
        </Section>

        {/* FOOTER */}
        <div style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 College Fast Forward</span>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Building parent networks at colleges across the country</span>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;