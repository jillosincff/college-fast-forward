import React from 'react';
import { motion } from 'framer-motion';
import ProgressRing from '../ProgressRing';

const RINGS = [
  { label: 'Targets Locked', key: 'companies_researched', max: 5, color: '#3B82F6' },
  { label: 'Insiders Found', key: 'alumni_discovered', max: 15, color: '#FA4616' },
  { label: 'Messages Sent', key: 'messages_drafted', max: 10, color: '#22C55E' },
  { label: 'Warm Paths', key: 'roadmaps_generated', max: 5, color: '#A855F7' },
];

export default function ParentProgressRings({ profile }) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">Progress</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {RINGS.map((r, i) => {
          const value = profile[r.key] || 0;
          return (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-xl p-4 flex flex-col items-center"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="relative mb-2">
                <ProgressRing value={value} max={r.max} color={r.color} size={64} strokeWidth={5} />
                <span className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-white">
                  {value}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-center leading-tight">
                {r.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">{value}/{r.max}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}