import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryCTA } from '@/components/landing/LandingCTAButton';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingFooterCTA({ stats, onClaim, onFAQ }) {
  return (
    <section className="py-44 sm:py-56 px-4" style={{ backgroundColor: '#0021A5' }}>
      <div className="max-w-md mx-auto text-center">
        <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="text-white text-[20px] sm:text-[22px] font-bold mb-3 leading-[1.6]">
            Only <span className="text-[#FA4616]">{stats.spots_left}</span> founding spots left at <span className="font-black">FREE forever</span> pricing.
          </p>
          <p className="text-white/60 text-[18px] mb-10 leading-[1.6]">After that it's $9/month.</p>

          <PrimaryCTA text="Claim Your Free Spot" onClick={onClaim} />

          <p className="text-[#E5E7EB]/50 text-xs mt-4">Founding members stay free forever.</p>

          <button
            onClick={onFAQ}
            className="mt-10 text-[#E5E7EB]/40 text-sm underline underline-offset-4 hover:text-white/60 transition-colors"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            Questions?
          </button>
        </motion.div>
      </div>
    </section>
  );
}