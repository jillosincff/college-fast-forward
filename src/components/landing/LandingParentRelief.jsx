import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingParentRelief({ onCTA }) {
  return (
    <section className="py-36 sm:py-48 px-4" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="text-center"
        >
          {/* Headline */}
          <motion.h2 variants={fade} className="text-[32px] sm:text-5xl md:text-[56px] font-black text-white mb-4 leading-[1.08] tracking-tight">
            For Parents Who Are{' '}
            <span className="text-[#FA4616] relative">
              Freaking Out
              <span className="absolute -bottom-2 left-0 w-full h-[3px] rounded-full bg-[#FA4616]/50" />
            </span>
          </motion.h2>

          {/* Empathy copy */}
          <motion.div variants={fade} className="mt-14 max-w-xl mx-auto text-left sm:text-center space-y-7">
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7]">
              You're watching your kid spend hours on Handshake, applying to everything, hearing nothing back.
            </p>
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7]">
              You feel helpless because you don't have any contacts in their target industry.
            </p>
            <p className="text-[#FA4616] text-[20px] sm:text-[22px] leading-[1.6] font-bold">
              That's why we built this.
            </p>
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7]">
              CFF connects your student to thousands of parents and alumni who <span className="font-bold text-white">HAVE</span> those connections — people who work at the companies your kid dreams about, and who've agreed to help.
            </p>
            <p className="text-white text-[18px] sm:text-[20px] leading-[1.7]">
              And FASTIQ — our AI career engine — goes even further. It searches the entire web to find alumni from their school at any company, then writes a personalized warm intro they can send with one tap.
            </p>
          </motion.div>

          {/* A-ha moment */}
          <motion.div
            variants={fade}
            className="mt-14 rounded-2xl p-7 sm:p-9 border max-w-xl mx-auto"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(250,70,22,0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 40px rgba(250,70,22,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-white text-[20px] sm:text-[22px] leading-[1.6] font-bold">
              You don't need to know someone at Google.
            </p>
            <p className="text-[#FA4616] text-[20px] sm:text-[22px] leading-[1.6] font-bold mt-2">
              FASTIQ will find a fellow Gator who works there.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fade} className="mt-14">
            <button
              onClick={onCTA}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-[17px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_8px_4px_rgba(250,70,22,0.35)]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
              }}
            >
              Get FASTIQ Free for My Student
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}