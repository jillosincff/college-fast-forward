import { useState } from 'react';

export default function ColdJobCard({ lead, onAddToPipeline, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const company = lead.company || lead.companyName || '';
  const title = lead.role || lead.title || '';
  const logo = lead.companyLogo || `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const match = lead.networkWeight ?? lead.matchPercentage ?? null;
  const source = lead.jobSource || lead.sourcePlatform || lead.source || 'Niche Board';
  const snippet = lead.jobDescription || lead.descriptionSnippet || lead.snippet || '';

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between h-[360px]">
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
              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
                {company.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">{company}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{title}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">Cold</span>
        </div>

        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-4">
          ❄️ HIDDEN BOARD DISCOVERY: {source}
        </p>
        {snippet && <p className="text-xs text-gray-600 mt-2 line-clamp-3">{snippet}</p>}

        <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2">
          <span className="text-lg">🛰️</span>
          <div>
            <p className="text-xs font-bold text-gray-700">Open Public Portal Opening</p>
            <p className="text-[10px] text-gray-500">Front door entry — CLiFF is running connection scans 24/7</p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
        {match !== null && (
          <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
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
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            style={{ minHeight: 'auto' }}
          >
            View & Hunt Insiders
          </button>
        </div>
      </div>
    </div>
  );
}