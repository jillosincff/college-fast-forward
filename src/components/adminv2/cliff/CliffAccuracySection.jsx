import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const FEEDBACK_LABELS = {
  resume_screen: 'Resume screen',
  gpa_requirement: 'GPA requirement',
  technical_interview: 'Technical interview',
  position_filled: 'Position filled',
  no_response: 'No response',
  other: 'Other',
};

const Tile = ({ label, value, sub }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold m-0">{label}</p>
    <p className="text-2xl font-bold text-white mt-1 mb-0">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1 mb-0">{sub}</p>}
  </div>
);

const fmt = (v) => (v === null || v === undefined ? '—' : `${v}%`);

// CLIFF Accuracy: is following CLIFF's recommendations actually paying off?
export default function CliffAccuracySection() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getRecommendationAccuracy', {})
      .then(res => setData(res.data))
      .catch(e => setError(e.message));
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white m-0">🎯 CLIFF Accuracy</h2>
        <p className="text-slate-500 text-xs mt-1 mb-0">Recommendation outcomes — the Learning Engine's report card.</p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!data && !error && <p className="text-slate-500 text-sm">Loading…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile label="Recommendations Graded" value={data.total_recommendations} />
            <Tile label="Adoption Rate (🔥 Best)" value={fmt(data.adoption_rate_best)} sub={`${data.by_level?.best?.pursued ?? 0} of ${data.by_level?.best?.total ?? 0} pursued`} />
            <Tile label="Applications" value={data.applied_total} />
            <Tile label="Interviews (Followed)" value={data.followed?.interviews ?? 0} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-sm font-bold text-emerald-400 m-0">Recommendations students followed</p>
              <p className="text-xs text-slate-400 mt-2 mb-0">Interview rate: <span className="text-white font-bold">{fmt(data.followed?.interview_rate)}</span> · Offer rate: <span className="text-white font-bold">{fmt(data.followed?.offer_rate)}</span> · n={data.followed?.total}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-sm font-bold text-slate-400 m-0">Recommendations students ignored</p>
              <p className="text-xs text-slate-400 mt-2 mb-0">Interview rate: <span className="text-white font-bold">{fmt(data.ignored?.interview_rate)}</span> · Offer rate: <span className="text-white font-bold">{fmt(data.ignored?.offer_rate)}</span> · n={data.ignored?.total}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['best', 'good', 'low'].map(level => {
              const b = data.by_level?.[level] || {};
              const icon = level === 'best' ? '🔥' : level === 'good' ? '⭐' : '⚪';
              return (
                <div key={level} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-white m-0">{icon} {level.toUpperCase()}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 mb-0 leading-relaxed">
                    {b.total ?? 0} shown · {fmt(b.adoption_rate)} adopted<br />
                    {fmt(b.interview_rate)} interview · {fmt(b.offer_rate)} offer
                  </p>
                </div>
              );
            })}
          </div>

          {data.feedback_breakdown && Object.keys(data.feedback_breakdown).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-sm font-bold text-white m-0 mb-2">"What happened?" — student feedback</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.feedback_breakdown).map(([k, v]) => (
                  <span key={k} className="text-[11px] font-semibold text-slate-300 bg-slate-800 rounded-full px-3 py-1">
                    {FEEDBACK_LABELS[k] || k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}