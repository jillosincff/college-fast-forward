import { useState } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import MobileSwipeStack from './MobileSwipeStack';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const INITIAL_SHOW = 9;

export default function CliffPrioritizedFeed({ user, schoolAbbr: schoolAbbrProp }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState(new Set());

  const handleDismiss = (lead) => {
    const key = `${lead.company}||${lead.role}`;
    setDismissedKeys(prev => new Set([...prev, key]));
  };
  const schoolAbbr = schoolAbbrProp || user?.school_code?.toUpperCase() || 'UF';
  const { target_industries, target_role, target_roles, company_size_preference } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';

  const { data: feedsData, isLoading, error } = useQuery({
    queryKey: ['cliffPrioritizedFeed', user?.id, target_industries, effectiveRole, company_size_preference],
    queryFn: () => getPersonalizedNetworkCarousel({
      target_industries: target_industries || [],
      target_role: effectiveRole,
      company_size_preference: company_size_preference || 'all',
    }),
    staleTime: 0,
    gcTime: 0,
    retry: 2,
    enabled: !!user?.id,
  });

  const payload = feedsData?.data || feedsData;
  const priorityInsiders    = Array.isArray(payload?.priorityInsiders)    ? payload.priorityInsiders    : [];
  const targetedDiscoveries = Array.isArray(payload?.targetedDiscoveries) ? payload.targetedDiscoveries : [];

  // UNIFIED feed — all cards merged and filtered
  const allLeads = [...priorityInsiders, ...targetedDiscoveries].filter(
    l => !dismissedKeys.has(`${l.company}||${l.role}`)
  );
  const totalCount = allLeads.length;

  const handleAddToPipeline = async (lead) => {
    try {
      await base44.entities.Opportunity.create({
        opportunity_type: 'job',
        title: lead.role || lead.title,
        org_name: lead.company || lead.companyName,
        description: lead.jobDescription || lead.description,
        status: 'active',
        created_by_role: user?.persona || 'student',
      });
      alert('✅ Added to your pipeline!');
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
    }
  };

  const noGoals = !target_industries?.length && !effectiveRole;

  return (
    <div className="w-full max-w-6xl mx-auto px-0 py-2 space-y-6">

      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          🚀 CLiFF's Live Target Matches
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
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

      {/* ── UNIFIED Target-Matched Opportunities ── */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">🛰️</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Target-Matched Opportunities ({isLoading ? '…' : totalCount})
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Scouting Connections
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:block shrink-0">High-match roles found on company websites</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : allLeads.length > 0 ? (
          <>
            {/* Mobile: swipe stack */}
            <div className="block md:hidden">
              <MobileSwipeStack leads={allLeads} onAddToPipeline={handleAddToPipeline} />
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(showAll ? allLeads : allLeads.slice(0, INITIAL_SHOW)).map((lead, idx) => (
                <DiscoveryJobCard
                  key={idx}
                  lead={lead}
                  onAddToPipeline={handleAddToPipeline}
                  onSelect={setSelectedLead}
                  schoolAbbr={schoolAbbr}
                  onDismiss={() => handleDismiss(lead)}
                />
              ))}
            </div>
            {allLeads.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="hidden md:block w-full mt-2 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                style={{ minHeight: 'auto', cursor: 'pointer' }}
              >
                {showAll ? `▲ Show fewer` : `▼ Show ${allLeads.length - INITIAL_SHOW} more opportunities`}
              </button>
            )}
          </>
        ) : error ? (
          <div className="border border-dashed border-red-200 rounded-2xl p-8 text-center text-red-400 text-xs">
            Failed to load jobs. Please refresh the page to try again.
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            No matching industry vacancies found today. Set your career goals to see personalized opportunities.
          </div>
        )}
      </section>

      {selectedLead && (
        <MatchDeepDiveModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}