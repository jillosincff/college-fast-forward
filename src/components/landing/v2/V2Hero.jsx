import React from 'react';
import { motion } from 'framer-motion';
import ConstellationBackground from '@/components/landing/ConstellationBackground';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2Hero({ onCTA }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 65%, #0d1117 100%)', minHeight: '100vh' }}
    >
      <ConstellationBackground />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(232,93,32,0.07), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-32 sm:pt-44 pb-24">

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20' }}>
            Exclusively for UF Students &amp; Families
          </span>
        </motion.div>

        {/* H1 — massive gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(36px, 7vw, 80px)', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24, padding: '0 4px' }}
        >
          <span style={{ color: '#fff' }}>It's March. </span>
          <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #FA4616, #FF8A5C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No internship yet?</span>
        </motion.h1>

        {/* Subhead — xl, pure white */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ fontFamily: dmSans, fontWeight: 400, fontSize: 'clamp(18px, 2.4vw, 22px)', color: '#FFFFFF', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 36px' }}
        >
          Your roommate has an offer. Your parents are freaking. Chill. We got you.
        </motion.p>

        {/* Body text — exact copy, pure white, 18px, 1.6 lh */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 18, color: '#FFFFFF', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px', textAlign: 'center' }}
        >
          <p style={{ marginBottom: 18 }}>
            People get jobs because of <em style={{ fontStyle: 'italic' }}>who they know</em> — not what they know.
          </p>
          <p style={{ marginBottom: 18 }}>
            So we invited your biggest supporters into the process: <strong style={{ fontWeight: 500 }}>your parents</strong>.{' '}
            They've spent 20 years building a network. They know everybody.{' '}
            Now that network works for you.
          </p>
          <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.5, marginTop: 28 }}>
            <span style={{ color: '#fff' }}>Your parents are the fuel.</span><br />
            <span style={{ color: '#FA4616' }}>FASTIQ is the engine.</span><br />
            <span style={{ color: '#fff' }}>You're the one who lands the job.</span>
          </p>
        </motion.div>

        {/* ── Live teaser section — the wow moment ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-14"
        >
          <InteractiveTeaserDemo />
        </motion.div>

        {/* Dual CTAs — orange primary, teal secondary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.38 }}
          className="flex flex-col items-center gap-4 mb-6"
        >
          <CTAButton text="I know where I want to work… but I don't know a single person there →" onClick={onCTA} />
          <CTAButton text="I literally have no clue where to even start →" onClick={onCTA} variant="teal" />
        </motion.div>

        {/* Micro-text */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
          style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}
        >
          Takes 45 seconds · No sign-up · See real UF people at Amazon, Google, Nike — free
        </motion.p>
      </div>
    </section>
  );
}

export function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isTeal = variant === 'teal';
  const isOutline = variant === 'outline';
  const isPrimary = !isTeal && !isOutline;

  const accentColor = isTeal ? '#06B6D4' : '#E85D20';
  const accentDark = isTeal ? '#0891B2' : '#d44e14';
  const accentLight = isTeal ? '#22D3EE' : '#FF6B2B';
  const glowColor = isTeal ? 'rgba(6,182,212,0.3)' : 'rgba(232,93,32,0.3)';

  const bg = isOutline ? 'transparent' : `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`;
  const bgHover = isOutline ? `rgba(232,93,32,0.1)` : `linear-gradient(135deg, ${accentLight} 0%, ${accentColor} 100%)`;
  const border = isOutline ? `2px solid ${accentColor}` : 'none';

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bgHover;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 6px 32px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bg;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = isPrimary || isTeal ? `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none';
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 15, fontWeight: 600, color: '#fff',
        background: bg, border, borderRadius: 100,
        padding: '16px 34px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: isPrimary || isTeal ? `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
        lineHeight: 1.35, textAlign: 'center',
        backdropFilter: isOutline ? 'blur(12px)' : 'none',
      }}
    >
      {text}
    </button>
  );
}