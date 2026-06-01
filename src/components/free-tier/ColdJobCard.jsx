import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function ColdJobCard({ lead, onAddToPipeline, onSelect, onDismiss }) {
  const [isScouting, setIsScouting] = useState(false);
  const [scoutDeployed, setScoutDeployed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const company = lead?.company || lead?.companyName || 'Unknown Company';
  const role = lead?.role || lead?.title || 'Open Role';
  const snippet = lead?.jobDescription || lead?.description || '';
  const companyTier = lead?.companyTier || 1;
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || TIER_BADGE[1];
  const logoUrl = lead?.logoUrl || lead?.logo_url || null;
  
  // Debug logging


  const handleScout = async () => {
    setIsScouting(true);
    try {
      // Call the backend function to scout for alumni
      const result = await base44.functions.invoke('scoutCompanyBackdoor', {
        jobId: lead.id || 'unknown',
        companyName: company
      });
      
      console.log('[ColdJobCard] Scout result:', result.data);
      if (result.data?.success) {
        setScoutDeployed(true);
        // Only open modal if insiders were actually found
        if (result.data.insiderFound && onSelect && result.data.alumni && result.data.alumni.length > 0) {
          console.log('[ColdJobCard] Opening modal with', result.data.alumni.length, 'alumni');
          onSelect({
            ...lead,
            company,
            role,
            jobDescription: snippet,
            alumCount: result.data.connectionsCount || 0,
            parentCount: 0,
            matchPct: result.data.matchScore || 85,
            logo: '🏢',
            jobSourceCategory: 'C',
            jobSource: 'Company Career Page',
            _members: (result.data.alumni || []).map(a => ({
              ...a,
              persona: 'alumni',
              full_name: a.name,
              title: a.role_title,
              linkedin_url: a.linkedin_url
            }))
          });
        } else if (!result.data.insiderFound) {
          // No insiders found - just show the updated status
          console.log('No insiders found yet - scout deployed for background search');
        } else if (result.data.alumni?.length === 0) {
          console.log('Scout succeeded but no alumni returned');
        }
      } else {
        console.error('Scout failed:', result.data?.message);
        alert('⚠️ Scout failed. Please try again.');
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
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-300 hover:text-gray-500 transition text-sm leading-none"
              title="Not interested"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              ✕
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{role}</p>
        
        {/* Job Description - Truncated to 3 lines with Read More */}
        <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="leading-relaxed text-sm line-clamp-3">
            {snippet || 'Matches your target role and industry profile.'}
          </p>
          <button 
            onClick={() => onSelect(lead)}
            className="text-purple-600 font-bold hover:text-purple-700 mt-1 block text-xs underline cursor-pointer"
          >
            Read More
          </button>
        </div>
        
        {/* Network status — 3-tier priority signal */}
        {(lead.alumniCount || 0) + (lead.parentCount || 0) > 0 ? (
          <div className="mt-5 bg-orange-50 rounded-xl p-3 border border-orange-200 flex items-center gap-2.5">
            <span className="text-base">🐊</span>
            <div>
              <p className="text-xs font-bold text-orange-900">
                {(lead.alumniCount || 0) + (lead.parentCount || 0)} Insiders Ready
              </p>
              <p className="text-[10px] text-orange-700 mt-0.5">
                Alumni &amp; parents verified at {company}.
              </p>
            </div>
          </div>
        ) : lead.hasSectorParents ? (
          <div className="mt-5 bg-blue-50 rounded-xl p-3 border border-blue-200 flex items-center gap-2.5">
            <span className="text-base">💼</span>
            <div>
              <p className="text-xs font-bold text-blue-900">Parent Network Connected</p>
              <p className="text-[10px] text-blue-700 mt-0.5">
                Verified parent contacts active in this sector.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-2.5">
            <span className="text-base">🤖</span>
            <div>
              <p className="text-xs font-bold text-gray-800">
                {(lead.alumniCount || 0) > 0
                  ? `CLiFF found ${lead.alumniCount} alumni who work here`
                  : (lead.parentCount || 0) > 0
                  ? `CLiFF found ${lead.parentCount} parent connections here`
                  : `CLiFF is scanning for insiders at ${company}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <button 
          onClick={() => onAddToPipeline && onAddToPipeline(lead)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          title="Add to Pipeline"
        >
          ➕
        </button>
        
        <button 
          onClick={handleScout}
          disabled={isScouting || scoutDeployed}
          className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition tracking-wide uppercase flex-1 text-center cursor-pointer ${
            scoutDeployed
              ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
              : isScouting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isScouting ? 'Searching...' : scoutDeployed ? '✅ Monitoring' : '🔍 Find an Insider'}
        </button>
      </div>
    </div>
  );
}