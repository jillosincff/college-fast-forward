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
  { step: '1', text: "Fill out a short profile — your industry, company, and how you're willing to help." },
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

const FAQS = [
  {
    q: "How does my kid actually connect with someone?",
    a: "Students search the network by industry, company, or role. When they find someone relevant, they send a message directly through the platform. You get notified and decide whether and how to respond. It's that simple.",
  },
  {
    q: "Do I have to respond to every student who reaches out?",
    a: "Absolutely not. You set your own availability and respond only when you want to. There's no obligation, no minimum commitment, and no pressure. Even one conversation can make a real difference.",
  },
  {
    q: "What's the difference between the free network and FastIQ?",
    a: "The network is the community — parents and alumni making themselves available to students for introductions and advice. FastIQ is an AI career engine that helps students search alumni, tailor their resume, practice interviews, and know exactly what to do next. The network is free. FastIQ is a paid upgrade for students who want to go further.",
  },
  {
    q: "Can I pay for my student's FastIQ?",
    a: "Yes. Either the student or a parent can unlock FastIQ. It starts with a free 7-day trial — no credit card needed — and then continues at $14.50/month during our founding rate period.",
  },
  {
    q: "Is my contact information visible to everyone?",
    a: "No. Your email address is never shown publicly. Students can message you through the platform, but your personal contact details stay private unless you choose to share them directly.",
  },
  {
    q: "What school does my kid need to go to?",
    a: "Any school. When you join, you tell us what school your student attends and you're connected with other parents and alumni from that same school. We're building networks at colleges across the country.",
  },
  {
    q: "I'm an alumni, not a parent — can I still join?",
    a: "Absolutely. Alumni are a crucial part of the network. Students specifically look for alumni at companies they want to work at. Your experience and connections are exactly what they need.",
  },
];

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

function Section({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      padding: '80px 24px',
      maxWidth: 720, margin: '0 auto',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
    </div>
  );
}

function PricingRow({ label, sublabel, price, highlight, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 24px',
      background: highlight ? 'rgba(232,93,32,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${highlight ? 'rgba(232,93,32,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 14, gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>{label}</p>
          {badge && (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 700,
              color: '#E85D20', background: 'rgba(232,93,32,0.12)',
              border: '1px solid rgba(232,93,32,0.3)',
              borderRadius: 100, padding: '2px 10px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>{badge}</span>
          )}
        </div>
        {sublabel && (
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{sublabel}</p>
        )}
      </div>
      <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 700, color: highlight ? '#E85D20' : 'rgba(255,255,255,0.7)', margin: 0, whiteSpace: 'nowrap' }}>{price}</p>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: '20px 0', background: 'none', border: 'none',
          cursor: 'pointer', minHeight: 'auto',
        }}
      >
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontFamily: dmSans, fontSize: 20, color: '#E85D20', flexShrink: 0,
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>+</span>
      </button>
      {open && (
        <p style={{
          fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7, margin: '0 0 20px', maxWidth: 580,
        }}>{a}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
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

    const updateCountdown = () => {
      const now = new Date();
      const diff = FOUNDING_DEADLINE - now;
      if (diff <= 0) { setTimeLeft(''); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h remaining`);
    };

    updateCountdown();
    const countdown = setInterval(updateCountdown, 60000);
    const quotes = setInterval(() => setActiveQuote(q => (q + 1) % SOCIAL_PROOF.length), 4000);
    return () => { clearInterval(countdown); clearInterval(quotes); };
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;

  const onParentJoin = () => {
    trackEvent('cta_parent_clicked');
    localStorage.setItem('pending_intent', 'helper');
    const callbackUrl = window.location.origin + '/#GatorWelcome';
    base44.auth.redirectToLogin(callbackUrl);
  };

  const onStudentJoin = () => {
    trackEvent('cta_student_clicked');
    localStorage.setItem('pending_intent', 'seeker');
    const callbackUrl = window.location.origin + '/#GatorWelcome';
    base44.auth.redirectToLogin(callbackUrl);
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
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E85D20', boxShadow: '0 0 12px rgba(232,93,32,0.6)' }} />
            <span style={{ fontFamily: playfair, fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>College Fast Forward</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('GetStarted')} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}>Sign In</button>
            <button onClick={onParentJoin} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', minHeight: 'auto' }}>Join Free</button>
          </div>
        </nav>

        {/* SECTION 1: HERO */}
        <Section style={{ padding: '100px 24px 80px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 40,
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.6s ease',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#E85D20', letterSpacing: '0.08em', textTransform: 'uppercase' }}>1,000+ Parents & Alumni Ready to Help</span>
          </div>

          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 10px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.7s ease 0.1s',
          }}>
            "I've asked everyone I know.
          </h1>
          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 700, color: '#E85D20', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 28px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.7s ease 0.15s',
          }}>
            My kid still has no real job leads."
          </h1>

          <p style={{
            fontFamily: playfair, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: '#fff',
            lineHeight: 1.3, margin: '0 0 12px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.7s ease 0.2s',
          }}>
            You're not alone. We're all in the same boat.
          </p>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2.5vw, 19px)', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, maxWidth: 580, margin: '0 auto 52px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.7s ease 0.25s',
          }}>
            College Fast Forward multiplies your effort — connecting you with 1,000+ parents and alumni who are ready to open their networks for your student.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.7s ease 0.3s' }}>
            <button onClick={onParentJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.35)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)'; }}
            >Join as a Parent or Alumni — Free →</button>
            <button onClick={onStudentJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px 32px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            >I'm a Student →</button>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', opacity: mounted ? 1 : 0, transition: 'all 0.7s ease 0.4s' }}>
            {STATS.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: playfair, fontSize: 34, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', lineHeight: 1 }}>{stat.number}</p>
                <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 2: PARENT MOTIVATION */}
        <Section>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px' }}>
            There is no one more motivated<br />than a parent.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 580 }}>
            Your kid isn't lazy. They just don't know the right people.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 20px', maxWidth: 580 }}>
            And here's what makes College Fast Forward different from every other network out there: every single person in it feels exactly the same way you do right now.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 20px', maxWidth: 580 }}>
            We're not professional networkers doing favors. We're parents. We lie awake at night thinking about our kids' futures. We forward job listings at midnight. We text old colleagues we haven't spoken to in years.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 40px', maxWidth: 580 }}>
            When you join this community, you're not just adding your network — you're joining thousands of parents who will go out of their way to help your student, because they know you'll do the same for theirs.
          </p>
          <div style={{ background: 'rgba(232,93,32,0.05)', border: '1px solid rgba(232,93,32,0.15)', borderRadius: 16, padding: '32px 28px', maxWidth: 580 }}>
            <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 16px' }}>
              You might have deep connections in finance, but your child is passionate about healthcare. Another parent in the network might have strong healthcare connections, but their child wants to break into finance.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.65, margin: '0 0 16px' }}>
              When you help their student, they help yours.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: '0 0 20px' }}>
              That's the beauty of College Fast Forward. It's not just your network helping your kid — it's thousands of parents collectively opening their networks for each other's children.
            </p>
            <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, fontStyle: 'italic', color: '#E85D20', margin: 0 }}>
              One conversation really can change everything.
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 3: HOW IT WORKS */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>How it works</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            Kids need jobs.<br />Personal connections get them hired.
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #E85D20', borderRadius: '0 12px 12px 0', padding: '14px 20px', marginBottom: 28, maxWidth: 560 }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.55 }}>
              📊 70% of Gen Z students already ask their parents for help finding a job.{' '}
              <span style={{ color: '#E85D20', fontWeight: 600 }}>Now parents can actually do something about it.</span>
            </p>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 12px', maxWidth: 560 }}>
            We pool our networks — parents and alumni across every industry — to maximize every student's chances of finding the right person at the right company.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 560 }}>
            Whatever school your kid goes to, that's the network you're in.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, margin: '0 0 36px', maxWidth: 520 }}>
            {HOW_IT_WORKS.map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20' }}>{step}</span>
                </div>
                <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, margin: 0, maxWidth: 520 }}>
            Not a job board. Not an algorithm. Real people who already want to help — because their kid is in the same boat.
          </p>
        </Section>

        <Divider />

        {/* SECTION 4: THE VILLAGE */}
        <Section style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(232,93,32,0.05)', border: '1px solid rgba(232,93,32,0.15)', borderRadius: 20, padding: '52px 40px' }}>
            <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px' }}>It takes a village.</h2>
            <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px' }}>And you're a big part of it.</h2>
            <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 auto 36px', maxWidth: 480 }}>
              Every parent who joins makes the network stronger — not just for their own student, but for every student in it. The more of us who show up, the more doors get opened.
            </p>
            <button onClick={onParentJoin} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#E85D20', background: 'none', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 10, padding: '12px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.1)'; e.currentTarget.style.borderColor = '#E85D20'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'; }}
            >Help grow the village — join free →</button>
          </div>
        </Section>

        <Divider />

        {/* SECTION 5: FASTIQ */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>For students who want to go further</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            A warm network alone isn't always enough.<br />So we built FastIQ.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 16px', maxWidth: 560 }}>
            FastIQ is an AI career engine that helps students activate their connections faster, craft better outreach, tailor their resume, and know exactly what to do next.
          </p>
          <p style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', margin: '0 0 48px' }}>
            The network opens the door.<br />FastIQ helps them walk through it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {FASTIQ_FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <p style={{ fontSize: 24, margin: '0 0 10px' }}>{f.icon}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{f.label}</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 6: PRICING */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>Simple pricing. No surprises.</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 32px' }}>
            What does it cost?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <PricingRow label="Parents & Alumni" sublabel="Join the network, help students, make introductions." price="Free to join" />
            <PricingRow label="Students — FastIQ" sublabel="Full AI career engine. No credit card to start." price={foundingActive ? '$14.50/mo' : '$29/mo'} highlight={true} badge={foundingActive ? 'Founding Rate' : null} />
          </div>
          {foundingActive && (
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
                🏅 Founding rate of <strong style={{ color: '#c9a84c' }}>$14.50/mo</strong> locked in forever. Regular price is $29/mo after April 30.
                {timeLeft && <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{timeLeft}</span>}
              </p>
            </div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
            {["✓ 7-day free trial — no credit card needed", "✓ Students can pay — or parents can pay on their student's behalf", "✓ Cancel anytime. No contracts."].map((line, i) => (
              <p key={i} style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: i < 2 ? '0 0 4px' : 0 }}>{line}</p>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onParentJoin} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 16px rgba(232,93,32,0.3)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >Join as a Parent — Free →</button>
            <button onClick={onStudentJoin} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#E85D20', background: 'none', border: '1px solid rgba(232,93,32,0.35)', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >Start Student Trial →</button>
          </div>
        </Section>

        <Divider />

        {/* SECTION 7: SOCIAL PROOF */}
        <Section style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 32px' }}>From the network</p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid #E85D20', borderRadius: '0 16px 16px 0', padding: '24px 28px', textAlign: 'left', maxWidth: 560, margin: '0 auto 16px' }}>
            <p style={{ fontFamily: playfair, fontSize: 19, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px', lineHeight: 1.55 }}>
              "{SOCIAL_PROOF[activeQuote].quote}"
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {SOCIAL_PROOF[activeQuote].author}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {SOCIAL_PROOF.map((_, i) => (
              <button key={i} onClick={() => setActiveQuote(i)} style={{ width: i === activeQuote ? 20 : 6, height: 6, borderRadius: 3, background: i === activeQuote ? '#E85D20' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 8: FAQ */}
        <Section>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px' }}>Common questions</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 40px' }}>
            Everything you need to know.
          </h2>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </Section>

        <Divider />

        {/* SECTION 9: FINAL CTA */}
        <Section style={{ textAlign: 'center', padding: '80px 24px 100px' }}>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Your student's next opportunity<br />is one introduction away.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 440 }}>
            Join the network. Add your connections. Help a student get hired — maybe even your own.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onParentJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.35)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,32,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.35)'; }}
            >Join as a Parent or Alumni — Free →</button>
            <button onClick={onStudentJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 32px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >I'm a Student →</button>
          </div>
        </Section>

        {/* FOOTER */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 College Fast Forward</span>
          <span style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Building parent networks at colleges across the country</span>
        </div>

      </div>
    </>
  );
}

LandingPage.isPublic = true;