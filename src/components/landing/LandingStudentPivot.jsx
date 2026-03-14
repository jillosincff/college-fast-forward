import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingStudentPivot({ onFunnel }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F172A 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,70,22,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 max-w-2xl mx-auto px-4 py-48 sm:py-60 text-center"
      >
        {/* Badge */}
        <motion.div variants={fade} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-8"
          style={{ boxShadow: '0 0 20px rgba(6,182,212,0.08)' }}
        >
          <span className="text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider">For Students</span>
        </motion.div>

        {/* Headline */}
        <motion.h2 variants={fade}
          className="text-[32px] sm:text-5xl md:text-[52px] font-black text-white tracking-tight mb-8 leading-[1.08]"
        >
          It's mid-March and you still{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            have zero plans for summer.
          </span>
        </motion.h2>

        {/* Reframe quote */}
        <motion.div variants={fade} className="max-w-xl mx-auto mb-14">
          <p
            className="text-[17px] sm:text-[19px] leading-[1.7] italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'rgba(244,240,232,0.65)' }}
          >
            "You're not behind because you're not trying hard enough. You're behind because nobody taught you how this actually works."
          </p>
        </motion.div>

        {/* Single CTA */}
        <motion.div variants={fade}>
          <PrimaryCTA text="Find out where you actually stand" onClick={() => onFunnel('quiz')} />
        </motion.div>

        {/* Stats row */}
        <motion.p variants={fade} className="text-[#E5E7EB]/40 text-sm mt-7">
          Takes 2 minutes · 9 questions · No BS — just the truth about where you stand
        </motion.p>

        {/* Fine print */}
        <motion.p variants={fade} className="text-[#E5E7EB]/25 text-xs mt-3">
          Free to take
        </motion.p>
      </motion.div>
    </section>
  );
}