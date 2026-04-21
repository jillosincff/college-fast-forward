import { useState, useEffect, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

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
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 22, color: '#E85D20', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 20px' }}>{a}</p>}
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
    const iv = setInterval(() => { if (!dragging) setActive(a => (a + 1) % total); }, 4500);
    return () => clearInterval(iv);
  }, [dragging]);

  const goTo = (i) => setActive((i + total) % total);
  const onMouseDown = (e) => { setDragging(true); setStartX(e.clientX); };
  const onMouseMove = (e) => { if (dragging) setOffset(e.clientX - startX); };
  const onMouseUp = () => { if (Math.abs(offset) > 60) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };
  const onTouchStart = (e) => { setDragging(true); setStartX(e.touches[0].clientX); };
  const onTouchMove = (e) => { if (dragging) setOffset(e.touches[0].clientX - startX); };
  const onTouchEnd = () => { if (Math.abs(offset) > 50) goTo(active + (offset < 0 ? 1 : -1)); setDragging(false); setOffset(0); };

  const t = TESTIMONIALS[active];

  return (
    <div style={{ userSelect: 'none' }}>
      <div
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderLeft: '4px solid #E85D20',
          borderRadius: '0 20px 20px 0',
          padding: '36px 36px 32px',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.08}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 190,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: playfair, fontSize: 100, lineHeight: 1, color: 'rgba(255,255,255,0.06)', fontWeight: 700, pointerEvents: 'none' }}>"</div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,93,32,0.2)', border: '1px solid rgba(232,93,32,0.35)', borderRadius: 100, padding: '4px 12px', marginBottom: 18 }}>
          <span style={{ fontSize: 12 }}>{t.tagIcon}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.tag}</span>
        </div>

        <p style={{ fontFamily: playfair, fontSize: 'clamp(18px, 2.5vw, 23px)', fontStyle: 'italic', fontWeight: 700, color: '#fff', lineHeight: 1.55, margin: '0 0 24px', position: 'relative', zIndex: 1 }}>
          "{t.quote}"
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #E85D20, #c9471a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(232,93,32,0.4)' }}>
            {t.initials}
          </div>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{t.name}</p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{t.school}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === active ? 24 : 6, height: 6, borderRadius: 3, background: i === active ? '#E85D20' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={i} onClick={() => goTo(active + (i === 0 ? -1 : 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: dmSans, fontSize: 15, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.2)'; e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.color = '#E85D20'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
            >{arrow}</button>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '12px 0 0', letterSpacing: '0.04em' }}>
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
  const go = () => navigate('GetStarted');
  const student = () => { if (onStudentClick) onStudentClick(); else navigate('GetStarted'); };

  return (
    <div style={{ fontFamily: dmSans, overflowX: 'hidden' }}>

      {/* ── SECTION 1: HERO — White with orange glow ── */}
      <div style={{
        background: '#ffffff',
        padding: '88px 24px 80px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(232,93,32,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(232,93,32,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(232,93,32,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 100, padding: '7px 18px', marginBottom: 36, opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20' }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.1em', textTransform: 'uppercase' }}>1,000+ parents & alumni helping students</span>
        </div>

        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(40px, 6.5vw, 76px)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 8px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.1s', position: 'relative' }}>
          Your student needs a job.
        </h1>
        <h1 style={{ fontFamily: playfair, fontSize: 'clamp(40px, 6.5vw, 76px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 32px', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.7s ease 0.15s', position: 'relative' }}>
          Parents have connections.
        </h1>

        <p style={{ fontFamily: dmSans, fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 600, color: '#3d3d3d', maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.6, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.2s', position: 'relative' }}>
          Let's pool them together and open doors.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.3s', position: 'relative' }}>
          <button onClick={go} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '17px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 28px rgba(232,93,32,0.35)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(232,93,32,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,93,32,0.35)'; }}
          >Join free — add your network →</button>
          <button onClick={student} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#6b6b6b', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: '17px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E85D20'; e.currentTarget.style.color = '#E85D20'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = '#6b6b6b'; }}
          >I'm a student →</button>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#a0a0a0', margin: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s', position: 'relative' }}>
          Free to join. No credit card. No obligation.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(0,0,0,0.07)', opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.4s', position: 'relative' }}>
          {[{ number: '1,000+', label: 'Parents & Alumni' }, { number: '15+', label: 'Universities' }, { number: '50+', label: 'Industries' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 44px', borderRight: i < 2 ? '1px solid rgba(0,0,0,0.07)' : 'none' }}>
              <p style={{ fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', lineHeight: 1 }}>{s.number}</p>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#a0a0a0', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: TRUSTED BY — Vibrant gradient ── */}
      <div style={{ background: 'linear-gradient(135deg, #E85D20 0%, #c9471a 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '44px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 20px' }}>Trusted by parents & alumni at</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {SCHOOLS.map((school, i) => (
            <div key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', background: i === SCHOOLS.length - 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', border: `1px solid ${i === SCHOOLS.length - 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)'}`, borderRadius: 100, padding: '8px 18px', fontStyle: i === SCHOOLS.length - 1 ? 'italic' : 'normal', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {school}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '22px 28px', maxWidth: 460, margin: '0 auto', boxShadow: '0 2px 16px rgba(232,93,32,0.06)' }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Don't see your kid's school?</p>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', lineHeight: 1.65, margin: '0 0 16px' }}>We're building networks at colleges across the country. Join and help us launch your school's network.</p>
          <button onClick={go} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#E85D20', background: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >Help us build it →</button>
        </div>
      </div>

      {/* ── SECTION 3: FOUNDER'S STORY — Deep navy ── */}
      <div style={{ background: '#0d1b2a', padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(232,93,32,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 36px' }}>Why we built this</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <p style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.35, letterSpacing: '-0.01em', margin: 0 }}>
              It's stressful watching your kid apply to hundreds of jobs and hear almost nothing back.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>
              You've probably already asked everyone you know — <em style={{ color: '#fff', fontWeight: 500 }}>"do you know anybody who can help?"</em>
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>
              But that only goes so far.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#ffffff', lineHeight: 1.8, margin: 0 }}>
              So we decided to change that.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>
              We're on a mission to pool the connections of parents at your kid's college — exponentially expanding the warm introductions available to every student in the network.
            </p>
            <p style={{ fontFamily: playfair, fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, fontStyle: 'italic', color: '#E85D20', lineHeight: 1.35, margin: '8px 0 0' }}>
              That's College Fast Forward.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: YOUR KID ISN'T LAZY — Bold orange ── */}
      <div style={{ background: '#E85D20', padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 350, height: 350, background: 'rgba(0,0,0,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Your kid isn't lazy.
          </h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, color: 'rgba(0,0,0,0.75)', fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 36px' }}>
            They just don't know the right people yet.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, margin: '0 0 16px', maxWidth: 580 }}>
            70% of Gen Z students are already asking their parents for help finding a job. You're not alone in wanting to do more.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, margin: '0 0 40px', maxWidth: 580 }}>
            The problem isn't motivation — it's access. Your network opens doors that no resume ever could.
          </p>
          <button onClick={go} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#E85D20', background: '#fff', border: 'none', borderRadius: 14, padding: '17px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 28px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.15)'; }}
          >Join free — add your network →</button>
        </div>
      </div>

      {/* ── SECTION 5: TESTIMONIALS — Dark charcoal ── */}
      <div style={{ background: '#1a1a2e', padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px' }}>From the network</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 40px' }}>
            Parents just like you.
          </h2>
          <TestimonialCarousel />
        </div>
      </div>

      {/* ── SECTION 6: HOW IT WORKS — Clean white ── */}
      <div style={{ background: '#ffffff', padding: '88px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>How it works</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Simple, on your terms.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontStyle: 'italic', color: '#a0a0a0', margin: '0 0 48px' }}>No commitments. Just helping.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 44 }}>
            {HOW_IT_WORKS.map(({ number, title, desc }, i) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '32px 0', borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.02em', marginTop: 2, boxShadow: '0 4px 16px rgba(232,93,32,0.3)' }}>
                  {number}
                </div>
                <div style={{ paddingTop: 12 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>{title}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 15, color: '#6b6b6b', margin: 0, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={go} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 12, padding: '16px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.3)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,93,32,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,93,32,0.3)'; }}
          >Join free — 2 minutes, zero obligation →</button>
        </div>
      </div>

      {/* ── SECTION 7: GROW THE NETWORK — Gradient poster ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a05 0%, #2d1206 40%, #1a0a05 100%)', padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,93,32,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🤝</div>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>Help us grow</p>
          <h3 style={{ fontFamily: playfair, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Know another parent at your kid's school?
          </h3>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 auto 36px', maxWidth: 420 }}>
            The bigger the network, the better the chances for every student — including yours.
          </p>
          <button onClick={() => navigate('InviteParent')} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '17px 40px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(232,93,32,0.4)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(232,93,32,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,32,0.4)'; }}
          >Invite a parent →</button>
        </div>
      </div>

      {/* ── SECTION 8: FAQ — Dark navy ── */}
      <div style={{ background: '#0d1b2a', padding: '88px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px' }}>FAQ</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 40px' }}>Got questions? Fair.</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* ── SECTION 9: FINAL CTA — Deep dark with glow ── */}
      <div style={{ background: '#08080f', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(232,93,32,0.15) 0%, transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: '#E85D20', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 24px' }}>Your best move</p>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(34px, 5vw, 64px)', fontWeight: 700, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 8px' }}>One intro from you</h2>
          <h2 style={{ fontFamily: playfair, fontSize: 'clamp(34px, 5vw, 64px)', fontWeight: 700, color: '#E85D20', fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 28px' }}>can change everything.</h2>
          <p style={{ fontFamily: dmSans, fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: '0 auto 40px' }}>
            Free. 2 minutes. No obligation.<br />Students at your school genuinely need you.
          </p>
          <button onClick={go} style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: '#fff', background: '#E85D20', border: 'none', borderRadius: 14, padding: '19px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 0 60px rgba(232,93,32,0.4), 0 8px 32px rgba(232,93,32,0.4)', marginBottom: 14, display: 'block', marginLeft: 'auto', marginRight: 'auto', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 80px rgba(232,93,32,0.55), 0 16px 48px rgba(232,93,32,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(232,93,32,0.4), 0 8px 32px rgba(232,93,32,0.4)'; }}
          >Join free — add your network →</button>
          <button onClick={student} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'block', margin: '0 auto', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >I'm a student →</button>
          {foundingActive && timeLeft && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#E85D20', marginTop: 18, fontWeight: 600 }}>🏅 Founding rate ends April 30 — {timeLeft} remaining</p>
          )}
        </div>
      </div>

    </div>
  );
}