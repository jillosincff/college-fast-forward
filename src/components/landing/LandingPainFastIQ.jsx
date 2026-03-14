import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import OutreachEnginePanel from '@/components/precision/OutreachEnginePanel';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LandingPainFastIQ({ onFastIQ }) {
  return (
    <section className="relative">

      {/* PAIN block */}
      <div className="py-36 sm:py-44 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[32px] sm:text-5xl md:text-[56px] font-black text-slate-900 mb-10 tracking-tight leading-[1.08]"
          >
            Your Kid Is Invisible to Employers
          </motion.h2>

          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-2xl p-7 sm:p-10 border border-slate-200/80"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)' }}
          >
            <p className="text-slate-700 text-[18px] sm:text-[20px] leading-[1.7] font-medium">
              They apply to 200+ jobs. AI rejects 98%. No callbacks. Friends get "connection" interviews while they get silence.
            </p>
            <p className="text-slate-700 text-[18px] sm:text-[20px] leading-[1.7] mt-4">
              Referrals are the #1 source of hires (Jobvite). Students don't lack opportunity — they lack access to the networks where opportunities live.
            </p>
            <p className="text-slate-900 text-[18px] sm:text-[20px] leading-[1.7] font-bold mt-5">
              A perfect resume means nothing without a warm connection.{' '}
              <span className="text-[#FA4616]">FASTIQ changes that.</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ proof */}
      <div className="py-36 sm:py-44 px-4" style={{ backgroundColor: '#F8FAFC' }}>
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
            <p className="text-slate-900 text-[20px] sm:text-[22px] leading-[1.55] font-bold max-w-2xl mx-auto">
              FASTIQ finds real UF grads already inside your target companies, drafts highly-responsive messages to them, and gets your kid in the door — bypassing thousands of other cold applicants.
            </p>
          </motion.div>

          {/* Screenshot with orange glow */}
          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-xl mx-auto rounded-2xl overflow-hidden mb-16"
            style={{
              boxShadow: '0 0 60px rgba(250,70,22,0.15), 0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(250,70,22,0.2)',
            }}
          >
            <OutreachEnginePanel />
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