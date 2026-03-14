import React from 'react';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingStudentPivot({ onFunnel }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F172A 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,70,22,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 max-w-2xl mx-auto px-4 py-48 sm:py-60 text-center"
      >
        <motion.div variants={fade} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-8"
          style={{ boxShadow: '0 0 20px rgba(6,182,212,0.08)' }}
        >
          <span className="text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider">For Students</span>
        </motion.div>

        <motion.h2 variants={fade}
          className="text-[32px] sm:text-5xl md:text-[52px] font-black text-white tracking-tight mb-8 leading-[1.08]"
        >
          It's mid-March and you still{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            have zero plans for summer.
          </span>
        </motion.h2>

        <motion.div variants={fade} className="mb-14 max-w-xl mx-auto space-y-5">
          <p className="text-white text-[18px] sm:text-[20px] leading-[1.65]">
            Your friends are posting offers. Your parents keep asking questions. You have no experience, no connections, and no clue how to fix it.
          </p>
          <p className="text-white text-[18px] sm:text-[20px] leading-[1.65] font-medium">
            FASTIQ finds real UF grads inside your target companies, messages them for you, and gets your foot in the door — bypassing thousands of cold applicants.
          </p>
        </motion.div>

        {/* Dual CTAs */}
        <motion.div variants={fade} className="flex flex-col sm:flex-row items-stretch justify-center gap-5">
          <button
            onClick={() => onFunnel('known')}
            className="flex-1 sm:max-w-[300px] rounded-xl px-6 py-5 text-left transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
              boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
            }}
          >
            <span className="flex items-start gap-2.5">
              <span className="text-xl mt-0.5">🔥</span>
              <span className="text-[16px] sm:text-[17px] font-bold text-white leading-snug">
                I know where I want to work… but I don't know a single person there
              </span>
            </span>
          </button>

          <button
            onClick={() => onFunnel('explorer')}
            className="flex-1 sm:max-w-[300px] rounded-xl px-6 py-5 text-left transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              boxShadow: '0 4px 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.08)',
            }}
          >
            <span className="flex items-start gap-2.5">
              <span className="text-xl mt-0.5">😬</span>
              <span className="text-[16px] sm:text-[17px] font-bold text-slate-900 leading-snug">
                I literally have no clue where to even start
              </span>
            </span>
          </button>
        </motion.div>

        <motion.p variants={fade} className="text-[#E5E7EB]/40 text-sm mt-7">
          Takes 45 seconds · No sign-up needed · See real UF alumni at Amazon, Google, Nike, TikTok — free
        </motion.p>
      </motion.div>
    </section>
  );
}