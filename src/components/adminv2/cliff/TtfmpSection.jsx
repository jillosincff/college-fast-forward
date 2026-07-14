import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TYPE_LABELS = {
  tailored_resume_completed: 'Tailored Resume',
  application_submitted: 'Application Submitted',
  outreach_sent: 'Outreach Sent',
  interview_practice_completed: 'Interview Practiced',
  follow_up_sent: 'Follow-Up Sent',
};

const fmt = (s) => {
  if (s === null || s === undefined) return '—';
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
};

const medianColor = (s) => (s === null ? 'text-slate-400' : s <= 600 ? 'text-emerald-400' : s <= 1200 ? 'text-yellow-400' : 'text-red-400');

function Tile({ label, value, sub, valueClass = 'text-white' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function TtfmpSection() {
  const [data, setData] = useState(null);
  const [school, setSchool] = useState('all');
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);

  const load = (sc) => {
    setLoading(true);
    base44.functions.invoke('getTtfmpMetrics', { school: sc })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(school); }, [school]);

  const runBackfill = async () => {
    setBackfilling(true);
    try {
      const res = await base44.functions.invoke('backfillTtfmp', {});
      setBackfillResult(res.data);
      load(school);
    } catch {}
    setBackfilling(false);
  };

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold text-white">⏱ Time to First Meaningful Progress</h2>
        <div className="flex items-center gap-2">
          {data?.schools?.length > 0 && (
            <select value={school} onChange={e => setSchool(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2" style={{ fontSize: 13 }}>
              <option value="all">All Schools</option>
              {data.schools.map(s => <option key={s.code} value={s.code}>{s.code} ({s.count})</option>)}
            </select>
          )}
          <button onClick={runBackfill} disabled={backfilling} style={{ minHeight: 'auto' }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">
            {backfilling ? 'Backfilling…' : 'Run Historical Backfill'}
          </button>
        </div>
      </div>
      <p className="text-emerald-400 text-xs font-semibold mb-4">
        🎯 Target: Median TTFMP under 10 minutes · Increase % of students reaching meaningful progress within 10 minutes
      </p>

      {backfillResult && (
        <p className="text-slate-400 text-xs mb-4">
          Backfill: {backfillResult.backfilled} students backfilled · {backfillResult.insufficient_data} with insufficient historical data · {backfillResult.impossible_timestamps_skipped} impossible timestamps skipped
        </p>
      )}

      {loading || !data ? (
        <p className="text-slate-500 text-sm py-8 text-center">Loading TTFMP metrics…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Tile label="Median TTFMP" value={fmt(data.median_ttfmp_seconds)} valueClass={medianColor(data.median_ttfmp_seconds)}
              sub={data.median_ttfmp_seconds !== null ? (data.median_ttfmp_seconds <= 600 ? 'On target' : data.median_ttfmp_seconds <= 1200 ? 'Above target' : 'Well above target') : 'No data yet'} />
            <Tile label="Under 10 Minutes" value={`${data.pct_under_10}%`} valueClass={data.pct_under_10 >= 50 ? 'text-emerald-400' : 'text-yellow-400'}
              sub="of all eligible students" />
            <Tile label="Reached Meaningful Progress" value={`${data.converted} of ${data.eligible}`} sub={`${data.conversion_rate}% conversion`} />
            <Tile label="No Meaningful Progress" value={`${data.no_progress.count} (${data.no_progress.pct}%)`} valueClass="text-red-400"
              sub={data.no_progress.median_days_since_signup !== null ? `Median ${Math.round(data.no_progress.median_days_since_signup)}d since signup` : ''} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Tile label="Average TTFMP (secondary)" value={fmt(data.avg_ttfmp_seconds)} valueClass="text-slate-300" sub="Median is the headline — averages get distorted by late returners" />
            <Tile label="Fastest Common First Action" valueClass="text-slate-100"
              value={data.fastest_first_action ? TYPE_LABELS[data.fastest_first_action.type] || data.fastest_first_action.type : '—'}
              sub={data.fastest_first_action ? `Median ${fmt(data.fastest_first_action.median_seconds)} · ${data.fastest_first_action.count} students` : ''} />
          </div>

          {/* Distribution */}
          <h3 className="text-sm font-semibold text-slate-300 mb-2">TTFMP Distribution</h3>
          <div className="space-y-1.5 mb-6">
            {data.distribution.map((b, i) => {
              const maxCount = Math.max(...data.distribution.map(x => x.count), 1);
              const isNone = b.label.startsWith('No meaningful');
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-40 flex-shrink-0">{b.label}</span>
                  <div className="flex-1 bg-slate-800 rounded h-4 overflow-hidden">
                    <div className={`h-full rounded ${isNone ? 'bg-red-500/60' : 'bg-violet-500/70'}`} style={{ width: `${(b.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-slate-300 text-xs w-20 text-right flex-shrink-0">{b.count} · {b.pct}%</span>
                </div>
              );
            })}
          </div>

          {/* First-action breakdown */}
          <h3 className="text-sm font-semibold text-slate-300 mb-2">First-Action Breakdown</h3>
          {data.breakdown.length === 0 ? (
            <p className="text-slate-500 text-xs mb-4">No converted students yet.</p>
          ) : (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 text-left border-b border-slate-800">
                    <th className="py-2 pr-4">First Action</th>
                    <th className="py-2 pr-4">Students</th>
                    <th className="py-2 pr-4">% of Converted</th>
                    <th className="py-2 pr-4">Median TTFMP</th>
                    <th className="py-2">% Under 10 Min</th>
                  </tr>
                </thead>
                <tbody>
                  {data.breakdown.map((b, i) => (
                    <tr key={i} className="border-b border-slate-800/50 text-slate-300">
                      <td className="py-2 pr-4 font-medium">{TYPE_LABELS[b.type] || b.type}</td>
                      <td className="py-2 pr-4">{b.count}</td>
                      <td className="py-2 pr-4">{b.pct_of_converted}%</td>
                      <td className={`py-2 pr-4 ${medianColor(b.median_seconds)}`}>{fmt(b.median_seconds)}</td>
                      <td className="py-2">{b.pct_under_10}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-slate-600 text-xs">
            {data.live_tracked} live-tracked · {data.backfilled} historically backfilled · schools with fewer than 10 students are hidden from cohort comparison for privacy
          </p>
        </>
      )}
    </section>
  );
}