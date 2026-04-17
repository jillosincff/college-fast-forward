import React from 'react';

export default function NorthStarBanner({ data }) {
  const { thisWeek, lastWeek, delta } = data;
  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
      <p className="text-orange-100 text-sm font-semibold uppercase tracking-widest mb-2">North Star — Outreach This Week</p>
      <div className="flex items-end gap-6 flex-wrap">
        <span className="text-7xl font-extrabold leading-none">{thisWeek}</span>
        <div className="pb-2">
          <span className={`text-2xl font-bold ${isUp ? 'text-green-200' : isDown ? 'text-red-200' : 'text-orange-200'}`}>
            {isUp ? '↑' : isDown ? '↓' : '→'} {Math.abs(delta)} from last week ({lastWeek})
          </span>
          <p className="text-orange-200 text-sm mt-1">
            Outreach messages sent (status ≠ draft, sent_at within 7 days)
          </p>
        </div>
      </div>
    </div>
  );
}