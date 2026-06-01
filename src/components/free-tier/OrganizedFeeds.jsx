import { useState } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import HotJobCard from './HotJobCard';
import ColdJobCard from './ColdJobCard';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function OrganizedFeeds({ user }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'Your School';
  const schoolEmoji = schoolAbbr === 'UF' ? '🐊' : '🎓';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';

  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['organizedFeeds', target_industries, effectiveRole],
    queryFn: () => getPersonalizedNetworkCarousel({
      target_industries: target_industries || [],
      target_role: effectiveRole,
    }),
  });

  const payload = feedsData?.data || feedsData;
  const priorityInsiders    = Array.isArray(payload?.priorityInsiders)    ? payload.priorityInsiders    : [];
  const targetedDiscoveries = Array.isArray(payload?.targetedDiscoveries) ? payload.targetedDiscoveries : [];
  const totalCount = priorityInsiders.length + targetedDiscoveries.length;

  const handleAddToPipeline = async (lead) => {
    try {
      // Create an OpportunityApplication to track this in the pipeline
      await base44.entities.OpportunityApplication.create({
        opportunity_id: `external_${Date.now()}`,
        applicant_id: user?.id || 'unknown',
        method: 'external',
        note: `Added from feed: ${lead.role || lead.title} at ${lead.company || lead.companyName}`,
        opportunity_title: lead.role || lead.title,
        opportunity_company: lead.company || lead.companyName,
        opportunity_type: 'job',
        status: 'applied',
      });
      alert('✅ Added to your pipeline! Check the Opportunities column.');
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
      alert('❌ Failed to add to pipeline. Please try again.');
    }
  };

  // No goals set — show a nudge inline (not a blocking full-page empty state)
  const noGoals = !target_industries?.length && !effectiveRole;

  // Network stats — computed live from real feed data
  const totalVerifiedInsiders = priorityInsiders.reduce(
    (sum, l) => sum + (l.alumniCount || 0) + (l.parentCount || 0), 0
  );
  const networkStats = {
    targetCompanies: priorityInsiders.length + targetedDiscoveries.length,
    verifiedContacts: totalVerifiedInsiders,
    warmOpenings: targetedDiscoveries.length,
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* Dynamic Hero Header */}
      <div className="space-y-4">
        {/* Title Group */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">CLiFF's Live Target Matches</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">Your personalized feed of{' '}
            <span className="font-bold text-purple-600">{isLoading ? '...' : totalCount}</span> hand-picked opportunities
          </p>
        </div>

        {/* Network Intelligence Panel - Only show when priority tracks is 0 */}
        {priorityInsiders.length === 0 && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                🔮 CLiFF Network Intelligence Active
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Updated live</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-4 text-center md:text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Ecosystem</p>
                <p className="text-lg font-black text-gray-800 mt-1">{networkStats.targetCompanies} Companies</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Under active automation tracking</p>
              </div>
              
              <div className="p-4 text-center md:text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leverage Points</p>
                <p className="text-lg font-black text-gray-800 mt-1">{networkStats.verifiedContacts} Verified Insiders</p>
                <p className="text-[11px] text-purple-600 font-semibold mt-0.5">{schoolEmoji} {schoolAbbr} Network connections ready</p>
              </div>

              <div className="p-4 text-center md:text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opportunity Pipeline</p>
                <p className="text-lg font-black text-orange-600 mt-1">{networkStats.warmOpenings} Fresh Opportunities</p>
                <p className="text-[11px] text-gray-500 mt-0.5">High-match roles found on company websites</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No goals nudge — inline, non-blocking */}
      {noGoals && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-blue-900">🎯 Add your career goals for a personalized feed</p>
            <p className="text-xs text-blue-700 mt-1">CLiFF will surface Company Insiders and Targeted Hidden Leads based on your target roles and industries.</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('cff:open-goals-modal'))}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors shrink-0"
            style={{ minHeight: 'auto', cursor: 'pointer' }}
          >
            Set Goals →
          </button>
        </div>
      )}

      {/* ── PRIORITY 1: DIRECT NETWORK LEVERAGE ─────────────────────── */}
      {priorityInsiders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Priority Insider Tracks ({priorityInsiders.length})
              </h3>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Foot-In-The-Door Active
              </span>
            </div>
            <span className="text-xs text-gray-400 font-medium hidden sm:block">Verified current company insiders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {priorityInsiders.map((lead, idx) => (
              <HotJobCard key={idx} lead={lead} onAddToPipeline={handleAddToPipeline} onSelect={setSelectedLead} schoolAbbr={schoolAbbr} />
            ))}
          </div>
        </section>
      )}

      {/* ── PRIORITY 2: TARGET DISCOVERIES (HUNT ACTIVE) ────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Target-Matched Discoveries ({isLoading ? '…' : targetedDiscoveries.length})
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Scouting Connections
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:block">High-match roles found on company websites</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : targetedDiscoveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {targetedDiscoveries.map((lead, idx) => (
              <ColdJobCard key={idx} lead={lead} onAddToPipeline={handleAddToPipeline} onSelect={setSelectedLead} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            No matching industry vacancies found today. Adjust your target positions to broaden search.
          </div>
        )}
      </section>

      {selectedLead && (
        <MatchDeepDiveModal
          match={selectedLead}
          shortName={schoolAbbr}
          onClose={() => setSelectedLead(null)}
          onGenerateOutreach={(data) => {
            console.log('Generating outreach:', data);
          }}
          onInitiateOutreach={({ contact, company, role, tab }) => {
            // Navigate to OutreachDrafts with pre-populated contact details
            window.location.hash = `#OutreachDrafts?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}&contact=${encodeURIComponent(contact.name)}&tab=${tab}`;
          }}
          user={user}
        />
      )}
    </div>
  );
}