import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingStudentPivot({ onFunnel }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F172A 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,70,22,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center"
      >
        <motion.div variants={fade} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-6">
          <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wider">For Students</span>
        </motion.div>

        <motion.h2 variants={fade}
          className="text-2xl sm:text-3xl md:text-[40px] font-extrabold text-white tracking-tight mb-5 leading-[1.1]"
        >
          It's mid-March and you still{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
            have zero plans for summer.
          </span>
        </motion.h2>

        <motion.p variants={fade} className="text-white/50 text-[14px] sm:text-[15px] mb-10 max-w-xl mx-auto leading-relaxed">
          Your friends are posting offers. Your parents keep asking questions.
          You have no experience, no connections, and no clue how to fix it.
          <br /><br />
          <span className="text-white/60 italic">It's not what you know — it's who you know.</span>
          <br /><br />
          <span className="text-white/70 font-medium">
            FASTIQ finds real UF grads inside your target companies, messages them for you, and gets your foot in the door — bypassing thousands of cold applicants.
          </span>
        </motion.p>

        {/* Dual CTAs */}
        <motion.div variants={fade} className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onFunnel('known')}
            className="flex-1 sm:max-w-[300px] rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
              boxShadow: '0 0 30px rgba(250,70,22,0.25)',
            }}
          >
            <span className="flex items-start gap-2">
              <span className="text-lg mt-0.5">🔥</span>
              <span className="text-[14px] sm:text-[15px] font-bold text-white leading-snug">
                I know where I want to work… but I don't know a single person there
              </span>
            </span>
          </button>

          <button
            onClick={() => onFunnel('explorer')}
            className="flex-1 sm:max-w-[300px] rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              boxShadow: '0 0 30px rgba(6,182,212,0.2)',
            }}
          >
            <span className="flex items-start gap-2">
              <span className="text-lg mt-0.5">🤔</span>
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-snug">
                I literally have no clue where to even start
              </span>
            </span>
          </button>
        </motion.div>

        <motion.p variants={fade} className="text-white/20 text-[11px] mt-5">
          Takes 45 seconds · No sign-up needed · See real UF alumni at Amazon, Google, Nike, TikTok — free
        </motion.p>
      </motion.div>
    </section>
  );
}