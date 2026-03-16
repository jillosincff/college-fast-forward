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
      style={{ background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 65%, #0d1117 100%)' }}
    >
      <ConstellationBackground />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(232,93,32,0.07), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-36 pb-16">

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20' }}>
            Exclusively for UF Students &amp; Families
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(32px, 6vw, 72px)', letterSpacing: '-0.025em', lineHeight: 1.06, marginBottom: 20, padding: '0 4px' }}
        >
          <span style={{ color: '#fff' }}>It's March. </span>
          <span style={{ fontStyle: 'italic', color: '#E85D20' }}>No internship yet?</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ fontFamily: dmSans, fontWeight: 400, fontSize: 'clamp(17px, 2.2vw, 21px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, maxWidth: 580, margin: '0 auto 32px' }}
        >
          Your roommate has an offer. Your parents are freaking. Chill. We got you.
        </motion.p>

        {/* Body paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 18, color: '#FFFFFF', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textAlign: 'center' }}
        >
          <p style={{ marginBottom: 18 }}>
            We're College Fast Forward. People get jobs because of <em>who they know</em> — not what they know.
          </p>
          <p style={{ marginBottom: 18 }}>
            So we invited your biggest supporters into the process: <strong style={{ fontWeight: 500 }}>your parents</strong>. They've spent 20 years building a network. They know everybody. And now that network works for you.
          </p>
          <p>
            Every time a parent helps a student in the network, your visibility goes up. More eyes on your profile. More alumni seeing your requests. More doors opening.
          </p>
        </motion.div>

        {/* Tagline — three visual beats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 30px)', color: '#fff', lineHeight: 1.5, maxWidth: 600, margin: '0 auto 44px', textAlign: 'center' }}
        >
          <span>Your parents are the fuel.</span><br />
          <span style={{ color: '#E85D20' }}>FASTIQ is the engine.</span><br />
          <span>You're the one who lands the job.</span>
        </motion.div>

        {/* ── Live teaser section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <InteractiveTeaserDemo />
        </motion.div>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.38 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
        >
          <CTAButton text="I know where I want to work →" onClick={onCTA} />
          <CTAButton text="I literally have no clue where to start →" onClick={onCTA} variant="outline" />
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
          style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.35)' }}
        >
          7-day free trial · $29/mo after · No card required · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}

export function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isOutline = variant === 'outline';
  const bg = isOutline ? 'transparent' : 'linear-gradient(135deg, #E85D20 0%, #d44e14 100%)';
  const bgHover = isOutline ? 'rgba(232,93,32,0.1)' : 'linear-gradient(135deg, #FF6B2B 0%, #E85D20 100%)';
  const border = isOutline ? '2px solid #E85D20' : 'none';
  const glowColor = 'rgba(232,93,32,0.3)';

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
        e.currentTarget.style.boxShadow = isOutline ? 'none' : `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`;
      }}
      style={{
        fontFamily: dmSans,
        fontSize: 15, fontWeight: 600, color: '#fff',
        background: bg, border, borderRadius: 100,
        padding: '15px 32px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: isOutline ? 'none' : `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        lineHeight: 1.35, textAlign: 'center',
      }}
    >
      {text}
    </button>
  );
}