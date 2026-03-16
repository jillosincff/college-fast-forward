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
      style={{ background: 'linear-gradient(to bottom, #0F172A 0%, #0a1a6e 30%, #0821A5 65%, #0d1117 100%)' }}
    >
      <ConstellationBackground />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(250,70,22,0.07), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-36 pb-16">

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 16px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA4616] flex-shrink-0" />
            Exclusively for UF Students &amp; Families
          </span>
        </motion.div>

        {/* Headline — student panic */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(34px, 5.5vw, 62px)', letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 28, padding: '0 4px' }}
        >
          <span style={{ color: '#f4f0e8' }}>It's mid-March and you still have </span>
          <span style={{ fontStyle: 'italic', color: '#FA4616' }}>zero plans for summer.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 19, color: '#FFFFFF', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 44px', padding: '0 8px' }}
        >
          Your friends are posting offers. Your parents keep asking questions.
          You have no real experience, no connections, and you're terrified you're the one who ends up back home.
          <br /><br />
          <strong style={{ fontWeight: 500, color: '#FFFFFF' }}>We find real UF alumni already inside the companies you want… and write the exact message you can send today.</strong>
        </motion.p>

        {/* ── Live teaser section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="mb-12"
        >
          <InteractiveTeaserDemo />
        </motion.div>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.34 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
        >
          <CTAButton text="I know where I want to work… but I don't know anyone there" onClick={onCTA} />
          <CTAButton text="I literally have no clue where to start" onClick={onCTA} variant="teal" />
        </motion.div>

        {/* Micro text */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.35)' }}
        >
          Takes 45 seconds · No sign-up · See real UF people at Amazon, Google, Nike — free
        </motion.p>
      </div>
    </section>
  );
}

export function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isTeal = variant === 'teal';
  const bg = isTeal ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' : 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)';
  const bgHover = isTeal ? 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)' : 'linear-gradient(135deg, #FF5722 0%, #E03A0F 100%)';
  const glowColor = isTeal ? 'rgba(6,182,212,0.35)' : 'rgba(250,70,22,0.35)';
  const glowHover = isTeal ? 'rgba(6,182,212,0.5)' : 'rgba(250,70,22,0.5)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bgHover;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 6px 32px ${glowHover}, inset 0 1px 0 rgba(255,255,255,0.2)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bg;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`;
      }}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 15, fontWeight: 600, color: '#fff',
        background: bg, border: 'none', borderRadius: 100,
        padding: '15px 32px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        lineHeight: 1.35, textAlign: 'center',
      }}
    >
      {text}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}