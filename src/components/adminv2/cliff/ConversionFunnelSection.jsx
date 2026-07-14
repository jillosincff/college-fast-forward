import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const MIN_COHORT = 5;

// Admin: the CLIFF Conversion Engine funnel — signup → Magic Moment → Pro.
export default function ConversionFunnelSection() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getConversionFunnel', {})
      .then(res => setData(res?.data || res))
      .catch(e => setError(e.message || 'Failed to load'));
  }, []);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Conversion Engine Funnel</h2>
          <p className="text-slate-500 text-xs mt-0.5">Free → Magic Moment → Reflection → Pro</p>
        </div>
        {data?.mmToProRate !== null && data?.mmToProRate !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400">{data.mmToProRate}%</p>
            <p className="text-slate-500 text-[11px]">Magic Moment → Pro</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!data && !error && <p className="text-slate-500 text-sm">Loading…</p>}

      {data && (
        <>
          {/* Funnel steps with step-over-step conversion */}
          <div className="space-y-1.5 mb-6">
            {data.funnel.map((s, i) => {
              const max = data.funnel[0]?.count || 1;
              const width = Math.max(3, Math.round((s.count / max) * 100));
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-52 shrink-0 truncate">{i + 1}. {s.label}</span>
                  <div className="flex-1 bg-slate-800 rounded h-5 overflow-hidden">
                    <div className="h-5 bg-violet-600/70 rounded" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-white text-xs font-bold w-12 text-right">{s.count}</span>
                  <span className={`text-[11px] w-12 text-right ${s.rate !== null && s.rate < 30 ? 'text-red-400' : 'text-slate-500'}`}>
                    {s.rate !== null ? `${s.rate}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversion by trigger */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-300 text-xs font-bold mb-2">By Trigger (CTA clicks / shown)</p>
              {Object.keys(data.byTrigger || {}).length === 0 && <p className="text-slate-600 text-xs">No trigger data yet</p>}
              {Object.entries(data.byTrigger || {}).map(([t, v]) => (
                <div key={t} className="flex justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400 truncate">{t}</span>
                  <span className="text-white font-semibold shrink-0 ml-2">{v.cta_clicked}/{v.shown}</span>
                </div>
              ))}
            </div>

            {/* Prompt fatigue */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-300 text-xs font-bold mb-2">Prompt Health</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Prompts shown</span><span className="text-white font-semibold">{data.prompts.totalShown}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Dismissed</span><span className="text-white font-semibold">{data.prompts.totalDismissed}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Dismissal rate</span><span className="text-white font-semibold">{data.prompts.dismissalRate !== null ? `${data.prompts.dismissalRate}%` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Currently suppressed (7d)</span><span className="text-white font-semibold">{data.prompts.suppressedNow}</span></div>
              </div>
            </div>

            {/* Segments — minimum cohort size enforced */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-300 text-xs font-bold mb-2">CTA Clicks by Segment</p>
              {[['School', data.bySchool], ['Device', data.byDevice]].map(([label, seg]) => (
                <div key={label} className="mb-2">
                  <p className="text-slate-500 text-[11px] mb-0.5">{label}</p>
                  {Object.entries(seg || {}).filter(([, n]) => n >= MIN_COHORT).length === 0
                    ? <p className="text-slate-600 text-xs">Cohorts under {MIN_COHORT} hidden</p>
                    : Object.entries(seg || {}).filter(([, n]) => n >= MIN_COHORT).map(([k, n]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-400">{k}</span>
                        <span className="text-white font-semibold">{n}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}