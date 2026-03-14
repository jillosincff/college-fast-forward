import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import InteractiveTeaserDemo from '@/components/landing/InteractiveTeaserDemo';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const painStats = [
  { icon: '📄', number: '200+', line1: 'applications sent', line2: 'by the average student' },
  { icon: '📬', number: '6 seconds', line1: 'is how long a recruiter', line2: 'looks at their resume' },
  { icon: '🤝', number: '0', line1: 'warm connections at', line2: 'their dream companies' },
];

export default function LandingPainFastIQ({ onFastIQ }) {
  return (
    <section className="relative">

      {/* PAIN block */}
      <div className="py-32 sm:py-44 px-4" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #0A1628 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">

          {/* Headline */}
          <motion.h2
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[32px] sm:text-5xl md:text-[60px] font-black text-white mb-4 tracking-tight leading-[1.06]"
          >
            Your Kid Is Invisible
          </motion.h2>
          <motion.p
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[32px] sm:text-5xl md:text-[60px] font-black text-white/50 mb-16 tracking-tight leading-[1.06]"
          >
            to Employers
          </motion.p>

          {/* Three stat cards */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16"
          >
            {painStats.map((s) => (
              <motion.div
                key={s.number}
                variants={fade}
                className="border rounded-2xl p-7 sm:p-8 text-center transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <p className="text-[#FA4616] text-[36px] sm:text-[44px] font-black tracking-tight leading-none mb-3">{s.number}</p>
                <p className="text-white/70 text-[15px] sm:text-[16px] leading-[1.5]">{s.line1}</p>
                <p className="text-white/70 text-[15px] sm:text-[16px] leading-[1.5]">{s.line2}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Gut-punch paragraph */}
          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="max-w-2xl mx-auto mb-14"
          >
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7] mb-6">
              Their friends who get interviews? They're not smarter.
              <br />
              They have <span className="font-bold text-white">connections</span>. Someone made an introduction.
              <br />
              Someone opened a door.
            </p>
            <p className="text-white/60 text-[18px] sm:text-[20px] leading-[1.7]">
              Your student is applying into a black hole.
            </p>
          </motion.div>

          {/* Bold callout */}
          <motion.p
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-white text-[20px] sm:text-[22px] leading-[1.5] font-bold mb-12"
          >
            A perfect resume means nothing without a warm connection.{' '}
            <span className="text-[#FA4616]">FASTIQ changes that.</span>
          </motion.p>

          {/* CTA */}
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <button
              onClick={onFastIQ}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-[17px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
              }}
            >
              See How It Works
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* FASTIQ proof — scanning + interactive teaser */}
      <div className="py-44 sm:py-56 px-4" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #111827 100%)' }}>
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
            <p className="text-white text-[20px] sm:text-[22px] leading-[1.6] font-bold max-w-2xl mx-auto">
              FASTIQ finds real UF grads already inside your target companies, drafts highly-responsive messages to them, and gets your kid in the door — bypassing thousands of other cold applicants.
            </p>
          </motion.div>

          {/* Interactive demo */}
          <motion.div
            variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mb-16"
          >
            <InteractiveTeaserDemo />
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
              Claim Your Free Spot →
            </button>
          </div>
        </div>
      </div>

      {/* Pain block CTA */}
      <div className="pb-16 px-4 text-center" style={{ background: '#0A1628' }}>
        <button
          onClick={onFastIQ}
          className="px-10 py-5 rounded-xl text-[17px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
          style={{
            background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
            boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
          }}
        >
          Claim Your Free Spot →
        </button>
      </div>
    </section>
  );
}