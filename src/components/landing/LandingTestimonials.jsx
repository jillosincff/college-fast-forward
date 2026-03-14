import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const quotes = [
  {
    text: "I was a wreck every time I called. FASTIQ found 5 UF alumni at places he wanted — he sent the messages and has two interviews. I finally slept.",
    name: "Karen",
    label: "UF Mom",
  },
  {
    text: "My daughter was paralyzed about internships. This thing wrote everything. She has coffee chats lined up now — and I'm not panicking anymore.",
    name: "Mike",
    label: "UF Dad",
  },
  {
    text: "My daughter landed an internship at a legal marketing firm — through a connection she never would have found on her own.",
    name: "Dana G.",
    label: "UF Parent",
  },
];

export default function LandingTestimonials({ onClaim }) {
  return (
    <section className="py-44 sm:py-56 px-4" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center"
        >
          <motion.h2 variants={fade} className="text-[28px] sm:text-4xl md:text-[48px] font-black text-white mb-16 tracking-tight leading-[1.1]">
            Real Parents.{' '}
            <span className="text-[#FA4616]">Real Results.</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
            {quotes.map((q) => (
              <motion.div
                key={q.name}
                variants={fade}
                className="border rounded-2xl p-6 text-left transition-all duration-300 hover:border-[#FA4616]/25"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 30px rgba(250,70,22,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-white text-[16px] sm:text-[17px] leading-[1.6] italic mb-5">"{q.text}"</p>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-xs font-bold">{q.name[0]}</span>
                  <span className="text-white text-sm font-semibold">{q.name}</span>
                  <span className="text-white/40 text-xs">· {q.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div variants={fade}>
            <button
              onClick={onClaim}
              className="px-10 py-5 rounded-xl text-[17px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.35), 0 0 60px rgba(250,70,22,0.1)',
              }}
            >
              Join These Families
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}