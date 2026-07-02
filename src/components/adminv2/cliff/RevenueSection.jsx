import React from 'react';
import MetricTile from './MetricTile';

export default function RevenueSection({ revenue }) {
  if (!revenue) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">💰 Revenue & Trials</h2>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <MetricTile label="Paying Subscribers" value={revenue.paidUsers} sub="active Stripe subscriptions" accent="text-green-400" />
        <MetricTile label="Est. MRR" value={`$${revenue.mrr}`} sub="payers × $19.96/mo" accent="text-green-400" />
        <MetricTile label="Founding Members" value={revenue.foundingMembers} sub="free lifetime access" />
        <MetricTile
          label="Active Trials"
          value={revenue.activeTrials}
          sub={`${revenue.activeTrialsEngaged ?? 0} actually used it · incl. auto-granted`}
          accent="text-orange-400"
        />
        <MetricTile
          label="Trial → Paid"
          value={revenue.trialConversionPct !== null ? `${revenue.trialConversionPct}%` : '—'}
          sub="of completed trials (estimate)"
          accent="text-orange-400"
        />
        <MetricTile label="Expired Trials" value={revenue.expiredTrials} sub="win-back pool" />
      </div>
    </section>
  );
}