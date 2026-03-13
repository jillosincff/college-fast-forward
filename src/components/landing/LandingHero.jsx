import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from 'framer-motion';
import ScanningAnimation from '@/components/landing/ScanningAnimation';

const blurredAlumni = [
  { role: 'Marketing at Nike', year: "UF '22", icon: '👟' },
  { role: 'Software Engineer at Google', year: "UF '21", icon: '🔍' },
  { role: 'Analyst at Goldman Sachs', year: "UF '23", icon: '📊' },
];

export default function LandingHero({ stats, onClaim }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-20 px-4" style={{ backgroundColor: '#0021A5' }}>
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
          className="text-[30px] sm:text-5xl md:text-6xl lg:text-[68px] text-white font-black leading-[1.06] mb-8 px-2 tracking-tight"
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
          <p className="text-white text-[18px] sm:text-[22px] leading-[1.6] font-medium">
            CFF is the private UF network where parents and alumni pledged to help each other's kids.
          </p>
          <p className="text-[#E5E7EB] text-[18px] sm:text-[22px] leading-[1.6]">
            FASTIQ is the AI engine that actually delivers the results.
          </p>
        </motion.div>

        {/* CTA card */}
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
            Founding members stay <strong className="text-slate-800">FREE forever</strong> — no catch.
          </p>

          <Button
            onClick={onClaim}
            size="lg"
            className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-6 text-lg font-bold min-h-[56px]"
            style={{ boxShadow: '0 4px 24px rgba(0,33,165,0.4), 0 0 40px rgba(0,33,165,0.15)' }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-slate-400 text-xs mt-3">After 1,000 new members pay $9/mo</p>
        </motion.div>

        {/* Scanning + Blurred Alumni Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-16 max-w-xl mx-auto"
        >
          <ScanningAnimation />

          <p className="text-white text-[16px] sm:text-[18px] leading-[1.6] mb-7 font-medium">
            We already found <span className="text-[#FA4616] font-bold">real UF grads</span> inside the companies kids are targeting.
          </p>

          <div className="flex items-center justify-center gap-4 mb-7">
            {blurredAlumni.map((a, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ scale: 1.06, y: -4 }}
                className="flex-1 rounded-2xl px-4 py-6 border text-center cursor-default transition-all duration-300"
                style={{
                  borderColor: hoveredCard === i ? 'rgba(250,70,22,0.4)' : 'rgba(255,255,255,0.1)',
                  background: hoveredCard === i
                    ? 'rgba(250,70,22,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: hoveredCard === i
                    ? '0 0 40px rgba(250,70,22,0.25), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="text-2xl mb-2">{a.icon}</div>
                {/* Blurred name placeholder that reveals on hover */}
                <div
                  className="w-16 h-2 rounded-full mx-auto mb-3 transition-all duration-500"
                  style={{
                    background: hoveredCard === i
                      ? 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))'
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: hoveredCard === i ? '0 0 8px rgba(255,255,255,0.15)' : 'none',
                  }}
                />
                <p className="text-white text-[13px] sm:text-[14px] font-bold leading-tight">{a.role}</p>
                <p
                  className="text-[11px] mt-1.5 font-semibold transition-all duration-500"
                  style={{ color: hoveredCard === i ? 'rgba(250,70,22,0.8)' : 'rgba(255,255,255,0.35)' }}
                >
                  {a.year}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-[#FA4616] text-base sm:text-lg font-bold tracking-wide cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Take the 45-second quiz to see yours →
          </motion.p>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-lg mx-auto rounded-2xl p-8 border"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-white italic text-[18px] sm:text-[22px] leading-[1.6]">
            "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own."
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="w-8 h-8 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-sm font-bold">D</span>
            <p className="text-[#E5E7EB] text-sm font-semibold">Dana G. <span className="text-white/40 font-normal">· UF Parent</span></p>
          </div>
        </motion.div>

        {/* FASTIQ tease */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-[#FA4616]" />
          <span className="text-[#E5E7EB]/60 text-xs font-medium tracking-wide">Powered by FASTIQ™ — the AI that makes it actually work</span>
        </motion.div>
      </div>
    </section>
  );
}