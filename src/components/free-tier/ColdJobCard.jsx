import { useState } from 'react';

export default function ColdJobCard({ lead, onAddToPipeline, onSelect }) {
  const [isScouting, setIsScouting] = useState(false);
  const [scoutDeployed, setScoutDeployed] = useState(false);

  const company = lead?.company || lead?.companyName || 'Unknown Company';
  const role = lead?.role || lead?.title || 'Open Role';
  const snippet = lead?.jobDescription || lead?.description || '';
  const logoUrl = lead?.logoUrl || lead?.logo_url || null;
  
  // Debug logging
  console.log('[ColdJobCard] lead data:', lead);
  console.log('[ColdJobCard] snippet:', snippet);

  const handleScout = async () => {
    setIsScouting(true);
    try {
      // Call the backend function to scout for alumni
      const { scoutCompanyBackdoor } = await import('@/functions/scoutCompanyBackdoor');
      const result = await scoutCompanyBackdoor({
        jobId: lead.id || 'unknown',
        companyName: company
      });
      
      if (result.success) {
        setScoutDeployed(true);
        // Open the deep dive modal with the lead data
        if (onSelect) {
          onSelect({
            ...lead,
            company,
            role,
            jobDescription: snippet,
            alumCount: result.alumniCount || 0,
            parentCount: result.parentCount || 0,
            matchPct: result.matchScore || 85,
            logo: '🏢',
            jobSourceCategory: 'C',
            jobSource: 'Company Career Page',
            _members: result.alumni || []
          });
        }
      } else {
        console.error('Scout failed:', result.message);
        alert('⚠️ No insiders found at this company yet. Try another!');
      }
    } catch (error) {
      console.error('Scout error:', error);
      alert('❌ Scout failed. Please try again.');
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between min-h-[380px] hover:border-gray-300 transition-all relative" data-component="ColdJobCard-v2">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 leading-tight truncate max-w-[70%]">{company}</h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
            Discovery
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{role}</p>
        
        {/* Job Description - Full Visible Text */}
        <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="leading-relaxed text-sm">
            {snippet || 'Matches your target role and industry profile.'}
          </p>
          {/* Debug info - visible only for testing */}
          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400 font-mono">
            <div>Has jobDescription: {lead.jobDescription ? '✅ YES' : '❌ NO'}</div>
            <div>Has description: {lead.description ? '✅ YES' : '❌ NO'}</div>
            <div>Has snippet: {lead.descriptionSnippet ? '✅ YES' : '❌ NO'}</div>
            <div>Snippet length: {snippet?.length || 0} chars</div>
          </div>
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
          onClick={handleScout}
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
    </div>
  );
}