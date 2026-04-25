export default function MessageStatsPanel({ data }) {
  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h2 className="text-lg font-bold text-white mb-4">Messages Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded p-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">This Week</p>
          <p className="text-2xl font-bold text-white mt-1">{data.sentThisWeek}</p>
          <p className={`text-xs mt-1 ${data.sentDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.sentDelta >= 0 ? '+' : ''}{data.sentDelta} vs last week
          </p>
        </div>

        <div className="bg-slate-800 rounded p-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Last Week</p>
          <p className="text-2xl font-bold text-white mt-1">{data.sentLastWeek}</p>
        </div>

        <div className="bg-slate-800 rounded p-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Read Rate (30d)</p>
          <p className="text-2xl font-bold text-white mt-1">{data.readRate ?? 'N/A'}%</p>
          <p className="text-xs text-slate-500 mt-1">{data.read30} of {data.sent30} read</p>
        </div>
      </div>
    </div>
  );
}