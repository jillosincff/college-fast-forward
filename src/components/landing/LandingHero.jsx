import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from 'framer-motion';
import ScanningAnimation from '@/components/landing/ScanningAnimation';
import TypewriterMessage from '@/components/landing/TypewriterMessage';

const blurredAlumni = [
  { role: 'Marketing at Nike', year: "UF '22", icon: '👟', color: '#FA4616' },
  { role: 'Software Engineer at Google', year: "UF '21", icon: '🔍', color: '#4285F4' },
  { role: 'Analyst at Goldman Sachs', year: "UF '23", icon: '📊', color: '#D4A843' },
];

export default function LandingHero({ stats, onClaim }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [teaserInView, setTeaserInView] = useState(false);
  const teaserRef = React.useRef(null);

  React.useEffect(() => {
    if (!teaserRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTeaserInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    obs.observe(teaserRef.current);
    return () => obs.disconnect();
  }, []);

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
          <p className="text-white text-[18px] sm:text-[20px] leading-[1.6] font-medium">
            CFF is the private UF network where parents and alumni pledged to help each other's kids.
          </p>
          <p className="text-white text-[18px] sm:text-[20px] leading-[1.6]">
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
            className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-6 text-lg font-bold min-h-[56px] transition-all duration-300 hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
            style={{ boxShadow: '0 4px 24px rgba(0,33,165,0.4), 0 0 40px rgba(0,33,165,0.15)' }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-slate-400 text-xs mt-3">After 1,000 new members pay $9/mo</p>
        </motion.div>

        {/* Scanning + Blurred Alumni Teaser */}
        <motion.div
          ref={teaserRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <ScanningAnimation />

          <p className="text-white text-[20px] sm:text-[24px] leading-[1.5] mb-8 font-bold">
            We found <span className="text-[#FA4616]">real UF alumni</span> already working inside the companies you're targeting.
          </p>

          <div className="flex items-center justify-center gap-5 mb-4">
            {blurredAlumni.map((a, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ scale: 1.08, y: -6 }}
                className="flex-1 rounded-2xl px-5 py-7 text-center cursor-default transition-all duration-300"
                style={{
                  border: `1px solid ${hoveredCard === i ? 'rgba(250,70,22,0.5)' : 'rgba(250,70,22,0.35)'}`,
                  background: hoveredCard === i
                    ? 'rgba(250,70,22,0.15)'
                    : 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: hoveredCard === i
                    ? '0 0 22px 10px rgba(250,70,22,0.8), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="text-[60px] leading-none mb-3 transition-all duration-500"
                  style={{
                    filter: hoveredCard === i
                      ? `drop-shadow(0 0 12px ${a.color}80)`
                      : `drop-shadow(0 0 6px ${a.color}40)`,
                  }}
                >
                  {a.icon}
                </div>
                <div
                  className="w-20 h-2.5 rounded-full mx-auto mb-3 transition-all duration-500"
                  style={{
                    background: hoveredCard === i
                      ? 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.25))'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: hoveredCard === i ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
                  }}
                />
                <p className="text-white text-[17px] sm:text-[21px] font-bold leading-tight">{a.role}</p>
                <p
                  className="text-sm mt-2 font-semibold transition-all duration-500"
                  style={{ color: hoveredCard === i ? '#FA4616' : '#CBD5E1' }}
                >
                  {a.year}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Typewriter payoff */}
          <TypewriterMessage inView={teaserInView} />

          <motion.p
            className="text-[#FA4616] text-[19px] sm:text-[23px] font-bold tracking-wide cursor-pointer hover:underline underline-offset-4 mt-10"
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            Take the 45-second quiz to see your own personalized message →
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