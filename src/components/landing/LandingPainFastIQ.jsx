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
  { emoji: '😔', text: 'They never hear back' },
  { emoji: '📉', text: 'Friends get "connection" interviews' },
  { emoji: '❓', text: 'They wonder what they\'re doing wrong' },
];

export default function LandingPainFastIQ({ onFastIQ }) {
  return (
    <section className="relative">

      {/* PAIN — light background */}
      <div className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2"
          >
            Your Student Is Invisible to Employers
          </motion.h2>
          <motion.p variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-slate-500 text-base mb-10"
          >
            (And it's not their fault. The system is broken.)
          </motion.p>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="flex flex-col items-center gap-2 mb-10"
          >
            {painItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <motion.span variants={fade} className="text-slate-300 text-lg">↓</motion.span>}
                <motion.div variants={fade} className="flex items-center gap-3 bg-slate-50 rounded-xl px-5 py-3 border border-slate-100 w-full max-w-sm">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-slate-700 font-medium text-sm sm:text-base">{item.text}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>

          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto"
          >
            <p className="text-gray-100 text-base leading-relaxed">
              <strong className="text-white">Here's the truth:</strong> A perfect resume means nothing without a warm connection.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ RELIEF — dark */}
      <div className="py-16 sm:py-20 px-4" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FA4616]/10 border border-[#FA4616]/20 mb-4">
              <Zap className="w-3 h-3 text-[#FA4616]" />
              <span className="text-[10px] font-bold text-[#FA4616] uppercase tracking-wider">FASTIQ™</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 max-w-2xl mx-auto leading-tight">
              FASTIQ finds real UF grads already inside the companies your kid wants — writes the messages — and tracks progress.
            </h3>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              So you both see momentum instead of silence.
            </p>
          </motion.div>

          {/* Screenshot panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            <TargetIntelligencePanel />
            <OutreachEnginePanel />
            <EntryStrategyPanel />
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onFastIQ}
              className="px-8 py-4 rounded-xl text-[15px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 0 30px rgba(250,70,22,0.2)',
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