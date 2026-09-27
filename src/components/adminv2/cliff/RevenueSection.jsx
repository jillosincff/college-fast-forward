import React, { useState } from 'react';
import MetricTile from './MetricTile';
import { base44 } from '@/api/base44Client';

export default function RevenueSection({ revenue }) {
  const [exporting, setExporting] = useState(false);
  const [exportingActivated, setExportingActivated] = useState(false);
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
  const exportActivatedCsv = async () => {
    setExportingActivated(true);
    try {
      const res = await base44.functions.invoke('exportActivatedStudentsCsv', {});
      const blob = new Blob([res.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activated_students_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Activated students export failed:', e);
    } finally {
      setExportingActivated(false);
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
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="text-xs font-medium text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
        >
          {exporting ? 'Exporting…' : '⬇ Export pilot list (CSV)'}
        </button>
        <button
          onClick={exportActivatedCsv}
          disabled={exportingActivated}
          className="text-xs font-medium text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
        >
          {exportingActivated ? 'Exporting…' : '⬇ Export activated students (CSV)'}
        </button>
      </div>

      {revenue.parentGiftTest && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">🎁 Parent gift test (Fall Semester)</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <MetricTile label="Asks sent" value={revenue.parentGiftTest.asksSent} sub="sendParentProInvite emails" />
            <MetricTile label="Parent page opens" value={revenue.parentGiftTest.parentPageOpens} sub="#/ForParents views" />
            <MetricTile label="Checkouts started" value={revenue.parentGiftTest.checkoutsStarted} sub="fall_semester_gift" />
            <MetricTile label="Gifts paid" value={revenue.parentGiftTest.giftsPaid} sub={`refunds: ${revenue.parentGiftTest.giftsRefunded}`} accent="text-green-400" />
            <MetricTile label="Revenue" value={`$${revenue.parentGiftTest.revenue}`} sub="$99 one-time" accent="text-green-400" />
          </div>
          {(() => {
            const u = revenue.parentGiftTest.byUtm || {};
            const keys = Array.from(new Set([
              'ask_parent', 'student_email', 'facebook', 'linkedin',
              ...Object.keys(u.asksSent || {}),
              ...Object.keys(u.parentPageOpens || {}),
              ...Object.keys(u.checkoutsStarted || {}),
              ...Object.keys(u.giftsPaid || {}),
              ...Object.keys(u.revenue || {}),
            ]));
            if (!keys.length) return null;
            return (
              <div className="mt-3 overflow-x-auto">
                <table className="text-xs text-slate-300">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="text-left pr-4 py-1 font-medium">utm_source</th>
                      <th className="text-right pr-4 py-1 font-medium">asks</th>
                      <th className="text-right pr-4 py-1 font-medium">page</th>
                      <th className="text-right pr-4 py-1 font-medium">checkouts</th>
                      <th className="text-right pr-4 py-1 font-medium">paid</th>
                      <th className="text-right pr-4 py-1 font-medium">rev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k} className="border-t border-slate-800">
                        <td className="pr-4 py-1">{k}</td>
                        <td className="pr-4 py-1 text-right">{u.asksSent?.[k] || 0}</td>
                        <td className="pr-4 py-1 text-right">{u.parentPageOpens?.[k] || 0}</td>
                        <td className="pr-4 py-1 text-right">{u.checkoutsStarted?.[k] || 0}</td>
                        <td className="pr-4 py-1 text-right">{u.giftsPaid?.[k] || 0}</td>
                        <td className="pr-4 py-1 text-right">${u.revenue?.[k] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
      )}
    </section>
  );
}