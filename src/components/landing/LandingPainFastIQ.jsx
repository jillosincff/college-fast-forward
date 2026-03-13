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
      <div className="py-24 sm:py-32 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight"
          >
            Your Kid Is Invisible to Employers
          </motion.h2>

          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8 border border-slate-100"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <p className="text-slate-700 text-lg sm:text-xl leading-[1.8] font-medium">
              Your kid applies to 200+ jobs. AI kills 98%. No callbacks. Friends get "connection" interviews while they get silence.
            </p>
            <p className="text-slate-900 text-lg sm:text-xl leading-[1.8] font-bold mt-4">
              A perfect resume means nothing without a warm connection.{' '}
              <span className="text-[#FA4616]">That's what CFF + FASTIQ fixes.</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ — single screenshot */}
      <div className="py-24 sm:py-32 px-4" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FA4616]/10 border border-[#FA4616]/20 mb-5">
              <Zap className="w-3 h-3 text-[#FA4616]" />
              <span className="text-[10px] font-bold text-[#FA4616] uppercase tracking-wider">FASTIQ™</span>
            </div>
            <h3
              className="text-[22px] sm:text-[26px] md:text-[32px] font-extrabold text-slate-900 mb-5 max-w-2xl mx-auto leading-snug tracking-tight"
              style={{ textShadow: '0 0 40px rgba(250,70,22,0.08)' }}
            >
              FASTIQ finds real UF grads already inside the companies your kid wants, messages them for you, and gets their foot in the door — bypassing thousands of other cold applicants.
            </h3>
            <p className="text-slate-600 text-sm sm:text-[15px] max-w-md mx-auto leading-relaxed font-semibold tracking-wide uppercase">
              No B.S. applications. No ghosting. Just real people helping real kids.
            </p>
          </motion.div>

          {/* Single screenshot with orange glow */}
          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-xl mx-auto rounded-2xl overflow-hidden mb-14"
            style={{ boxShadow: '0 0 40px rgba(250,70,22,0.12), 0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(250,70,22,0.15)' }}
          >
            <OutreachEnginePanel />
          </motion.div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onFastIQ}
              className="px-10 py-5 rounded-xl text-base font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.3)',
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