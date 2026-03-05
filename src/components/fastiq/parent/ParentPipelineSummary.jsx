import React from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { key: 'identified', icon: '🔍', label: 'Identified', color: '#0021A5' },
  { key: 'reached_out', icon: '✉️', label: 'Reached Out', color: '#8B5CF6' },
  { key: 'replied', icon: '💬', label: 'Replies', color: '#10B981' },
  { key: 'interview', icon: '📅', label: 'Interviews', color: '#FA4616' },
  { key: 'offer', icon: '🎉', label: 'Offers', color: '#EAB308' },
];

export default function ParentPipelineSummary({ counts, studentName }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">
        {studentName ? `${studentName}'s Pipeline` : 'Pipeline'}
      </h2>
      <div
        className="rounded-xl p-5 flex items-center overflow-x-auto"
        style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {STAGES.map((s, i) => {
          const count = counts[s.key] || 0;
          const active = count > 0;
          return (
            <React.Fragment key={s.key}>
              <div className="text-center flex-1 min-w-[52px]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1.5 text-lg"
                  style={{ background: active ? `${s.color}20` : 'rgba(255,255,255,0.05)' }}
                >
                  {s.icon}
                </div>
                <div className="text-xl font-bold" style={{ color: active ? s.color : 'rgba(255,255,255,0.25)' }}>
                  {count}
                </div>
                <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  {s.label}
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="text-slate-600 text-sm flex-shrink-0 px-1 mt-[-16px]">→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}