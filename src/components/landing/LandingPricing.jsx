import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap } from "lucide-react";
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingPricing({ stats, onClaim, onFastIQ }) {
  return (
    <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10"
        >
          Choose Your Path
        </motion.h2>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* FOUNDING */}
          <motion.div variants={fade} className="bg-white rounded-2xl border-2 border-[#0021A5] p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0021A5] text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 mt-2">FOUNDING MEMBER</h3>
            <p className="text-slate-500 text-sm mb-4">First 1,000 members – FREE forever</p>
            <div className="text-3xl font-extrabold text-[#0021A5] mb-4">FREE</div>
            <ul className="space-y-2 text-sm text-slate-700 mb-6 flex-1">
              {['Full network access', 'Parent & alumni matching', 'Community + karma', 'UF Directory'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0021A5] flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button onClick={onClaim} className="bg-[#0021A5] hover:bg-[#001878] text-white w-full py-5 font-bold min-h-[48px]">
              Claim Free Spot <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <p className="text-[#FA4616] text-xs font-semibold text-center mt-2">{stats.spots_left} left</p>
          </motion.div>

          {/* CFF MEMBERSHIP */}
          <motion.div variants={fade} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1">CFF MEMBERSHIP</h3>
            <p className="text-slate-500 text-sm mb-4">After founding spots fill</p>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">$9<span className="text-lg font-medium text-slate-500">/mo</span></div>
            <p className="text-slate-400 text-xs mb-4">Cancel anytime</p>
            <ul className="space-y-2 text-sm text-slate-700 mb-6 flex-1">
              {['Full access + messaging', 'Parent & alumni matching', 'Karma system', 'Family connections'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-slate-400 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button onClick={onClaim} variant="outline" className="w-full py-5 font-bold min-h-[48px] border-2">
              Start 7-day free trial <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* FASTIQ */}
          <motion.div variants={fade} className="bg-white rounded-2xl border-2 border-[#FA4616] p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FA4616] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> AI POWERED
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 mt-2">FASTIQ™</h3>
            <p className="text-slate-500 text-sm mb-4">AI career engine</p>
            <div className="text-3xl font-extrabold text-[#FA4616] mb-1">$29<span className="text-lg font-medium text-slate-500">/mo</span></div>
            <p className="text-slate-400 text-xs mb-4">or $249/year — save 28%</p>
            <ul className="space-y-2 text-sm text-slate-700 mb-6 flex-1">
              {['Everything in CFF', 'Alumni discovery engine', 'AI outreach messages', 'Progress tracking', 'Weekly scout reports'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FA4616] flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <button
              onClick={onFastIQ}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 min-h-[48px]"
              style={{ background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)' }}
            >
              Activate FASTIQ – 7-day free trial
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}