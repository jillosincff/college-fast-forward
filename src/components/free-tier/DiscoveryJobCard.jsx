import { useState, useEffect } from 'react';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { base44 } from '@/api/base44Client';
import useParentCompanies from '@/hooks/useParentCompanies';
import { getStandoutInsight } from '@/functions/getStandoutInsight';
import WarmApplyFlow from './WarmApplyFlow';
import JobCardPlanCTA from './JobCardPlanCTA';

const MASCOT = { UF: '🐊', FSU: '🏹', UCF: '⚔️', USF: '🐂', UGA: '🐾', OSU: '🌰', USC: '✌️', UCLA: '🐻', UMICH: '〽️', PSU: '🦁', TULANE: '🌊', UDEL: '🐓', UMD: '🐢' };

export default function DiscoveryJobCard({ lead, onAddToPipeline, onTrackOnly, onColdInroad, onSelect, schoolAbbr, onDismiss, isPinned, insiderPill, user, compact, access, pursuit, rank, onUpgrade }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [appliedExternally, setAppliedExternally] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Insight state
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  // Alumni search state — the smart entry point
  // Phase: 'idle' | 'searching' | 'found' | 'not_found'
  const [alumniPhase, setAlumniPhase] = useState('idle');
  const [foundAlumni, setFoundAlumni] = useState(null);

  const { hasParentAt } = useParentCompanies();
  const school = schoolAbbr || lead.schoolAbbr || 'UF';
  const mascot = MASCOT[school] || '🎓';

  // Company size tier
  let companyTier = lead?.companyTier;
  if (companyTier === undefined || companyTier === null) {
    const name = (lead.company || lead.companyName || '').toLowerCase();
    const enterprise = ['amazon', 'google', 'microsoft', 'apple', 'meta', 'netflix', 'uber', 'jpmorgan', 'goldman sachs', 'morgan stanley', 'deloitte', 'pwc', 'ey', 'kpmg', 'mckinsey', 'bcg', 'bain', 'accenture', 'ibm', 'salesforce', 'oracle', 'sap', 'adobe', 'american express', 'amex', 'visa', 'target', 'walmart', 'costco', 'home depot', 'endeavor', 'disney', 'boeing', 'tesla', 'coca-cola', 'pepsi', 'pfizer', 'johnson & johnson'];
    const midMarket = ['celonis', 'notion', 'airtable', 'figma', 'canva', 'miro', 'asana', 'monday.com', 'hubspot', 'zendesk', 'atlassian', 'slack', 'zoom', 'dropbox', 'shopify', 'instacart', 'doordash', 'robinhood', 'coinbase', 'affirm', 'klarna', 'peloton', 'warby parker'];
    companyTier = enterprise.some(c => name.includes(c) || c.includes(name)) ? 1 : midMarket.some(c => name.includes(c) || c.includes(name)) ? 2 : null;
  }
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || null;

  // Normalize field names
  const companyName = lead.company || lead.companyName || lead.name || '';
  const jobTitle = lead.job_title || lead.role || '';
  const jobDesc = lead.jobDescription || lead.description || lead.hiring_description || '';
  const jobUrl = lead.job_url || lead.jobSource || '';
  const location = lead.location || lead.location_text || '';
  const salary = lead.salary_range || lead.salary || '';
  
  // Calculate freshness from posted_date
  const getFreshnessBadge = () => {
    if (!lead.posted_date) return null;
    const posted = new Date(lead.posted_date);
    const now = new Date();
    const daysAgo = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    
    if (daysAgo <= 2) {
      return { label: '🆕 New Today', color: 'bg-green-50 text-green-700 border-green-200', text: `Posted ${daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : '2 days ago'}` };
    } else if (daysAgo <= 5) {
      return { label: 'This Week', color: 'bg-blue-50 text-blue-700 border-blue-200', text: `Posted ${daysAgo} days ago` };
    } else if (daysAgo <= 10) {
      return { label: 'Recent', color: 'bg-amber-50 text-amber-700 border-amber-200', text: `Posted ${daysAgo}d ago` };
    } else {
      return { label: 'Older', color: 'bg-gray-50 text-gray-500 border-gray-200', text: `Posted ${daysAgo}d ago` };
    }
  };
  
  const freshnessBadge = getFreshnessBadge();

  const handleTrackOnly = (path = 'cold_apply') => {
    if (onTrackOnly) onTrackOnly(lead, path);
    else if (onAddToPipeline) onAddToPipeline(lead, path);
  };

  const handleDismiss = () => { setDismissed(true); onDismiss?.(); };

  const handleApplyExternal = () => {
    if (jobUrl) window.open(jobUrl, '_blank', 'noopener,noreferrer');
    setAppliedExternally(true);
    handleTrackOnly('cold_apply');
    try { base44.analytics.track({ eventName: 'external_apply_clicked', properties: { company: companyName, role: jobTitle, card_rank: rank ?? 0 } }); } catch {}
  };

  const handleLoadInsight = async () => {
    if (insight) { setShowInsight(true); return; }
    if (loadingInsight) return;
    setLoadingInsight(true);
    setShowInsight(true);
    try {
      const res = await getStandoutInsight({ company: companyName, job_title: jobTitle, job_description: jobDesc, job_url: jobUrl });
      const data = res?.data || res;
      if (data?.standout_tip) setInsight(data);
    } catch {}
    setLoadingInsight(false);
  };

  const handleSelectAlumni = (alumni) => {
    handleTrackOnly('alumni_outreach');
    window.location.hash = `#OutreachDrafts?context=alumni_search&company=${encodeURIComponent(companyName)}&jobTitle=${encodeURIComponent(jobTitle)}&alumniName=${encodeURIComponent(alumni.name || '')}&alumniRole=${encodeURIComponent(alumni.role_title || '')}&alumniLinkedin=${encodeURIComponent(alumni.linkedin_url || '')}&skipForm=1`;
  };

  const handleHiringManagerOutreach = () => {
    handleTrackOnly('hiring_manager');
    onColdInroad ? onColdInroad(lead) : (window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(jobTitle)}`);
  };

  // Smart entry point: search alumni first
  const handleFindConnection = async () => {
    // If already searched, just show the cached result
    if (alumniPhase === 'found' || alumniPhase === 'not_found') return;
    setAlumniPhase('searching');
    try {
      const res = await scoutCompanyBackdoor({ jobId: companyName, companyName });
      const data = res?.data || res;
      const alumni = data?.alumni || [];
      setFoundAlumni(alumni);
      setAlumniPhase(alumni.length > 0 ? 'found' : 'not_found');
    } catch {
      setFoundAlumni([]);
      setAlumniPhase('not_found');
    }
  };

  // Load cached alumni from DiscoveredAlumni on mount
  useEffect(() => {
    let cancelled = false;
    const loadCached = async () => {
      if (!companyName) return;
      try {
        const cached = await base44.entities.DiscoveredAlumni.filter({ school_code: school }, '-created_date', 100);
        const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matches = (cached || []).filter(a => {
          const c = (a.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return c && (c.includes(cleanCompany) || cleanCompany.includes(c));
        });
        if (!cancelled && matches.length > 0) {
          setFoundAlumni(matches.map(a => ({ name: a.name, role_title: a.role_title, company: a.company, linkedin_url: a.linkedin_url })));
          setAlumniPhase('found');
        }
      } catch {}
    };
    loadCached();
    return () => { cancelled = true; };
  }, [companyName, school]);

  const hasAlumniSignal = alumniPhase === 'found' || lead.hasAlumni;
  const hasParentSignal = hasParentAt(companyName);

  if (dismissed) return null;

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col hover:border-indigo-200 hover:shadow-md transition-all relative" style={{ paddingBottom: compact ? '12px' : '16px' }}>

      {/* Top signal strip */}
      {(hasAlumniSignal || hasParentSignal || insiderPill) && (
        <div className={`px-4 py-1.5 flex items-center gap-2 text-[11px] font-bold ${
          hasAlumniSignal ? 'bg-purple-600 text-white' :
          hasParentSignal ? 'bg-emerald-600 text-white' :
          'bg-indigo-50 text-indigo-700 border-b border-indigo-100'
        }`}>
          {hasAlumniSignal && <>{lead.alumniCount ? `${lead.alumniCount} ` : ''}{school} alumni here — warm path available</>}
          {!hasAlumniSignal && hasParentSignal && <>A parent in your network works here</>}
          {!hasAlumniSignal && !hasParentSignal && insiderPill && <>{insiderPill}</>}
        </div>
      )}

      <div className={`flex flex-col gap-2 flex-1 ${compact ? 'p-3' : 'p-5'}`} style={{ overflow: 'visible' }}>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h4 className="font-extrabold leading-tight text-base truncate" style={{ color: '#4f46e5' }}>{companyName}</h4>
            {jobTitle && <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{jobTitle}</p>}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tierBadge && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>{tierBadge.label}</span>
              )}
              {freshnessBadge && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${freshnessBadge.color}`} title={freshnessBadge.text}>
                  {freshnessBadge.label}
                </span>
              )}
              {isPinned && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Saved</span>
              )}
              {jobUrl && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Easy Apply
                </span>
              )}
              {hasAlumniSignal && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Alumni Network
                </span>
              )}
              {(lead.alumniCount >= 3 || lead.leadTier === 'target') && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  High Match
                </span>
              )}
            </div>
          </div>
          {!isPinned && (
            <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition text-sm flex-shrink-0" title="Not interested" aria-label="Dismiss" style={{ minHeight: 'auto', minWidth: 'auto' }}>✕</button>
          )}
        </div>

        {/* Standardized metadata row — always shown for consistency */}
        {(location || salary) && (
          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
            {location && <span className="flex items-center gap-0.5 truncate">📍 {location}</span>}
            {salary && <span className="flex items-center gap-0.5 truncate">💰 {salary}</span>}
          </div>
        )}

        {/* Job description — single line in compact mode, boxed in full mode */}
        {jobDesc && (
          compact ? (
            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
              {jobDesc}
              {jobDesc.length > 100 && (
                <button onClick={() => setShowFullDesc(true)} className="text-purple-600 font-bold hover:underline ml-1 cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>more</button>
              )}
            </p>
          ) : (
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="leading-relaxed text-sm line-clamp-2">{jobDesc}</p>
              {jobDesc.length > 100 && (
                <button onClick={() => setShowFullDesc(true)} className="text-[11px] text-purple-600 font-bold hover:underline mt-1.5 cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>Read more →</button>
              )}
            </div>
          )
        )}

        {/* ── PRIMARY CTA: one plan-aware workflow action ── */}
        {(alumniPhase === 'idle' || alumniPhase === 'found') && (
          <>
            <JobCardPlanCTA
              access={access}
              pursuit={pursuit}
              rank={rank ?? 0}
              onUpgrade={onUpgrade}
              companyName={companyName}
              jobTitle={jobTitle}
              jobDesc={jobDesc}
              jobUrl={jobUrl}
              location={location}
              salary={salary}
              alumniCount={lead.alumniCount || 0}
            />
            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full py-2 rounded-xl border-2 border-indigo-200 bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-all cursor-pointer active:scale-[0.98]"
              style={{ minHeight: 'auto' }}
            >
              📋 Apply &amp; Track via CFF
            </button>
          </>
        )}

        {/* ── SMART CONNECTION FLOW ── */}
        <div className="space-y-2">

          {/* Phase: idle — secondary CTA (downstyled to ghost/outline) */}
          {alumniPhase === 'idle' && (
            <button
              onClick={handleFindConnection}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 text-purple-700 border-2 border-purple-200 bg-transparent hover:bg-purple-50"
              style={{ minHeight: 'auto' }}
            >
              <span style={{ color: '#7c3aed' }}>{mascot}</span> Find {school} Network
            </button>
          )}

          {/* Phase: searching */}
          {alumniPhase === 'searching' && (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold">
              <span className="inline-block animate-spin">⟳</span> Searching {school} alumni database…
            </div>
          )}

          {/* Phase: found — show alumni list with outreach CTAs */}
          {alumniPhase === 'found' && foundAlumni && foundAlumni.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-extrabold text-purple-800">{mascot} {foundAlumni.length} {school} alumni found at {companyName}</p>
              {foundAlumni.slice(0, 3).map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white border border-purple-100 rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{a.name}</p>
                    {a.role_title && <p className="text-[10px] text-gray-500 truncate">{a.role_title}</p>}
                  </div>
                  {a.linkedin_url && (
                    <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center flex-shrink-0"
                      style={{ minHeight: 'auto', minWidth: 'auto', textDecoration: 'none' }}>
                      <span className="text-white font-bold text-[10px]">in</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleSelectAlumni(a)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0 cursor-pointer"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    ⚡ Message →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Phase: not_found — graceful fallback with two clear options */}
          {alumniPhase === 'not_found' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-amber-800">No {school} alumni found at {companyName} — here are your next best options:</p>
              <button
                onClick={handleHiringManagerOutreach}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer active:scale-95"
                style={{ minHeight: 'auto' }}
              >
                ⚡ Option A: Message a Hiring Manager
              </button>
              <button
                onClick={() => { handleLoadInsight(); setShowApplyModal(true); }}
                className="w-full py-2.5 rounded-xl border-2 border-indigo-300 bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors cursor-pointer active:scale-95"
                style={{ minHeight: 'auto' }}
              >
                📋 Option B: Tailor Resume &amp; Apply with Stand-Out Tips
              </button>
            </div>
          )}

          {/* CLIFF Insight — shown on demand or after fallback */}
          {showInsight && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">💡 CLIFF Stand-Out Tips</span>
                <button onClick={() => setShowInsight(false)} className="text-amber-500 hover:text-amber-800 text-xs font-bold leading-none" style={{ minHeight: 'auto', minWidth: 'auto' }}>✕</button>
              </div>
              {loadingInsight ? (
                <p className="text-[11px] text-amber-700 animate-pulse">Asking CLIFF AI…</p>
              ) : insight ? (
                <p className="text-[11px] text-amber-900 leading-relaxed">{insight.standout_tip}</p>
              ) : (
                <p className="text-[11px] text-amber-600">Loading insight…</p>
              )}
            </div>
          )}

          {/* Secondary actions — subtle text links with better spacing */}
          {(alumniPhase === 'found' || alumniPhase === 'idle') && (
            <div className="flex items-center justify-between gap-2 pt-1 pb-1">
              {alumniPhase === 'idle' && (
                <button
                  onClick={handleLoadInsight}
                  className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  💡 Stand-Out Tips
                </button>
              )}
              {jobUrl && (
                <button
                  onClick={handleApplyExternal}
                  className="text-[11px] text-gray-500 font-bold hover:text-gray-700 cursor-pointer flex items-center gap-0.5 ml-auto"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                  title="Apply on company site"
                >
                  Apply on site {appliedExternally ? '✅' : '↗'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unified warm-apply flow: connection → outreach → tracked → tailor.
          The flow writes to the pipeline itself — no extra tracking call. */}
      {showApplyModal && (
        <WarmApplyFlow
          job={{ company: companyName, role: jobTitle, jobUrl }}
          user={user}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      {/* Full Description Modal */}
      {showFullDesc && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{companyName}</h3>
                <p className="text-xs text-gray-500 font-medium">{jobTitle} — Full Description</p>
              </div>
              <button onClick={() => setShowFullDesc(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-sm text-gray-700 space-y-3 leading-relaxed">
              {(jobDesc || '').split(/\n\n+|\n+/).filter(p => p.trim()).map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              {jobUrl && (
                <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold hover:underline">View Original Posting ↗</a>
              )}
              <button onClick={() => setShowFullDesc(false)} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer ml-auto" style={{ minHeight: 'auto', minWidth: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}