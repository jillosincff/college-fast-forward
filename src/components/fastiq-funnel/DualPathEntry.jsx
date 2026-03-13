import React from 'react';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useFunnel } from './FunnelContext';
import { base44 } from '@/api/base44Client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DualPathEntry() {
  const { setPath, setPhase, onClose } = useFunnel();

  const choosePath = (p) => {
    base44.analytics.track({ eventName: 'funnel_started', properties: { path: p } });
    setPath(p);
    setPhase('quiz');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="relative max-w-2xl mx-auto px-5 py-10 sm:py-16 text-center"
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

      {/* Subtle badge */}
      <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
        <Flame className="w-3 h-3 text-orange-400" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">FASTIQ™</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        className="text-[28px] sm:text-[38px] md:text-[46px] font-extrabold tracking-tight mb-5"
        style={{ lineHeight: 1.1 }}
      >
        <span className="text-white">It's mid-March and you still</span>{' '}
        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #FA4616, #F97316)' }}>
          have zero plans for summer.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        variants={fadeUp}
        className="text-[14px] sm:text-[16px] md:text-[17px] text-white/50 mb-10 max-w-xl mx-auto leading-relaxed"
      >
        Your friends are posting offers. Your parents keep asking questions.
        You have no real experience, no connections, and no clue how to fix it.
        <br className="hidden sm:block" /><br className="hidden sm:block" />
        <span className="text-white/70 font-medium">
          FASTIQ finds actual UF people already working at the places you want — and writes the message you can send today so you don't end up waitressing again.
        </span>
      </motion.p>

      {/* CTAs */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 mb-6">
        {/* Primary — Known targets */}
        <button
          onClick={() => choosePath('known')}
          className="flex-1 sm:max-w-[320px] group rounded-xl px-6 py-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
            boxShadow: '0 0 40px rgba(250,70,22,0.3), 0 4px 20px rgba(250,70,22,0.25)',
          }}
        >
          <span className="flex items-start gap-2.5">
            <span className="text-xl mt-0.5">🔥</span>
            <span className="text-[15px] sm:text-[16px] font-bold text-white leading-snug">
              I know where I want to work… but I don't know a single person there
            </span>
          </span>
          <span className="block text-[12px] text-white/50 mt-2 ml-8">
            Get your hidden UF connections instantly
          </span>
        </button>

        {/* Secondary — Explorer */}
        <button
          onClick={() => choosePath('explorer')}
          className="flex-1 sm:max-w-[320px] group rounded-xl px-6 py-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            boxShadow: '0 0 30px rgba(6,182,212,0.2), 0 4px 16px rgba(6,182,212,0.15)',
          }}
        >
          <span className="flex items-start gap-2.5">
            <span className="text-xl mt-0.5">🤔</span>
            <span className="text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug">
              I literally have no clue where to even start
            </span>
          </span>
          <span className="block text-[12px] text-slate-700/60 mt-2 ml-8">
            We'll figure out paths & matches together
          </span>
        </button>
      </motion.div>

      {/* Micro-text */}
      <motion.p variants={fadeUp} className="text-[12px] text-white/25 max-w-md mx-auto leading-relaxed">
        Takes 45 seconds · No sign-up needed · See real UF people at Amazon, Google, Nike, TikTok, wherever — free
      </motion.p>
    </motion.div>
  );
}