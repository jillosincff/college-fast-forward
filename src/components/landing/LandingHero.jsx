import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from 'framer-motion';

export default function LandingHero({ stats, onClaim }) {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-16 pb-12 px-4" style={{ backgroundColor: '#0021A5' }}>
      <div className="max-w-4xl mx-auto text-center w-full">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#FA4616] font-semibold text-xs sm:text-sm tracking-widest uppercase mb-6"
        >
          Only UF Families Can Access
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-[26px] sm:text-4xl md:text-5xl lg:text-[56px] text-white font-extrabold leading-[1.1] mb-6 px-2"
        >
          Imagine thousands of UF parents and alumni pledged to help your kid land a job.{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            Now they are.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 px-2"
        >
          College Fast Forward is the private network where parents open doors for each other's kids — real introductions, advice, and connections that move the needle.
        </motion.p>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl p-5 sm:p-8 shadow-2xl max-w-md mx-auto w-full"
        >
          <p className="text-[#FA4616] font-bold text-base sm:text-lg mb-1 flex items-center justify-center gap-2">
            <span>🔥</span> {stats.spots_left} FREE founding spots left
          </p>
          <p className="text-slate-400 text-sm mb-1">(of 1,000)</p>
          <p className="text-slate-600 text-sm mb-5 font-medium">
            Founding members stay <strong className="text-slate-800">FREE forever</strong> — seriously, no catch.
          </p>

          <Button
            onClick={onClaim}
            size="lg"
            className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-6 text-lg font-bold shadow-lg min-h-[56px]"
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
          className="mt-10 max-w-lg mx-auto"
        >
          <p className="text-white/80 italic text-base sm:text-lg leading-relaxed">
            "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own."
          </p>
          <p className="text-white/50 text-sm mt-2">— Dana G., UF Parent</p>
        </motion.div>

        {/* FASTIQ tease */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42 }}
          className="mt-8 flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-[#FA4616]" />
          <span className="text-white/30 text-xs font-medium tracking-wide">Powered by FASTIQ™ — the AI that makes it actually work</span>
        </motion.div>
      </div>
    </section>
  );
}