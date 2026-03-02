import React from 'react';

const ROW_STYLE = "flex justify-between items-baseline py-2 border-b border-white/5 last:border-0";
const LABEL = "text-[11px] text-slate-500 uppercase tracking-[0.08em] font-medium";
const VALUE = "text-[13px] text-slate-200 font-medium text-right";

export default function TargetIntelligencePanel() {
  return (
    <div className="flex flex-col h-full">
      <div
        className="rounded-md overflow-hidden flex-1 flex flex-col"
        style={{
          background: '#0F172A',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.14em] font-semibold">Target Intelligence</p>
        </div>

        {/* Data Rows */}
        <div className="px-5 py-3 flex-1">
          <div className={ROW_STYLE}>
            <span className={LABEL}>Target Company</span>
            <span className={`${VALUE} text-white font-semibold`}>Goldman Sachs</span>
          </div>
          <div className={ROW_STYLE}>
            <span className={LABEL}>Role Focus</span>
            <span className={VALUE}>IB Summer Analyst</span>
          </div>
          <div className={ROW_STYLE}>
            <span className={LABEL}>Alumni Identified</span>
            <span className={VALUE} style={{ fontVariantNumeric: 'tabular-nums' }}>4</span>
          </div>
          <div className={ROW_STYLE}>
            <span className={LABEL}>Warm Path Strength</span>
            <span className="text-[13px] font-semibold text-right" style={{ color: '#4ADE80' }}>High</span>
          </div>
          <div className={ROW_STYLE}>
            <span className={LABEL}>Recent Engagement</span>
            <span className={VALUE}>2 responses this month</span>
          </div>
          <div className={ROW_STYLE}>
            <span className={LABEL}>Referral Probability</span>
            <span className={VALUE}>Moderate</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,0.4)' }} />
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-medium">Warm Path Active</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[12px] text-slate-500 leading-[1.7] mt-4 px-1">
        FASTIQ identifies alumni leverage and evaluates warm-path strength before your student applies.
      </p>
    </div>
  );
}