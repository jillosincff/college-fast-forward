import React from 'react';
import MetricTile from './MetricTile';

export default function AlumniDbSection({ alumniDb, schools }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">🎓 Alumni Database & Schools</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricTile label="Alumni Discovered" value={alumniDb?.total} />
        <MetricTile label="Verified" value={alumniDb?.verified} accent="text-green-400" />
        <MetricTile label="Unresolved Search Misses" value={alumniDb?.unresolvedMisses} sub="seeding priority" accent="text-red-400" />
      </div>
      {schools?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                <th className="text-left p-3">School</th>
                <th className="text-right p-3">Students</th>
                <th className="text-right p-3">Parents</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">New (7d)</th>
              </tr>
            </thead>
            <tbody>
              {schools.map(s => (
                <tr key={s.code} className="border-b border-slate-800/50 last:border-0">
                  <td className="p-3 text-slate-200 font-medium uppercase">{s.code}</td>
                  <td className="p-3 text-right text-slate-400">{s.students}</td>
                  <td className="p-3 text-right text-slate-400">{s.parents}</td>
                  <td className="p-3 text-right text-white font-semibold">{s.total}</td>
                  <td className="p-3 text-right text-green-400">{s.newThisWeek > 0 ? `+${s.newThisWeek}` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}