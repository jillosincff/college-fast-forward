import React from 'react';
import { motion } from 'framer-motion';
import ConstellationBackground from '@/components/landing/ConstellationBackground';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function V2Hero({ spotsLeft, onCTA }) {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 25%, #0821A5 60%, #0821A5 100%)' }}
    >
      <ConstellationBackground />
      <div aria-hidden className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(232,93,32,0.08), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-32 pb-20">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-full" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)', padding: '6px 16px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA4616] flex-shrink-0" />
            Exclusively for UF Families
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(36px, 5.5vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12, padding: '0 8px' }}
        >
          <span style={{ color: '#f4f0e8' }}>Imagine having thousands of friends</span>
          <br className="hidden sm:block" />
          <span style={{ color: '#f4f0e8' }}> helping your kid land a job.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(36px, 5.5vw, 64px)', color: '#FA4616', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 40 }}
        >
          Now you do.
        </motion.p>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 18, color: '#E5E7EB', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 36px', padding: '0 8px', textAlign: 'left' }}
        >
          <p style={{ marginBottom: 14 }}>They say job searching is a numbers game. We don't play games when it comes to our kids.</p>
          <p style={{ marginBottom: 14 }}>Research shows <strong style={{ fontWeight: 600, color: '#FFFFFF' }}>70–85% of jobs are filled through networking</strong> (LinkedIn, BLS) — not cold applications.</p>
          <p style={{ marginBottom: 14 }}>CFF is the private UF network where parents and alumni pledge to help each other's kids.</p>
          <p><strong style={{ fontWeight: 600, color: '#FFFFFF' }}>FASTIQ</strong> is the AI engine that actually delivers: finds real UF grads already inside target companies, drafts highly-responsive messages to them, and gets your kid in the door — instantly.</p>
        </motion.div>

        {/* Urgency box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 }}
          className="max-w-lg mx-auto mb-10"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(250,70,22,0.3)', borderRadius: 16, padding: '18px 24px', boxShadow: '0 0 30px rgba(250,70,22,0.08), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🔥</span>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.5, margin: 0 }}>
              <strong style={{ color: '#FA4616' }}>{spotsLeft} FREE 7-day FASTIQ trials left</strong> (of 1,000) — founding rate stays <strong>$29/mo forever</strong>. After 1,000 new members pay normal pricing.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.34 }} className="flex flex-col items-center gap-4">
          <CTAButton text="Start 7-Day Free Trial — $29/mo after" onClick={onCTA} />
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No credit card required. Cancel anytime.</p>
        </motion.div>

        {/* Testimonial */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }} className="mt-14 max-w-md mx-auto">
          <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own."
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>— Dana G., UF Parent</p>
        </motion.div>

        {/* FASTIQ badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
            Powered by FASTIQ™ — the AI that actually makes it work
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export function CTAButton({ text, onClick, variant = 'primary', fullWidth = false }) {
  const isPrimary = variant === 'primary';
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
        fontSize: 16, fontWeight: 600, color: '#fff',
        background: bg, border: 'none', borderRadius: 100,
        padding: '16px 40px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.25s ease', minHeight: 'auto', minWidth: 'auto',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: `0 4px 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      {text}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}