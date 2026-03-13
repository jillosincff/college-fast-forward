import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, Zap, X } from 'lucide-react';
import { useFunnel } from './FunnelContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DualPathEntry() {
  const { setPath, setPhase, onClose } = useFunnel();

  const choosePath = (p) => {
    setPath(p);
    setPhase('quiz');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="relative max-w-xl mx-auto px-5 py-10 text-center"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      )}

      <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 mb-6">
        <Zap className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">FASTIQ™ Quiz</span>
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className="text-[22px] sm:text-[30px] font-extrabold text-white mb-3 tracking-tight"
        style={{ lineHeight: 1.15 }}
      >
        Let's find your <span className="text-orange-400">alumni network.</span>
      </motion.h2>

      <motion.p variants={fadeUp} className="text-[14px] sm:text-[16px] text-white/55 mb-10 max-w-md mx-auto leading-relaxed">
        Answer a few quick questions and we'll show you UF alumni who can open doors at your target companies.
      </motion.p>

      <motion.div variants={fadeUp} className="space-y-4">
        {/* Path A */}
        <button
          onClick={() => choosePath('known')}
          className="w-full group rounded-2xl p-5 sm:p-6 text-left transition-all duration-200 border-2 border-orange-500/30 hover:border-orange-400 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, rgba(250,70,22,0.12) 0%, rgba(250,70,22,0.04) 100%)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(250,70,22,0.2)' }}>
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-bold text-[16px] mb-1">I know my dream companies</p>
              <p className="text-white/50 text-[13px] leading-snug">Unlock alumni at your specific target companies — Amazon, Google, Goldman, whoever.</p>
            </div>
          </div>
        </button>

        {/* Path B */}
        <button
          onClick={() => choosePath('explorer')}
          className="w-full group rounded-2xl p-5 sm:p-6 text-left transition-all duration-200 border-2 border-cyan-500/30 hover:border-cyan-400 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.04) 100%)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.2)' }}>
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-bold text-[16px] mb-1">I have no idea where to start</p>
              <p className="text-white/50 text-[13px] leading-snug">We'll suggest career paths and companies based on your interests, then show you alumni who can help.</p>
            </div>
          </div>
        </button>
      </motion.div>

      <motion.p variants={fadeUp} className="text-[12px] text-white/30 mt-8">
        Takes 60 seconds · No sign-up required to see results
      </motion.p>
    </motion.div>
  );
}