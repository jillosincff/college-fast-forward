import { useState } from 'react';

export default function ColdJobCard({ lead, onAddToPipeline, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const company = lead.company || lead.companyName || '';
  const title = lead.role || lead.title || '';
  const logo = lead.companyLogo || `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const snippet = lead.jobDescription || lead.descriptionSnippet || lead.snippet || '';

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
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm font-bold text-amber-500">
                {company.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">{company}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{title}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0">Target</span>
        </div>

        <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mt-4">
          ☀️ TARGETED MATCH — NO INSIDER YET
        </p>
        {snippet && <p className="text-xs text-gray-600 mt-2 line-clamp-3">{snippet}</p>}

        <div className="mt-4 bg-amber-50/60 rounded-xl p-3 border border-amber-100 flex items-center gap-2">
          <span className="text-lg">🛰️</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Insider Hunt Active</p>
            <p className="text-[10px] text-amber-700">CLiFF is scanning the deep web to find a connection at this company</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-50 flex gap-2">
        <button
          onClick={() => onAddToPipeline(lead)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-xs transition"
          style={{ minHeight: 'auto' }}
        >
          ➕ Add to Pipeline
        </button>
        <button
          onClick={() => onSelect(lead)}
          className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          style={{ minHeight: 'auto' }}
        >
          🛰️ Trigger Insider Hunt
        </button>
      </div>
    </div>
  );
}