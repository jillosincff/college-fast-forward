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
  const [showAllInsiders, setShowAllInsiders] = useState(false);
  const [showAllDiscoveries, setShowAllDiscoveries] = useState(false);
  const schoolAbbr = schoolAbbrProp || user?.school_code?.toUpperCase() || 'UF';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';

  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['cliffPrioritizedFeed', target_industries, effectiveRole],
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

  // No goals set — show a nudge inline (not a blocking full-page empty state)
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
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">🔥</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Priority Insider Tracks ({isLoading ? '…' : priorityInsiders.length})
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Foot-In-The-Door
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:block shrink-0">Verified insiders</span>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : priorityInsiders.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(showAllInsiders ? priorityInsiders : priorityInsiders.slice(0, INITIAL_SHOW)).map((lead, idx) => (
                <DiscoveryJobCard key={idx} lead={lead} onAddToPipeline={handleAddToPipeline} onSelect={setSelectedLead} schoolAbbr={schoolAbbr} />
              ))}
            </div>
            {priorityInsiders.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllInsiders(v => !v)}
                className="w-full mt-2 py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
                style={{ minHeight: 'auto', cursor: 'pointer' }}
              >
                {showAllInsiders ? `▲ Show fewer` : `▼ Show ${priorityInsiders.length - INITIAL_SHOW} more insider tracks`}
              </button>
            )}
          </>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 text-center">
            <p className="text-sm text-gray-600 font-semibold">
              🛰️ CLiFF is actively monitoring your connected corporate networks...
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              No active vacancies found inside your exact alumni or parent networks today. Checking broader target matches below.
            </p>
          </div>
        )}
      </section>

      {/* ── PRIORITY 2: TARGET DISCOVERIES (HUNT ACTIVE) ────────────── */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">🛰️</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Opportunities ({isLoading ? '…' : targetedDiscoveries.length})
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Scouting
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium hidden sm:block shrink-0">Company websites</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : targetedDiscoveries.length > 0 ? (
          <>
            {/* Mobile: swipe stack */}
            <div className="block md:hidden">
              <MobileSwipeStack leads={targetedDiscoveries} onAddToPipeline={handleAddToPipeline} />
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(showAllDiscoveries ? targetedDiscoveries : targetedDiscoveries.slice(0, INITIAL_SHOW)).map((lead, idx) => (
                <DiscoveryJobCard key={idx} lead={lead} onAddToPipeline={handleAddToPipeline} onSelect={setSelectedLead} schoolAbbr={schoolAbbr} />
              ))}
            </div>
            {targetedDiscoveries.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllDiscoveries(v => !v)}
                className="hidden md:block w-full mt-2 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                style={{ minHeight: 'auto', cursor: 'pointer' }}
              >
                {showAllDiscoveries ? `▲ Show fewer` : `▼ Show ${targetedDiscoveries.length - INITIAL_SHOW} more opportunities`}
              </button>
            )}
          </>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            No matching industry vacancies found today. Adjust your target positions to broaden search.
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