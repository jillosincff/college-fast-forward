import { useState, useEffect } from 'react';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { base44 } from '@/api/base44Client';
import useParentCompanies from '@/hooks/useParentCompanies';
import { getStandoutInsight } from '@/functions/getStandoutInsight';
import InAppApplyModal from './InAppApplyModal';

const MASCOT = { UF: '🐊', FSU: '🏹', UCF: '⚔️', USF: '🐂', UGA: '🐾', OSU: '🌰', USC: '✌️', UCLA: '🐻', UMICH: '〽️', PSU: '🦁', TULANE: '🌊', UDEL: '🐓', UMD: '🐢' };

export default function DiscoveryJobCard({ lead, onAddToPipeline, onTrackOnly, onColdInroad, onSelect, schoolAbbr, onDismiss, isPinned, insiderPill, user }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [added, setAdded] = useState(false);
  const [appliedExternally, setAppliedExternally] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Standout insight state
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Alumni search state
  const [alumniSearched, setAlumniSearched] = useState(false);
  const [alumniSearching, setAlumniSearching] = useState(false);
  const [foundAlumni, setFoundAlumni] = useState(null);

  const { hasParentAt } = useParentCompanies();
  const school = schoolAbbr || lead.schoolAbbr || 'UF';
  const mascot = MASCOT[school] || '🎓';
  // Use companyTier for size badge, fall back to inferring from company name if not set
  let companyTier = lead?.companyTier;
  if (companyTier === undefined || companyTier === null) {
    // Fallback: hardcoded corrections for well-known companies
    const name = (lead.company || lead.companyName || '').toLowerCase();
    
    const enterprise = ['amazon', 'google', 'microsoft', 'apple', 'meta', 'netflix', 'uber', 'jpmorgan', 'goldman sachs', 'morgan stanley', 'deloitte', 'pwc', 'ey', 'kpmg', 'mckinsey', 'bcg', 'bain', 'accenture', 'ibm', 'salesforce', 'oracle', 'sap', 'adobe', 'american express', 'amex', 'visa', 'target', 'walmart', 'costco', 'home depot', 'endeavor', 'disney', 'boeing', 'tesla', 'coca-cola', 'pepsi', 'pfizer', 'johnson & johnson'];
    const midMarket = ['celonis', 'notion', 'airtable', 'figma', 'canva', 'miro', 'asana', 'monday.com', 'hubspot', 'zendesk', 'atlassian', 'slack', 'zoom', 'dropbox', 'shopify', 'instacart', 'doordash', 'robinhood', 'coinbase', 'affirm', 'klarna', 'peloton', 'warby parker'];
    
    const isEnterprise = enterprise.some(c => name.includes(c) || c.includes(name));
    const isMidMarket = midMarket.some(c => name.includes(c) || c.includes(name));

    // Don't guess: if the company isn't in a known list, leave the size unknown
    companyTier = isEnterprise ? 1 : isMidMarket ? 2 : null;
  }
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || null;

  // Normalize all possible field names
  const companyName = lead.company || lead.companyName || lead.name || '';
  const jobTitle = lead.job_title || lead.role || '';
  const jobDesc = lead.jobDescription || lead.description || lead.hiring_description || '';
  const jobUrl = lead.job_url || lead.jobSource || '';

  // Saves + dismisses card from feed
  const handleAddToPipeline = (path = 'cold_apply') => {
    if (!onAddToPipeline) return;
    onAddToPipeline(lead, path);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // Tracks without removing card from feed
  const handleTrackOnly = (path = 'cold_apply') => {
    if (onTrackOnly) onTrackOnly(lead, path);
    else if (onAddToPipeline) onAddToPipeline(lead, path); // fallback for contexts without onTrackOnly
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleApplyExternal = () => {
    if (jobUrl) window.open(jobUrl, '_blank', 'noopener,noreferrer');
    setAppliedExternally(true);
    // Track silently — does NOT remove card from feed so student can still message alumni
    handleTrackOnly('cold_apply');
  };

  const handleLoadInsight = async () => {
    if (insight || loadingInsight) return;
    setLoadingInsight(true);
    try {
      const res = await getStandoutInsight({
        company: companyName,
        job_title: jobTitle,
        job_description: jobDesc,
        job_url: jobUrl,
      });
      const data = res?.data || res;
      if (data?.standout_tip) setInsight(data);
    } catch {}
    setLoadingInsight(false);
  };

  // Restore previously discovered alumni from the DiscoveredAlumni cache on mount —
  // results shouldn't vanish on refresh, and we avoid re-running the paid Exa search.
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
          setFoundAlumni(matches.map(a => ({
            name: a.name,
            role_title: a.role_title,
            company: a.company,
            linkedin_url: a.linkedin_url,
          })));
          setAlumniSearched(true);
        }
      } catch {
        // Cache lookup is best-effort; the search button remains available
      }
    };
    loadCached();
    return () => { cancelled = true; };
  }, [companyName, school]);

  const handleSearchAlumni = async () => {
    setAlumniSearching(true);
    try {
      const res = await scoutCompanyBackdoor({ jobId: companyName, companyName });
      const data = res?.data || res;
      setFoundAlumni(data?.alumni || []);
      setAlumniSearched(true);
    } catch (err) {
      setFoundAlumni([]);
      setAlumniSearched(true);
    } finally {
      setAlumniSearching(false);
    }
  };

  const handleSelectAlumni = (alumni) => {
    // Route directly to the alumni outreach draft for the chosen person
    window.location.hash = `#OutreachDrafts?context=alumni_search&company=${encodeURIComponent(companyName)}&jobTitle=${encodeURIComponent(jobTitle)}&alumniName=${encodeURIComponent(alumni.name || '')}&alumniRole=${encodeURIComponent(alumni.role_title || '')}&alumniLinkedin=${encodeURIComponent(alumni.linkedin_url || '')}&skipForm=1`;
  };

  // derive top signal badges
  const hasAlumniSignal = (foundAlumni && foundAlumni.length > 0) || lead.hasAlumni;
  const hasParentSignal = hasParentAt(companyName);

  if (dismissed) return null;

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all relative overflow-hidden">
      {/* Top signal strip */}
      {(hasAlumniSignal || hasParentSignal || insiderPill) && (
        <div className={`px-4 py-1.5 flex items-center gap-2 text-[11px] font-bold ${
          hasAlumniSignal ? 'bg-purple-600 text-white' :
          hasParentSignal ? 'bg-emerald-600 text-white' :
          'bg-indigo-50 text-indigo-700 border-b border-indigo-100'
        }`}>
          {hasAlumniSignal && <><span>👥</span> {lead.alumniCount ? `${lead.alumniCount} ` : ''}{school} alumni here — warm path</>}
          {!hasAlumniSignal && hasParentSignal && <><span>🤝</span> Parent in your network works here</>}
          {!hasAlumniSignal && !hasParentSignal && insiderPill && <>{insiderPill}</>}
        </div>
      )}

      <div className="p-5">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h4 className="font-extrabold leading-tight text-base truncate" style={{ color: '#4f46e5' }}>{companyName}</h4>
            {jobTitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{jobTitle}</p>
            )}
            {/* Inline badges row */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tierBadge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>
                  {tierBadge.label}
                </span>
              )}
              {isPinned && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                  📌 Saved
                </span>
              )}
              {insight?.competitiveness_label && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  insight.competitiveness_label === 'Low' ? 'bg-green-50 text-green-700' :
                  insight.competitiveness_label === 'Moderate' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>{insight.competitiveness_label} Competition</span>
              )}
            </div>
          </div>
          {!isPinned && (
            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-gray-500 transition text-sm leading-none flex-shrink-0"
              title="Not interested"
              aria-label="Dismiss"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Job Description — collapsed by default */}
        {jobDesc ? (
          <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="leading-relaxed text-sm line-clamp-3">{jobDesc}</p>
            <div className="flex items-center gap-3 mt-2">
              {jobDesc.length > 120 && (
                <button
                  onClick={() => setShowFullDesc(true)}
                  className="text-[11px] text-purple-600 font-bold hover:text-purple-700 underline cursor-pointer"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  Read more →
                </button>
              )}
              {jobUrl && (
                <a
                  href={jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 font-bold hover:text-blue-700 underline"
                  onClick={e => e.stopPropagation()}
                >
                  View posting ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg p-3 border border-gray-100">No description available for this role.</div>
        )}

        {/* Standout insight */}
        <div className="mt-3">
          {!insight && !loadingInsight ? (
            <button
              onClick={handleLoadInsight}
              className="w-full text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors text-left cursor-pointer"
              style={{ minHeight: 'auto' }}
            >
              💡 How to stand out for this role →
            </button>
          ) : loadingInsight ? (
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 animate-pulse">Asking CLIFF AI…</div>
          ) : insight ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">💡 CLIFF Insight</span>
                {insight.competitiveness_label && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    insight.competitiveness_label === 'Low' ? 'bg-green-100 text-green-700' :
                    insight.competitiveness_label === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{insight.competitiveness_label} Competition</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">{insight.standout_tip}</p>
            </div>
          ) : null}
        </div>

        {/* Alumni Section */}
        <div className="mt-3">
          {!alumniSearched ? (
            <button
              onClick={handleSearchAlumni}
              disabled={alumniSearching}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                lead.hasAlumni
                  ? 'border-purple-400 bg-purple-600 text-white hover:bg-purple-700'
                  : 'border-dashed border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
              style={{ minHeight: 'auto', cursor: alumniSearching ? 'not-allowed' : 'pointer' }}
            >
              {alumniSearching ? (
                <><span className="inline-block animate-spin">⟳</span> Searching {school} alumni…</>
              ) : lead.hasAlumni ? (
                <>{mascot} {lead.alumniCount} {school} alumni here — view contacts</>
              ) : (
                <>{mascot} Search for {school} Alumni at {companyName}</>
              )}
            </button>
          ) : foundAlumni && foundAlumni.length > 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-purple-800">{mascot} {foundAlumni.length} {school} alumni at {companyName}</p>
              {foundAlumni.slice(0, 3).map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white border border-purple-100 rounded-lg px-3 py-2" style={{ minHeight: 'auto' }}>
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
                    onClick={() => { handleTrackOnly('alumni_outreach'); handleSelectAlumni(a); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0 cursor-pointer"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    Message →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-2">No {school} alumni found — CLIFF can find a direct contact instead.</p>
              <button
                onClick={() => {
                  onColdInroad ? onColdInroad(lead) : (window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(jobTitle)}`);
                }}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                style={{ minHeight: 'auto' }}
              >
                Find a Hiring Manager →
              </button>
            </div>
          )}
        </div>

      {/* Three-Path Action Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
        {/* Path 1: Primary CTA — outreach */}
        <button
          onClick={() => {
            if (foundAlumni && foundAlumni.length > 0) {
              handleTrackOnly('alumni_outreach');
              handleSelectAlumni(foundAlumni[0]);
              return;
            }
            handleTrackOnly(alumniSearched ? 'hiring_manager' : 'cold_apply');
            onColdInroad ? onColdInroad(lead) : (window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(jobTitle)}`);
          }}
          className="w-full px-4 py-3 font-extrabold text-sm rounded-xl shadow-md transition tracking-wide text-center cursor-pointer text-white active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', minHeight: 'auto' }}
        >
          ⚡ {foundAlumni?.length > 0 ? `Message Alumni at ${companyName}` : 'Generate Outreach Message'}
        </button>

        {/* Path 2: Apply via CFF (secondary) + external link */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex-1 py-2.5 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer active:scale-95"
            style={{ minHeight: 'auto' }}
          >
            📋 Apply &amp; Track via CFF
          </button>
          {jobUrl && (
            <button
              onClick={handleApplyExternal}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
              title="Apply on company site"
              aria-label="Apply externally"
            >
              {appliedExternally ? '✅' : '↗'}
            </button>
          )}
        </div>
      </div>

      {/* In-App Apply Modal */}
      {showApplyModal && (
        <InAppApplyModal
          lead={lead}
          user={user}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            handleTrackOnly('cold_apply');
            setTimeout(() => setShowApplyModal(false), 2500);
          }}
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
              <button
                onClick={() => setShowFullDesc(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-sm text-gray-700 space-y-3 leading-relaxed">
              {(jobDesc || '').split(/\n\n+|\n+/).filter(p => p.trim()).map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              {jobUrl && (
                <a href={jobUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-bold hover:underline">
                  View Original Posting ↗
                </a>
              )}
              <button
                onClick={() => setShowFullDesc(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer ml-auto"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}