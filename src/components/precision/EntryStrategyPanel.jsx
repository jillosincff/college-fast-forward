import React from 'react';

const STEPS = [
  { label: 'Alumni Identified', complete: true },
  { label: 'Initial Introduction Sent', complete: false, active: true },
  { label: 'Follow-Up Scheduled', complete: false },
  { label: 'Application Submission', complete: false },
  { label: 'Referral Pending', complete: false },
];

export default function EntryStrategyPanel() {
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
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.14em] font-semibold">Entry Strategy Map</p>
        </div>

        {/* Sequence */}
        <div className="px-5 py-4 flex-1">
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const isLast = i === STEPS.length - 1;
              return (
                <div key={step.label} className="flex gap-3">
                  {/* Vertical line + node */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{
                        background: step.complete
                          ? '#4ADE80'
                          : step.active
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.15)',
                        boxShadow: step.complete
                          ? '0 0 6px rgba(74,222,128,0.4)'
                          : step.active
                            ? '0 0 6px rgba(255,255,255,0.3)'
                            : 'none',
                      }}
                    />
                    {!isLast && (
                      <div
                        className="w-px flex-1 min-h-[24px]"
                        style={{
                          background: step.complete
                            ? 'rgba(74,222,128,0.25)'
                            : 'rgba(255,255,255,0.06)',
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                    <p
                      className="text-[12px] font-medium leading-none"
                      style={{
                        color: step.complete
                          ? '#4ADE80'
                          : step.active
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {step.label}
                    </p>
                    {step.active && (
                      <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.08em]">Current Stage</p>
                    )}
                    {step.complete && (
                      <p className="text-[10px] mt-1.5 uppercase tracking-[0.08em]" style={{ color: 'rgba(74,222,128,0.5)' }}>Complete</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBF24', boxShadow: '0 0 6px rgba(251,191,36,0.3)' }} />
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-medium">Warm Path In Progress</span>
            </div>
            <span className="text-[10px] text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>2 Active · 1 Response</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[12px] text-slate-500 leading-[1.7] mt-4 px-1">
        Every target company has a defined warm path — so effort compounds instead of drifting.
      </p>
    </div>
  );
}