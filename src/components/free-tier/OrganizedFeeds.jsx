import { useState, useEffect, useRef } from 'react';
import { getDualConstraintLeads } from '@/functions/getDualConstraintLeads';
import { getLiveJobMatchesFn } from '@/functions/getLiveJobMatchesFn';
import { clearJobLeadsCache } from '@/functions/clearJobLeadsCache';
import CompactFeedCard from './CompactFeedCard';
import JobDetailPane from './JobDetailPane';
import PipelineKanbanModal from './PipelineKanbanModal';
import EmptyMatchesState from './EmptyMatchesState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

export default function OrganizedFeeds({ user, verifiedAlumniCount, verifiedParentsCount, isPremium = false }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [showDetailPane, setShowDetailPane] = useState(false);
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

  const { data: feedsData, isLoading, isFetching, error } = useQuery({
    queryKey: ['liveJobMatches', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation, refreshKey],
    queryFn: async () => {
      // FORCE cache bust on every call for fresh data
      try { await clearJobLeadsCache({}); } catch {}
      const result = await getLiveJobMatchesFn({
        career_goals: {
          role: effectiveRole,
          industries: target_industries || [],
          locations: effectiveLocation ? [effectiveLocation] : [],
          company_size_preference: effectiveSize && effectiveSize !== 'all' ? [effectiveSize] : [],
        },
        force_refresh: true, // Always force refresh
      });
      console.log('🔍 [OrganizedFeeds] getLiveJobMatchesFn result:', JSON.stringify(result, null, 2));
      return result;
    },
    enabled: true,
    staleTime: 0,
    gcTime: 0, // Don't cache
  });
  
  // Debug: Log query state
  useEffect(() => {
    console.log('🔍 [OrganizedFeeds] Query state:', { isLoading, isFetching, hasData: !!feedsData, error, companyCount: feedsData?.data?.companies?.length || 0 });
  }, [isLoading, isFetching, feedsData, error]);

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

  const handleAddToPipeline = async (lead, path = 'cold_apply') => {
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
        application_path: path,
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

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailPane(true);
  };

  const noGoals = !target_industries?.length && !effectiveRole;
  const anyLoading = isLoading || dualLoading;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 200px)',
      maxHeight: '900px',
      background: '#f8f9fc',
      overflow: 'hidden',
    }}>
      {/* Split-View Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showDetailPane ? '30% 70%' : '1fr',
        gap: 0,
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* LEFT COLUMN: Condensed Feed */}
        <div style={{
          overflowY: 'auto',
          borderRight: showDetailPane ? '1px solid #e5e7eb' : 'none',
          scrollBehavior: 'smooth',
        }}>
          <div style={{ maxWidth: '100%', padding: '16px 20px' }}>
            {/* Feed Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <svg className="w-5 h-5" style={{ width: 20, height: 20, color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h2 style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Target Matches</h2>
              </div>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
                {anyLoading ? 'Loading...' : targetOpportunities.length} opportunities
              </p>
            </div>

            {/* Compact Feed Cards */}
            {anyLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} style={{ height: 72, background: '#e5e7eb', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : targetOpportunities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {targetOpportunities.slice(0, cappedVisibleCount).map((lead, idx) => (
                  <CompactFeedCard
                    key={lead.company || lead.companyName || idx}
                    lead={lead}
                    user={user}
                    schoolAbbr={schoolAbbr}
                    isSelected={selectedLead && (selectedLead.company || selectedLead.companyName) === (lead.company || lead.companyName)}
                    onClick={() => handleSelectLead(lead)}
                  />
                ))}
              </div>
            ) : (
              <EmptyMatchesState hasGoals={!noGoals} onSetGoals={() => window.dispatchEvent(new CustomEvent('cff:open-goals-modal'))} />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Pane (Expanded to 70%) */}
        {showDetailPane && selectedLead && (
          <div style={{
            overflowY: 'auto',
            background: '#fff',
          }}>
            <JobDetailPane
              lead={selectedLead}
              user={user}
              schoolAbbr={schoolAbbr}
              onClose={() => setShowDetailPane(false)}
              onAddToPipeline={handleAddToPipeline}
              onColdInroad={handleColdInroad}
            />
          </div>
        )}
      </div>

      {/* Kanban Modal */}
      <PipelineKanbanModal
        isOpen={isKanbanOpen}
        onClose={() => setIsKanbanOpen(false)}
        user={user}
      />
    </div>
  );
}