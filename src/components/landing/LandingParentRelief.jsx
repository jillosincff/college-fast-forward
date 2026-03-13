import React from 'react';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const quotes = [
  {
    text: "I was a wreck every time I called. FASTIQ found 5 UF alumni at places he wanted — he sent the messages and has two interviews. I finally slept.",
    name: "Karen", label: "UF Mom",
  },
  {
    text: "My daughter was paralyzed about internships. This thing wrote everything. She has coffee chats lined up now — and I'm not panicking anymore.",
    name: "Mike", label: "UF Dad",
  },
];

export default function LandingParentRelief({ onCTA }) {
  return (
    <section className="py-16 sm:py-24 px-4" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">

          <motion.h2 variants={fade} className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
            For Parents Who Are{' '}
            <span className="text-[#FA4616] relative">
              Freaking Out
              <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-[#FA4616]/50" />
            </span>
          </motion.h2>

          <motion.div variants={fade} className="mt-8 text-white/50 text-sm sm:text-[15px] leading-relaxed max-w-2xl mx-auto text-left sm:text-center space-y-4">
            <p>
              You're watching your kid spiral — late nights on Handshake, dodging your questions, stress everywhere. You're spending a fortune on college and terrified they'll graduate with nothing lined up.
            </p>
            <p className="text-white/70">
              FASTIQ is the plan you can both believe in: finds real UF alumni already working at the companies they're targeting, writes the exact messages they can send today, shows progress you can both see — so you stop asking <span className="text-white/80 font-medium">"any updates?"</span> and they stop feeling invisible.
            </p>
          </motion.div>

          {/* Quotes */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            {quotes.map((q) => (
              <motion.div key={q.name} variants={fade} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-left">
                <p className="text-white/60 text-[13px] sm:text-[14px] leading-relaxed italic">"{q.text}"</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="w-8 h-8 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-xs font-bold">{q.name[0]}</span>
                  <span className="text-white/70 text-sm font-medium">{q.name}</span>
                  <span className="text-white/30 text-xs">· {q.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fade} className="mt-10">
            <button
              onClick={onCTA}
              className="px-8 py-4 rounded-xl text-[15px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 0 30px rgba(250,70,22,0.25)',
              }}
            >
              Activate FASTIQ for My Student – Start 7-Day Free Trial
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}