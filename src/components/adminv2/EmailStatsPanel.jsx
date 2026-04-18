import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      <p className={`text-4xl font-extrabold ${color} mb-1`}>{value ?? '—'}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function EmailStatsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getSendGridStats', {});
      setData(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load email stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          Email Stats (Last 30 Days)
        </h2>
        {data && (
          <span className="text-slate-600 text-xs">
            {data.startDate} → {data.endDate}
          </span>
        )}
      </div>

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading SendGrid stats…</p>
        </div>
      )}

      {error && (
        <div className="bg-slate-900 border border-red-900 rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={load} className="mt-3 px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm">Retry</button>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            label="Emails Sent"
            value={data.totals.requests.toLocaleString()}
          />
          <StatCard
            label="Delivered"
            value={data.totals.delivered.toLocaleString()}
            sub={data.totals.requests > 0 ? `${Math.round((data.totals.delivered / data.totals.requests) * 100)}% delivery rate` : null}
          />
          <StatCard
            label="Open Rate"
            value={data.openRate !== null ? `${data.openRate}%` : '—'}
            sub={`${data.totals.unique_opens.toLocaleString()} unique opens`}
            color={data.openRate >= 20 ? 'text-green-400' : data.openRate >= 10 ? 'text-yellow-400' : 'text-white'}
          />
          <StatCard
            label="Click Rate"
            value={data.clickRate !== null ? `${data.clickRate}%` : '—'}
            sub={`${data.totals.unique_clicks.toLocaleString()} unique clicks`}
            color={data.clickRate >= 3 ? 'text-green-400' : 'text-white'}
          />
          <StatCard
            label="Bounces"
            value={data.totals.bounces.toLocaleString()}
            sub={data.bounceRate !== null ? `${data.bounceRate}% bounce rate` : null}
            color={data.bounceRate > 5 ? 'text-red-400' : 'text-white'}
          />
          <StatCard
            label="Unsubscribes"
            value={data.totals.unsubscribes.toLocaleString()}
          />
          <StatCard
            label="Spam Reports"
            value={data.totals.spam_reports.toLocaleString()}
            color={data.totals.spam_reports > 0 ? 'text-red-400' : 'text-slate-400'}
          />
        </div>
      )}
    </div>
  );
}