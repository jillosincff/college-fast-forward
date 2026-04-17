import React from 'react';

function Tile({ label, thisWeek, delta }) {
  const isUp = delta > 0;
  const isDown = delta < 0;
  const deltaColor = isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-slate-500';
  const arrow = isUp ? '↑' : isDown ? '↓' : '→';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-2">
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-5xl font-extrabold text-white">{thisWeek}</p>
      <p className={`text-sm font-semibold ${deltaColor}`}>
        {arrow} {Math.abs(delta)} vs last week
      </p>
    </div>
  );
}

export default function SignupTiles({ data }) {
  return (
    <div>
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">This Week — Signups</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="New Signups" thisWeek={data.total.thisWeek} delta={data.total.delta} />
        <Tile label="New Parents" thisWeek={data.parents.thisWeek} delta={data.parents.delta} />
        <Tile label="New Alumni" thisWeek={data.alumni.thisWeek} delta={data.alumni.delta} />
        <Tile label="New Students" thisWeek={data.students.thisWeek} delta={data.students.delta} />
      </div>
    </div>
  );
}