import React from 'react';

function MetricBlock({ label, value, sub, note }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-4xl font-extrabold text-white mb-1">{value}</p>
      {sub && <p className="text-slate-400 text-sm">{sub}</p>}
      {note && <p className="text-slate-600 text-xs mt-2">{note}</p>}
    </div>
  );
}

export default function EngagementPanel({ data }) {
  const {
    sentThisWeek, sentLastWeek, sentDelta,
    responseRate, replied30, sent30,
    totalHelpers, uniqueContacted, helpersContactedPct,
  } = data;

  const deltaColor = sentDelta > 0 ? 'text-green-400' : sentDelta < 0 ? 'text-red-400' : 'text-slate-500';
  const arrow = sentDelta > 0 ? '↑' : sentDelta < 0 ? '↓' : '→';

  return (
    <div>
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Network Engagement</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBlock
          label="Outreach Sent This Week"
          value={sentThisWeek}
          sub={<span className={deltaColor}>{arrow} {Math.abs(sentDelta)} vs last week ({sentLastWeek})</span>}
          note="OutreachDraft where status ≠ draft, sent_at within 7 days"
        />
        <MetricBlock
          label="Response Rate (30 days)"
          value={responseRate !== null ? `${responseRate}%` : 'TBD'}
          sub={responseRate !== null ? `${replied30} replied of ${sent30} sent` : 'No sent outreach yet'}
          note="% of sent messages with status='replied' or replied_date set"
        />
        <MetricBlock
          label="Helpers Contacted This Month"
          value={helpersContactedPct !== null ? `${helpersContactedPct}%` : 'TBD'}
          sub={helpersContactedPct !== null ? `${uniqueContacted} of ${totalHelpers} helpers` : 'Instrumentation needed'}
          note="Parents + alumni who received ≥1 message in last 30 days"
        />
      </div>
    </div>
  );
}