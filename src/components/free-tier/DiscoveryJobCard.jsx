import { useState } from 'react';

export default function DiscoveryJobCard({ lead, onAddToPipeline, onSelect }) {
  const [isScouting, setIsScouting] = useState(false);
  const [scoutDeployed, setScoutDeployed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

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
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between min-h-[380px] hover:border-gray-300 transition-all relative">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 leading-tight truncate max-w-[70%]">{lead.company}</h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
            Discovery
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{lead.role}</p>
        
        {/* Job Snippet with View More Hook */}
        <div className="mt-4 text-xs text-gray-600 relative">
          <p className="line-clamp-3 leading-relaxed">
            {lead.jobDescription || lead.description || "No description preview available."}
          </p>
          <button 
            onClick={() => setShowFullDesc(true)}
            className="text-[11px] text-purple-600 font-bold hover:text-purple-700 mt-1 block underline cursor-pointer"
          >
            Read Full Description
          </button>
        </div>
        
        {/* Clean Passive Network Status Box */}
        <div className="mt-5 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2.5">
          <span className="text-base">{scoutDeployed ? '✅' : '🔒'}</span>
          <div>
            <p className="text-xs font-bold text-gray-800">
              {scoutDeployed ? 'Insider Search Active' : 'Direct Backdoor Unmapped'}
            </p>
            <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
              {scoutDeployed 
                ? 'CLiFF is actively querying your university network for a live path.'
                : 'Matches your profile. Click below to look for a verified connection.'}
            </p>
          </div>
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