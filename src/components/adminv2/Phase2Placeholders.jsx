import React from 'react';

const items = [
  { label: 'MRR', note: 'Requires Stripe subscription sync' },
  { label: 'Active FastIQ Subscribers', note: 'Requires subscription entity' },
  { label: 'Trials Active Now', note: 'Requires trial_end_date tracking' },
  { label: 'Trial → Paid Conversion Rate', note: 'Requires trial + payment event logging' },
];

export default function Phase2Placeholders() {
  return (
    <div>
      <h2 className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-4">Coming in Phase 2</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.label} className="bg-slate-900/40 border border-slate-800/50 border-dashed rounded-2xl p-5 opacity-50">
            <p className="text-slate-500 text-sm font-medium mb-2">{item.label}</p>
            <p className="text-slate-600 text-lg font-bold">Coming in Phase 2</p>
            <p className="text-slate-700 text-xs mt-2">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}