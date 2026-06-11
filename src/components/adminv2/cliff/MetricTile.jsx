import React from 'react';

export default function MetricTile({ label, value, sub, delta, accent = 'text-white' }) {
  const deltaColor = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-500';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value ?? '—'}</p>
      <div className="flex items-center gap-2 mt-1">
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
        {typeof delta === 'number' && (
          <span className={`text-xs font-medium ${deltaColor}`}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)} vs last wk
          </span>
        )}
      </div>
    </div>
  );
}