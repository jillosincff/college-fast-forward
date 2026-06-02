import { useState } from 'react';

const MASCOT = { UF: '🐊', FSU: '🏹', UCF: '⚔️', USF: '🐂', UGA: '🐾', OSU: '🌰', USC: '✌️', UCLA: '🐻', UMICH: '〽️', PSU: '🦁', TULANE: '🌊', UDEL: '🐓', UMD: '🐢' };

export default function DiscoveryJobCard({ lead, onAddToPipeline, onSelect, schoolAbbr, onDismiss }) {
  const [isScouting, setIsScouting] = useState(false);
  const [scoutDeployed, setScoutDeployed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;
  const school = schoolAbbr || lead.schoolAbbr || 'UF';
  const mascot = MASCOT[school] || '🎓';
  const insiderCount = (lead.alumniCount || 0) + (lead.parentCount || 0);
  const companyTier = lead?.companyTier || 1;
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || TIER_BADGE[1];



  const handleScoutDeployment = async () => {
    setIsScouting(true);
    try {
      if (onSelect) {
        await onSelect(lead);
      }
      setScoutDeployed(true);
      window.dispatchEvent(new CustomEvent('cff:refresh-feed'));
    } catch (error) {
      console.error('Scout failed:', error);
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between min-h-[380px] hover:border-gray-300 transition-all relative" data-component="DiscoveryJobCard-v2">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 leading-tight truncate max-w-[70%]">{lead.company}</h4>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-gray-500 transition text-sm leading-none"
              title="Not interested"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              ✕
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{lead.role}</p>
        
        {/* Job Description - Truncated Preview */}
        {(() => {
          const fullDesc = lead.jobDescription || lead.description || '';
          const LIMIT = 180;
          const isTruncated = fullDesc.length > LIMIT;
          const preview = isTruncated ? fullDesc.slice(0, LIMIT).trimEnd() + '…' : fullDesc;
          return (
            <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="leading-relaxed text-sm">
                {preview || "No description preview available."}
              </p>
              {isTruncated && (
                <button
                  onClick={() => setShowFullDesc(true)}
                  className="text-[11px] text-purple-600 font-bold hover:text-purple-700 mt-2 block underline cursor-pointer"
                >
                  Read Full Description →
                </button>
              )}
            </div>
          );
        })()}
        
        {/* Insider footer — dynamic CLiFF language */}
        <div className="mt-5 bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-2.5">
          <span className="text-base">🤖</span>
          <p className="text-xs font-bold text-gray-800">
            {insiderCount > 0
              ? `CLiFF found ${insiderCount} alumni who work here`
              : `CLiFF is scanning for insiders at ${lead.company}`}
          </p>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <button 
          onClick={() => onAddToPipeline && onAddToPipeline(lead)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          title="Save to Pipeline"
        >
          ➕
        </button>
        
        <button 
          onClick={handleScoutDeployment}
          disabled={isScouting || scoutDeployed}
          className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition tracking-wide uppercase flex-1 text-center cursor-pointer ${
            scoutDeployed
              ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
              : isScouting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isScouting ? 'Searching...' : scoutDeployed ? 'Search Initiated' : '🔍 Find an Insider'}
        </button>
      </div>

      {/* Simple Overlaid Full Description Modal */}
      {showFullDesc && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{lead.role}</h3>
                <p className="text-xs text-gray-500 font-medium">{lead.company} — Job Details</p>
              </div>
              <button 
                onClick={() => setShowFullDesc(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-xs text-gray-700 space-y-4 leading-relaxed whitespace-pre-line font-sans">
              {lead.fullDescription || lead.jobDescription || lead.description}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-end">
              <button 
                onClick={() => setShowFullDesc(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}