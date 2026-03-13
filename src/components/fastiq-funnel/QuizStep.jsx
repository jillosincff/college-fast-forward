import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useFunnel } from './FunnelContext';

const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export default function QuizStep({ questionNumber, totalQuestions, title, subtitle, canNext, onNext, children }) {
  const { prevStep, step, setPhase } = useFunnel();
  const progress = ((questionNumber) / totalQuestions) * 100;

  const handleBack = () => {
    if (step === 0) {
      setPhase('entry');
    } else {
      prevStep();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FA4616, #F97316)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[12px] text-white/40 font-medium flex-shrink-0">{questionNumber}/{totalQuestions}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={questionNumber} {...fadeSlide}>
          <h3 className="text-[18px] sm:text-[22px] font-bold text-white mb-1.5 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[13px] text-white/45 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}

          {children}

          <button
            onClick={onNext}
            disabled={!canNext}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white py-3.5 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
            style={{ background: canNext ? 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)' : 'rgba(255,255,255,0.1)' }}
          >
            {questionNumber === totalQuestions ? 'See My Results' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}