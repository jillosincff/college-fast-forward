import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

// ── Design Tokens — match StudentLandingPage ──────────────────
const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';
const TEXT3 = '#94A3B8';
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const GREEN_LIGHT = '#F0FDF4';
const GREEN_BORDER = '#BBF7D0';
const ORANGE = '#F97316';
const SHADOW = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
const SHADOW_MD = '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.04)';
const SHADOW_LG = '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)';
const R = 12;

const SCHOOLS = ['University of Florida', 'Florida State', 'Ohio State', 'UCF', 'USC', 'Penn State', 'University of Michigan', 'Tulane', 'University of Maryland', 'And growing…'];

const HOW_IT_WORKS = [
  { number: "01", title: "Fill out a quick profile", desc: "Your industry, company, and how you're willing to help. Takes 2 minutes. Seriously." },
  { number: "02", title: "Students reach out to you directly", desc: "Only students from your school's network — no spam, no cold outreach from strangers." },
  { number: "03", title: "You respond and help how you want", desc: "Whether that's advice, a referral, or an introduction — you decide. No pressure ever." },
];

const FAQS = [
  { q: "Is the parent & alumni network really free?", a: "Yes, completely. Parents and alumni join free and stay free. FastIQ is an optional paid upgrade for students only." },
  { q: "What does 'agreeing to respond' mean?", a: "When you join, you're committing to be an active member — if a student reaches out, you'll do your best to respond. Even a quick reply makes a difference." },
  { q: "What exactly does FastIQ do?", a: "FastIQ is an AI career engine for students — resume tailoring, alumni search, mock interviews, company intel, and a daily action plan." },
  { q: "Can I buy FastIQ for my student?", a: "Yes. Parents can gift FastIQ to their student directly from their dashboard." },
  { q: "What schools are in the network?", a: "We're building networks at colleges across the country. Whatever school your student attends, that's the network you join." },
  { q: "I'm an alumni — can I join to help?", a: "Absolutely. Alumni are a crucial part of the network. Students specifically look for alumni at their target companies." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid #E2E8F0` }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
        <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: BLUE, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.75, margin: '0 0 20px' }}>{a}</p>}
    </div>
  );
}

export default function ParentLandingPage({ onStudentClick }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ fullName: '', jobTitle: '', industry: '', linkedin: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('plp-inter')) {
      const link = document.createElement('link');
      link.id = 'plp-inter';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const go = () => {
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    navigate('GatorAuth');
  };

  const student = () => {
    if (onStudentClick) onStudentClick();
    else navigate('StudentLandingPage');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.jobTitle || !form.industry || !form.email) return;
    setSubmitting(true);
    // Store parent role hint and navigate to signup
    localStorage.setItem('pending_invite_role', 'parent');
    sessionStorage.setItem('pending_invite_role', 'parent');
    // Store form data for pre-population
    try {
      sessionStorage.setItem('parent_prefill', JSON.stringify(form));
    } catch {}
    setTimeout(() => {
      setSubmitting(false);
      navigate('GatorAuth');
    }, 600);
  };

  const SectionLabel = ({ text, center = true }) => (
    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: center ? 'center' : 'left' }}>{text}</p>
  );

  const inputStyle = {
    fontFamily: FONT, fontSize: 15, color: TEXT,
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: R, padding: '14px 16px', width: '100%',
    outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: BG, fontFamily: FONT, color: TEXT, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .parent-input:focus { border-color: ${BLUE} !important; background: #fff !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(248,250,252,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
          College <span style={{ color: BLUE }}>Fast Forward</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={student} style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 12px' }}>I'm a student →</button>
          <button onClick={go} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(0,102,255,0.25)', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Join the Network →</button>
        </div>
      </nav>

      {/* ── HERO + FORM ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 60%)',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`,
          borderRadius: 100, padding: '7px 18px', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Join 1,500+ parents helping students succeed</span>
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s', maxWidth: 620, textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ fontFamily: FONT, fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: TEXT, margin: '0 0 16px' }}>
            Help students{' '}
            <span style={{ color: BLUE }}>open doors.</span>
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2vw, 19px)', color: TEXT2, lineHeight: 1.65, maxWidth: 500, margin: '0 auto 8px' }}>
            Your experience can create real opportunities for the next generation.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT3, margin: 0 }}>
            Add your information below — it only takes 30 seconds.
          </p>
        </div>

        {/* ── SIGNUP FORM ── */}
        <div style={{
          width: '100%', maxWidth: 480,
          background: CARD, borderRadius: 20, boxShadow: SHADOW_LG,
          padding: '32px 28px', marginTop: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.3s',
          textAlign: 'left',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT, margin: '0 0 10px', letterSpacing: '-0.02em' }}>You're in!</h3>
              <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, lineHeight: 1.65, margin: 0 }}>
                Thanks for joining. Finish setting up your profile so students can find you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>Full Name *</label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  placeholder="Jane Smith"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>Job Title *</label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  placeholder="VP of Marketing"
                  value={form.jobTitle}
                  onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>Industry / Company *</label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  placeholder="e.g. Software Engineering at Google"
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>LinkedIn Profile <span style={{ fontWeight: 400, color: TEXT3 }}>(optional)</span></label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  placeholder="linkedin.com/in/yourprofile"
                  value={form.linkedin}
                  onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>Email Address *</label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
                  background: submitting ? '#94A3B8' : BLUE,
                  border: 'none', borderRadius: R, padding: '16px 24px',
                  cursor: submitting ? 'default' : 'pointer', minHeight: 'auto',
                  boxShadow: submitting ? 'none' : '0 8px 24px rgba(0,102,255,0.3)',
                  transition: 'all 0.2s ease', marginTop: 4,
                  width: '100%',
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.background = '#0052CC'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = submitting ? '#94A3B8' : BLUE; }}
              >
                {submitting ? 'Setting up your profile…' : 'Join the Network →'}
              </button>

              {/* Trust lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
                {[
                  'Your information is only shown to relevant students from the same school',
                  'Free to join. No spam. No obligation.',
                  'You control what\'s visible',
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: GREEN }}>✓</span>
                    </div>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.4 }}>{line}</p>
                  </div>
                ))}
              </div>

              {/* Match note */}
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0, textAlign: 'center', fontStyle: 'italic', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                Your profile will only be surfaced when a student matches your school + industry.
              </p>
            </form>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 52, paddingTop: 36, borderTop: '1px solid #E2E8F0', opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.5s', gap: 0, width: '100%', maxWidth: 520 }}>
          {[{ number: '1,500+', label: 'Parents & Alumni' }, { number: '15+', label: 'Universities' }, { number: '50+', label: 'Industries' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 36px', borderRight: i < 2 ? '1px solid #E2E8F0' : 'none' }}>
              <p style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: BLUE, margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.number}</p>
              <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: TEXT3, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUSTED BY ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '44px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 20px' }}>Parents & Alumni at</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {SCHOOLS.map((school, i) => (
            <div key={i} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: i === SCHOOLS.length - 1 ? TEXT3 : TEXT2, background: i === SCHOOLS.length - 1 ? '#F8FAFC' : BLUE_LIGHT, border: `1px solid ${i === SCHOOLS.length - 1 ? '#E2E8F0' : BLUE_BORDER}`, borderRadius: 100, padding: '7px 16px', fontStyle: i === SCHOOLS.length - 1 ? 'italic' : 'normal' }}>
              {school}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="How it works" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 8px', textAlign: 'center' }}>Simple, on your terms.</h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT3, textAlign: 'center', margin: '0 0 48px', fontStyle: 'italic' }}>No commitments. Just helping.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
            {HOW_IT_WORKS.map(({ number, title, desc }, i) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '28px 0', borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: BLUE_LIGHT, border: `1.5px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: BLUE, marginTop: 2 }}>
                  {number}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: 0, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={go} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: R, padding: '16px 36px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(0,102,255,0.25)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#0052CC'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = BLUE; }}
            >Join the Network →</button>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ background: CARD, borderTop: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="FAQ" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 40px', textAlign: 'center' }}>Got questions? Fair.</h2>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: '88px 24px 72px', textAlign: 'center', background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <SectionLabel text="One connection changes everything" />
          <h2 style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            One introduction from you can<br />
            <span style={{ color: BLUE }}>lead to an interview.</span>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 32px', lineHeight: 1.7 }}>
            Free. 30 seconds. No obligation.<br />Students at your school genuinely need you.
          </p>
          <button onClick={go} style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: 14, padding: '19px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(0,102,255,0.3)', marginBottom: 14, transition: 'all 0.2s ease', display: 'inline-block' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#0052CC'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = BLUE; }}
          >Join the Network →</button>
          <br />
          <button onClick={student} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'inline-block', marginTop: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT2}
            onMouseLeave={e => e.currentTarget.style.color = TEXT3}
          >I'm a student →</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: '28px 24px', textAlign: 'center', background: CARD }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: FONT, fontSize: 13, color: TEXT3, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT2}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0 }}>
          © {new Date().getFullYear()} College Fast Forward · Helping students land faster with less stress.
        </p>
      </div>
    </div>
  );
}