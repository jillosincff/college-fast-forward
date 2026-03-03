import React from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { key: 'identified', label: 'Identified', emoji: '🔍', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  { key: 'reached_out', label: 'Reached Out', emoji: '📧', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { key: 'replied', label: 'Replies', emoji: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  { key: 'interview', label: 'Interviews', emoji: '📅', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'offer', label: 'Offers', emoji: '🎉', color: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
];

export default function PipelineFunnel({ counts }) {
  const maxCount = Math.max(counts.identified || 1, 1);

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 mb-4">
      {STAGES.map((stage, i) => {
        const count = counts[stage.key] || 0;
        const widthPct = maxCount > 0 ? Math.max((count / maxCount) * 100, 12) : 12;
        const isLast = i === STAGES.length - 1;

        return (
          <div key={stage.key} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[18px] sm:text-[22px] font-bold" style={{ color: count > 0 ? stage.color : 'rgba(255,255,255,0.2)' }}>
              {count}
            </span>
            <motion.div
              className="w-full rounded-md"
              style={{ background: count > 0 ? stage.bg : 'rgba(255,255,255,0.04)', borderBottom: `2px solid ${count > 0 ? stage.color : 'rgba(255,255,255,0.06)'}` }}
              initial={{ height: 0 }}
              animate={{ height: Math.max(widthPct * 0.4, 6) }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            />
            <div className="text-center">
              <span className="text-[10px]">{stage.emoji}</span>
              <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold uppercase tracking-wider leading-tight">{stage.label}</p>
            </div>
            {!isLast && (
              <span className="absolute text-slate-600 text-[10px] hidden">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STAGES };