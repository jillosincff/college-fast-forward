import React, { useState } from 'react';
import MetricTile from './MetricTile';
import { base44 } from '@/api/base44Client';

export default function RevenueSection({ revenue }) {
  const [exporting, setExporting] = useState(false);
  if (!revenue) return null;
  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke('exportFoundingGatorParentsCsv', {});
      const blob = new Blob([res.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `founding_gator_parents_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed:', e);
    } finally {
      setExporting(false);
    }
  };
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">💰 Revenue & Trials</h2>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <MetricTile label="Paying Pro" value={revenue.payingPro ?? revenue.paidUsers} sub="active Stripe subscriptions · never combined with pilot" accent="text-green-400" />
        <MetricTile label="Est. MRR" value={`$${revenue.mrr}`} sub="payers × $19.96/mo" accent="text-green-400" />
        <MetricTile label="Pilot (free Pro)" value={revenue.pilotFreePro ?? 0} sub="founding_gator cohort · never charged" />
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
      <button
        onClick={exportCsv}
        disabled={exporting}
        className="mt-3 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
      >
        {exporting ? 'Exporting…' : '⬇ Export pilot list (CSV)'}
      </button>
    </section>
  );
}