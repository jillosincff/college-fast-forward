import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from 'framer-motion';

export default function LandingHero({ stats, onClaim }) {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-24 px-4" style={{ backgroundColor: '#0021A5' }}>
      <div className="max-w-4xl mx-auto text-center w-full">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#FA4616] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mb-8"
        >
          Only UF Families Can Access
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-[32px] sm:text-5xl md:text-6xl lg:text-[68px] text-white font-black leading-[1.06] mb-10 px-2 tracking-tight"
        >
          Imagine having thousands of friends helping your kid land a job.{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            Now you do.
          </span>
        </motion.h1>

        {/* Subheadline — two clear paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="max-w-2xl mx-auto mb-16 px-2 space-y-4"
        >
          <p className="text-white text-[18px] sm:text-[20px] leading-[1.65] font-semibold">
            They say job searching is a numbers game. We don't play games when it comes to our kids.
          </p>
          <p className="text-[#E5E7EB] text-[18px] sm:text-[20px] leading-[1.65]">
            Research shows 70–85% of jobs are filled through networking (LinkedIn, BLS) — not cold applications. CFF is the private UF network where parents and alumni pledged to help each other's kids.
          </p>
          <p className="text-[#E5E7EB] text-[18px] sm:text-[20px] leading-[1.65]">
            FASTIQ is the AI engine that actually delivers: finds real UF grads already inside target companies, drafts highly-responsive messages to them, and gets your kid in the door — instantly.
          </p>
        </motion.div>

        {/* Urgency CTA card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.24 }}
          className="rounded-2xl p-6 sm:p-8 max-w-md mx-auto w-full"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 0 80px rgba(0,33,165,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <p className="text-[#FA4616] font-bold text-base sm:text-lg mb-1 flex items-center justify-center gap-2">
            <span>🔥</span> {stats.spots_left} FREE founding spots left
          </p>
          <p className="text-slate-400 text-sm mb-1">(of 1,000)</p>
          <p className="text-slate-600 text-sm mb-5 font-medium">
            Founding members stay <strong className="text-slate-800">FREE forever</strong> — no catch. After 1,000 new members pay $9/mo.
          </p>

          <Button
            onClick={onClaim}
            size="lg"
            className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-6 text-lg font-bold min-h-[56px] transition-all duration-300 hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
            style={{ boxShadow: '0 4px 24px rgba(0,33,165,0.4), 0 0 40px rgba(0,33,165,0.15)' }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36 }}
          className="mt-16 max-w-lg mx-auto rounded-2xl p-8 border"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-white italic text-[18px] sm:text-[20px] leading-[1.6]">
            "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own."
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="w-8 h-8 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-sm font-bold">D</span>
            <p className="text-[#E5E7EB] text-sm font-semibold">Dana G. <span className="text-white/40 font-normal">· UF Parent</span></p>
          </div>
        </motion.div>

        {/* FASTIQ badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-[#FA4616]" />
          <span className="text-[#E5E7EB]/50 text-xs font-medium tracking-wide">Powered by FASTIQ™ — the AI that actually makes it work</span>
        </motion.div>
      </div>
    </section>
  );
}