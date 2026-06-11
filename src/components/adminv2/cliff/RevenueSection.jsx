import React from 'react';
import MetricTile from './MetricTile';

export default function RevenueSection({ revenue }) {
  if (!revenue) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">💰 Revenue & Trials</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricTile label="Paid Members" value={revenue.paidUsers} accent="text-green-400" />
        <MetricTile label="Est. Weekly Revenue" value={`$${revenue.weeklyMRR}`} sub="paid × $4.99/wk" accent="text-green-400" />
        <MetricTile label="Active Trials" value={revenue.activeTrials} sub={`${revenue.trialsStartedThisWeek} started this wk`} accent="text-orange-400" />
        <MetricTile
          label="Trial → Paid"
          value={revenue.trialConversionPct !== null ? `${revenue.trialConversionPct}%` : '—'}
          sub="of completed trials"
          accent="text-orange-400"
        />
        <MetricTile label="Expired Trials" value={revenue.expiredTrials} sub="win-back pool" />
      </div>
    </section>
  );
}