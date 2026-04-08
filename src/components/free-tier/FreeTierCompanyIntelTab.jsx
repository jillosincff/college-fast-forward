import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import AddTargetCompanyModal from './AddTargetCompanyModal';
import { base44 } from '@/api/base44Client';
import { getCompanyIntel } from '@/functions/getCompanyIntel';
import { researchSpecificCompany } from '@/functions/researchSpecificCompany';
import { discoverCompanies } from '@/functions/discoverCompanies';
import CompanyIntelCard from './CompanyIntelCard';
import CompanyResearchChat from './CompanyResearchChat';

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'hiring', label: '🟢 Actively Hiring' },
  { key: 'cff',    label: '👥 CFF Network' },
  { key: 'best',   label: '⭐ Best Opportunities' },
  { key: 'saved',  label: '🔖 Saved' },
];

const EXAMPLE_CHIPS = ['Biotech in New York', 'Chicago finance firms', 'Miami e-commerce', 'Sustainability startups in Austin'];

function isSpecificCompany(query) {
  return query.split(' ').length <= 3 && !query.includes(' in ') && !query.includes(' at ') && !query.includes(' hiring ');
}

function FilterBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: '#f5f5f5', borderRadius: 100, width: '100%', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
      {FILTERS.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)} style={{
          padding: '8px 16px', borderRadius: 100,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          fontWeight: active === f.key ? 600 : 500,
          cursor: 'pointer', border: 'none',
          background: active === f.key ? '#fff' : 'transparent',
          color: active === f.key ? '#0d1117' : '#666',
          boxShadow: active === f.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s ease', whiteSpace: 'nowrap', minHeight: 44, flexShrink: 0,
        }}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

function DiscoveredCompanyCard({ company, onAddToList, onResearchMore, added }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#0d1117', margin: '0 0 4px' }}>{company.name}</p>
          {company.careers_url && (
            <a href={company.careers_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#0077B5', textDecoration: 'none', fontWeight: 500 }}>
              🔗 Careers page →
            </a>
          )}
        </div>
        <span style={{
          background: company.hiring_signal === 'active' ? '#DCFCE7' : company.hiring_signal === 'selective' ? '#FEF9C3' : '#F5F5F5',
          color: company.hiring_signal === 'active' ? '#166534' : company.hiring_signal === 'selective' ? '#854D0E' : '#888',
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {company.hiring_signal === 'active' ? '🟢 Actively Hiring' : company.hiring_signal === 'selective' ? '🟡 Selective' : '⚪ Unknown'}
        </span>
      </div>
      {company.hiring_summary && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.5, margin: '0 0 10px' }}>{company.hiring_summary}</p>
      )}
      {company.open_role_types?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {company.open_role_types.slice(0, 4).map(r => (
            <span key={r} style={{ background: '#F5F5F5', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#555', fontFamily: "'DM Sans', sans-serif" }}>{r}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onAddToList(company.name)} disabled={added} style={{ background: added ? '#DCFCE7' : '#E85D20', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: added ? '#166534' : '#fff', cursor: added ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
          {added ? '✓ Added to My List' : '+ Add to My List'}
        </button>
        <button onClick={() => onResearchMore(company.name)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
          Research More →
        </button>
      </div>
    </div>
  );
}

export default function FreeTierCompanyIntelTab({ user, onOpenUpgrade, onTabChange }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [targetRoles, setTargetRoles] = useState([]);
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [hasGoals, setHasGoals] = useState(true);
  const [filter, setFilter] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [researchCompany, setResearchCompany] = useState(null);
  const [savedCompanies, setSavedCompanies] = useState(() => user?.saved_company_intel || []);
  const [localTargetCompanies, setLocalTargetCompanies] = useState(() => user?.career_goals?.target_companies || []);
  const [showAll, setShowAll] = useState(false);
  const [skippedGoals, setSkippedGoals] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [researchError, setResearchError] = useState(null);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [addedToList, setAddedToList] = useState([]);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq' || user?.trial_status === 'active' || user?.fastiq_trial_active === true);

  useEffect(() => {
    if (!user?.id) return;
    const goals = user?.career_goals || {};
    const goalsExist = (goals.target_industries?.length > 0) || (goals.target_roles?.length > 0) || (goals.target_companies?.length > 0);
    if (!goalsExist) { setHasGoals(false); return; }
    setTargetRoles([...(goals.target_roles || []), ...(user?.target_roles || [])].filter(Boolean));
    setTargetIndustries([...(goals.target_industries || []), ...(user?.target_industries || [])].filter(Boolean));
    setHasGoals(true);
  }, [user?.id]);

  const loadCompanies = async () => {
    setLoading(true);
    setLoadingQuery('your goals');
    setResearchError(null);
    try {
      const res = await getCompanyIntel({ student_id: user.id });
      const data = res?.data || res;
      if (data.noGoals) { setHasGoals(false); setLoading(false); return; }
      setCompanies(prev => {
        const incoming = data.companies || [];
        const manual = prev.filter(p => !incoming.find(c => c.name.toLowerCase() === p.name.toLowerCase()));
        return [...manual, ...incoming];
      });
      setTargetRoles(data.targetRoles || []);
      setTargetIndustries(data.targetIndustries || []);
    } catch (e) {
      setResearchError("Couldn't load company intel. Please try again.");
    }
    setLoading(false);
    setLoadingQuery('');
  };

  const handleResearch = async (queryOverride) => {
    const query = (queryOverride || searchInput).trim();
    if (!query) return;

    setResearchError(null);
    setDiscoverResults([]);
    setFilterSearch('');
    setFilter('all');

    if (isSpecificCompany(query)) {
      // Single company research
      setLoading(true);
      setLoadingQuery(query);
      try {
        const res = await researchSpecificCompany({ companyName: query, userId: user.id, schoolCode: user.school || user.university || '' });
        const data = res?.data || res;
        if (!data?.success || !data?.data) throw new Error('no_data');
        const intel = data.data;
        const newCompany = {
          name: intel.company_name, hiring_signal: intel.is_actively_hiring ? 'active' : 'selective',
          known_for: intel.hiring_summary || '', careers_url: intel.careers_url || '',
          culture_notes: intel.culture_notes || '', application_tips: intel.application_tips || '',
          headquarters: '', size: 'enterprise', what_they_look_for: [],
          entry_level_programs: null, campus_recruiting: false,
          cff_parent_count: 0, cff_parents: [], alumni_count: null, is_combo: false,
          signals: { open_roles: { count: intel.open_role_types?.length || 0, matched_roles: intel.open_role_types || [] } },
        };
        setHasStarted(true);
        setCompanies(prev => [newCompany, ...prev.filter(c => c.name.toLowerCase() !== newCompany.name.toLowerCase())]);
        setFilterSearch(intel.company_name);
        setShowAll(true);
      } catch (e) {
        // Fallback: try broad discover search
        try {
          const fallbackRes = await discoverCompanies({ query: `${query} company jobs hiring careers` });
          const fallbackData = fallbackRes?.data || fallbackRes;
          if (fallbackData?.success && fallbackData?.companies?.length > 0) {
            setDiscoverResults(fallbackData.companies);
          } else {
            setResearchError(`We couldn't find hiring data for "${query}". Try a different spelling or a broader search like "${query} company jobs".`);
          }
        } catch (_) {
          setResearchError(`We couldn't find hiring data for "${query}". Try a different spelling or a broader search.`);
        }
      }
      setLoading(false);
      setLoadingQuery('');
    } else {
      // Natural language discovery
      setLoading(true);
      setLoadingQuery(query);
      try {
        const res = await discoverCompanies({ query });
        const data = res?.data || res;
        if (!data?.success || !data?.companies?.length) throw new Error('no_results');
        setDiscoverResults(data.companies);
      } catch (e) {
        setResearchError(`No companies found for "${query}". Try rephrasing — e.g. add a city, role type, or industry.`);
      }
      setLoading(false);
      setLoadingQuery('');
    }
  };

  const handleAddDiscoveredToList = async (companyName) => {
    setAddedToList(prev => [...prev, companyName]);
    const updated = [...localTargetCompanies, companyName];
    setLocalTargetCompanies(updated);
    try {
      await base44.auth.updateMe({ career_goals: { ...(user?.career_goals || {}), target_companies: updated } });
    } catch (_) {}
  };

  const handleSave = async (name) => {
    const updated = [...savedCompanies, name];
    setSavedCompanies(updated);
    await base44.auth.updateMe({ saved_company_intel: updated }).catch(() => {});
  };

  const handleUnsave = async (name) => {
    const updated = savedCompanies.filter(c => c !== name);
    setSavedCompanies(updated);
    await base44.auth.updateMe({ saved_company_intel: updated }).catch(() => {});
  };

  const filteredCompanies = companies.filter(c => {
    if (filterSearch) return c.name.toLowerCase().includes(filterSearch.toLowerCase());
    if (filter === 'hiring') return c.hiring_signal === 'active';
    if (filter === 'cff') return c.cff_parent_count > 0 || c.alumni_count > 0;
    if (filter === 'best') return c.is_combo;
    if (filter === 'saved') return savedCompanies.includes(c.name);
    return true;
  });

  const visibleCompanies = showAll ? filteredCompanies : filteredCompanies.slice(0, 6);
  const role = targetRoles[0] || '';
  const industry = targetIndustries[0] || '';

  if (!user) return null;

  const renderTargetCompanies = () => {
    if (localTargetCompanies.length === 0) return (
      <div style={{ background: '#FFF5F0', border: '1px dashed rgba(232,93,32,0.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>Research companies you're interested in</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>We'll show you hiring signals and alumni at the companies you care about most.</p>
        </div>
        <button onClick={() => setShowAddCompanyModal(true)} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 44 }}>+ Add Target Companies →</button>
      </div>
    );

    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', margin: 0 }}>🎯 YOUR TARGET COMPANIES</p>
          <button onClick={() => setShowAddCompanyModal(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#AAAAAA', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Edit →</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 10, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {localTargetCompanies.map(company => (
            <div key={company} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#E85D20', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                  {company[0]?.toUpperCase()}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{company}</p>
              </div>
              <button
                onClick={() => { setSearchInput(company); handleResearch(company); }}
                style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto', width: '100%' }}
              >
                Research →
              </button>
            </div>
          ))}
          <div onClick={() => setShowAddCompanyModal(true)} style={{ background: '#F5F5F5', border: '1px dashed #CCCCCC', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minWidth: 100 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>+ Add</span>
          </div>
        </div>
        <div style={{ height: 1, background: '#F0F0F0', margin: '16px 0 0' }} />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Goals banner */}
      {!hasGoals && !skippedGoals && (
        <div style={{ background: '#FFF5F5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EF4444', margin: 0, fontWeight: 500 }}>⚠️ Add target companies so we can find the right intel for you.</p>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setShowAddCompanyModal(true)} style={{ background: '#EF4444', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Add Companies →</button>
            <button onClick={() => setSkippedGoals(true)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Explore anyway</button>
          </div>
        </div>
      )}

      {/* Target companies */}
      {renderTargetCompanies()}

      {/* Unified search bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#aaa' }} />
            <input
              type="text"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setResearchError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleResearch()}
              placeholder="Search a company or describe what you're looking for..."
              style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 13, paddingBottom: 13, borderRadius: 100, border: '1px solid #e5e5e5', background: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', minHeight: 48 }}
            />
          </div>
          <button
            onClick={() => handleResearch()}
            disabled={loading || !searchInput.trim()}
            style={{ background: '#0d1117', border: 'none', borderRadius: 100, padding: '13px 22px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: loading || !searchInput.trim() ? 'not-allowed' : 'pointer', opacity: !searchInput.trim() ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
          >
            Research →
          </button>
        </div>

        {/* Example chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {EXAMPLE_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => { setSearchInput(chip); handleResearch(chip); }}
              style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto', transition: 'all 0.15s' }}
            >
              {chip}
            </button>
          ))}
        </div>


      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ background: '#F9F9F9', borderRadius: 12, padding: '24px', margin: '24px 0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Loader2 style={{ width: 20, height: 20, color: '#E85D20', animation: 'ciSpin 1s linear infinite', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#0d1117', margin: '0 0 4px' }}>🔍 {isSpecificCompany(loadingQuery) ? `Researching ${loadingQuery}…` : `Finding ${loadingQuery}…`}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>{isSpecificCompany(loadingQuery) ? 'Scanning their careers page and hiring signals. This takes about 20 seconds.' : 'Searching across multiple sources and scanning careers pages. Usually takes 20–40 seconds.'}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && researchError && (
        <div style={{ background: '#FFF5F5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', margin: '20px 0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', margin: 0 }}>{researchError}</p>
        </div>
      )}

      {/* Discover results */}
      {!loading && discoverResults.length > 0 && (
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '0 0 12px' }}>{discoverResults.length} companies found</p>
          {discoverResults.length < 3 && (
            <div style={{ background: '#FFFBEB', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#854D0E', margin: '0 0 8px' }}>We found {discoverResults.length} {discoverResults.length === 1 ? 'company' : 'companies'} matching your search. Try broadening it — e.g. add a state instead of a city, or remove a specific role type.</p>
              <button onClick={() => { setDiscoverResults([]); setSearchInput(''); }} style={{ background: 'none', border: '1px solid #D97706', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#92400E', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Try a broader search</button>
            </div>
          )}
          {discoverResults.map(company => (
            <DiscoveredCompanyCard
              key={company.name}
              company={company}
              onAddToList={handleAddDiscoveredToList}
              onResearchMore={(name) => { setSearchInput(name); handleResearch(name); }}
              added={addedToList.includes(company.name)}
            />
          ))}
        </div>
      )}

      {researchCompany && (
        <CompanyResearchChat company={researchCompany} user={user} isFastIQ={true} onClose={() => setResearchCompany(null)} />
      )}
      {showAddCompanyModal && (
        <AddTargetCompanyModal
          user={user}
          onClose={() => setShowAddCompanyModal(false)}
          onSaved={(updatedCompanies) => {
            setLocalTargetCompanies(updatedCompanies);
            setHasGoals(true);
            setSkippedGoals(true);
            setHasStarted(false);
          }}
        />
      )}

      <style>{`@keyframes ciSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}