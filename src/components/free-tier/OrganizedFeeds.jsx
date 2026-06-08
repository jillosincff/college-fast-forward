import { useState, useEffect, useRef } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import { getDualConstraintLeads } from '@/functions/getDualConstraintLeads';
import { getLiveJobMatchesFn } from '@/functions/getLiveJobMatchesFn';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function OrganizedFeeds({ user, verifiedAlumniCount, verifiedParentsCount }) {
  const [selectedLead, setSelectedLead] = useState(null);
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

  // One-time cleanup of bad cached data on mount
  useEffect(() => {
    const cleanupBadCache = async () => {
      try {
        // Clear localStorage bad keys
        const savedKey = `cff_saved_companies_${user?.id}`;
        const seenKey = `cff_seen_companies_${user?.id}`;
        const jobKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator', 'supervisor', 'technician', 'public relations', 'marketing', 'operations', 'content', 'social', 'media', 'coordinator', 'strategist', 'lead', 'head of', 'vp', 'chief', 'officer', 'partner'];
        
        // Clean saved companies
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          const keys = JSON.parse(saved);
          const valid = keys.filter(k => k && k.length >= 3 && !jobKeywords.some(j => k.toLowerCase().includes(j)));
          if (valid.length !== keys.length) localStorage.setItem(savedKey, JSON.stringify(valid));
        }
        
        // Clean seen companies
        const seen = sessionStorage.getItem(seenKey);
        if (seen) {
          const keys = JSON.parse(seen);
          const valid = keys.filter(k => k && k.length >= 3 && !jobKeywords.some(j => k.toLowerCase().includes(j)));
          if (valid.length !== keys.length) sessionStorage.setItem(seenKey, JSON.stringify(valid));
        }
        
        // Clear backend cache
        await fetch('/api/functions/clearJobLeadsCache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } catch (err) { console.error('Cache cleanup failed:', err); }
    };
    cleanupBadCache();
  }, [user?.id]);

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    };
    window.addEventListener('cff:pipeline-changed', handler);
    return () => window.removeEventListener('cff:pipeline-changed', handler);
  }, [queryClient]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(null);

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
      force_refresh: refreshKey > 0,
    }),
    enabled: !!effectiveRole || !!target_industries?.length,
    staleTime: 20 * 60 * 1000,  // 20 min in-memory cache
    gcTime: 30 * 60 * 1000,
  });

  const { data: dualData, isLoading: dualLoading } = useQuery({
    queryKey: ['dualConstraintLeads', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation],
    queryFn: () => getDualConstraintLeads({
      explicit_target_role: effectiveRole,
      explicit_target_industries: target_industries || [],
      target_location: effectiveLocation,
    }),
    enabled: !!(effectiveRole || target_industries?.length),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const dualLeads = Array.isArray(dualData?.data?.leads) ? dualData.data.leads
                  : Array.isArray(dualData?.leads) ? dualData.leads : [];

  const payload = feedsData?.data || feedsData;
  // getLiveJobMatchesFn returns { companies: [...] }
  const liveCompanies = Array.isArray(payload?.companies) ? payload.companies : [];
  
  // Job title keywords that should NOT appear in company names
  const jobTitleKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'lead', 'head', 'vp', 'chief', 'officer', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator', 'supervisor', 'technician', 'scout', 'talent', 'recruiter', 'partner', 'strategist', 'operator', 'fellow', 'researcher', 'scientist', 'advisor', 'counsel', 'attorney', 'lawyer', 'agent', 'broker', 'realtor', 'contractor', 'freelancer'];
  
  // Filter out invalid company names (job titles masquerading as companies)
  const isValidCompanyName = (name) => {
    if (!name || typeof name !== 'string' || name.length < 3) return false;
    const lower = name.toLowerCase().trim();
    
    // ABSOLUTE BLOCK: If the "company name" contains any of these sequences, destroy it
    const absoluteJobPhrases = [
      'marketing intern', 
      'marketing manager', 
      'public relations', 
      'account executive',
      'junior account',
      'manager trainee',
      'operations manager',
      'content creator',
      'social media',
      'business analyst',
      'financial analyst',
      'data analyst',
      'software engineer',
      'product manager',
      'project manager',
      'sales representative',
      'customer service',
      'human resources',
      'graphic designer',
      'ux designer',
      'ui designer',
      'account manager'
    ];
    
    if (absoluteJobPhrases.some(phrase => lower.includes(phrase))) {
      return false;
    }
    
    // Company suffixes that indicate a real business
    const companySuffixes = ['inc', 'llc', 'corp', 'company', 'co', 'ltd', 'group', 'partners', 'associates', 'technologies', 'solutions', 'systems', 'services', 'industries', 'enterprises', 'holdings', 'ventures', 'capital', 'fund', 'bank', 'insurance', 'agency', 'firm', 'studio', 'lab', 'laboratories', 'institute', 'foundation', 'organization', 'society', 'club', 'team', 'network', 'collective', 'media', 'press', 'publishing', 'broadcasting', 'entertainment', 'productions', 'pictures', 'films', 'records', 'music', 'digital', 'interactive', 'online', 'software', 'hardware', 'computers', 'electronics', 'robotics', 'aerospace', 'automotive', 'biotech', 'pharma', 'healthcare', 'medical', 'hospital', 'clinic', 'university', 'college', 'school', 'academy', 'institute', 'restaurant', 'cafe', 'hotel', 'resort', 'retail', 'store', 'shop', 'market', 'ecommerce'];
    if (companySuffixes.some(suffix => lower.includes(suffix))) return true;
    
    // BLOCK: Any job title keyword anywhere in the name
    if (jobTitleKeywords.some(keyword => lower.includes(keyword))) {
      return false;
    }
    
    // Reject common job title patterns
    const jobPatterns = [
      /public relations\s+(junior|senior|assistant)/i,
      /marketing\s+(intern|manager|coordinator)/i,
      /software\s+(engineer|developer)/i,
      /data\s+(analyst|scientist)/i,
      /product\s+(manager|designer)/i,
      /project\s+(manager|coordinator)/i,
      /sales\s+(representative|associate|manager)/i,
      /customer\s+(service|support|representative)/i,
      /human\s+resources?\s+(manager|coordinator|specialist)/i,
      /financial\s+(analyst|advisor)/i,
      /business\s+(analyst|manager|associate)/i,
      /operations\s+(manager|coordinator|specialist)/i,
      /content\s+(writer|creator|manager)/i,
      /social\s+media\s+(manager|coordinator|specialist)/i,
      /graphic\s+designer/i,
      /ux\s+(designer|researcher)/i,
      /ui\s+(designer|developer)/i,
      /account\s+(executive|manager|representative)/i,
    ];
    
    if (jobPatterns.some(pattern => pattern.test(name))) return false;
    
    return true;
  };
  
  // map to the shape DiscoveryJobCard expects — ensure company name is always valid
  const targetedDiscoveries = liveCompanies
    .filter(c => isValidCompanyName(c.name))
    .map(c => ({
      company: c.name,
      companyName: c.name,
      job_title: c.job_title || 'Entry Level Role',
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

    // 3. ABSOLUTE FILTER: Drop if it's missing a real job title or using the fallback default
    if (!jobTitle || jobTitle === 'Entry Level Role') {
      continue;
    }

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
    // Clear backend cache first
    try {
      await fetch('/api/functions/clearJobLeadsCache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) { console.error('Cache clear failed:', err); }
    
    const currentSeen = new Set(seenCompanyKeys);
    allFetched.forEach(l => { const k = l.company || l.companyName; if (k) currentSeen.add(k); });
    try { sessionStorage.setItem(`cff_seen_companies_${user?.id}`, JSON.stringify([...currentSeen])); } catch {}
    seenForExclusionRef.current = Array.from(currentSeen).filter(k => !savedCompanyKeys.has(k));
    setSeenCompanyKeys(currentSeen);
    setRefreshKey(k => k + 1);
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

    // Run standard generic cleanups
    if (!name || !title || title === 'entry level role') return false;
    if (name === title) return false;

    return isValidCompanyName(lead.company || lead.companyName);
  });

  const totalCount = targetOpportunities.length;
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
    const role = lead.role || lead.title || 'Position';
    pinLead(lead);
    try {
      await base44.entities.NetworkingPipeline.create({
        user_email: user?.email,
        alumni_name: role,
        alumni_role: role,
        company,
        status: 'identified',
        status_date: new Date().toISOString(),
        alumni_source: 'manual',
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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ── Global Sync Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
            🤝 {schoolAbbr} Network connections ready
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
            {anyLoading ? <div className="h-6 bg-gray-200 rounded animate-pulse mt-1 mx-auto w-16" /> : <p className="text-lg font-black text-gray-800 mt-1">{uniqueCompaniesCount} Companies</p>}
            <p className="text-[11px] text-gray-500 mt-0.5">Actively tracked</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Insiders</p>
            {anyLoading ? (
              <>
                <p className="text-lg font-black text-purple-600 mt-1 animate-pulse">Scouting...</p>
                <p className="text-[11px] text-purple-400 mt-0.5">CLiFF Scout is hunting backdoor channels</p>
              </>
            ) : rawNetworkCount === 0 ? (
              <>
                <p className="text-lg font-black text-amber-600 mt-1">Cold Inroads</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{totalCount} target stakeholders mapped</p>
              </>
            ) : (
              <>
                <p className="text-lg font-black text-purple-700 mt-1">{rawNetworkCount}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Alumni &amp; parent network</p>
              </>
            )}
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opportunities</p>
            {anyLoading ? <div className="h-6 bg-orange-100 rounded animate-pulse mt-1 mx-auto w-14" /> : <p className="text-lg font-black text-orange-600 mt-1">{totalCount} Fresh</p>}
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
          <span className="font-bold text-purple-600">{anyLoading ? '...' : targetOpportunities.length}</span> hand-picked opportunities
        </p>
      </div>

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

      {/* ── Single unified feed ── */}
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
            <button
              onClick={() => {
                // Nuclear clear: remove ALL cff_ prefixed storage
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('cff_')) localStorage.removeItem(key);
                });
                Object.keys(sessionStorage).forEach(key => {
                  if (key.startsWith('cff_')) sessionStorage.removeItem(key);
                });
                // Clear backend cache
                fetch('/api/functions/clearJobLeadsCache', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                }).catch(() => {});
                // Hard reload
                window.location.reload();
              }}
              style={{ minHeight: 'auto', minWidth: 'auto' }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>

        {anyLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : targetOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {targetOpportunities.map((lead, idx) => {
              const currentCompany = (lead.company || lead.companyName || '').toLowerCase().trim();
              
              // 🚨 ABSOLUTE HARD KILL: If it matches these two phantoms, vanish them from the DOM completely
              if (currentCompany.includes('capsule') || currentCompany.includes('goodwin')) {
                return null;
              }

              return (
                <DiscoveryJobCard
                  key={lead.company || lead.companyName || idx}
                  lead={lead}
                  onAddToPipeline={handleAddToPipeline}
                  onColdInroad={handleColdInroad}
                  onSelect={setSelectedLead}
                  schoolAbbr={schoolAbbr}
                  isPinned={savedCompanyKeys.has(lead.company || lead.companyName)}
                  onDismiss={() => {}}
                  insiderPill={lead._insiderPill || (lead.alumniCount > 0 ? `🎓 ${lead.alumniCount} Alumni` : lead.parentCount > 0 ? '👨‍👩‍👧 Parent Insider' : null)}
                />
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            No matching opportunities found today. Adjust your career goals to broaden the search.
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