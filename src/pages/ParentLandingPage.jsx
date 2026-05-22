import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { base44 } from '@/api/base44Client';

// ── Design Tokens — match StudentLandingPage ──────────────────
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const FONT = SF;
const BG = '#f8f9ff';
const BG2 = '#ffffff';
const CARD = '#ffffff';
const CARD2 = '#f1f5ff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const VIOLET = '#7c3aed';
const VIOLET_LIGHT = 'rgba(124,58,237,0.08)';
const VIOLET_BORDER = 'rgba(124,58,237,0.20)';
const PINK = '#ec4899';
const PINK_LIGHT = 'rgba(236,72,153,0.08)';
const PINK_BORDER = 'rgba(236,72,153,0.22)';
const TEAL = '#06b6d4';
const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const TEAL_DARK = '#0891b2';
const CORAL = '#f43f5e';
const CORAL_LIGHT = 'rgba(244,63,94,0.07)';
const CORAL_BORDER = 'rgba(244,63,94,0.22)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const GRAD_WARM = 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';
const R = 16;
// Aliases for backward compat
const BLUE = INDIGO;
const BLUE_LIGHT = INDIGO_LIGHT;
const BLUE_BORDER = INDIGO_BORDER;
const GREEN = TEAL;
const GREEN_LIGHT = TEAL_LIGHT;
const GREEN_BORDER = TEAL_BORDER;

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
    <div style={{ borderBottom: `1px solid #f1f5f9` }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
        <span style={{ fontFamily: SF, fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: INDIGO, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, lineHeight: 1.75, margin: '0 0 20px' }}>{a}</p>}
    </div>
  );
}

export default function ParentLandingPage({ onStudentClick }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ fullName: '', jobTitle: '', industry: '', linkedin: '', email: '', school: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.jobTitle || !form.industry || !form.email || !form.school) return;
    setSubmitting(true);
    
    try {
      // Derive school_code from school name
      const schoolCode = deriveSchoolCode(form.school);
      
      // Create parent user directly in database
      await base44.functions.invoke('createParentUser', {
        email: form.email.toLowerCase().trim(),
        full_name: form.fullName.trim(),
        school: form.school.trim(),
        school_name: form.school.trim(),
        school_code: schoolCode,
        company: form.industry.trim(),
        career_background: form.jobTitle.trim(),
        industry: form.industry.trim(),
        industries: [form.industry.trim()],
        intro_willingness: 'yes',
        ways_to_help: ['networking_intros', 'career_advice'],
        help_types: ['networking_intros', 'career_advice'],
        visible_in_directory: true,
        directory_consent_given: true,
        linkedin_url: form.linkedin?.trim() || '',
      });
      
      // Store parent role hint for future login
      localStorage.setItem('pending_invite_role', 'parent');
      sessionStorage.setItem('pending_invite_role', 'parent');
      
      // Show success screen
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create parent:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const SectionLabel = ({ text, color = INDIGO }) => (
    <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>{text}</p>
  );

  const inputStyle = {
    fontFamily: SF, fontSize: 15, color: TEXT,
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: R, padding: '14px 16px', width: '100%',
    outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: BG, fontFamily: FONT, color: TEXT, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGreen { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        .parent-input:focus { border-color: ${INDIGO} !important; background: #fff !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(248,249,255,0.90)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.10)',
        padding: '0 clamp(16px,5vw,32px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: SF, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          College{' '}
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Fast Forward
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!submitted && (
            <>
              <button onClick={student} style={{ fontFamily: SF, fontSize: 13, fontWeight: 500, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '8px 12px' }}>For Students</button>
              <button onClick={go} style={{
                fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff',
                background: GRAD_INDIGO, border: 'none', borderRadius: 10,
                padding: '10px 20px', cursor: 'pointer', minHeight: 44,
                boxShadow: '0 4px 14px rgba(109,40,217,0.35)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >Join the Network →</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO + FORM ── */}
      <div style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 40px) clamp(60px, 10vw, 80px)', textAlign: 'center',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle radial glow */}
        <div style={{ position: 'absolute', top: '50%', right: '0%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)', transform: 'translate(-20%, -50%)', pointerEvents: 'none' }} />
        
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`,
          borderRadius: 999, padding: '12px 28px', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
          <span style={{ fontFamily: SF, fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>⚡ JOIN 1,500+ PARENTS & ALUMNI</span>
        </div>

        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s', maxWidth: 620, textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ fontFamily: SF, fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: TEXT, margin: '0 0 16px' }}>
            Help students{' '}
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>open doors.</span>
          </h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(16px, 2vw, 19px)', color: TEXT2, lineHeight: 1.65, maxWidth: 500, margin: '0 auto 8px' }}>
            Your experience can create real opportunities for the next generation.
          </p>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, color: TEXT3, margin: 0 }}>
            Add your information below — it only takes 30 seconds.
          </p>
        </div>

        {/* ── SIGNUP FORM ── */}
        <div style={{
          width: '100%', maxWidth: 480,
          background: CARD, borderRadius: 20, boxShadow: SHADOW_LG, border: `1px solid ${INDIGO_BORDER}`,
          padding: 'clamp(28px, 6vw, 36px)', marginTop: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.3s',
          textAlign: 'left', position: 'relative',
        }}>
          {/* Top gradient accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: GRAD_INDIGO, borderRadius: '20px 20px 0 0' }} />
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Thank you!</h3>
              <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.5, margin: '0 0 16px' }}>
                Your information has been added to the College Fast Forward network.
              </p>
              <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.7, margin: '0 0 24px' }}>
                Each parent connection strengthens the student community. Your profile will now be surfaced to relevant students from your school who are looking in your industry — creating real opportunities for the next generation.
              </p>
              <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: TEAL, margin: '0 0 24px' }}>
                You just helped make the network better for everyone.
              </p>

              {/* Next Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                <button
                  onClick={() => {
                    const subject = encodeURIComponent('Join me on College Fast Forward');
                    const body = encodeURIComponent('Hey! I just joined the College Fast Forward network to help students in my industry. You should sign up too - it\'s free and only takes 30 seconds.\n\nJoin here: https://collegefastforward.com\n\nLet me know if you have any questions!');
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                  }}
                  style={{
                    fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff',
                    background: GRAD_INDIGO, border: 'none', borderRadius: 14, padding: '16px 24px',
                    cursor: 'pointer', minHeight: 52,
                    boxShadow: '0 8px 28px rgba(109,40,217,0.30)',
                    transition: 'all 0.2s ease', width: '100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.42)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.30)'; }}
                >
                  Invite My Student →
                </button>
              </div>

              {/* What happens next */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 18, textAlign: 'left' }}>
                <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, margin: '0 0 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>What happens next?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Students matching your school + industry will see you as a potential warm connection',
                    'You\'ll only be contacted if a student reaches out',
                    'You can edit or remove your profile anytime',
                  ].map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>
                      </div>
                      <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.5 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                <label style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>Which school would you like to support? *</label>
                <input
                  className="parent-input"
                  style={inputStyle}
                  placeholder="e.g. University of Florida"
                  value={form.school}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
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
                  fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff',
                  background: submitting ? '#94A3B8' : GRAD_INDIGO,
                  border: 'none', borderRadius: 14, padding: '16px 24px',
                  cursor: submitting ? 'default' : 'pointer', minHeight: 52,
                  boxShadow: submitting ? 'none' : '0 8px 28px rgba(109,40,217,0.30)',
                  transition: 'all 0.2s ease', marginTop: 4,
                  width: '100%',
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.42)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = submitting ? 'none' : '0 8px 28px rgba(109,40,217,0.30)'; }}
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
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>
                    </div>
                    <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.4 }}>{line}</p>
                  </div>
                ))}
              </div>

              {/* Match note */}
              <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, textAlign: 'center', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                Your profile will only be surfaced when a student matches your school + industry.
              </p>
            </form>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 52, paddingTop: 36, borderTop: '1px solid #f1f5f9', opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.5s', gap: 0, width: '100%', maxWidth: 520 }}>
          {[{ number: '1,500+', label: 'Parents & Alumni' }, { number: '15+', label: 'Universities' }, { number: '50+', label: 'Industries' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 36px', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <p style={{ fontFamily: SF, fontSize: 32, fontWeight: 800, color: INDIGO, margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.number}</p>
              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: TEXT3, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUSTED BY ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '20px clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 'clamp(12px, 4vw, 32px)', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { emoji: '🎓', stat: '1,500+', label: 'Parents & Alumni' },
            { emoji: '🏢', stat: '15+', label: 'Universities' },
            { emoji: '🤝', stat: '50+', label: 'Industries' },
            { emoji: '⭐', stat: '4.9/5', label: 'Parent Rating' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <div>
                <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>{item.stat}</p>
                <p style={{ fontFamily: SF, fontSize: 11, color: TEXT3, margin: 0, fontWeight: 500 }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: BG, padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <SectionLabel text="How it works" color={VIOLET} />
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 44px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 clamp(28px, 8vw, 40px)', textAlign: 'center' }}>
            Simple, on your terms.<br />
            <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Just helping.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
            {HOW_IT_WORKS.map(({ number, title, desc }, i) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: 'clamp(24px, 5vw, 32px) 0', borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: INDIGO_LIGHT, border: `1.5px solid ${INDIGO_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 13, fontWeight: 800, color: INDIGO, marginTop: 2 }}>
                  {number}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <p style={{ fontFamily: SF, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>{title}</p>
                  <p style={{ fontFamily: SF, fontSize: 14, color: TEXT2, margin: 0, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!submitted && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={go} style={{
                fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff',
                background: GRAD_INDIGO, border: 'none', borderRadius: 14, padding: '16px 36px',
                cursor: 'pointer', minHeight: 52,
                boxShadow: '0 8px 28px rgba(109,40,217,0.30)',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(109,40,217,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.30)'; }}
              >Join the Network →</button>
            </div>
          )}
        </div>
      </div>



      {/* ── FINAL CTA ── */}
      {!submitted && (
        <div style={{ padding: 'clamp(56px, 12vw, 100px) clamp(20px, 5vw, 40px)', textAlign: 'center', background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>One connection changes everything</p>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 7vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
              One introduction from you can<br />lead to an interview.
            </h2>
            <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.75)', margin: '0 0 clamp(28px, 6vw, 36px)', lineHeight: 1.65 }}>
              Free. 30 seconds. No obligation.<br />Students at your school genuinely need you.
            </p>
            <button onClick={go} style={{
              fontFamily: SF, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: INDIGO,
              background: '#fff', border: 'none', borderRadius: 14,
              padding: 'clamp(16px, 4vw, 20px) clamp(40px, 8vw, 56px)',
              cursor: 'pointer', minHeight: 56,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              transition: 'all 0.2s ease', touchAction: 'manipulation',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)'; }}
            >
              Join the Network →
            </button>
            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '16px 0 0', lineHeight: 1.4 }}>Free to Join</p>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: 'clamp(20px, 5vw, 28px) clamp(16px, 5vw, 32px)', textAlign: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 28px)', marginBottom: 12, flexWrap: 'wrap' }}>
          {[['Privacy', '#Privacy'], ['Terms', '#Terms'], ['Contact', 'mailto:hello@collegefastforward.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontFamily: SF, fontSize: 13, color: TEXT3, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = TEXT}
              onMouseLeave={e => e.currentTarget.style.color = TEXT3}
            >{label}</a>
          ))}
        </div>
        <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} College Fast Forward · Helping students land faster with less stress.
        </p>
      </div>
    </div>
  );
}