import { useState, useEffect } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function OrganizedFeeds({ user }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const queryClient = useQueryClient();
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'Your School';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';

  // Refresh feed when pipeline changes
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    };
    window.addEventListener('cff:pipeline-changed', handler);
    return () => window.removeEventListener('cff:pipeline-changed', handler);
  }, [queryClient]);

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


  // UNIFIED feed — all cards merged
  const targetOpportunities = [...priorityInsiders, ...targetedDiscoveries];
  const totalCount = targetOpportunities.length;
  const uniqueCompaniesCount = new Set(targetOpportunities.map(l => l.company || l.companyName)).size;

  // Sum insider contacts directly from the active feed cards
  const totalNetworkCount = targetOpportunities.reduce((sum, l) => sum + (l.alumniCount || 0) + (l.parentCount || 0), 0);

  const handleAddToPipeline = async (lead) => {
    try {
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
      alert('✅ Added to your pipeline!');
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
    }
  };

  const noGoals = !target_industries?.length && !effectiveRole;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ── Global Sync Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
            🔵 Synced: University of Florida Alumni &amp; Parent Network
          </span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('cff:open-network-modal'))}
            className="text-[11px] text-blue-100 font-semibold hover:text-white transition"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            Tap to view →
          </button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Ecosystem</p>
            <p className="text-lg font-black text-gray-800 mt-1">{isLoading ? '—' : uniqueCompaniesCount} Companies</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Actively tracked</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Insiders</p>
            <p className="text-lg font-black text-purple-700 mt-1">{isLoading ? '—' : totalNetworkCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Alumni &amp; parent network</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opportunities</p>
            <p className="text-lg font-black text-orange-600 mt-1">{isLoading ? '—' : totalCount} Fresh</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Hand-picked for you</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">CLiFF's Live Target Matches</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your personalized feed of{' '}
          <span className="font-bold text-purple-600">{isLoading ? '...' : totalCount}</span> hand-picked opportunities
        </p>
      </div>

      {/* No goals nudge */}
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

      {/* ── UNIFIED Target-Matched Opportunities Feed ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Target-Matched Opportunities ({isLoading ? '…' : totalCount})
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
        ) : targetOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {targetOpportunities.map((lead, idx) => (
              <DiscoveryJobCard
                key={idx}
                lead={lead}
                onAddToPipeline={handleAddToPipeline}
                onSelect={setSelectedLead}
                schoolAbbr={schoolAbbr}
                onDismiss={() => {}}
              />
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
          onGenerateOutreach={(data) => { console.log('Generating outreach:', data); }}
          onInitiateOutreach={({ contact, company, role, tab }) => {
            window.location.hash = `#OutreachDrafts?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}&contact=${encodeURIComponent(contact.name)}&tab=${tab}`;
          }}
          user={user}
        />
      )}
    </div>
  );
}