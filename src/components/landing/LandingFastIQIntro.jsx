import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LandingFastIQIntro({ onCTA }) {
  return (
    <div className="py-44 sm:py-56 px-4" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FA4616]/10 border border-[#FA4616]/20 mb-6"
            style={{ boxShadow: '0 0 20px rgba(250,70,22,0.08)' }}
          >
            <Zap className="w-3.5 h-3.5 text-[#FA4616]" />
            <span className="text-[11px] font-bold text-[#FA4616] uppercase tracking-wider">FASTIQ™</span>
          </div>
          <p className="text-white text-[20px] sm:text-[22px] leading-[1.6] font-bold max-w-2xl mx-auto">
            FASTIQ finds real UF grads at your kid's dream companies, writes the perfect intro message, and gets them in the door — bypassing thousands of cold applicants.
          </p>
        </motion.div>

        <motion.div
          variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mb-16"
        >
          <InteractiveTeaserDemo />
        </motion.div>

        <div className="text-center">
          <PrimaryCTA text="Claim Your Free Spot" onClick={onCTA} />
        </div>
      </div>
    </div>
  );
}