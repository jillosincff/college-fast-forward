import { useState } from 'react';
import { getDailyDrop } from '@/functions/getDailyDrop';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import MobileSwipeStack from './MobileSwipeStack';
import AllCaughtUpCard from './AllCaughtUpCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CliffPrioritizedFeed({ user, schoolAbbr: schoolAbbrProp }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const schoolAbbr = schoolAbbrProp || user?.school_code?.toUpperCase() || 'UF';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';
  const queryClient = useQueryClient();

  const { data: dropData, isLoading, error } = useQuery({
    queryKey: ['dailyDrop', user?.id],
    queryFn: () => getDailyDrop({}),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
    enabled: !!user?.id,
  });

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
      handleAction(lead);
    } catch (err) {
      console.error('Failed to add to pipeline:', err);
    }
  };

  const handleDismiss = (lead) => handleAction(lead);

  const visibleSlots = slots.filter(s => !actionedKeys.has(`${s.company}||${s.role}`));
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
          {!isLoading && slots.length > 0 && !allActioned && (
            <div className="flex gap-1.5 items-center shrink-0 mt-1">
              {slots.map((s, i) => {
                const key = `${s.company}||${s.role}`;
                const done = actionedKeys.has(key);
                return <div key={i} className={`w-2 h-2 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />;
              })}
            </div>
          )}
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
              {visibleSlots.some(s => s.slotType === 'live') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>Live</span>}
              {visibleSlots.some(s => s.slotType === 'curated') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>Curated</span>}
              {visibleSlots.some(s => s.slotType === 'wildcard') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>Wildcard</span>}
            </div>
            <div className="block md:hidden">
              <MobileSwipeStack leads={visibleSlots} onAddToPipeline={handleAddToPipeline} />
            </div>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleSlots.map((lead, idx) => (
                <DiscoveryJobCard
                  key={`${lead.company}||${lead.role}||${idx}`}
                  lead={lead}
                  onAddToPipeline={handleAddToPipeline}
                  onSelect={setSelectedLead}
                  schoolAbbr={schoolAbbr}
                  onDismiss={() => handleDismiss(lead)}
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