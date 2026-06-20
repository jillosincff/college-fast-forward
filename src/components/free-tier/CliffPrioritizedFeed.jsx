import { useState, useEffect } from 'react';
import { getDailyDrop } from '@/functions/getDailyDrop';
import { refreshDailyDrop } from '@/functions/refreshDailyDrop';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import MobileSwipeStack from './MobileSwipeStack';
import AllCaughtUpCard from './AllCaughtUpCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RefreshCw } from 'lucide-react';

export default function CliffPrioritizedFeed({ user, schoolAbbr: schoolAbbrProp }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const schoolAbbr = schoolAbbrProp || user?.school_code?.toUpperCase() || 'UF';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';
  const queryClient = useQueryClient();

  const { data: dropData, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyDrop', user?.id, JSON.stringify(user?.career_goals)],
    queryFn: () => getDailyDrop({}),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    enabled: !!user?.id,
  });

  // Listen for manual refresh requests from parent
  useEffect(() => {
    const handler = (event) => {
      console.log('[CliffPrioritizedFeed] Refreshing with force_refresh:', event?.detail?.force_refresh);
      refetch();
    };
    window.addEventListener('cff:refresh-daily-drop', handler);
    return () => window.removeEventListener('cff:refresh-daily-drop', handler);
  }, [refetch]);

  const payload = dropData?.data || dropData;
  const slots = Array.isArray(payload?.slots) ? payload.slots : [];
  const dropId = payload?.drop_id;
  const actionedKeys = new Set(payload?.actioned_keys || []);

  const actionMutation = useMutation({
    mutationFn: async ({ key, dropId }) => {
      const drops = await base44.entities.UserDailyDrop.filter({ user_id: user.id, id: dropId });
      if (!drops?.length) return;
      const drop = drops[0];
      const updated = [...new Set([...(drop.actioned_keys || []), key])];
      await base44.entities.UserDailyDrop.update(dropId, { actioned_keys: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyDrop', user?.id] });
    },
  });

  const handleAction = (lead) => {
    const key = `${lead.company}||${lead.role}`;
    if (dropId) actionMutation.mutate({ key, dropId });
  };

  // Shared pipeline write — does NOT mark the card as actioned/dismissed
  const writeToPipeline = async (lead, applicationPath = 'cold_apply') => {
    await base44.entities.NetworkingPipeline.create({
      user_email: user.email,
      company: lead.company || lead.companyName,
      job_title: lead.role || lead.job_title,
      job_description: lead.jobDescription || lead.description || '',
      job_url: lead.job_url || lead.jobSource || '',
      application_path: applicationPath,
      status: 'identified',
      location: lead.location || '',
      posted_date: lead.posted_date || null,
    });
  };

  // Called when user explicitly saves/swipes — marks card as actioned and removes it from feed
  const handleAddToPipeline = async (lead, applicationPath = 'cold_apply') => {
    try {
      await writeToPipeline(lead, applicationPath);
      handleAction(lead); // removes card from feed
    } catch (err) {
      console.error('Failed to add to pipeline:', err);
    }
  };

  // Track only — writes to pipeline but keeps the card visible
  const handleTrackOnly = async (lead, applicationPath = 'cold_apply') => {
    try {
      await writeToPipeline(lead, applicationPath);
    } catch (err) {
      console.error('Failed to track:', err);
    }
  };

  const handleDismiss = (lead) => handleAction(lead);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear today's cached drop first, then refetch to generate a fresh one
      await refreshDailyDrop({});
      queryClient.removeQueries({ queryKey: ['dailyDrop', user?.id] });
      await refetch();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Sort: alumni-network slots first, then live, then curated
  const sortedSlots = [...slots].sort((a, b) => {
    const aScore = (a.hasAlumni ? 2 : 0) + (a.slotType === 'live' ? 1 : 0);
    const bScore = (b.hasAlumni ? 2 : 0) + (b.slotType === 'live' ? 1 : 0);
    return bScore - aScore;
  });

  const visibleSlots = sortedSlots.filter(s => !actionedKeys.has(`${s.company}||${s.role}`));
  const allActioned = slots.length > 0 && visibleSlots.length === 0;
  const noGoals = !target_industries?.length && !effectiveRole;

  return (
    <div className="w-full max-w-6xl mx-auto px-0 py-2 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              🚀 Your Daily Drop
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isLoading
                ? 'Scouting your matches…'
                : allActioned
                  ? 'All caught up for today'
                  : `${visibleSlots.length} hand-picked opportunit${visibleSlots.length === 1 ? 'y' : 'ies'} curated for you today`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {!isLoading && slots.length > 0 && !allActioned && (
              <div className="flex gap-1.5 items-center">
                {slots.map((s, i) => {
                  const key = `${s.company}||${s.role}`;
                  const done = actionedKeys.has(key);
                  return <div key={i} className={`w-2 h-2 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />;
                })}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
              title="Refresh to get new opportunities based on your latest goals"
              style={{ minHeight: 'auto' }}
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {noGoals && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-blue-900">🎯 Add your career goals to unlock your Daily Drop</p>
            <p className="text-xs text-blue-700 mt-1">CLiFF will surface 5 curated opportunities every morning based on your target roles and industries.</p>
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

      <section className="space-y-3">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : allActioned ? (
          <AllCaughtUpCard dropDate={payload?.drop_date} />
        ) : error ? (
          <div className="border border-dashed border-red-200 rounded-2xl p-8 text-center text-red-400 text-xs">
            Failed to load today's opportunities. Please refresh to try again.
          </div>
        ) : visibleSlots.length > 0 ? (
          <>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {visibleSlots.some(s => s.hasAlumni) && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>Network Opportunity</span>}
              {visibleSlots.some(s => s.slotType === 'live') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>Live</span>}
              {visibleSlots.some(s => s.slotType === 'curated') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>Curated</span>}
            </div>
            <div className="block md:hidden">
              <MobileSwipeStack leads={visibleSlots} onAddToPipeline={handleAddToPipeline} schoolAbbr={schoolAbbr} />
            </div>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleSlots.map((lead, idx) => (
                <DiscoveryJobCard
                  key={`${lead.company}||${lead.role}||${idx}`}
                  lead={lead}
                  onAddToPipeline={handleAddToPipeline}
                  onTrackOnly={handleTrackOnly}
                  onSelect={setSelectedLead}
                  schoolAbbr={schoolAbbr}
                  onDismiss={() => handleDismiss(lead)}
                  user={user}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            No opportunities in today's drop yet. Set your career goals to get a personalized daily feed.
          </div>
        )}
      </section>

      {selectedLead && (
        <MatchDeepDiveModal lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}