import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const steps = [
  {
    num: '1',
    title: 'Sign up (30 seconds)',
    desc: 'Create your free parent account and connect your student.',
  },
  {
    num: '2',
    title: 'FASTIQ goes to work',
    desc: 'Our AI scans the UF alumni network and finds real people at your kid\'s target companies.',
  },
  {
    num: '3',
    title: 'Warm intros happen',
    desc: 'FASTIQ drafts personalized messages. Your student sends them. Conversations start. Doors open.',
  },
];

export default function LandingHowItWorks({ onClaim }) {
  return (
    <section className="py-44 sm:py-56 px-4" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #0A1628 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="text-center"
        >
          <motion.h2 variants={fade} className="text-[28px] sm:text-4xl md:text-[48px] font-black text-white mb-16 tracking-tight leading-[1.1]">
            How It Works{' '}
            <span className="text-white/40 font-normal text-[20px] sm:text-[24px]">(for parents)</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {steps.map((s) => (
              <motion.div
                key={s.num}
                variants={fade}
                className="border rounded-2xl p-6 text-center transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center text-lg font-black"
                  style={{
                    background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(250,70,22,0.3)',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-white text-[18px] font-bold mb-3">{s.title}</h3>
                <p className="text-white/70 text-[16px] leading-[1.6]">{s.desc}</p>
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
              Get Started — It's Free
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}