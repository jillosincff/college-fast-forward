import React, { useEffect, useRef, useState } from 'react';

const FONT_LINK_ID = 'two-products-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const NETWORK_FEATURES = [
  'Instant matching with UF parents & alumni on the platform',
  'Career leads, referrals, advice & guidance from people who\'ve been there',
  'The Parent Pledge — every member commits to showing up',
  'Warm intros that no cold application can replicate',
];

const FASTIQ_FEATURES = [
  'Finds UF alumni worldwide at your student\'s target companies',
  'Drafts personalized outreach — students send, alumni respond',
  'Tailors resumes to specific job listings & uncovers hidden opportunities',
  'Real-time company intel, interview prep & follow-up reminders',
];

export default function LandingTwoProducts({ onClaim, onFastIQ }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => { ensureFonts(); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
  });

  return (
    <section
      ref={ref}
      style={{
        background: '#0d1117',
        padding: '80px 24px 88px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* dual glow */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 60% at 25% 50%, rgba(255,255,255,0.02), transparent), radial-gradient(ellipse 60% 60% at 75% 50%, rgba(232,93,32,0.06), transparent)' }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>

        {/* eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: 14, ...fadeUp(0) }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20' }}>
            Two powerful things. One platform.
          </span>
        </div>

        {/* headline */}
        <div style={{ textAlign: 'center', marginBottom: 56, ...fadeUp(0.08) }}>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            <span style={{ color: '#f4f0e8' }}>Built for the Way </span>
            <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Careers Actually Start</span>
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 300, color: 'rgba(244,240,232,0.45)', marginTop: 14, lineHeight: 1.6 }}>
            Not cold applications. Not algorithms. Real people and relentless intelligence — working together.
          </p>
        </div>

        {/* cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto 52px', position: 'relative' }}>

          {/* center connector */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 36, height: 36, borderRadius: '50%', background: '#0d1117', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'rgba(244,240,232,0.3)', zIndex: 2, lineHeight: 1 }}>+</div>

          {/* left card */}
          <NetworkCard features={NETWORK_FEATURES} onClaim={onClaim} style={fadeUp(0.14)} />

          {/* right card */}
          <FastIQCard features={FASTIQ_FEATURES} onClaim={onFastIQ || onClaim} style={fadeUp(0.22)} />
        </div>

        {/* footer note */}
        <div style={{ textAlign: 'center', ...fadeUp(0.3) }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)', lineHeight: 1.6, margin: 0 }}>
            FASTIQ includes <span style={{ fontWeight: 400, color: 'rgba(244,240,232,0.55)' }}>full access to the Parent Network</span>. One upgrade. Everything unlocked.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── network card ─────────────────────────────────── */
function NetworkCard({ features, onClaim, style }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', gap: 0, ...style }}>
      {/* icon */}
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3.5" stroke="rgba(244,240,232,0.6)" strokeWidth="1.5" />
          <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="rgba(244,240,232,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17" cy="8" r="2.5" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" />
          <path d="M18 14c2.5.5 4 2.2 4 4.5" stroke="rgba(244,240,232,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(244,240,232,0.4)', marginBottom: 8 }}>Part One</span>
      <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#f4f0e8', lineHeight: 1.2, marginBottom: 6 }}>Parent Powered Community</span>
      <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 13, color: 'rgba(244,240,232,0.45)', lineHeight: 1.5, marginBottom: 24 }}>Real people who pledged to help — because they get it.</span>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: 22 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, flex: 1 }}>
        {features.map((f) => (
          <FeatureItem key={f} text={f} variant="network" />
        ))}
      </div>

      <CTAButton text="Explore the Network" dark onClick={onClaim} />
    </div>
  );
}

/* ── fastiq card ──────────────────────────────────── */
function FastIQCard({ features, onClaim, style }) {
  return (
    <div style={{ background: 'rgba(232,93,32,0.07)', border: '1px solid rgba(232,93,32,0.35)', borderRadius: 20, padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', ...style }}>
      {/* most popular badge */}
      <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most Popular</div>

      {/* icon */}
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(232,93,32,0.15)', border: '0.5px solid rgba(232,93,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(232,93,32,0.8)', marginBottom: 8 }}>Part Two</span>
      <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#f4f0e8', lineHeight: 1.2, marginBottom: 6 }}>FASTIQ™ AI Career Engine</span>
      <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 13, color: 'rgba(232,93,32,0.7)', lineHeight: 1.5, marginBottom: 24 }}>Working for your student 24 hours a day, 7 days a week.</span>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: 22 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, flex: 1 }}>
        {features.map((f) => (
          <FeatureItem key={f} text={f} variant="fastiq" />
        ))}
      </div>

      <CTAButton text="Unlock FASTIQ" dark={false} onClick={onClaim} />
    </div>
  );
}

/* ── feature item ─────────────────────────────────── */
function FeatureItem({ text, variant }) {
  const isFastiq = variant === 'fastiq';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: isFastiq ? 'rgba(232,93,32,0.2)' : 'rgba(255,255,255,0.08)', border: isFastiq ? '0.5px solid rgba(232,93,32,0.4)' : '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5.5L4 7.5L8 3" stroke={isFastiq ? '#E85D20' : 'rgba(244,240,232,0.7)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.7)', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

/* ── CTA button ───────────────────────────────────── */
function CTAButton({ text, dark, onClick }) {
  const baseBg = dark ? 'rgba(255,255,255,0.08)' : '#E85D20';
  const hoverBg = dark ? 'rgba(255,255,255,0.13)' : '#d44e14';
  const borderStyle = dark ? '0.5px solid rgba(255,255,255,0.15)' : 'none';
  const color = dark ? '#f4f0e8' : '#fff';

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.transform = 'translateY(-1px)';
        const arrow = e.currentTarget.querySelector('.tp-arrow');
        if (arrow) arrow.style.transform = 'translateX(3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseBg;
        e.currentTarget.style.transform = 'translateY(0)';
        const arrow = e.currentTarget.querySelector('.tp-arrow');
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 15,
        fontWeight: 500,
        color,
        background: baseBg,
        border: borderStyle,
        borderRadius: 100,
        padding: '14px 28px',
        width: '100%',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background 0.2s ease, transform 0.15s ease',
        minHeight: 'auto',
      }}
    >
      {text}
      <svg className="tp-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 0.15s ease' }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}