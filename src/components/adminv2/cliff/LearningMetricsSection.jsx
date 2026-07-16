import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MetricTile from './MetricTile';

const fmtPct = (v) => (v === null || v === undefined ? '—' : `${v}%`);
const fmtHours = (h) => {
  if (h === null || h === undefined) return '—';
  return h >= 48 ? `${Math.round((h / 24) * 10) / 10} days` : `${h} hrs`;
};

function TopList({ title, items, render }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">{title}</p>
      {(!items || items.length === 0) ? (
        <p className="text-xs text-slate-600">No data yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-300 capitalize truncate">{it.name}</span>
              <span className="text-xs text-slate-500 font-mono shrink-0">{render ? render(it) : it.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LearningMetricsSection() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getCliffLearningMetrics', {})
      .then(res => setData(res.data))
      .catch(e => setError(e.message || 'Failed to load'));
  }, []);

  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-1">🧠 Learning Metrics</h2>
      <p className="text-xs text-slate-500 mb-4">What real student behavior is teaching CLIFF</p>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!data && !error && <p className="text-slate-500 text-sm">Loading…</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricTile label="Signups Today" value={data.signups_today} sub={`${data.total_students} students total`} accent="text-orange-400" />
            <MetricTile label="Magic Moment" value={data.magic_moment?.total_students} sub={`${data.magic_moment?.today || 0} today`} accent="text-purple-400" />
            <MetricTile label="Onboarding Completed" value={data.onboarding?.completed_total} sub={`${data.onboarding?.completed_today || 0} today`} />
            <MetricTile label="Avg Time to First Progress" value={fmtHours(data.avg_ttfmp_hours)} sub={`n=${data.ttfmp_sample_size}`} accent="text-cyan-400" />
            <MetricTile label='"Still Exploring"' value={data.still_exploring?.count} sub={`of ${data.still_exploring?.of_plans} students with goals`} />
            <MetricTile label="Interview Rate" value={fmtPct(data.interview_rate?.pct)} sub={`${data.interview_rate?.interviews} of ${data.interview_rate?.applied} applied`} accent="text-green-400" />
            <MetricTile label="Offer Rate" value={fmtPct(data.offer_rate?.pct)} sub={`${data.offer_rate?.offers} offers`} accent="text-green-400" />
            <MetricTile label="Pro Conversion" value={fmtPct(data.pro_conversion?.pct)} sub={`${data.pro_conversion?.pro} Pro accounts`} accent="text-orange-400" />
            <MetricTile label="7-Day Retention" value={fmtPct(data.retention_7d?.pct)} sub={`${data.retention_7d?.retained} of ${data.retention_7d?.cohort} in cohort`} accent="text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TopList title="Most Common Career Goals" items={data.top_goals} />
            <TopList title="Most Common Locations" items={data.top_locations} />
            <TopList
              title="Best-Performing Recommendations"
              items={[
                ...(data.recommendations?.by_level || []).map(l => ({
                  name: `${l.level} tier`,
                  detail: `${l.pursued}/${l.shown} pursued · ${l.interview} interviews`,
                })),
                ...(data.recommendations?.top_companies || []).map(c => ({
                  name: c.name,
                  detail: `${c.pursued} pursued · ${c.interview} interviews`,
                })),
              ]}
              render={(it) => it.detail}
            />
          </div>
        </div>
      )}
    </section>
  );
}