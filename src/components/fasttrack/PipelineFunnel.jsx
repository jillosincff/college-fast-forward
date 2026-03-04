import React from 'react';
import { ArrowRight } from 'lucide-react';

const STAGES = [
  { key: 'identified', label: 'Identified', emoji: '🔍', color: '#64748B', bg: '#F1F5F9' },
  { key: 'reached_out', label: 'Reached Out', emoji: '📧', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'replied', label: 'Replies', emoji: '✅', color: '#22C55E', bg: '#F0FDF4' },
  { key: 'interview', label: 'Interviews', emoji: '📅', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'offer', label: 'Offers', emoji: '🎉', color: '#EAB308', bg: '#FEF9C3' },
];

export default function PipelineFunnel({ counts }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const count = counts[stage.key] || 0;
        const isActive = count > 0;
        const isLast = i === STAGES.length - 1;

        return (
          <div key={stage.key} className="flex items-center flex-shrink-0">
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{
                background: isActive ? stage.bg : '#F8FAFC',
                border: `1px solid ${isActive ? stage.color + '30' : '#E2E8F0'}`,
              }}
            >
              <span className="text-[11px]">{stage.emoji}</span>
              <span
                className="text-[15px] font-bold tabular-nums"
                style={{ color: isActive ? stage.color : '#CBD5E1' }}
              >
                {count}
              </span>
              <span
                className="text-[10px] font-semibold whitespace-nowrap"
                style={{ color: isActive ? stage.color : '#94A3B8' }}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STAGES };