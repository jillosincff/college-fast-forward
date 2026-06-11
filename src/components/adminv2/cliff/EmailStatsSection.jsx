import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MetricTile from './MetricTile';

export default function EmailStatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getSendGridStats', {})
      .then(res => setStats(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">📧 Email Performance (Last 30 Days)</h2>
      {loading && <p className="text-xs text-slate-500">Loading SendGrid stats…</p>}
      {error && <p className="text-xs text-red-400">Failed to load email stats: {error}</p>}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricTile
            label="Open Rate"
            value={stats.openRate !== null ? `${stats.openRate}%` : '—'}
            sub={`${stats.totals.unique_opens} unique opens`}
            accent="text-orange-400"
          />
          <MetricTile
            label="Click Rate"
            value={stats.clickRate !== null ? `${stats.clickRate}%` : '—'}
            sub={`${stats.totals.unique_clicks} unique clicks`}
            accent="text-orange-400"
          />
          <MetricTile
            label="Delivered"
            value={stats.totals.delivered}
            sub={`of ${stats.totals.requests} sent`}
          />
          <MetricTile
            label="Bounce Rate"
            value={stats.bounceRate !== null ? `${stats.bounceRate}%` : '—'}
            sub={`${stats.totals.bounces} bounces`}
            accent={stats.bounceRate > 5 ? 'text-red-400' : 'text-white'}
          />
          <MetricTile
            label="Unsubscribes"
            value={stats.totals.unsubscribes}
            sub={`${stats.totals.spam_reports} spam reports`}
            accent={stats.totals.spam_reports > 0 ? 'text-red-400' : 'text-white'}
          />
        </div>
      )}
    </section>
  );
}