import { useState } from 'react';

export default function ColdJobCard({ lead, onAddToPipeline, onSelect }) {
  const [isScouting, setIsScouting] = useState(false);
  const [scoutDeployed, setScoutDeployed] = useState(false);

  const company = lead?.company || lead?.companyName || 'Unknown Company';
  const role = lead?.role || lead?.title || 'Open Role';
  const snippet = lead?.jobDescription || lead?.descriptionSnippet || lead?.description || '';
  const logoUrl = lead?.logoUrl || lead?.logo_url || null;

  const handleScout = async () => {
    setIsScouting(true);
    // Simulate async backend call — in production wire to a real scout endpoint
    await new Promise(r => setTimeout(r, 1800));
    setIsScouting(false);
    setScoutDeployed(true);
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between h-[360px] hover:border-gray-300 transition-all">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={company}
                className="w-8 h-8 rounded-lg object-contain border border-gray-100 shrink-0"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                {company[0]}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">{company}</h4>
              <p className="text-xs text-gray-500 font-medium truncate">{role}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wide shrink-0">
            🛰️ Discovery
          </span>
        </div>

        {/* Snippet */}
        <p className="text-xs text-gray-600 mt-4 line-clamp-3 leading-relaxed">
          {snippet || 'Matches your target role and industry profile.'}
        </p>

        {/* Passive / Active Network Status Box */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
          <span className="text-base mt-0.5">{scoutDeployed ? '✅' : '🔒'}</span>
          <div>
            <p className="text-xs font-bold text-gray-800">
              {scoutDeployed ? 'Backdoor Scan Dispatched' : 'Direct Backdoor Unmapped'}
            </p>
            <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
              {scoutDeployed
                ? 'CLiFF is pulling unindexed alumni & parent networks for this company.'
                : 'Matches your career profile. Tap below to have CLiFF hunt for an insider connection.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onAddToPipeline && onAddToPipeline(lead)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition shrink-0"
          title="Save to Pipeline"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          ➕
        </button>

        <button
          onClick={handleScout}
          disabled={isScouting || scoutDeployed}
          className={`flex-1 py-2 font-bold text-xs rounded-xl shadow-sm transition tracking-wide uppercase text-center ${
            scoutDeployed
              ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
              : isScouting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          style={{ minHeight: 'auto' }}
        >
          {isScouting ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin inline-block" />
              Scouting Network...
            </span>
          ) : scoutDeployed ? (
            'Scan Triggered ✓'
          ) : (
            'Scout Backdoor Channels'
          )}
        </button>
      </div>
    </div>
  );
}