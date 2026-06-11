import { useState, useEffect } from 'react';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { base44 } from '@/api/base44Client';

const MASCOT = { UF: '🐊', FSU: '🏹', UCF: '⚔️', USF: '🐂', UGA: '🐾', OSU: '🌰', USC: '✌️', UCLA: '🐻', UMICH: '〽️', PSU: '🦁', TULANE: '🌊', UDEL: '🐓', UMD: '🐢' };

export default function DiscoveryJobCard({ lead, onAddToPipeline, onColdInroad, onSelect, schoolAbbr, onDismiss, isPinned, insiderPill }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [added, setAdded] = useState(false);

  // Alumni search state
  const [alumniSearched, setAlumniSearched] = useState(false);
  const [alumniSearching, setAlumniSearching] = useState(false);
  const [foundAlumni, setFoundAlumni] = useState(null);

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
    
    companyTier = isEnterprise ? 1 : isMidMarket ? 2 : 3;
  }
  const TIER_BADGE = {
    1: { label: 'Enterprise', color: 'bg-slate-100 text-slate-600' },
    2: { label: 'Mid-Market', color: 'bg-blue-50 text-blue-600' },
    3: { label: '🚀 Startup', color: 'bg-purple-50 text-purple-700' },
  };
  const tierBadge = TIER_BADGE[companyTier] || TIER_BADGE[1];

  // Normalize all possible field names
  const companyName = lead.company || lead.companyName || lead.name || '';
  const jobTitle = lead.job_title || lead.role || '';
  const jobDesc = lead.jobDescription || lead.description || lead.hiring_description || '';
  const jobUrl = lead.job_url || lead.jobSource || '';

  const handleAddToPipeline = () => {
    if (!onAddToPipeline) return;
    onAddToPipeline(lead);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
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

  if (dismissed) return null;

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 flex flex-col justify-between min-h-[380px] hover:border-gray-300 transition-all relative">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h4 className="font-extrabold leading-tight text-base truncate" style={{ color: '#4f46e5' }}>{companyName}</h4>
            {jobTitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{jobTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {insiderPill && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {insiderPill}
              </span>
            )}
            {isPinned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                📌 Saved
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${tierBadge.color}`}>
              {tierBadge.label}
            </span>
            {!isPinned && (
              <button
                onClick={handleDismiss}
                className="text-gray-300 hover:text-gray-500 transition text-sm leading-none"
                title="Not interested"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
          {jobDesc ? (
            <>
              <p className="leading-relaxed text-sm">
                {jobDesc.length > 200 ? jobDesc.slice(0, 200).trimEnd() + '…' : jobDesc}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {jobDesc.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc(true)}
                    className="text-[11px] text-purple-600 font-bold hover:text-purple-700 underline cursor-pointer"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    Read Full Description →
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
                    View Posting ↗
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="leading-relaxed text-sm text-gray-400 italic">Click "Generate Message" to get a personalized outreach for this company.</p>
          )}
        </div>

        {/* Alumni Search Section */}
        <div className="mt-4">
          {!alumniSearched ? (
            <button
              onClick={handleSearchAlumni}
              disabled={alumniSearching}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-bold transition-colors"
              style={{ minHeight: 'auto', cursor: alumniSearching ? 'not-allowed' : 'pointer' }}
            >
              {alumniSearching ? (
                <><span className="inline-block animate-spin">⟳</span> Searching {school} alumni at {companyName}…</>
              ) : (
                <>{mascot} Search for {school} Alumni at {companyName}</>
              )}
            </button>
          ) : foundAlumni && foundAlumni.length > 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-purple-800">{mascot} Found {school} alumni at {companyName}!</p>
              <p className="text-[10px] text-purple-600">Pick who you'd like to reach out to:</p>
              {foundAlumni.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 bg-white border border-purple-100 rounded-lg px-3 py-2"
                  style={{ minHeight: 'auto' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{a.name}</p>
                    {a.role_title && <p className="text-[10px] text-gray-500 truncate">{a.role_title}</p>}
                  </div>
                  {a.linkedin_url && (
                    <a
                      href={a.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center flex-shrink-0"
                      title="View LinkedIn"
                      style={{ minHeight: 'auto', minWidth: 'auto', textDecoration: 'none' }}
                    >
                      <span className="text-white font-bold text-[10px]">in</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleSelectAlumni(a)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0 cursor-pointer"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    Select →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-600 font-semibold mb-1">No {school} alumni found here</p>
              <p className="text-xs text-gray-500">We'll suggest a contact to reach out to instead ↓</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="relative group">
          <button
            onClick={handleAddToPipeline}
            disabled={added}
            className={`p-2 border rounded-xl transition cursor-pointer ${added ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600'}`}
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            {added ? '✅' : '➕'}
          </button>
          {!added && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Add to Pipeline
            </div>
          )}
        </div>

        <button
          onClick={() => {
            // If alumni were found, draft for the first alumnus instead of a cold (non-alumni) contact
            if (foundAlumni && foundAlumni.length > 0) {
              handleSelectAlumni(foundAlumni[0]);
              return;
            }
            onColdInroad ? onColdInroad(lead) : (window.location.hash = `#OutreachDrafts?context=cold_outreach&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(jobTitle)}`);
          }}
          className="px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition tracking-wide uppercase flex-1 text-center cursor-pointer text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', minHeight: 'auto' }}
        >
          ⚡ Generate Message
        </button>
      </div>

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
  );
}