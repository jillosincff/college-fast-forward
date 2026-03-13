import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingFooterCTA({ stats, onClaim, onFAQ }) {
  return (
    <>
      {/* Main CTA block */}
      <section className="py-32 sm:py-40 px-4" style={{ backgroundColor: '#0021A5' }}>
        <div className="max-w-md mx-auto text-center">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-white text-[20px] sm:text-[22px] font-bold mb-3 leading-[1.5]">
              Only <span className="text-[#FA4616]">{stats.spots_left}</span> founding spots left at <span className="font-black">FREE forever</span> pricing.
            </p>
            <p className="text-[#E5E7EB]/60 text-[15px] mb-10">After that it's $9/month.</p>

            <Button
              onClick={onClaim}
              size="lg"
              className="bg-white text-[#0021A5] hover:bg-slate-100 w-full py-6 text-lg font-bold min-h-[56px]"
              style={{ boxShadow: '0 4px 30px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.08)' }}
            >
              Claim Your Free Spot
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

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
    </>
  );
}