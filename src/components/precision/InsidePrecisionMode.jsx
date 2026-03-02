import React from 'react';
import TargetIntelligencePanel from './TargetIntelligencePanel';
import OutreachEnginePanel from './OutreachEnginePanel';
import EntryStrategyPanel from './EntryStrategyPanel';

export default function InsidePrecisionMode({ onUpgrade }) {
  return (
    <section className="py-16 sm:py-24 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[13px] text-slate-400 uppercase tracking-[0.18em] font-semibold mb-3">
            Inside FASTIQ™
          </h2>
          <p className="text-[15px] sm:text-[16px] text-slate-600 max-w-[620px] mx-auto leading-[1.7]">
            FASTIQ turns the network into a targeted entry system — powered by data, context, and structured outreach.
          </p>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-5">
          <TargetIntelligencePanel />
          <OutreachEnginePanel />
          <EntryStrategyPanel />
        </div>

        {/* CTA */}
        <div className="text-center mt-14 sm:mt-16">
          <button
            onClick={onUpgrade}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded text-[14px] font-semibold text-white tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: '#0F172A',
              minHeight: 'auto',
              letterSpacing: '0.02em',
            }}
          >
            Unlock FASTIQ™
          </button>
          <p className="text-[12px] text-slate-400 mt-3 tracking-wide">
            Starting at $19/month • 7-day free trial
          </p>
        </div>

      </div>
    </section>
  );
}