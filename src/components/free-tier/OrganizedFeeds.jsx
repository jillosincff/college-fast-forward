import { useState, useEffect } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import { getDualConstraintLeads } from '@/functions/getDualConstraintLeads';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import DiscoveryJobCard from './DiscoveryJobCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRef } from 'react';

const TABS = ['All', 'Network Backdoors', 'Hidden Discoveries'];

export default function OrganizedFeeds({ user, verifiedAlumniCount, verifiedParentsCount }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const queryClient = useQueryClient();

  // Track companies the user has explicitly saved (pipeline add or cold inroad click)
  // These are pinned to the feed and never rotated out
  const [savedCompanyKeys, setSavedCompanyKeys] = useState(() => {
    try {
      const stored = localStorage.getItem(`cff_saved_companies_${user?.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  // The pinned cards themselves (full lead objects), stable across batches
  const [pinnedLeads, setPinnedLeads] = useState([]);

  // Track ALL companies the user has ever seen in the current session so "New Batch"
  // never serves the same company twice until the pool is fully exhausted
  const [seenCompanyKeys, setSeenCompanyKeys] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`cff_seen_companies_${user?.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const addSeenKeys = (leads) => {
    setSeenCompanyKeys(prev => {
      const next = new Set(prev);
      leads.forEach(l => { const k = l.company || l.companyName; if (k) next.add(k); });
      try { sessionStorage.setItem(`cff_seen_companies_${user?.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const persistSavedKey = (companyKey) => {
    setSavedCompanyKeys(prev => {
      const next = new Set(prev);
      next.add(companyKey);
      try { localStorage.setItem(`cff_saved_companies_${user?.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  // Dynamic school state with fallback
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'Network';
  const schoolName = user?.school_name || user?.schoolName || `${schoolAbbr} Network`;

  // Extract career goals DIRECTLY from user prop for query key - ensures instant cache bust
  const { target_industries, target_role, target_roles, company_size_preference, location_preference } = user?.career_goals || {};
  const effectiveRole = target_role || target_roles?.[0] || '';
  const effectiveSize = company_size_preference || 'all';
  const effectiveLocation = location_preference || user?.location || '';

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    };
    window.addEventListener('cff:pipeline-changed', handler);
    return () => window.removeEventListener('cff:pipeline-changed', handler);
  }, [queryClient]);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD — busts cache daily
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Use a ref so the queryFn always reads the latest seen companies synchronously
  // (useState is async — by the time the query fires, the state hasn't updated yet)
  // Initialize from sessionStorage so returning users don't re-see excluded companies
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
    // CRITICAL: Include career goals directly in queryKey for instant cache bust
    queryKey: ['personalizedNetworkCarousel', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation, refreshKey],
    queryFn: () => {
      return getPersonalizedNetworkCarousel({
        // CRITICAL: Pass explicit parameters to bypass backend DB race condition
        explicit_target_role: effectiveRole,
        explicit_target_industries: target_industries || [],
        target_industries: target_industries || [],
        target_role: effectiveRole,
        company_size_preference: effectiveSize,
        target_location: effectiveLocation,
        refresh_seed: refreshKey,
        seen_companies: seenForExclusionRef.current,
      });
    },
    enabled: !!effectiveRole || !!target_industries?.length,
    staleTime: 0,
    gcTime: 0,
    cacheTime: 0,
  });

  // Dual-constraint engine: alumni-verified companies with active job listings
  const { data: dualData, isLoading: dualLoading } = useQuery({
    queryKey: ['dualConstraintLeads', effectiveRole, JSON.stringify(target_industries), effectiveSize, effectiveLocation],
    queryFn: () => getDualConstraintLeads({
      explicit_target_role: effectiveRole,
      explicit_target_industries: target_industries || [],
      target_location: effectiveLocation,
    }),
    enabled: !!(effectiveRole || target_industries?.length),
    staleTime: 10 * 60 * 1000, // 10min — slower-moving data
    gcTime: 15 * 60 * 1000,
  });
  const dualLeads = Array.isArray(dualData?.data?.leads) ? dualData.data.leads
                  : Array.isArray(dualData?.leads) ? dualData.leads : [];

  const payload = feedsData?.data || feedsData;
  const priorityInsiders    = Array.isArray(payload?.priorityInsiders)    ? payload.priorityInsiders    : [];
  const targetedDiscoveries = Array.isArray(payload?.targetedDiscoveries) ? payload.targetedDiscoveries : [];

  const allFetched = [...priorityInsiders, ...targetedDiscoveries];

  const handleManualRefresh = () => {
    // Compute seen companies synchronously and write to ref BEFORE triggering the query
    const currentSeen = new Set(seenCompanyKeys);
    allFetched.forEach(l => { const k = l.company || l.companyName; if (k) currentSeen.add(k); });
    // Persist to sessionStorage
    try { sessionStorage.setItem(`cff_seen_companies_${user?.id}`, JSON.stringify([...currentSeen])); } catch {}
    // Write to ref synchronously — queryFn will read this immediately when refreshKey changes
    seenForExclusionRef.current = Array.from(currentSeen).filter(k => !savedCompanyKeys.has(k));
    // Now update state (async, just for UI consistency) and trigger the query
    setSeenCompanyKeys(currentSeen);
    setRefreshKey(k => k + 1);
    setLastRefreshed(new Date());
  };

  // Update pinned leads whenever new data arrives — keep pinned cards fresh with latest data
  // but never let a batch rotation remove them
  useEffect(() => {
    if (!allFetched.length) return;
    setPinnedLeads(prev => {
      const freshPinned = prev.map(pinned => {
        const updated = allFetched.find(l => (l.company || l.companyName) === (pinned.company || pinned.companyName));
        return updated || pinned;
      });
      return freshPinned;
    });
  }, [feedsData]); // eslint-disable-line

  // Rotate feed = pinned cards + fresh un-saved cards (saved ones never appear twice)
  const pinnedKeys = new Set(pinnedLeads.map(l => l.company || l.companyName));
  const freshCards = allFetched.filter(l => {
    const key = l.company || l.companyName;
    return !pinnedKeys.has(key) && !savedCompanyKeys.has(key);
  });
  const targetOpportunities = [...pinnedLeads, ...freshCards];
  const totalCount = targetOpportunities.length;
  const uniqueCompaniesCount = new Set(targetOpportunities.map(l => l.company || l.companyName)).size;
  const rawNetworkCount = targetOpportunities.reduce((sum, l) => sum + (l.alumniCount || 0) + (l.parentCount || 0), 0);
  // Use passed-in verified counts from the backend as a floor — never show 0
  const totalNetworkCount = rawNetworkCount > 0
    ? rawNetworkCount
    : Math.max(1, (verifiedAlumniCount || 0) + (verifiedParentsCount || 0));

  // Tab filtering
  const filteredOpportunities = activeTab === 'Network Backdoors'
    ? targetOpportunities.filter(l => (l.alumniCount || 0) + (l.parentCount || 0) > 0)
    : activeTab === 'Hidden Discoveries'
    ? targetOpportunities.filter(l => (l.alumniCount || 0) === 0 && (l.parentCount || 0) === 0)
    : targetOpportunities;

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
    pinLead(lead); // lock this card in place before the next batch
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
    pinLead(lead); // lock card before navigating away
    const company = lead.company || lead.companyName || '';
    const role = lead.role || lead.title || '';
    window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`;
  };

  const noGoals = !target_industries?.length && !effectiveRole;

  const tabDefs = [
    { key: 'All', label: 'All' },
    { key: 'Network Backdoors', label: `🤝 ${schoolAbbr} Network Backdoors` },
    { key: 'Hidden Discoveries', label: '🕵️‍♂️ Hidden Discoveries' },
  ];

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
            {isLoading ? <div className="h-6 bg-gray-200 rounded animate-pulse mt-1 mx-auto w-16" /> : <p className="text-lg font-black text-gray-800 mt-1">{uniqueCompaniesCount} Companies</p>}
            <p className="text-[11px] text-gray-500 mt-0.5">Actively tracked</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Insiders</p>
            {isLoading ? (
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
            {isLoading ? <div className="h-6 bg-orange-100 rounded animate-pulse mt-1 mx-auto w-14" /> : <p className="text-lg font-black text-orange-600 mt-1">{totalCount} Fresh</p>}
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
          <span className="font-bold text-purple-600">{isLoading ? '...' : targetOpportunities.length}</span> hand-picked opportunities
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

      {/* ── DUAL CONSTRAINT: Alumni-Verified + Active Jobs ── */}
      {(dualLoading || dualLeads.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Alumni-Verified Opportunities
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200">
              ✦ CLiFF Gold
            </span>
            {dualLoading && (
              <span className="text-[11px] text-gray-400 animate-pulse">Scanning alumni network...</span>
            )}
          </div>
          <p className="text-xs text-gray-500 -mt-1">
            Companies where <span className="font-semibold text-purple-700">{schoolAbbr} alumni already work</span> — cross-referenced with active openings for your target role.
          </p>

          {dualLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2].map(n => (
                <div key={n} className="h-28 bg-amber-50 rounded-2xl animate-pulse border border-amber-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dualLeads.map((lead, idx) => (
                <div
                  key={lead.company || idx}
                  className={`rounded-2xl border p-4 space-y-2.5 cursor-pointer hover:shadow-md transition-all ${
                    lead.signalTier === 'gold'
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                      : 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50'
                  }`}
                  onClick={() => setSelectedLead({
                    ...lead,
                    role: lead.role || effectiveRole,
                    alumniCount: lead.alumniCount,
                    // Map insiders → alumni shape expected by MatchDeepDiveModal
                    alumni: (lead.insiders || []).map(ins => ({
                      name: (ins.name || ins.headline || '').split(/[|\-·]/)[0].trim(),
                      role_title: (ins.headline || '').split(/[|\-·]/).slice(1).join(' ').trim() || 'Professional',
                      linkedin_url: ins.url || ins.linkedin_url || null,
                    })).filter(a => a.name && a.name.length > 1),
                    // Map first active job → jobDescription (prefer actual description, fallback to title)
                    jobDescription: lead.activeJobs?.[0]?.description
                      ? lead.activeJobs[0].description
                      : lead.activeJobs?.[0]?.title
                        ? `${lead.activeJobs[0].title}${lead.hasActiveJobs ? ' — reach out to your insider for the full details and a referral.' : ''}`
                        : `${lead.alumniCount} ${schoolAbbr} alumni work here. Message them directly to get a referral before the role posts publicly.`,
                  })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{lead.company}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{lead.role || effectiveRole}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lead.signalTier === 'gold'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {lead.signalTier === 'gold' ? '🏅 ACTIVE + ALUMNI' : '🎓 ALUMNI EDGE'}
                    </span>
                  </div>

                  {/* Alumni proof */}
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                    <span>🎓</span>
                    <span>{lead.alumniCount} {schoolAbbr} alumni at this company</span>
                  </div>

                  {/* Active job proof + description */}
                  {lead.hasActiveJobs && lead.activeJobs?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-green-700 font-semibold flex items-center gap-1.5">
                        <span>✅</span>
                        <a
                          href={lead.activeJobs[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="hover:underline"
                        >
                          {lead.activeJobs[0].title}
                        </a>
                      </div>
                      {lead.activeJobs[0].description && (
                        <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3 pl-5">
                          {lead.activeJobs[0].description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Insider names if available */}
                  {lead.insiders?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lead.insiders.slice(0, 2).map((insider, i) => (
                        <span key={i} className="text-[10px] bg-white/70 border border-purple-200 text-purple-600 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                          {insider.name?.split(/[|\-·]/)[0]?.trim() || 'Alumni'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToPipeline({ ...lead, role: lead.role || effectiveRole }); }}
                      className="flex-1 text-[11px] font-bold py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                      style={{ minHeight: 'auto' }}
                    >
                      + Pipeline
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleColdInroad({ ...lead, role: lead.role || effectiveRole, company: lead.company }); }}
                      className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg text-white transition ${
                        lead.signalTier === 'gold' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      style={{ minHeight: 'auto' }}
                    >
                      ⚡ Generate Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── UNIFIED Target-Matched Opportunities Feed ── */}
      <section className="space-y-4">
        {/* Section title row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Target-Matched Opportunities ({isLoading ? '…' : totalCount})
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Scouting Connections
            </span>
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
          </div>
        </div>

        {/* Three-tab filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabDefs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ minHeight: 'auto', minWidth: 'auto' }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((lead, idx) => (
              <DiscoveryJobCard
                key={lead.company || lead.companyName || idx}
                lead={lead}
                onAddToPipeline={handleAddToPipeline}
                onColdInroad={handleColdInroad}
                onSelect={setSelectedLead}
                schoolAbbr={schoolAbbr}
                isPinned={savedCompanyKeys.has(lead.company || lead.companyName)}
                onDismiss={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs">
            {activeTab === 'All'
              ? 'No matching industry vacancies found today. Adjust your target positions to broaden search.'
              : `No ${activeTab === 'Network Backdoors' ? 'network-connected' : 'hidden discovery'} roles found in your current feed.`}
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