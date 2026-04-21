import { useState, useEffect, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const C = {
  bg: '#fafaf8',
  bgWhite: '#ffffff',
  bgWarm: '#fffaf6',
  orange: '#E85D20',
  orangeLight: 'rgba(232,93,32,0.07)',
  orangeBorder: 'rgba(232,93,32,0.18)',
  dark: '#1a1a1a',
  body: '#3d3d3d',
  muted: '#6b6b6b',
  hint: '#a0a0a0',
  border: 'rgba(0,0,0,0.07)',
  borderWarm: 'rgba(232,93,32,0.12)',
};

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

const TESTIMONIALS = [
  { quote: "My daughter got an interview with a sports agency within 48 hours of joining.", name: "Mara B.", school: "UF Parent", initials: "MB", tag: "48 hours", tagIcon: "⚡" },
  { quote: "My son has been looking for an internship for months. He reached out to a parent with a healthcare background and got an interview the next day.", name: "Mandy S.", school: "University of Delaware Parent", initials: "MS", tag: "Next day interview", tagIcon: "🎯" },
  { quote: "This is brilliant! How could this have not existed before?", name: "Mike S.", school: "USC Parent", initials: "MS", tag: "Early member", tagIcon: "🏅" },
  { quote: "I wish I had this when I was looking for a job!", name: "Nancy H.", school: "Indiana Parent", initials: "NH", tag: "Early member", tagIcon: "🏅" },
  { quote: "I felt so helpless watching my kid apply and hear nothing back. This gave me something real to do.", name: "David K.", school: "OSU Parent", initials: "DK", tag: "Now helping", tagIcon: "🤝" },
  { quote: "A conversation through CFF changed the trajectory of my son's career.", name: "Lisa M.", school: "UF Parent", initials: "LM", tag: "Career changed", tagIcon: "🚀" },
];

const SCHOOLS = ['University of Florida', 'Florida State', 'Ohio State', 'UCF', 'USC', 'Penn State', 'University of Michigan', 'Tulane', 'University of Maryland', 'And growing…'];

const HOW_IT_WORKS = [
  { number: "01", title: "Fill out a quick profile", desc: "Your industry, company, and how you're willing to help. Takes 2 minutes. Seriously." },
  { number: "02", title: "Students reach out to you", desc: "Only students from your school's network — no spam, no cold outreach from strangers." },
  { number: "03", title: "You respond and help how you want", desc: "A 15-minute call. A LinkedIn intro. A referral. You decide. No pressure ever." },
];

const FAQS = [
  { q: "Is the parent & alumni network really free?", a: "Yes, completely. Parents and alumni join free and stay free. FastIQ is an optional paid upgrade for students only." },
  { q: "What does 'agreeing to respond' mean?", a: "When you join, you're committing to be an active member — if a student reaches out, you'll do your best to respond. Even a quick reply makes a difference." },
  { q: "What exactly does FastIQ do?", a: "FastIQ is an AI career engine for students — resume tailoring, alumni search, mock interviews, company intel, and a daily action plan." },
  { q: "Can my parents pay FastIQ for me?", a: "Yes. Parents can gift FastIQ to their student directly from their dashboard." },
  { q: "What schools are in the network?", a: "We're building networks at colleges across the country. Whatever school your student attends, that's the network you join." },
  { q: "I'm an alumni — can I join to help?", a: "Absolutely. Alumni are a crucial part of the network. Students specifically look for alumni at their target companies." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '20px 0', background: 'none', border: 'none',
        cursor: 'pointer', minHeight: 'auto',
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: C.dark, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 22, color: C.orange, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dmSans, fontSize: 15, color: C.muted, lineHeight: 1.75, margin: '0 0 20px' }}>{a}</p>}
    </div>
  );
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const interval = setInterval(() => { if (!dragging) setActive(a => (a + 1) % total); }, 5000);
    return () => clearInterval(interval);
  }, [dragging]);

  const goTo = (i) => setActive((i + total) % total);
  const onMouseDown = (e) => { setDragging(true); setStartX(e.clientX); setOffset(0); };
  const onMouseMove = (e) => { if (dragging) setOffset(e.clientX - startX); };
  const onMouseUp = () => { if (Math.abs(offset) > 60) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };
  const onTouchStart = (e) => { setDragging(true); setStartX(e.touches[0].clientX); };
  const onTouchMove = (e) => { if (dragging) setOffset(e.touches[0].clientX - startX); };
  const onTouchEnd = () => { if (Math.abs(offset) > 50) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };

  const t = TESTIMONIALS[active];

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <div
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          background: C.bgWhite,
          border: `1px solid ${C.borderWarm}`,
          borderLeft: `4px solid ${C.orange}`,
          borderRadius: '0 20px 20px 0',
          padding: '36px 36px 32px',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.08}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
          boxShadow: '0 4px 32px rgba(232,93,32,0.06)',
          minHeight: 190,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative quote */}
        <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: playfair, fontSize: 90, lineHeight: 1, color: 'rgba(232,93,32,0.05)', fontWeight: 700, pointerEvents: 'none', userSelect: 'none' }}>"</div>

        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
          <span style={{ fontSize: 12 }}>{t.tagIcon}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.tag}</span>
        </div>

        {/* Quote */}
        <p style={{ fontFamily: playfair, fontSize: 'clamp(18px, 2.5vw, 23px)', fontStyle: 'italic', fontWeight: 700, color: C.dark, lineHeight: 1.55, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
          "{t.quote}"
        </p>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.orange}, #c9471a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(232,93,32,0.25)' }}>
            {t.initials}
          </div>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>{t.name}</p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: C.muted, margin: 0 }}>{t.school}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 24 : 6, height: 6, borderRadius: 3, background: i === active ? C.orange : C.border, border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: C.bgWhite, border: `1px solid ${C.border}`, fontFamily: dmSans, fontSize: 15, color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; e.currentTarget.style.background = C.orangeLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dark; e.currentTarget.style.background = C.bgWhite; }}
            >{arrow}</button>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: C.hint, textAlign: 'center', margin: '12px 0 0', letterSpacing: '0.04em' }}>
        swipe or drag · {active + 1} of {total}
      </p>
    </div>
  );
}

export default function ParentLandingPage({ onStudentClick }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('plp-fonts')) {
      const link = document.createElement('link');
      link.id = 'plp-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    const update = () => {
      const diff = FOUNDING_DEADLINE - new Date();
      if (diff > 0) { const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); setTimeLeft(`${d}d ${h}h`); }
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const foundingActive = new Date() < FOUNDING_DEADLINE;
  const handleJoin = () => navigate('GetStarted');
  const handleStudent = () => { if (onStudentClick) onStudentClick(); else navigate('GetStarted'); };

  return (
    <div style={{ background: C.bg, fontFamily: dmSans, color: C.dark, overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{ background: C.bgWhite, padding: '88px 24px 80px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: `radial-gradient(ellipse, ${C.orangeLight} 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 100, padding: '7px 18px', marginBottom: 36, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.1em', textTransform: 'uppercase' }}>1,000+ parents & alumni helping students</span>
        </div>

        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 700, color: C.dark, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 8px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.1s', position: 'relative' }}>
          Your student needs a job.
        </h1>
        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 32px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.15s', position: 'relative' }}>
          Parents have connections.
        </h1>

        <p style={{ fontFamily: dmSans, fontSize: 'clamp(17px, 2.2vw, 21px)', fontWeight: 600, color: C.body, maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.6, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s', position: 'relative' }}>
          Let's pool them together and open doors.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s', position: 'relative' }}>
          <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 14, padding: '17px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 28px rgba(232,93,32,0.28)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(232,93,32,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,93,32,0.28)'; }}
          >Join free — add your network →</button>
          <button onClick={handleStudent} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: C.muted, background: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: '17px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
          >I'm a student →</button>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, color: C.hint, margin: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s', position: 'relative' }}>
          Free to join. No credit card. No obligation.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 56, paddingTop: 40, borderTop: `1px solid ${C.border}`, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s', position: 'relative' }}>
          {[{ number: '1,000+', label: 'Parents & Alumni' }, { number: '15+', label: 'Universities' }, { number: '50+', label: 'Industries' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 44px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
              <p style={{ fontFamily: playfair, fontSize: 34, fontWeight: 700, color: C.orange, margin: '0 0 4px', lineHeight: 1 }}>{s.number}</p>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: C.hint, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUSTED BY ── */}
      <div style={{ background: C.bgWhite, borderBottom: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>Trusted by parents & alumni at</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {SCHOOLS.map((school, i) => (
            <div key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: i === SCHOOLS.length - 1 ? C.orange : C.body, background: i === SCHOOLS.length - 1 ? C.orangeLight : C.bg, border: `1px solid ${i === SCHOOLS.length - 1 ? C.orangeBorder : C.border}`, borderRadius: 100, padding: '7px 16px', fontStyle: i === SCHOOLS.length - 1 ? 'italic' : 'normal' }}>
              {school}
            </div>
          ))}
        </div>
        <div style={{ background: C.bgWarm, border: `1px solid ${C.borderWarm}`, borderRadius: 16, padding: '20px 24px', maxWidth: 460, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: C.dark, margin: '0 0 6px' }}>Don't see your kid's school?</p>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: C.muted, lineHeight: 1.65, margin: '0 0 14px' }}>We're building networks at colleges across the country. Join and help us launch your school's network.</p>
          <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: C.orange, background: 'none', border: `1px solid ${C.orangeBorder}`, borderRadius: 8, padding: '9px 20px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orangeLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >Help us build it →</button>
        </div>
      </div>

      {/* ── FOUNDER'S STORY ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 32px' }}>Why we built this</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, color: C.dark, lineHeight: 1.35, letterSpacing: '-0.01em', margin: 0 }}>
            It's stressful watching your kid apply to hundreds of jobs and hear almost nothing back.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.8, margin: 0 }}>
            You've probably already asked everyone you know — <em style={{ color: C.dark, fontWeight: 500 }}>"do you know anybody who can help?"</em>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.8, margin: 0 }}>But that only goes so far.</p>
          <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 700, color: C.dark, lineHeight: 1.8, margin: 0 }}>So we decided to change that.</p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.8, margin: 0 }}>
            We're on a mission to pool the connections of parents at your kid's college — exponentially expanding the warm introductions available to every student in the network.
          </p>
          <p style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, fontStyle: 'italic', color: C.orange, lineHeight: 1.35, margin: '8px 0 0' }}>
            That's College Fast Forward.
          </p>
        </div>
      </div>

      {/* ── YOUR KID ISN'T LAZY ── */}
      <div style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: C.dark, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Your kid isn't lazy.</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px' }}>They just don't know the right people yet.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.8, margin: '0 0 16px' }}>
            70% of Gen Z students are already asking their parents for help finding a job. You're not alone in wanting to do more.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: C.body, lineHeight: 1.8, margin: 0 }}>
            The problem isn't motivation — it's access. Your network opens doors that no resume ever could.
          </p>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>From the network</p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 36px' }}>
          Parents just like you.
        </h2>
        <TestimonialCarousel />
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>How it works</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Simple, on your terms.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontStyle: 'italic', color: C.hint, margin: '0 0 44px' }}>No commitments. Just helping.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
            {HOW_IT_WORKS.map(({ number, title, desc }, i) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '28px 0', borderBottom: i < HOW_IT_WORKS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 800, color: C.orange, letterSpacing: '0.04em', marginTop: 2 }}>
                  {number}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: C.dark, margin: '0 0 4px' }}>{title}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 12, padding: '15px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.25)', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >Join free — 2 minutes, zero obligation →</button>
        </div>
      </div>

      {/* ── GROW THE NETWORK ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ background: C.bgWarm, border: `1px solid ${C.borderWarm}`, borderRadius: 24, padding: '44px 40px', textAlign: 'center', boxShadow: '0 4px 40px rgba(232,93,32,0.06)' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🤝</div>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>Help us grow</p>
          <h3 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: C.dark, lineHeight: 1.3, letterSpacing: '-0.01em', margin: '0 0 14px' }}>
            Know another parent at your kid's school?
          </h3>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: C.muted, lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 420 }}>
            The bigger the network, the better the chances for every student — including yours.
          </p>
          <button onClick={() => navigate('InviteParent')} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 12, padding: '14px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.25)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,93,32,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,93,32,0.25)'; }}
          >Invite a parent →</button>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ background: C.bgWhite, borderTop: `1px solid ${C.border}`, padding: '88px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQ</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: C.dark, lineHeight: 1.2, margin: '0 0 36px' }}>Got questions? Fair.</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ background: C.dark, padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 20px' }}>Your best move</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4.5vw, 56px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>One intro from you</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(30px, 4.5vw, 56px)', fontWeight: 700, color: C.orange, fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 24px' }}>can change everything.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: '0 auto 36px' }}>
            Free. 2 minutes. No obligation.<br />Students at your school genuinely need you.
          </p>
          <button onClick={handleJoin} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: C.orange, border: 'none', borderRadius: 14, padding: '18px 44px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.4)', marginBottom: 14, display: 'block', marginLeft: 'auto', marginRight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(232,93,32,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >Join free — add your network →</button>
          <button onClick={handleStudent} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >I'm a student →</button>
          {foundingActive && timeLeft && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: C.orange, marginTop: 16, fontWeight: 600 }}>🏅 Founding rate ends April 30 — {timeLeft} remaining</p>
          )}
        </div>
      </div>

    </div>
  );
}