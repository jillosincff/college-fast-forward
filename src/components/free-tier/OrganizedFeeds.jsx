import { useState, useEffect, useRef } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import { getDualConstraintLeads } from '@/functions/getDualConstraintLeads';
import { getLiveJobMatchesFn } from '@/functions/getLiveJobMatchesFn';
import { clearJobLeadsCache } from '@/functions/clearJobLeadsCache';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import ApplicationPipeline from './ApplicationPipeline';
import PipelineKanbanModal from './PipelineKanbanModal';
import EmptyMatchesState from './EmptyMatchesState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function OrganizedFeeds({ user, verifiedAlumniCount, verifiedParentsCount, isPremium = false }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const queryClient = useQueryClient();

  const [savedCompanyKeys, setSavedCompanyKeys] = useState(() => {
    try {
      const stored = localStorage.getItem(`cff_saved_companies_${user?.id}`);
      if (!stored) return new Set();
      const keys = JSON.parse(stored);
      // Filter out any job-title-like keys that were saved before the fix
      const validKeys = keys.filter(k => {
        if (!k || k.length < 3) return false;
        const lower = k.toLowerCase();
        const jobKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator', 'supervisor', 'technician', 'public relations', 'marketing'];
        return !jobKeywords.some(j => lower.includes(j));
      });
      // Update localStorage with cleaned keys
      if (validKeys.length !== keys.length) {
        localStorage.setItem(`cff_saved_companies_${user?.id}`, JSON.stringify(validKeys));
      }
      return new Set(validKeys);
    } catch { return new Set(); }
  });
  const [pinnedLeads, setPinnedLeads] = useState([]);

  const [seenCompanyKeys, setSeenCompanyKeys] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`cff_seen_companies_${user?.id}`);
      if (!stored) return new Set();
      const keys = JSON.parse(stored);
      // Filter out any job-title-like keys
      const validKeys = keys.filter(k => {
        if (!k || k.length < 3) return false;
        const lower = k.toLowerCase();
        const jobKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator', 'supervisor', 'technician', 'public relations', 'marketing'];
        return !jobKeywords.some(j => lower.includes(j));
      });
      // Update sessionStorage with cleaned keys
      if (validKeys.length !== keys.length) {
        sessionStorage.setItem(`cff_seen_companies_${user?.id}`, JSON.stringify(validKeys));
      }
      return new Set(validKeys);
    } catch { return new Set(); }
  });

  const persistSavedKey = (companyKey) => {
    setSavedCompanyKeys(prev => {
      const next = new Set(prev);
      next.add(companyKey);
      try { localStorage.setItem(`cff_saved_companies_${user?.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'Network';

  const { target_industries, target_role, target_roles, company_size_preference, location_preference } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';
  const effectiveSize = company_size_preference || 'all';
  const effectiveLocation = location_preference || user?.career_goals?.location_preference || user?.location || '';

  // No auto-clear on mount — cache is managed manually via buttons

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    };
    window.addEventListener('cff:pipeline-changed', handler);
    return () => window.removeEventListener('cff:pipeline-changed', handler);
  }, [queryClient]);

  // Listen for Kanban modal open event
  useEffect(() => {
    const openKanbanHandler = () => setIsKanbanOpen(true);
    window.addEventListener('cff:open-pipeline-modal', openKanbanHandler);
    return () => window.removeEventListener('cff:open-pipeline-modal', openKanbanHandler);
  }, []);

  const PAGE_SIZE = 8;
  const FREE_DAILY_LIMIT = 15;
  const FIRST_DAY_BONUS = 30;
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Daily view cap — free users see max 15/day (30 on signup day), premium is unlimited
  const isFirstDay = (() => {
    if (!user?.created_date) return false;
    return (Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60) < 24;
  })();
  const dailyLimit = isPremium ? Infinity : (isFirstDay ? FIRST_DAY_BONUS : FREE_DAILY_LIMIT);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const seenForExclusionRef = useRef((() => {
    try {
      const stored = sessionStorage.getItem(`cff_seen_companies_${user?.id}`);
      if (!stored) return [];
      const all = JSON.parse(stored);
      const savedKeys = (() => {
        try { const s = localStorage.getItem(`cff_saved_companies_${user?.id}`); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); }
      })();
      return all.filter(k => !savedKeys.has(k));
    } catch { return []; }
  })());

  const { data: feedsData, isLoading, isFetching } = useQuery({
    queryKey: ['liveJobMatches', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation, refreshKey],
    queryFn: () => getLiveJobMatchesFn({
      career_goals: {
        role: effectiveRole,
        industries: target_industries || [],
        locations: effectiveLocation ? [effectiveLocation] : [],
        company_size_preference: effectiveSize && effectiveSize !== 'all' ? [effectiveSize] : [],
      },
      force_refresh: forceRefresh,
    }),
    enabled: true,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Reset forceRefresh flag after the query has fired
  useEffect(() => {
    if (forceRefresh && !isLoading) setForceRefresh(false);
  }, [isLoading, forceRefresh]);

  const { data: dualData, isLoading: dualLoading } = useQuery({
    queryKey: ['dualConstraintLeads', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation],
    queryFn: async () => {
      const result = await getDualConstraintLeads({
        explicit_target_role: effectiveRole,
        explicit_target_industries: target_industries || [],
        target_location: effectiveLocation,
      });
      
      // 🔍 DEBUG: Log raw payload structure from backend
      console.log('🔍 [OrganizedFeeds] Raw Dual Constraint Payload:', JSON.stringify(result, null, 2));
      const leads = result?.leads || [];
      leads.forEach((lead, idx) => {
        console.log(`🔍 [OrganizedFeeds] Dual Lead #${idx}:`, {
          company: lead.company,
          job_title: lead.job_title,
          role: lead.role,
          signalTier: lead.signalTier,
          all_keys: Object.keys(lead),
        });
      });
      
      return result;
    },
    enabled: !!(effectiveRole || target_industries?.length),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const dualLeads = Array.isArray(dualData?.data?.leads) ? dualData.data.leads
                  : Array.isArray(dualData?.leads) ? dualData.leads : [];

  const payload = feedsData?.data || feedsData;
  // getLiveJobMatchesFn returns { companies: [...] }
  const liveCompanies = Array.isArray(payload?.companies) ? payload.companies : [];
  
  // Job title phrases that should NOT be used as company names
  
  // Filter out strings that are clearly job titles masquerading as company names
  const isValidCompanyName = (name) => {
    if (!name || typeof name !== 'string' || name.length < 3) return false;
    const lower = name.toLowerCase().trim();
    // Only block exact multi-word job title phrases
    const jobPhrases = [
      'marketing intern', 'marketing manager', 'public relations', 'account executive',
      'manager trainee', 'operations manager', 'content creator', 'social media manager',
      'business analyst', 'financial analyst', 'data analyst', 'software engineer',
      'product manager', 'project manager', 'sales representative', 'customer service representative',
      'human resources manager', 'graphic designer', 'account manager', 'junior account',
    ];
    if (jobPhrases.some(phrase => lower === phrase)) return false;
    return true;
  };
  
  // map to the shape DiscoveryJobCard expects — ensure company name is always valid
  const targetedDiscoveries = liveCompanies
    .filter(c => isValidCompanyName(c.name))
    .map(c => ({
      company: c.name,
      companyName: c.name,
      job_title: c.job_title || '',
      hiring_description: c.hiring_description || 'Join our team in this exciting opportunity.',
      job_url: c.job_url || '',
      hiring_signal: c.hiring_signal || 'warm',
      industry: c.industry || '',
    }));
  const priorityInsiders = [];

  // Deep structural validation on backend dual constraint leads
  const validatedDualLeads = dualLeads
    .map(l => {
      // 1. Extract the company name across all potential keys
      const extractedCompany = (l.company || l.companyName || l.company_name || '').trim();
      
      // 2. Extract the actual job title from the backend payload
      // If the backend sent 'Marketing Manager Trainee' in l.role, this catches it
      const extractedTitle = (l.job_title || l.role || l.title || '').trim();

      return {
        ...l,
        company: extractedCompany,
        companyName: extractedCompany,
        // Map it explicitly to job_title so DiscoveryJobCard reads it perfectly
        job_title: extractedTitle 
      };
    })
    .filter(l => {
      // HARD LOCK 1: If there's no company name, drop it
      if (!l.company) return false;

      // HARD LOCK 2: If there is no job title returned from the backend, 
      // drop it entirely instead of letting it render an empty card
      if (!l.job_title) return false;

      // HARD LOCK 3: Deep comparative check to kill mirrored titles
      const cleanCompany = l.company.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanTitle = l.job_title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanCompany === cleanTitle) return false;
      
      // 4. Run the company name through your standard validation filters
      return isValidCompanyName(l.company);
    });

  // Merge dual (alumni-verified) leads into the main pool with an insider pill, deduplicated
  const mergedSeen = new Set();
  const allFetched = [];
  
  const rawUnifiedPool = [
    ...validatedDualLeads.map(l => ({ ...l, _insiderPill: `🎓 ${l.alumniCount || ''} Alumni`.trim() })),
    ...priorityInsiders,
    ...targetedDiscoveries,
  ];

  for (const lead of rawUnifiedPool) {
    // 1. Unify company and title tracking across both api response structures
    const companyName = (lead.company || lead.companyName || lead.name || '').trim();
    const jobTitle = (lead.job_title || lead.role || lead.title || '').trim();

    // 2. ABSOLUTE FILTER: Drop if company name is completely missing 
    if (!companyName) continue;

    // 3. ABSOLUTE FILTER: Drop if it's missing a real job title
    if (!jobTitle) continue;

    // 4. ABSOLUTE FILTER: If the company name matches the job title strings, skip it
    const cleanCo = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTi = jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanCo === cleanTi) continue;

    // 5. Run the normalized company name through the validation keywords engine
    if (!isValidCompanyName(companyName)) continue;

    // 6. Deduplicate and commit cleanly to the display array
    const lookupKey = companyName.toLowerCase();
    if (mergedSeen.has(lookupKey)) continue;
    
    mergedSeen.add(lookupKey);
    
    // Push a perfectly structured object down to DiscoveryJobCard
    allFetched.push({
      ...lead,
      company: companyName,
      companyName: companyName,
      job_title: jobTitle
    });
  }

  const handleManualRefresh = async () => {
    try { await clearJobLeadsCache({}); } catch (err) { console.error('Backend cache clear failed:', err); }
    queryClient.removeQueries({ queryKey: ['liveJobMatches'] });
    queryClient.removeQueries({ queryKey: ['dualConstraintLeads'] });
    setForceRefresh(true);
    setRefreshKey(k => k + 1);
    setVisibleCount(PAGE_SIZE);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    setPinnedLeads([]);
  }, [effectiveLocation, effectiveRole, JSON.stringify(target_industries)]);

  useEffect(() => {
    if (!allFetched.length) return;
    setPinnedLeads(prev => prev.map(pinned => {
      const updated = allFetched.find(l => (l.company || l.companyName) === (pinned.company || pinned.companyName));
      return updated || pinned;
    }));
  }, [feedsData]); // eslint-disable-line

  const pinnedKeys = new Set(pinnedLeads.map(l => l.company || l.companyName));
  
  const freshCards = allFetched.filter(l => {
    const key = l.company || l.companyName;
    return !pinnedKeys.has(key) && !savedCompanyKeys.has(key);
  });

  // 1. Unify the total pool
  const rawTargetOpportunities = [...pinnedLeads, ...freshCards];

  // 2. THE ULTIMATE GUARD: Force evaluate everything right before rendering
  const targetOpportunities = rawTargetOpportunities.filter(lead => {
    const name = (lead.company || lead.companyName || '').toLowerCase().trim();
    const title = (lead.job_title || lead.role || lead.title || '').toLowerCase().trim();

    // Kill specific explicit phantoms instantly
    if (name.includes('goodwin') || name.includes('capsule')) {
      // If it doesn't have a legitimate, concrete job title, nuke it
      if (!title || title === 'entry level role' || title.includes('intern') || title.includes('manager')) {
        return false;
      }
    }

    if (!name || !title) return false;
    if (name === title) return false;

    return isValidCompanyName(lead.company || lead.companyName);
  });

  const totalCount = targetOpportunities.length;
  const cappedVisibleCount = isPremium ? visibleCount : Math.min(visibleCount, dailyLimit);
  const limitReached = !isPremium && targetOpportunities.length > dailyLimit && cappedVisibleCount >= dailyLimit;
  const uniqueCompaniesCount = new Set(targetOpportunities.map(l => l.company || l.companyName)).size;
  const rawNetworkCount = targetOpportunities.reduce((sum, l) => sum + (l.alumniCount || 0) + (l.parentCount || 0), 0);
  const totalNetworkCount = rawNetworkCount > 0
    ? rawNetworkCount
    : Math.max(1, (verifiedAlumniCount || 0) + (verifiedParentsCount || 0));

  const pinLead = (lead) => {
    const key = lead.company || lead.companyName;
    if (!key) return;
    persistSavedKey(key);
    setPinnedLeads(prev => {
      if (prev.find(l => (l.company || l.companyName) === key)) return prev;
      return [...prev, lead];
    });
  };

  const handleAddToPipeline = async (lead) => {
    const company = lead.company || lead.companyName || 'Unknown';
    const jobTitle = lead.job_title || lead.role || lead.title || '';
    const jobDescription = lead.hiring_description || lead.description || lead.jobDescription || '';
    const jobUrl = lead.job_url || lead.url || '';
    const alumniName = lead.alumnus?.name || lead.alumni_name || '';
    const alumniEmail = lead.alumnus?.email || lead.alumni_email || '';
    const alumniLinkedin = lead.alumnus?.linkedinUrl || lead.alumni_linkedin || '';
    
    pinLead(lead);
    try {
      await base44.entities.NetworkingPipeline.create({
        user_email: user?.email,
        company,
        job_title: jobTitle,
        job_description: jobDescription,
        job_url: jobUrl,
        alumni_name: alumniName,
        alumni_email: alumniEmail,
        alumni_linkedin: alumniLinkedin,
        alumni_role: lead.alumnus?.title || lead.alumni_role || '',
        status: 'identified',
        status_date: new Date().toISOString(),
        alumni_source: alumniName ? 'top_match' : 'manual',
      });
      window.dispatchEvent(new CustomEvent('cliff:pipeline-refresh'));
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
    }
  };

  const handleColdInroad = (lead) => {
    pinLead(lead);
    const company = lead.company || lead.companyName || '';
    const role = lead.role || lead.title || '';
    window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`;
  };

  const noGoals = !target_industries?.length && !effectiveRole;
  const anyLoading = isLoading || dualLoading;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* ── 70/30 Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* ── LEFT COLUMN (70%): Feed ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">CLiFF's Live Target Matches</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your personalized feed of{' '}
              <span className="font-bold text-purple-600">{anyLoading ? '...' : targetOpportunities.length}</span> hand-picked opportunities
            </p>
            {isPremium ? (
              <p className="text-xs text-blue-500 font-medium mt-1">🔄 New roles posted every 24 hours — check back tomorrow!</p>
            ) : (
              <p className="text-xs text-blue-500 font-medium mt-1">
                🔄 {cappedVisibleCount} of {dailyLimit} daily recommendations viewed — {limitReached ? 'limit reached' : 'come back tomorrow for a fresh batch'}
              </p>
            )}
          </div>

          {/* Subtle guidance note */}
          {!noGoals && !anyLoading && targetOpportunities.length > 0 && (
            <p className="text-[11px] text-gray-400 font-medium italic mb-3">
              ✨ These are hand-picked matches based on your profile. Tap any role for more options.
            </p>
          )}

          {/* No goals nudge */}
          {noGoals && !anyLoading && (
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

          {/* ── Target-Matched Opportunities Grid ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛰️</span>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Target-Matched Opportunities ({anyLoading ? '…' : totalCount})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {lastRefreshed && (
                  <span className="text-[11px] text-gray-400 hidden sm:block">
                    Refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {!lastRefreshed && (
                  <span className="text-[11px] text-blue-500 hidden sm:block font-medium">
                    🔄 New roles posted every 24 hours
                  </span>
                )}
                <button
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isFetching
                      ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
                      : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  <span className={isFetching ? 'animate-spin inline-block' : 'inline-block'}>↻</span>
                  {isFetching ? 'Loading...' : 'New Batch'}
                </button>
              </div>
            </div>

            {anyLoading ? (
              viewMode === 'list' ? (
                <div className="space-y-3 max-w-2xl">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )
            ) : targetOpportunities.length > 0 ? (
              <>
                {/* View toggle */}
                <div className="flex items-center justify-end mb-1">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('list')}
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                      ☰ List
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                      ▦ Grid
                    </button>
                  </div>
                </div>
                {viewMode === 'list' ? (
                  <div className="space-y-3 max-w-2xl">
                    {targetOpportunities.slice(0, cappedVisibleCount).map((lead, idx) => (
                      <DiscoveryJobCard
                        key={lead.company || lead.companyName || idx}
                        lead={lead}
                        user={user}
                        onAddToPipeline={handleAddToPipeline}
                        onColdInroad={handleColdInroad}
                        onSelect={setSelectedLead}
                        schoolAbbr={schoolAbbr}
                        isPinned={savedCompanyKeys.has(lead.company || lead.companyName)}
                        onDismiss={() => {}}
                        insiderPill={lead._insiderPill || (lead.alumniCount > 0 ? `🎓 ${lead.alumniCount} Alumni` : lead.parentCount > 0 ? '👨‍👩‍👧 Parent Insider' : null)}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                    {targetOpportunities.slice(0, cappedVisibleCount).map((lead, idx) => (
                      <DiscoveryJobCard
                        key={lead.company || lead.companyName || idx}
                        lead={lead}
                        user={user}
                        onAddToPipeline={handleAddToPipeline}
                        onColdInroad={handleColdInroad}
                        onSelect={setSelectedLead}
                        schoolAbbr={schoolAbbr}
                        isPinned={savedCompanyKeys.has(lead.company || lead.companyName)}
                        onDismiss={() => {}}
                        insiderPill={lead._insiderPill || (lead.alumniCount > 0 ? `🎓 ${lead.alumniCount} Alumni` : lead.parentCount > 0 ? '👨‍👩‍👧 Parent Insider' : null)}
                      />
                    ))}
                  </div>
                )}
                {limitReached ? (
                  <div className="flex flex-col items-center mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl text-center">
                    <span className="text-2xl mb-2">🔒</span>
                    <p className="text-sm font-bold text-gray-900">You've reached today's match limit</p>
                    <p className="text-xs text-gray-500 mt-1 mb-4 max-w-sm">
                      You've seen all {dailyLimit} of your daily recommendations. Premium unlocks unlimited job matches, deeper insights, and instant resume tailoring.
                    </p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('cff:open-upgrade-modal', { detail: { source: 'daily_job_limit' } }))}
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                    >
                      Unlock Unlimited Matches →
                    </button>
                  </div>
                ) : cappedVisibleCount < targetOpportunities.length && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setVisibleCount(c => isPremium ? c + PAGE_SIZE : Math.min(c + PAGE_SIZE, dailyLimit))}
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold border border-purple-300 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all"
                    >
                      Load More ({targetOpportunities.length - cappedVisibleCount} remaining{!isPremium && cappedVisibleCount + PAGE_SIZE > dailyLimit ? ' · daily limit' : ''})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyMatchesState hasGoals={!noGoals} onSetGoals={() => window.dispatchEvent(new CustomEvent('cff:open-goals-modal'))} />
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN (30%): Sticky Sidebar Pipeline ── */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-theme(spacing.24))] overflow-y-auto space-y-4">

            {/* Parent Network Card — collapsible on mobile */}
            <details className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm group" open>
              <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">🤝</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Parent Network</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Connected · check for warm paths</p>
                </div>
                <span className="lg:hidden text-emerald-400 text-xs font-bold transition-transform group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                  Parents in your network may work at your target companies. Tap to find warm introductions.
                </p>
                <button
                  onClick={() => window.location.hash = '#FreeTierDashboard?tab=network'}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  style={{ minHeight: 'auto', cursor: 'pointer' }}
                >
                  Explore Parent Network →
                </button>
              </div>
            </details>

            <ApplicationPipeline
              userSchool={user?.school_name || 'University of Florida'}
              alumniCount={verifiedAlumniCount || 0}
              isPremium={isPremium}
              onUpgrade={(feature) => {
                console.log('Upgrade clicked:', feature);
              }}
            />
          </div>
        </div>
      </div>

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

      {/* Kanban Modal - Only opens on explicit trigger */}
      <PipelineKanbanModal
        isOpen={isKanbanOpen}
        onClose={() => setIsKanbanOpen(false)}
        user={user}
      />
    </div>
  );
}