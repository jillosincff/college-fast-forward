import React from 'react';

const Stage = ({ label, value, pctOfPrev, dropCount }) => (
  <div className="flex-1 min-w-[120px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{label}</p>
    {pctOfPrev !== null && (
      <p className={`text-xs mt-1 ${pctOfPrev < 50 ? 'text-red-400' : 'text-orange-400'}`}>
        {pctOfPrev}% {dropCount > 0 && <span className="text-slate-500">(−{dropCount})</span>}
      </p>
    )}
  </div>
);

export default function DropoffSection({ dropoff }) {
  if (!dropoff) return null;
  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null);
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">📉 Student Drop-Off Journey</h2>
      <div className="flex gap-2 flex-wrap items-stretch">
        <Stage label="Signed Up" value={dropoff.signedUp} pctOfPrev={null} dropCount={0} />
        <Stage label="Completed Onboarding" value={dropoff.onboarded} pctOfPrev={pct(dropoff.onboarded, dropoff.signedUp)} dropCount={dropoff.signedUp - dropoff.onboarded} />
        <Stage label="Built a Pipeline" value={dropoff.builtPipeline} pctOfPrev={pct(dropoff.builtPipeline, dropoff.onboarded)} dropCount={dropoff.onboarded - dropoff.builtPipeline} />
        <Stage label="Sent Outreach" value={dropoff.reachedOut} pctOfPrev={pct(dropoff.reachedOut, dropoff.builtPipeline)} dropCount={dropoff.builtPipeline - dropoff.reachedOut} />
      </div>
      <p className="text-xs text-slate-600 mt-2">
        Red % = biggest leak. Each stage shows conversion from the previous stage and how many students dropped.
        {dropoff.unclassified > 0 && ` "Signed Up" includes ${dropoff.unclassified} accounts that never got classified as a student or parent.`}
      </p>
    </section>
  );
}