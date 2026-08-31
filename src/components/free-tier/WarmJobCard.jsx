import { useState } from 'react';
import OutreachSideDrawer from './OutreachSideDrawer';

export default function WarmJobCard({ lead, onAddToPipeline, onSelect, user }) {
  const [imgError, setImgError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const company = lead.company || lead.companyName || '';
  const title = lead.role || lead.title || '';
  const logo = lead.companyLogo || `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const match = lead.networkWeight ?? lead.matchPercentage ?? null;
  const industry = lead.targetIndustry || lead.industry || '';
  const snippet = lead.jobDescription || lead.descriptionSnippet || lead.description || '';
  const industryAlumni = lead.parentCount ?? lead.networkData?.industryAlumniCount ?? 0;

  return (
    <>
      <div className="border border-purple-100 rounded-2xl bg-white shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between h-[360px]">
        <div>
          {/* Header */}
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
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-sm font-bold text-purple-400">
                  {company.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900 leading-tight">{company}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{title}</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 shrink-0">Warm</span>
          </div>

          {/* Industry match label */}
          <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mt-4">
            ☀️ WARM MATCH: {industry}
          </p>
          {snippet && <p className="text-xs text-gray-600 mt-2 line-clamp-3">{snippet}</p>}

          {/* Alumni insight */}
          <div className="mt-4 bg-purple-50/40 rounded-xl p-3 border border-purple-100/50 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-xs font-bold text-purple-900">
                {industryAlumni > 0
                  ? `${industryAlumni} UF Alum${industryAlumni !== 1 ? 's' : ''} work in${industry ? ` ${industry}` : ' this industry'}`
                  : `UF alumni in${industry ? ` ${industry}` : ' this industry'} unlock with CLIFF Pro`}
              </p>
              <p className="text-[10px] text-purple-700">Active channel — reach out for a direct intro</p>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          {match !== null && (
            <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full shrink-0">
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
              onClick={() => setDrawerOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition tracking-wide"
              style={{ minHeight: 'auto' }}
            >
              📩 Message an Alumni
            </button>
          </div>
        </div>
      </div>

      <OutreachSideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={lead}
        user={user}
      />
    </>
  );
}