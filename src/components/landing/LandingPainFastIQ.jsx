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

      {/* PAIN — bold paragraph on white */}
      <div className="py-32 sm:py-40 px-4 bg-white">
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
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)', backdropFilter: 'blur(8px)' }}
          >
            <p className="text-slate-700 text-[18px] sm:text-[20px] leading-[1.7] font-medium">
              Your kid applies to 200+ jobs. AI kills 98%. No callbacks. Friends get "connection" interviews while they get silence.
            </p>
            <p className="text-slate-900 text-[18px] sm:text-[20px] leading-[1.7] font-bold mt-5">
              A perfect resume means nothing without a warm connection.{' '}
              <span className="text-[#FA4616]">That's what CFF + FASTIQ fixes.</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ — single screenshot */}
      <div className="py-32 sm:py-40 px-4" style={{ backgroundColor: '#F8FAFC' }}>
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
            <h3
              className="text-[24px] sm:text-[28px] md:text-[36px] font-black text-slate-900 mb-6 max-w-2xl mx-auto leading-[1.15] tracking-tight"
            >
              FASTIQ finds real UF grads already inside the companies your kid wants, messages them for you, and gets their foot in the door — bypassing thousands of other cold applicants.
            </h3>
            <p className="text-slate-600 text-[15px] sm:text-base max-w-md mx-auto leading-[1.6] font-semibold tracking-wide uppercase">
              No B.S. applications. No ghosting. Just real people helping real kids.
            </p>
          </motion.div>

          {/* Single screenshot with orange glow */}
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