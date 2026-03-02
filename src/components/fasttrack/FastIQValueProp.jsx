import React from 'react';
import { Users, MessageSquare, Map, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const PILLARS = [
  {
    icon: Users,
    title: 'Find Insiders',
    body: 'Surfaces alumni and warm connections tied to your target company — on and off CFF.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    icon: MessageSquare,
    title: 'Draft Outreach',
    body: 'Writes high-response messages tailored to the role, the person, and the context.',
    color: '#FA4616',
    bg: 'rgba(250,70,22,0.1)',
  },
  {
    icon: Map,
    title: 'Map the Warm Path',
    body: 'Builds a step-by-step plan: who to contact first, what to say, and what to do next.',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
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
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3">What FASTIQ Does</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PILLARS.map(({ icon: Icon, title, body, color, bg }, i) => (
            <motion.div
              key={title}
              {...fade}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
              className="rounded-lg p-4"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-[13px] font-semibold text-white mb-1">{title}</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* B) Mechanism explainer */}
      <motion.p
        {...fade}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-[13px] text-slate-400 leading-relaxed text-center max-w-lg mx-auto"
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
        <div
          className="rounded-lg p-4"
          style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em] mb-3">Cold Applying</p>
          <ul className="space-y-2">
            {COLD_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-2">
                <X className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                <span className="text-[12px] text-slate-500 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FASTIQ */}
        <div
          className="rounded-lg p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(250,70,22,0.06) 0%, rgba(37,99,235,0.06) 100%)',
            border: '1px solid rgba(250,70,22,0.15)',
          }}
        >
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-[0.12em] mb-3">FASTIQ</p>
          <ul className="space-y-2">
            {FASTIQ_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-[12px] text-slate-300 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* D) Bridge micro-line */}
      <motion.p
        {...fade}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-[11px] text-slate-500 text-center tracking-wide"
      >
        Upgrade turns your job search into a guided warm-path system.
      </motion.p>

    </div>
  );
}