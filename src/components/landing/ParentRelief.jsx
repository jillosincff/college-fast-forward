import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const testimonials = [
  {
    quote: "I was a wreck every time I called. FASTIQ found 5 UF alumni at places he wanted — he sent the messages and has two interviews. I finally slept.",
    name: "Karen",
    label: "UF Mom",
  },
  {
    quote: "My daughter was paralyzed about internships. This thing wrote everything. She has coffee chats lined up now — and I'm not panicking anymore.",
    name: "Mike",
    label: "UF Dad",
  },
  {
    quote: "She was crying about having nothing. FASTIQ gave her a list and drafts. She's moving forward — worth every penny.",
    name: "Lisa",
    label: "UF Parent",
  },
];

function TestimonialCard({ quote, name, label }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col"
    >
      <p className="text-white/60 text-[14px] leading-relaxed italic flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 mt-5">
        <div className="w-9 h-9 rounded-full bg-[#FA4616]/20 flex items-center justify-center text-[#FA4616] text-sm font-bold">
          {name[0]}
        </div>
        <div>
          <span className="text-white/80 text-sm font-semibold">{name}</span>
          <span className="text-white/40 text-xs ml-1.5">· {label}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ParentRelief({ onCTA }) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center"
        >
          {/* Headline */}
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
            For Parents Who Are{' '}
            <span className="relative inline-block">
              <span className="text-[#FA4616]">Freaking Out</span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-[#FA4616]/60" />
            </span>
          </motion.h2>

          {/* Body */}
          <motion.div variants={fadeUp} className="mt-8 space-y-5 text-[14px] sm:text-[15px] text-white/50 leading-relaxed max-w-2xl mx-auto text-left sm:text-center">
            <p>
              You're watching your kid spiral — late nights on Handshake, dodging your questions, stress everywhere.
              <br />
              You're spending a fortune on college and terrified they'll graduate with nothing lined up — or move back home with no direction.
            </p>

            <p>
              <span className="text-white/70 font-semibold">FASTIQ is the plan you can both believe in:</span>
            </p>
            <ul className="space-y-2 pl-0 list-none">
              <li className="flex items-start gap-2">
                <span className="text-[#FA4616] mt-0.5">•</span>
                <span>It finds real UF alumni already working at the companies they're targeting (or should be).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FA4616] mt-0.5">•</span>
                <span>It writes the exact messages they can send today — no awkward cold outreach.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FA4616] mt-0.5">•</span>
                <span>It shows progress you can both see: messages sent, replies received, coffee chats booked.</span>
              </li>
            </ul>

            <p className="text-white/60">
              You stop asking <span className="text-white/70">"any updates?"</span> every call because you can see it happening.
              <br />
              They stop feeling like the only one without a plan because someone finally gave them a real shot.
            </p>
          </motion.div>

          {/* Testimonials */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-12">
            <button
              onClick={onCTA}
              className="px-8 py-4 rounded-xl text-[15px] sm:text-[16px] font-bold text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                boxShadow: '0 0 30px rgba(250,70,22,0.25), 0 4px 16px rgba(250,70,22,0.2)',
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