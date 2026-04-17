import React, { useState } from 'react';

const COLS = [
  { key: 'name',       label: 'School' },
  { key: 'parents',    label: 'Parents' },
  { key: 'alumni',     label: 'Alumni' },
  { key: 'students',   label: 'Students' },
  { key: 'total',      label: 'Total' },
  { key: 'newThisWeek',label: 'New This Week' },
  { key: 'pct',        label: '% of Network' },
];

export default function SchoolTable({ schools, grandTotal }) {
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  const toggle = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...schools].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest">School Breakdown</h2>
        <span className="text-slate-500 text-xs">{grandTotal} total users across {schools.length} schools</span>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {COLS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggle(col.key)}
                    className="px-4 py-3 text-left text-slate-400 font-semibold cursor-pointer hover:text-white select-none whitespace-nowrap"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="ml-1 text-orange-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.code} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                  <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-3 text-slate-300">{s.parents}</td>
                  <td className="px-4 py-3 text-slate-300">{s.alumni}</td>
                  <td className="px-4 py-3 text-slate-300">{s.students}</td>
                  <td className="px-4 py-3 font-bold text-white">{s.total}</td>
                  <td className="px-4 py-3">
                    {s.newThisWeek > 0
                      ? <span className="text-green-400 font-semibold">+{s.newThisWeek}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min(s.pct, 100)}%` }} />
                      </div>
                      <span className="text-slate-400 text-xs">{s.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}