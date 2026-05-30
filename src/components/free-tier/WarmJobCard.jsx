import { useState } from 'react';

export default function WarmJobCard({ lead, onAddToPipeline, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const company = lead.companyName || lead.company || '';
  const title = lead.title || lead.role || '';
  const logo = lead.companyLogo || `https://logo.clearbit.com/${company.toLowerCase().replace(/\s+/g, '')}.com`;
  const match = lead.matchPercentage ?? lead.match ?? null;
  const source = lead.sourcePlatform || lead.source || 'Niche Board';
  const industry = lead.industry || lead.targetIndustry || '';
  const snippet = lead.descriptionSnippet || lead.description || '';
  const industryAlumni = lead.networkData?.industryAlumniCount ?? lead.parentCount ?? lead.alumniCount ?? 0;

  return (
    <div className="border border-amber-100 rounded-2xl bg-white shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between h-[360px]">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            {!imgError ? (
              <img
                src={logo}
                alt={company}
                onError={() => setImgError(true)}
                className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm font-bold text-amber-400">
                {company.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">{company}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{title}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0">Warm</span>
        </div>

        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mt-4">
          ☀️ MATCH VIA SPECIALIZED BOARD: {source}
        </p>
        {snippet && <p className="text-xs text-gray-600 mt-2 line-clamp-3">{snippet}</p>}

        <div className="mt-4 bg-amber-50/40 rounded-xl p-3 border border-amber-100/50 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-bold text-amber-900">{industryAlumni} alumni work in {industry}</p>
            <p className="text-[10px] text-amber-700">Request strategy & portfolio advice from industry insiders</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
        {match !== null && (
          <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
            ⚡ {match}% match
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => onAddToPipeline(lead)}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition"
            title="Add to Pipeline"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            ➕
          </button>
          <button
            onClick={() => onSelect(lead)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            style={{ minHeight: 'auto' }}
          >
            Request Industry Insight
          </button>
        </div>
      </div>
    </div>
  );
}