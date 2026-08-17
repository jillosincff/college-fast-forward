import { useState, useEffect } from 'react';
import { getDailyDrop } from '@/functions/getDailyDrop';
import { refreshDailyDrop } from '@/functions/refreshDailyDrop';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import AllCaughtUpCard from './AllCaughtUpCard';
import EmptyMatchesState from './EmptyMatchesState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { recordMemorySignal } from '@/functions/recordMemorySignal';
import { RefreshCw } from 'lucide-react';
import useAccessPlan from '@/hooks/useAccessPlan';
import { computeCliffVerdict } from '@/lib/cliffVerdict';
import { locationPrefsFromUser } from '@/lib/locationPrefs';
import BestOpportunityCard from './BestOpportunityCard';

export default function CliffPrioritizedFeed({ user, schoolAbbr: schoolAbbrProp, onUpgrade }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [visibleCount, setVisibleCount] = useState(8); // pagination for infinite scroll
  // Library is a reference area — collapsed by default, remembered per student
  const [libraryOpen, setLibraryOpen] = useState(() => {
    try { return localStorage.getItem('cliff_library_open') === '1'; } catch { return false; }
  });
  const openLibrary = () => {
    setLibraryOpen(true);
    try { localStorage.setItem('cliff_library_open', '1'); } catch {}
    try { base44.analytics.track({ eventName: 'browse_more_opportunities_clicked' }); } catch {}
  };
  const closeLibrary = () => {
    setLibraryOpen(false);
    try { localStorage.setItem('cliff_library_open', '0'); } catch {}
  };
  const schoolAbbr = schoolAbbrProp || user?.school_code?.toUpperCase() || 'UF';
  const { target_industries, target_role, target_roles } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';
  const queryClient = useQueryClient();

  // Canonical plan + magic-moment state — drives plan-aware card CTAs
  const access = useAccessPlan(user);

  // Existing pursuits so in-progress jobs show their next step instead of a restart CTA
  const [pursuits, setPursuits] = useState([]);
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.JobPursuit.filter({ user_email: user.email }, '-updated_date', 100)
      .then(rows => setPursuits(rows || []))
      .catch(() => {});
  }, [user?.email]);

  const findPursuit = (lead) => {
    const c = (lead.company || lead.companyName || '').toLowerCase().trim();
    const r = (lead.role || lead.job_title || '').toLowerCase().trim();
    if (!c) return null;
    return pursuits.find(p => {
      if ((p.company_name || '').toLowerCase().trim() !== c) return false;
      const pt = (p.job_title || '').toLowerCase().trim();
      return !r || !pt || pt.includes(r) || r.includes(pt);
    }) || null;
  };

  // CLIFF memory: active high-confidence "avoid" memories quietly filter the feed
  const [memories, setMemories] = useState([]);
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.StudentMemory.filter({ user_email: user.email, active: true }, '-confidence', 100)
      .then(rows => setMemories(rows || []))
      .catch(() => {});
  }, [user?.email]);

  const queryKey = ['dailyDrop', user?.id];
  
  const { data: dropData, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('[CliffPrioritizedFeed] Fetching daily drop...');
      const result = await getDailyDrop({ force_refresh: true });
      console.log('[CliffPrioritizedFeed] Result:', result);
      return result;
    },
    staleTime: 0,
    gcTime: 0,
    retry: 0,
    refetchOnMount: 'always',
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
    recordMemorySignal({ event: 'job_saved', company: lead.company, role: lead.role, location: lead.location || '' }).catch(() => {});
    try { base44.analytics.track({ eventName: 'job_saved', properties: { company: lead.company || '', role: lead.role || '' } }); } catch {}
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

  const handleDismiss = (lead) => {
    recordMemorySignal({ event: 'job_dismissed', company: lead.company, role: lead.role, location: lead.location || '' }).catch(() => {});
    try { base44.analytics.track({ eventName: 'job_dismissed', properties: { company: lead.company || '', role: lead.role || '' } }); } catch {}
    handleAction(lead);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Properly invalidate just the daily drop query
      await queryClient.invalidateQueries({ queryKey });
      await refetch();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // CLIFF Confidence Engine: opinionated verdict per job, then rank best-first
  const verdictMap = new Map(slots.map(s => [
    `${s.company}||${s.role}`,
    computeCliffVerdict(s, { memories, careerGoals: user?.career_goals || {}, pursuit: findPursuit(s), locationPrefs: locationPrefsFromUser(user) }),
  ]));
  const verdictOf = (s) => verdictMap.get(`${s.company}||${s.role}`);
  const sortedSlots = [...slots].sort((a, b) => (verdictOf(b)?.score || 0) - (verdictOf(a)?.score || 0));

  // Apply memory: only high-confidence active "avoid" memories filter jobs out
  const avoids = memories.filter(m => (m.confidence ?? 0) >= 70 && ['disliked_industries', 'avoided_companies', 'excluded_locations'].includes(m.category));
  const hitAvoid = (s) => avoids.find(m => {
    const v = (m.value || '').toLowerCase();
    if (!v) return false;
    if (m.category === 'avoided_companies') return (s.company || '').toLowerCase().includes(v);
    if (m.category === 'excluded_locations') return (s.location || '').toLowerCase().includes(v);
    return (s.role || '').toLowerCase().includes(v);
  });
  const memoryHits = [];
  const visibleSlots = sortedSlots.filter(s => {
    if (actionedKeys.has(`${s.company}||${s.role}`)) return false;
    const hit = hitAvoid(s);
    if (hit) { memoryHits.push(hit); return false; }
    return true;
  });
  const memoryRef = memoryHits[0];
  const allActioned = slots.length > 0 && visibleSlots.length === 0;
  const noGoals = !target_industries?.length && !effectiveRole;
  // CLIFF's Best Opportunities: top 3 non-skip verdicts lead; the rest is the collapsed library
  const bestSlots = visibleSlots.filter(s => verdictOf(s)?.verdict !== 'skip').slice(0, 3);
  const bestKeys = new Set(bestSlots.map(s => `${s.company}||${s.role}`));
  const librarySlots = visibleSlots.filter(s => !bestKeys.has(`${s.company}||${s.role}`));
  // Empty/error/caught-up states must always render — treat as open when there's no best section
  const effectiveOpen = libraryOpen || bestSlots.length === 0;
  const paginatedSlots = librarySlots.slice(0, visibleCount);
  const hasMore = visibleCount < librarySlots.length;
  const isPremium = dropData?.data?.is_premium || dropData?.is_premium;
  const dailyLimit = dropData?.data?.daily_limit || dropData?.daily_limit || 15;

  return (
    <div className="w-full max-w-6xl mx-auto px-0 py-2 space-y-6">
      {/* CLIFF's Best Opportunities — verdict-first, max 3, never forced */}
      {!isLoading && bestSlots.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">CLIFF's Best Opportunities</h2>
          {bestSlots.map((lead, i) => (
            <BestOpportunityCard
              key={`${lead.company}||${lead.role}`}
              lead={lead}
              verdict={verdictOf(lead)}
              rank={i}
              pursuit={findPursuit(lead)}
              onDetails={setSelectedLead}
            />
          ))}
          {bestSlots.length < 3 && (
            <p className="text-xs text-gray-500 italic">I'm still evaluating the rest. I won't waste your time with weak matches.</p>
          )}
        </div>
      )}

      {librarySlots.length > 0 && (
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
               📚 More Matches CLIFF Vetted
             </h2>
             <p className="text-xs sm:text-sm text-gray-500 mt-1">
               {isLoading
                 ? 'CLIFF is gathering opportunities…'
                 : `${librarySlots.length} more opportunit${librarySlots.length === 1 ? 'y' : 'ies'} CLIFF checked for you today — the strongest are already above`
               }
             </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {!isLoading && slots.length > 0 && (
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
      )}

      {/* Collapsed library: one calm CTA instead of a long feed */}
      {!effectiveOpen && !isLoading && librarySlots.length > 0 && (
        <button
          onClick={openLibrary}
          className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ minHeight: 44 }}
        >
          Browse More Opportunities ({librarySlots.length})
        </button>
      )}

      {effectiveOpen && !noGoals && !isLoading && visibleSlots.length > 0 && (
        <p className="text-[11px] text-gray-400 font-medium italic">
          ✨ These are hand-picked matches based on your profile. Tap any role for more options.
        </p>
      )}

      {/* One memory reference per session — CLIFF shows it's listening */}
      {effectiveOpen && !isLoading && memoryRef && (
        <p className="text-[11px] text-purple-600 font-semibold">
          🧠 I filtered out {memoryRef.value} {memoryRef.category === 'avoided_companies' ? 'jobs' : memoryRef.category === 'excluded_locations' ? 'locations' : 'roles'} {memoryRef.source === 'explicit' ? 'like you asked' : "based on what you've been skipping"}.{' '}
          <button onClick={() => { window.location.hash = '#/CliffMemory'; }} className="underline cursor-pointer bg-transparent border-0 p-0 text-purple-600" style={{ minHeight: 'auto', minWidth: 'auto' }}>Manage</button>
        </p>
      )}

      {noGoals && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-blue-900">🎯 Add your career goals to unlock your Daily Drop</p>
            <p className="text-xs text-blue-700 mt-1">CLiFF will surface up to 15 curated opportunities every morning based on your target roles and industries.</p>
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

      {effectiveOpen && (
      <section className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => <div key={n} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : allActioned ? (
          <AllCaughtUpCard dropDate={payload?.drop_date} onUpgrade={() => onUpgrade?.('Unlimited Daily Matches')} />
        ) : error ? (
          <div className="border border-dashed border-red-200 rounded-2xl p-8 text-center text-red-400 text-xs">
            Failed to load today's opportunities. Please refresh to try again.
          </div>
        ) : visibleSlots.length > 0 ? (
          <>
            {/* View toggle + legend */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {visibleSlots.some(s => s.hasAlumni) && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>Network Opportunity</span>}
                {visibleSlots.some(s => s.slotType === 'live') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>Live</span>}
                {visibleSlots.some(s => s.slotType === 'curated') && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>Curated</span>}
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  ☰ List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  ▦ Grid
                </button>
              </div>
            </div>

            {/* LinkedIn-style vertical scrollable feed (default) */}
            {viewMode === 'list' ? (
              <div className="space-y-3 max-w-2xl mx-auto">
                {paginatedSlots.map((lead, idx) => (
                  <DiscoveryJobCard
                    key={`${lead.company}||${lead.role}||${idx}`}
                    lead={lead}
                    onAddToPipeline={handleAddToPipeline}
                    onTrackOnly={handleTrackOnly}
                    onSelect={setSelectedLead}
                    schoolAbbr={schoolAbbr}
                    onDismiss={() => handleDismiss(lead)}
                    user={user}
                    access={access}
                    pursuit={findPursuit(lead)}
                    verdict={verdictOf(lead)}
                    rank={idx}
                    onUpgrade={onUpgrade}
                    compact
                  />
                ))}
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount(c => c + 8)}
                    className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ minHeight: 'auto' }}
                  >
                    Load More ({visibleSlots.length - visibleCount} remaining)
                  </button>
                )}
                {!isPremium && !access.excludePrompts && visibleSlots.length >= dailyLimit && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-purple-900">CLIFF has more matches ready for you.</p>
                    <button
                      onClick={() => onUpgrade?.('Unlimited Daily Matches')}
                      className="mt-3 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                      style={{ minHeight: 'auto' }}
                    >
                      Unlock Today's Full List
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedSlots.map((lead, idx) => (
                  <DiscoveryJobCard
                    key={`${lead.company}||${lead.role}||${idx}`}
                    lead={lead}
                    onAddToPipeline={handleAddToPipeline}
                    onTrackOnly={handleTrackOnly}
                    onSelect={setSelectedLead}
                    schoolAbbr={schoolAbbr}
                    onDismiss={() => handleDismiss(lead)}
                    user={user}
                    access={access}
                    pursuit={findPursuit(lead)}
                    verdict={verdictOf(lead)}
                    rank={idx}
                    onUpgrade={onUpgrade}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyMatchesState hasGoals={!noGoals} onSetGoals={() => window.dispatchEvent(new CustomEvent('cff:open-goals-modal'))} />
        )}
      </section>
      )}

      {effectiveOpen && libraryOpen && bestSlots.length > 0 && (
        <button
          onClick={closeLibrary}
          className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
          style={{ minHeight: 44 }}
        >
          Show fewer ▲
        </button>
      )}

      {selectedLead && (
        <MatchDeepDiveModal lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}