import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

export default function LandingHero({ stats, onClaim }) {
  const spotsText = stats.spots_left > 0
    ? `ONLY ${stats.spots_left} FREE FOUNDING SPOTS LEFT`
    : 'LIMITED FREE FOUNDING SPOTS REMAINING';

  return (
    <section className="min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-24 px-4" style={{ backgroundColor: '#0021A5' }}>
      <div className="max-w-3xl mx-auto text-center w-full">

        {/* Urgency top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={onClaim}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] sm:text-[13px] font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              color: '#FA4616',
              background: 'rgba(250,70,22,0.1)',
              border: '1px solid rgba(250,70,22,0.25)',
              minHeight: 'auto',
            }}
          >
            {spotsText}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-[36px] sm:text-5xl md:text-6xl lg:text-[72px] text-white font-black leading-[1.04] mb-6 px-2 tracking-tight"
        >
          Imagine having thousands of friends{' '}
          <br className="hidden sm:block" />
          helping your kid land a job.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-[40px] sm:text-5xl md:text-6xl lg:text-[72px] font-black leading-[1.04] mb-14 tracking-tight"
        >
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            Now you do.
          </span>
        </motion.p>

        {/* One stat callout */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-[#FA4616] text-[22px] sm:text-[28px] font-black mb-6 tracking-tight"
        >
          80% of jobs are filled through networking — not applications.
        </motion.p>

        {/* One sentence explanation */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="text-white text-[18px] sm:text-[20px] leading-[1.6] max-w-xl mx-auto mb-14 px-2"
        >
          CFF is a private network where parents and alumni pledge to help each other's students — with real introductions, real advice, and real connections. Your network. Their network. Every student wins.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-sm mx-auto"
        >
          <Button
            onClick={onClaim}
            size="lg"
            className="w-full py-6 text-lg font-bold min-h-[56px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
              boxShadow: '0 4px 30px rgba(250,70,22,0.4), 0 0 60px rgba(250,70,22,0.15)',
            }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-white/60 text-sm mt-4 flex items-center justify-center gap-1.5">
            <span>🔥</span> Free founding spots are limited. After that, $9/month.
          </p>
        </motion.div>

        {/* Single testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-md mx-auto"
        >
          <p className="text-white/70 italic text-[16px] leading-[1.6]">
            "My daughter landed an internship through a connection she never would have found on a job board."
          </p>
          <p className="text-white/40 text-sm mt-3">— UF Parent</p>
        </motion.div>
      </div>
    </section>
  );
}