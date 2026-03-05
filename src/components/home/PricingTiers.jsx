import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.12 } }
};

function FoundingTier({ spotsLeft, onCTA }) {
  const claimed = 1000 - spotsLeft;
  const pct = Math.min((claimed / 1000) * 100, 100);

  return (
    <motion.div variants={fadeInUp} className="flex">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center flex flex-col h-full w-full">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">FOUNDING MEMBER</h3>
        <p className="text-sm text-slate-500 mb-4">First 1,000 members — forever free</p>
        <div className="text-4xl md:text-5xl font-extrabold text-green-600 mb-1">FREE</div>
        <p className="text-green-700 font-semibold text-sm mb-6">FOREVER</p>

        <ul className="text-left space-y-2.5 mb-6 flex-1">
          {[
            'Full CFF network access',
            'Parent and alumni matching',
            'Community, messaging, karma system',
            'UF Directory access',
          ].map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{claimed} of 1,000 spots claimed</p>
        </div>

        <Button
          onClick={onCTA}
          className="bg-[#0021A5] hover:bg-[#001878] text-white font-bold w-full py-5 text-base"
        >
          {spotsLeft > 0 ? 'Claim Your Spot' : 'Join Waitlist'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-[11px] text-slate-400 mt-2.5">
          Once 1,000 spots are filled, membership starts at $9/month
        </p>
      </div>
    </motion.div>
  );
}

function CFFTier({ onCTA }) {
  return (
    <motion.div variants={fadeInUp} className="flex">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 text-center flex flex-col h-full w-full">
        <div className="text-3xl mb-2">🚀</div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">CFF MEMBERSHIP</h3>
        <p className="text-sm text-slate-500 mb-4">Your network, activated</p>
        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-1">$9</div>
        <p className="text-slate-500 font-semibold text-sm mb-6">/month</p>

        <ul className="text-left space-y-2.5 mb-6 flex-1">
          {[
            'Full access to the CFF network',
            'Parent and alumni matching & messaging',
            'Community board and help requests',
            'UF Directory browsing',
            'Karma system and family connections',
          ].map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <Check className="w-4 h-4 text-[#0021A5] mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onCTA}
          variant="outline"
          className="border-2 border-[#0021A5] text-[#0021A5] font-bold w-full py-5 text-base hover:bg-[#0021A5]/5"
        >
          Start 7-day free trial
        </Button>
      </div>
    </motion.div>
  );
}

function FastIQTier({ onCTA }) {
  return (
    <motion.div variants={fadeInUp} className="flex lg:scale-105 lg:-my-3 z-10">
      <div
        className="rounded-2xl p-6 md:p-8 text-center flex flex-col h-full w-full relative overflow-hidden"
        style={{
          background: '#fff',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 0 0 2px #FA4616, 0 0 30px rgba(250,70,22,0.12), 0 8px 32px rgba(0,33,165,0.10)',
        }}
      >
        {/* Popular badge */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-lg text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          style={{ background: 'linear-gradient(135deg, #FA4616, #E03A12)' }}
        >
          Most Popular
        </div>

        <div className="text-3xl mb-2 mt-3">⚡</div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">FASTIQ™</h3>
        <p className="text-sm text-slate-500 mb-4">Your unfair advantage</p>
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-4xl md:text-5xl font-extrabold text-slate-900">$29</span>
          <span className="text-slate-500 font-medium">/month</span>
        </div>
        <p className="text-[#FA4616] font-semibold text-sm mb-6">or $249/year — save 28%</p>

        <p className="text-left text-sm text-slate-700 font-bold mb-3">
          Everything in CFF Membership, plus:
        </p>
        <ul className="text-left space-y-2.5 mb-6 flex-1">
          {[
            { icon: '🔍', text: 'AI-powered company research — hiring scores, salary intel, interview process' },
            { icon: '🌎', text: 'Discover UF alumni at ANY company worldwide — not just on CFF' },
            { icon: '✉️', text: 'AI-drafted personalized outreach referencing your shared UF connection' },
            { icon: '🗺️', text: 'Weekly career action plans customized to your goals' },
            { icon: '⚡', text: 'Your own AI career agent that works for you 24/7' },
          ].map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onCTA}
          className="text-white font-bold w-full py-5 text-base"
          style={{ background: '#FA4616', hover: '#E03A12' }}
        >
          Activate FASTIQ — 7-day free trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-[12px] text-slate-500 mt-2.5 italic">
          Because applying isn't a strategy.
        </p>
      </div>
    </motion.div>
  );
}

export default function PricingTiers({ spotsLeft = 50, onFoundingCTA, onCFFCTA, onFastIQCTA }) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4"
        >
          Choose Your Path
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-slate-600 text-center mb-12 text-lg"
        >
          Every tier includes the full power of the CFF network.
        </motion.p>

        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 items-stretch"
        >
          <FoundingTier spotsLeft={spotsLeft} onCTA={onFoundingCTA} />
          <CFFTier onCTA={onCFFCTA} />
          <FastIQTier onCTA={onFastIQCTA} />
        </motion.div>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          All plans include a 7-day free trial. Cancel anytime. Your price locks in forever.
        </motion.p>
      </div>
    </section>
  );
}