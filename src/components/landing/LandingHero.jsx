import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';
import ConstellationBackground from '@/components/landing/ConstellationBackground';

const FONT_LINK_ID = 'hero-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "var(--font-display, 'Playfair Display', serif)";
const dmSans = "var(--font-body, 'DM Sans', sans-serif)";

export default function LandingHero({ onClaim }) {
  useEffect(() => { ensureFonts(); }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-32 px-4" style={{ background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 25%, #0821A5 60%, #0821A5 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* constellation dots */}
      <ConstellationBackground />
      {/* radial warm glow overlay */}
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(232,93,32,0.08) 0%, rgba(8,33,165,0.0) 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="max-w-3xl mx-auto text-center w-full" style={{ position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              fontFamily: dmSans,
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.1)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              padding: '6px 16px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', flexShrink: 0 }} />
            Exclusively for UF Families
          </span>
        </motion.div>

        {/* Headline — Playfair Display */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          style={{
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            color: '#f4f0e8',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 16,
            padding: '0 8px',
          }}
        >
          Imagine having thousands of friends{' '}
          <br className="hidden sm:block" />
          helping your kid land a job.
        </motion.h1>

        {/* Accent line — Playfair italic */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            fontFamily: playfair,
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            color: '#E85D20',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 48,
          }}
        >
          Now you do.
        </motion.p>

        {/* Stat callout — Playfair 700 smaller */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          style={{
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: '#E85D20',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: 20,
          }}
        >
          80% of jobs are filled through networking — not applications.
        </motion.p>

        {/* Body copy — DM Sans */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          style={{
            fontFamily: dmSans,
            fontWeight: 300,
            fontSize: 19,
            color: '#FFFFFF',
            lineHeight: 1.6,
            maxWidth: 560,
            margin: '0 auto 48px',
            padding: '0 8px',
          }}
        >
          College Fast Forward is a private network where parents and alumni pledge to help each other's students — with real introductions, real advice, and real connections. Your network. Their network. Every student wins.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <PrimaryCTA text="Claim Your Free Spot" onClick={onClaim} />

          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.45)', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Join nearly 1,000 UF families already on the platform.
          </p>
        </motion.div>

        {/* Single testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-md mx-auto"
        >
          <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            "My daughter landed an internship through a connection she never would have found on a job board."
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>— UF Parent</p>
        </motion.div>
      </div>
    </section>
  );
}