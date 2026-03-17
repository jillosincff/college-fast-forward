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

        {/* Body text — high-readability, spaced paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontFamily: dmSans, fontWeight: 500, fontSize: 19, color: '#FFFFFF', lineHeight: 1.65, letterSpacing: '0.3px', maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '32px 0 44px' }}
        >
          <p style={{ marginBottom: 28 }}>
            People get jobs because of <strong style={{ fontWeight: 600, color: '#FA4616' }}>who they know</strong> — not what they know.
          </p>
          <p style={{ marginBottom: 28 }}>
            So we invited your biggest supporters into the process: <strong style={{ fontWeight: 600, color: '#FA4616' }}>your parents</strong>.
          </p>
          <p style={{ marginBottom: 28 }}>
            They've spent 20 years building a network. They know everybody.<br />
            Now that network works <strong style={{ fontWeight: 600, color: '#FA4616' }}>for you</strong>.
          </p>
          <p style={{ marginBottom: 0 }}>
            Every time a parent helps a student, your visibility goes up.<br />
            <strong style={{ fontWeight: 600, color: '#FA4616' }}>More eyes. More alumni. More doors.</strong>
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

export { default as CTAButton } from '@/components/landing/v3/CTAButton';