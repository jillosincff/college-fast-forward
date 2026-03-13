import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import TargetIntelligencePanel from '@/components/precision/TargetIntelligencePanel';
import OutreachEnginePanel from '@/components/precision/OutreachEnginePanel';
import EntryStrategyPanel from '@/components/precision/EntryStrategyPanel';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const painItems = [
  { emoji: '📄', text: 'They apply to 200+ jobs' },
  { emoji: '🤖', text: 'AI rejects 98% before a human sees it' },
  { emoji: '😔', text: 'They never hear back while friends get "connection" interviews' },
];

export default function LandingPainFastIQ({ onFastIQ }) {
  return (
    <section className="relative">

      {/* PAIN — light background */}
      <div className="py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight"
          >
            Your Kid Is Invisible to Employers
          </motion.h2>
          <motion.p variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-slate-500 text-base sm:text-lg mb-12"
          >
            (And it's not their fault — the system is broken.)
          </motion.p>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col items-center gap-2.5 mb-12"
          >
            {painItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <motion.span variants={fade} className="text-slate-300 text-lg">↓</motion.span>}
                <motion.div variants={fade} className="flex items-center gap-3 bg-slate-50 rounded-xl px-6 py-4 border border-slate-100 w-full max-w-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-slate-800 font-semibold text-[15px] sm:text-base">{item.text}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>

      {/* FASTIQ RELIEF */}
      <div className="py-20 sm:py-28 px-4" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
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

          {/* Screenshot panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl" style={{ boxShadow: '0 0 20px rgba(250,70,22,0.08), 0 2px 8px rgba(0,0,0,0.06)' }}>
              <TargetIntelligencePanel />
            </div>
            <div className="rounded-2xl" style={{ boxShadow: '0 0 20px rgba(250,70,22,0.08), 0 2px 8px rgba(0,0,0,0.06)' }}>
              <OutreachEnginePanel />
            </div>
            <div className="rounded-2xl" style={{ boxShadow: '0 0 20px rgba(250,70,22,0.08), 0 2px 8px rgba(0,0,0,0.06)' }}>
              <EntryStrategyPanel />
            </div>
          </div>

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