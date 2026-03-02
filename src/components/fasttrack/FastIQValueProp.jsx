import React from 'react';
import { Users, MessageSquare, Map, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const PILLARS = [
  {
    icon: Users,
    title: 'Find Insiders',
    body: 'Surfaces alumni and warm connections tied to your target company — on and off CFF.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: MessageSquare,
    title: 'Draft Outreach',
    body: 'Writes high-response messages tailored to the role, the person, and the context.',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  {
    icon: Map,
    title: 'Map the Warm Path',
    body: 'Builds a step-by-step plan: who to contact first, what to say, and what to do next.',
    color: '#16A34A',
    bg: '#F0FDF4',
  },
];

const COLD_ITEMS = [
  'Compete with hundreds of applicants',
  'No insider context',
  'More waiting, less control',
];

const FASTIQ_ITEMS = [
  'Lead with warm paths',
  'Reach out with a plan',
  'Move first — with precision',
];

export default function FastIQValueProp() {
  return (
    <div className="space-y-8">

      {/* A) What FASTIQ Does — 3 cards */}
      <div>
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-3">What FASTIQ Does</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PILLARS.map(({ icon: Icon, title, body, color, bg }, i) => (
            <motion.div
              key={title}
              {...fade}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
              className="rounded-xl p-5 border border-slate-200"
              style={{ background: '#FFFFFF' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-[18px] h-[18px]" style={{ color }} />
              </div>
              <p className="text-[14px] sm:text-[13px] font-bold text-slate-900 mb-1.5">{title}</p>
              <p className="text-[13px] sm:text-[12px] text-slate-600 leading-[1.65]">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* B) Mechanism explainer */}
      <motion.p
        {...fade}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-[14px] sm:text-[13px] text-slate-600 text-center max-w-[600px] mx-auto"
        style={{ lineHeight: 1.75 }}
      >
        FASTIQ analyzes your target company, finds alumni leverage, and hands you the next precise move — so you're not guessing or cold applying.
      </motion.p>

      {/* C) Comparison strip */}
      <motion.div
        {...fade}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {/* Cold Applying */}
        <div className="rounded-xl p-5 bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-3">Cold Applying</p>
          <ul className="space-y-2.5">
            {COLD_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-2.5">
                <X className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-[13px] sm:text-[12px] text-slate-500 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FASTIQ */}
        <div
          className="rounded-xl p-5 border-2"
          style={{ background: '#FFFBF8', borderColor: '#FA461630' }}
        >
          <p className="text-[11px] font-bold text-[#EA580C] uppercase tracking-[0.12em] mb-3">FASTIQ</p>
          <ul className="space-y-2.5">
            {FASTIQ_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-[#EA580C] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] sm:text-[12px] text-slate-800 leading-snug font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* D) Bridge micro-line */}
      <motion.p
        {...fade}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-[12px] text-slate-400 text-center tracking-wide"
      >
        Upgrade turns your job search into a guided warm-path system.
      </motion.p>

    </div>
  );
}