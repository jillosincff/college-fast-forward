import React from 'react';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const quotes = [
  { text: "I called six friends in finance before finding CFF. Wish I had this sooner.", name: "Rob K.", label: "UF Parent, Finance" },
  { text: "My son went from zero replies to three interviews in two weeks. This is magic.", name: "Lisa M.", label: "UF Parent, Tech" },
  { text: "I didn't know how to help. Now I actually can. CFF gave me a way in.", name: "Sarah T.", label: "UF Parent, Healthcare" },
  { text: "The FASTIQ outreach draft was better than anything I could have written myself.", name: "Mike D.", label: "UF Parent, Law" },
];

export default function LandingParentRelief({ onCTA }) {
  return (
    <section className="py-28 sm:py-36 px-4" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center">

          <motion.h2 variants={fade} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            For Parents Who Are{' '}
            <span className="text-[#FA4616] relative">
              Freaking Out
              <span className="absolute -bottom-1.5 left-0 w-full h-[3px] rounded-full bg-[#FA4616]/50" />
            </span>
          </motion.h2>

          <motion.div variants={fade} className="mt-10 max-w-2xl mx-auto text-left sm:text-center space-y-5">
            <p className="text-[#E5E7EB] text-lg sm:text-xl leading-[1.8]">
              You're watching your kid spiral — late nights on Handshake, dodging your questions, stress everywhere. You're spending a fortune on college and terrified they'll graduate with nothing lined up.
            </p>
            <p className="text-[#D1D5DB] text-lg sm:text-xl leading-[1.8]">
              FASTIQ is the plan you can both believe in: finds real UF alumni already working at the companies they're targeting, writes the exact messages they can send today, shows progress you can both see — so you stop asking <span className="text-white font-medium">"any updates?"</span> and they stop feeling invisible.
            </p>
          </motion.div>

          {/* Quotes */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-16">
            {quotes.map((q) => (
              <motion.div key={q.name} variants={fade}
                className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 text-left"
                style={{ boxShadow: '0 0 24px rgba(250,70,22,0.05), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <p className="text-[#E5E7EB] text-base sm:text-lg leading-relaxed italic">"{q.text}"</p>
                <div className="flex items-center gap-2.5 mt-5">
                  <span className="w-9 h-9 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-sm font-bold">{q.name[0]}</span>
                  <span className="text-white/80 text-sm font-semibold">{q.name}</span>
                  <span className="text-white/40 text-xs">· {q.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fade} className="mt-14">
            <button
              onClick={onCTA}
              className="px-10 py-5 rounded-xl text-base font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 4px 30px rgba(250,70,22,0.3)',
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