import React from 'react';
import { motion } from 'framer-motion';
import TargetIntelligencePanel from './TargetIntelligencePanel';
import OutreachEnginePanel from './OutreachEnginePanel';
import EntryStrategyPanel from './EntryStrategyPanel';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function InsidePrecisionMode({ onUpgrade }) {
  return (
    <section className="py-16 sm:py-24 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] text-[#FA4616] uppercase tracking-[0.2em] font-bold mb-4">INSIDE CFF</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight max-w-3xl mx-auto">
            FASTIQ™ — The AI That Makes the Network <span className="text-[#FA4616]">Actually Work</span>
          </h2>
          <p className="text-[15px] sm:text-[16px] text-slate-600 max-w-[640px] mx-auto leading-[1.7] mb-6">
            FASTIQ turns the parent/alumni pledge into real job offers — powered by data, context, and structured outreach.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-3 sm:gap-6 text-[14px] text-slate-700 font-medium max-w-xl mx-auto">
            <span className="flex items-center gap-1.5"><span className="text-[#FA4616]">•</span> Finds real UF grads at target companies</span>
            <span className="flex items-center gap-1.5"><span className="text-[#FA4616]">•</span> Writes copy-paste messages</span>
            <span className="flex items-center gap-1.5"><span className="text-[#FA4616]">•</span> Tracks replies & progress</span>
          </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-5">
          <TargetIntelligencePanel />
          <OutreachEnginePanel />
          <EntryStrategyPanel />
        </div>

        {/* FASTIQ-specific testimonials */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid md:grid-cols-2 gap-5 mt-12 sm:mt-14"
        >
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
              "FASTIQ found 12 UF alumni at Amazon I didn't know existed. One draft message got a reply in 2 hours — I start my internship in June."
            </p>
            <p className="text-[13px] text-slate-400 font-medium">— Alex P., UF Junior, Computer Science</p>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
              "My daughter used the AI-drafted outreach and got 3 coffee chats in one week. She went from zero network to an offer at Deloitte in 6 weeks."
            </p>
            <p className="text-[13px] text-slate-400 font-medium">— Janet W., UF Parent</p>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-14 sm:mt-16">
          <button
            onClick={onUpgrade}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded text-[14px] font-semibold text-white tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: '#0F172A',
              minHeight: 'auto',
              letterSpacing: '0.02em',
            }}
          >
            Unlock FASTIQ™
          </button>
          <p className="text-[12px] text-slate-400 mt-3 tracking-wide">
            Starting at $29/month • 7-day free trial
          </p>
        </div>

      </div>
    </section>
  );
}