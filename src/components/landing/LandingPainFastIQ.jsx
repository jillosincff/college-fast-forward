import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LandingPainFastIQ({ onFastIQ }) {
  return (
    <section className="relative">

      {/* PAIN block */}
      <div className="py-44 sm:py-56 px-4" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #0A1628 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[32px] sm:text-5xl md:text-[56px] font-black text-white mb-10 tracking-tight leading-[1.08]"
          >
            Your Kid Is Invisible to Employers
          </motion.h2>

          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-2xl p-7 sm:p-10 border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7] font-medium">
              They apply to 200+ jobs. AI rejects 98%. No callbacks. Friends get "connection" interviews while they get silence.
            </p>
            <p className="text-white/80 text-[18px] sm:text-[20px] leading-[1.7] mt-4">
              Referrals are the #1 source of hires (Jobvite). Students don't lack opportunity — they lack access to the networks where opportunities live.
            </p>
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7] font-bold mt-5">
              A perfect resume means nothing without a warm connection.{' '}
              <span className="text-[#FA4616]">FASTIQ changes that.</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ proof — scanning + interactive teaser */}
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
              FASTIQ finds real UF grads already inside your target companies, drafts highly-responsive messages to them, and gets your kid in the door — bypassing thousands of other cold applicants.
            </p>
          </motion.div>

          {/* Interactive demo */}
          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mb-16"
          >
            <InteractiveTeaserDemo />
          </motion.div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onFastIQ}
              className="px-10 py-5 rounded-xl text-[17px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
              }}
            >
              Activate FASTIQ for My Student – 7-Day Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}