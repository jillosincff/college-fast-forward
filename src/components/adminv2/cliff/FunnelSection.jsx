import React from 'react';
import MetricTile from './MetricTile';

const Stage = ({ label, value, pctOfPrev }) => (
  <div className="flex-1 min-w-[100px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{label}</p>
    {pctOfPrev !== null && <p className="text-xs text-orange-400 mt-1">{pctOfPrev}%</p>}
  </div>
);

export default function FunnelSection({ funnel, activation }) {
  if (!funnel) return null;
  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null);
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">🎯 Outreach Funnel (All Time)</h2>
      <div className="flex gap-2 items-stretch overflow-x-auto pb-2 scrollbar-hide">
        <Stage label="Contacts Identified" value={funnel.identified} pctOfPrev={null} />
        <Stage label="Reached Out" value={funnel.reachedOut} pctOfPrev={pct(funnel.reachedOut, funnel.identified)} />
        <Stage label="Replied" value={funnel.replied} pctOfPrev={pct(funnel.replied, funnel.reachedOut)} />
        <Stage label="Interviews" value={funnel.interviews} pctOfPrev={pct(funnel.interviews, funnel.replied)} />
        <Stage label="Offers" value={funnel.offers} pctOfPrev={pct(funnel.offers, funnel.interviews)} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
        <MetricTile
          label="Reply Rate (30d)"
          value={funnel.replyRate30 !== null ? `${funnel.replyRate30}%` : '—'}
          accent="text-orange-400"
        />
        <MetricTile
          label="Outreach This Week"
          value={funnel.outreachThisWeek}
          delta={funnel.outreachThisWeek - funnel.outreachLastWeek}
        />
        {activation && (
          <>
            <MetricTile
              label="Student Activation"
              value={activation.activationPct !== null ? `${activation.activationPct}%` : '—'}
              sub={`${activation.studentsWithPipeline} of ${activation.totalStudents} have a pipeline`}
              accent="text-orange-400"
            />
            <MetricTile
              label="Students Reached Out"
              value={activation.studentsWhoReachedOut}
              sub="sent ≥1 outreach"
            />
            <MetricTile
              label="Weekly Active Students"
              value={activation.weeklyActiveStudents ?? '—'}
              sub="any activity in last 7 days"
              accent="text-green-400"
            />
          </>
        )}
      </div>
    </section>
  );
}