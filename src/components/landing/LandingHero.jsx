import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from 'framer-motion';

export default function LandingHero({ stats, onClaim }) {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-16 px-4" style={{ backgroundColor: '#0021A5' }}>
      <div className="max-w-4xl mx-auto text-center w-full">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#FA4616] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mb-8"
        >
          Only UF Families Can Access
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-[28px] sm:text-5xl md:text-6xl lg:text-[64px] text-white font-extrabold leading-[1.08] mb-8 px-2 tracking-tight"
        >
          Imagine having thousands of friends helping your kid land a job.{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            Now you do.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="max-w-xl mx-auto mb-14 px-2 space-y-2"
        >
          <p className="text-[#E5E7EB] text-base sm:text-xl leading-relaxed">
            CFF is the private UF network of parents and alumni who pledged to help each other's kids.
          </p>
          <p className="text-white/50 text-base sm:text-xl leading-relaxed">
            FASTIQ is the AI engine that actually makes it happen.
          </p>
        </motion.div>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-md mx-auto w-full"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 0 60px rgba(0,33,165,0.15)' }}
        >
          <p className="text-[#FA4616] font-bold text-base sm:text-lg mb-1 flex items-center justify-center gap-2">
            <span>🔥</span> {stats.spots_left} FREE founding spots left
          </p>
          <p className="text-slate-400 text-sm mb-1">(of 1,000)</p>
          <p className="text-slate-600 text-sm mb-5 font-medium">
            Founding members stay <strong className="text-slate-800">FREE forever</strong> — no catch.
          </p>

          <Button
            onClick={onClaim}
            size="lg"
            className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-6 text-lg font-bold min-h-[56px]"
            style={{ boxShadow: '0 4px 20px rgba(0,33,165,0.3)' }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-slate-400 text-xs mt-3">After 1,000 new members pay $9/mo</p>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-14 max-w-lg mx-auto"
        >
          <p className="text-[#E5E7EB] italic text-lg sm:text-xl leading-relaxed">
            "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own."
          </p>
          <p className="text-white/50 text-sm mt-3">— Dana G., UF Parent</p>
        </motion.div>

        {/* FASTIQ tease */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-[#FA4616]" />
          <span className="text-white/40 text-xs font-medium tracking-wide">Powered by FASTIQ™ — the AI that makes it actually work</span>
        </motion.div>
      </div>
    </section>
  );
}