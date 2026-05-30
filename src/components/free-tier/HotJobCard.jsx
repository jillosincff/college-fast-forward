import { useState } from 'react';

export default function HotJobCard({ lead, onAddToPipeline, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const company = lead.company || lead.companyName || '';
  const title = lead.role || lead.title || '';
  const logo = lead.companyLogo || `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const match = lead.networkWeight ?? lead.matchPercentage ?? null;
  const snippet = lead.jobDescription || lead.descriptionSnippet || lead.description || '';
  const alumniCount = lead.alumniCount ?? 0;
  const parentCount = lead.parentCount ?? 0;
  const insiderBadge = lead.insiderBadge || (alumniCount > 0 ? `${alumniCount} Alumni Work Here` : `${parentCount} Parent Insider`);
  const isAlumniLed = lead.ctaType === 'message_alumni' || alumniCount > 0;

  return (
    <div className="border border-orange-100 rounded-2xl bg-white shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between h-[360px]">
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
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-bold text-orange-400">
                {company.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">{company}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{title}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 shrink-0">Insider</span>
        </div>

        <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mt-4">
          🔥 VERIFIED INSIDER AT THIS COMPANY
        </p>
        {snippet && <p className="text-xs text-gray-600 mt-2 line-clamp-3">{snippet}</p>}

        <div className="mt-4 bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 flex items-center gap-2">
          <span className="text-lg">{isAlumniLed ? '🎓' : '💡'}</span>
          <div>
            <p className="text-xs font-bold text-orange-900">{insiderBadge}</p>
            <p className="text-[10px] text-orange-700">
              {isAlumniLed ? 'Skip the portal — get a direct alumni intro' : 'Parent advisor has inside knowledge here'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
        {match !== null && (
          <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full shrink-0">
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
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            style={{ minHeight: 'auto' }}
          >
            {isAlumniLed ? '📩 Message an Alumni' : '💡 Connect via Parent Insider'}
          </button>
        </div>
      </div>
    </div>
  );
}