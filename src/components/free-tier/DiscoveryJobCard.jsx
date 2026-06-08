import { useState } from 'react';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';

const MASCOT = { UF: '🐊', FSU: '🏹', UCF: '⚔️', USF: '🐂', UGA: '🐾', OSU: '🌰', USC: '✌️', UCLA: '🐻', UMICH: '〽️', PSU: '🦁', TULANE: '🌊', UDEL: '🐓', UMD: '🐢' };

export default function DiscoveryJobCard({ lead, onAddToPipeline, onColdInroad, onSelect, schoolAbbr, onDismiss, isPinned }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [added, setAdded] = useState(false);

  // Alumni search state
  const [alumniSearched, setAlumniSearched] = useState(false);
  const [alumniSearching, setAlumniSearching] = useState(false);
  const [foundAlumni, setFoundAlumni] = useState(null); // null = not searched, [] = none found, [...] = results

  const school = schoolAbbr || lead.schoolAbbr || 'UF';
  const mascot = MASCOT[school] || '🎓';
  const companyTier = lead?.companyTier || 1;
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || TIER_BADGE[1];
  const jobDesc = lead.jobDescription || lead.description || lead.hiring_description || '';

  const handleAddToPipeline = () => {
    if (!onAddToPipeline) return;
    onAddToPipeline(lead);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleSearchAlumni = async () => {
    setAlumniSearching(true);
    try {
      const res = await scoutCompanyBackdoor({
        jobId: lead.company, // use company as jobId since we don't have a real jobId
        companyName: lead.company,
      });
      const data = res?.data || res;
      setFoundAlumni(data?.alumni || []);
      setAlumniSearched(true);
    } catch (err) {
      console.error('Alumni search failed:', err);
      setFoundAlumni([]);
      setAlumniSearched(true);
    } finally {
      setAlumniSearching(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between min-h-[380px] hover:border-gray-300 transition-all relative">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h4 className="font-extrabold text-gray-900 leading-tight text-base truncate" style={{ color: '#4f46e5' }}>{lead.company}</h4>
            <p className="text-sm text-slate-500 mt-0.5 font-normal truncate">{lead.role}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isPinned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                📌 Saved
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
            {!isPinned && (
              <button
                onClick={handleDismiss}
                className="text-gray-300 hover:text-gray-500 transition text-sm leading-none"
                title="Not interested"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
          {jobDesc ? (
            <>
              <p className="leading-relaxed text-sm">
                {jobDesc.length > 200 ? jobDesc.slice(0, 200).trimEnd() + '…' : jobDesc}
              </p>
              {jobDesc.length > 200 && (
                <button
                  onClick={() => setShowFullDesc(true)}
                  className="text-[11px] text-purple-600 font-bold hover:text-purple-700 mt-2 block underline cursor-pointer"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  Read Full Description →
                </button>
              )}
            </>
          ) : (
            <p className="leading-relaxed text-sm text-gray-400 italic">Tap "Generate Message" to learn more about this role.</p>
          )}
        </div>

        {/* Alumni Search Section */}
        <div className="mt-4">
          {!alumniSearched ? (
            <button
              onClick={handleSearchAlumni}
              disabled={alumniSearching}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-bold transition-colors"
              style={{ minHeight: 'auto', cursor: alumniSearching ? 'not-allowed' : 'pointer' }}
            >
              {alumniSearching ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Searching {school} alumni at {lead.company}…
                </>
              ) : (
                <>
                  {mascot} Search for {school} Alumni at {lead.company}
                </>
              )}
            </button>
          ) : foundAlumni && foundAlumni.length > 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-purple-800">{mascot} Found {foundAlumni.length} {school} alumni at {lead.company}!</p>
              {foundAlumni.slice(0, 3).map((a, i) => (
                <a
                  key={i}
                  href={a.linkedin_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-white border border-purple-100 rounded-lg px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  style={{ minHeight: 'auto', textDecoration: 'none' }}
                >
                  {/* LinkedIn icon */}
                  <div className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-[10px]">in</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-700">{a.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{a.role_title || 'Professional'}</p>
                  </div>
                  <span className="text-[10px] text-blue-500 font-semibold shrink-0 group-hover:text-blue-700">View →</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">No {school} alumni found at {lead.company} yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="relative group">
          <button
            onClick={handleAddToPipeline}
            disabled={added}
            className={`p-2 border rounded-xl transition cursor-pointer ${added ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600'}`}
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            {added ? '✅' : '➕'}
          </button>
          {!added && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Add to Pipeline
            </div>
          )}
        </div>

        <button
          onClick={() => onColdInroad ? onColdInroad(lead) : (window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(lead.company)}&role=${encodeURIComponent(lead.role)}`)}
          className="px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition tracking-wide uppercase flex-1 text-center cursor-pointer text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', minHeight: 'auto' }}
        >
          ⚡ Generate Message
        </button>
      </div>

      {/* Full Description Modal */}
      {showFullDesc && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{lead.role}</h3>
                <p className="text-xs text-gray-500 font-medium">{lead.company} — Job Details</p>
              </div>
              <button
                onClick={() => setShowFullDesc(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-sm text-gray-700 space-y-3 leading-relaxed">
              {(jobDesc || '').split(/\n\n+|\n+/).filter(p => p.trim()).map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-end">
              <button
                onClick={() => setShowFullDesc(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}