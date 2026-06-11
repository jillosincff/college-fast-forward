import React from 'react';
import MetricTile from './MetricTile';

export default function GrowthSection({ growth }) {
  if (!growth) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">📈 Growth</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile label="Total Users" value={growth.totalUsers} sub={`${growth.students} students · ${growth.parents} parents`} />
        <MetricTile
          label="Signups This Week"
          value={growth.signupsThisWeek}
          delta={growth.signupsThisWeek - growth.signupsLastWeek}
        />
        <MetricTile
          label="New Students"
          value={growth.studentsThisWeek}
          delta={growth.studentsThisWeek - growth.studentsLastWeek}
        />
        <MetricTile
          label="New Parents"
          value={growth.parentsThisWeek}
          delta={growth.parentsThisWeek - growth.parentsLastWeek}
        />
      </div>
    </section>
  );
}