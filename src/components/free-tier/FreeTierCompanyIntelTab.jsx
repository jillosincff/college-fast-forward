import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, X } from 'lucide-react';
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

const DISCOVER_PLACEHOLDERS = [
  'e.g. "e-commerce companies in Miami hiring operations roles"',
  'e.g. "biotech companies in New York for pre-med students"',
  'e.g. "Chicago finance firms that hire liberal arts majors"',
  'e.g. "sustainability startups in Austin"',
];

const FREE_TIER_DAILY_LIMIT = 3;

function getDailyCount() {
  try {
    const stored = JSON.parse(localStorage.getItem('cff_company_research') || '{}');
    const today = new Date().toDateString();
    if (stored.date !== today) return 0;
    return stored.count || 0;
  } catch { return 0; }
}

function incrementDailyCount() {
  try {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem('cff_company_research') || '{}');
    const count = stored.date === today ? (stored.count || 0) + 1 : 1;
    localStorage.setItem('cff_company_research', JSON.stringify({ date: today, count }));
    return count;
  } catch { return 1; }
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
        <button
          onClick={() => onAddToList(company.name)}
          disabled={added}
          style={{
            background: added ? '#DCFCE7' : '#E85D20', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 12, fontWeight: 600,
            color: added ? '#166534' : '#fff', cursor: added ? 'default' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", minHeight: 'auto',
          }}
        >
          {added ? '✓ Added to My List' : '+ Add to My List'}
        </button>
        <button
          onClick={() => onResearchMore(company.name)}
          style={{
            background: 'none', border: '1px solid #E0E0E0', borderRadius: 8,
            padding: '8px 16px', fontSize: 12, fontWeight: 600,
            color: '#555', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", minHeight: 'auto',
          }}
        >
          Research More →
        </button>
      </div>
    </div>
  );
}

export default function FreeTierCompanyIntelTab({ user, onOpenUpgrade, onTabChange }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [targetRoles, setTargetRoles] = useState([]);
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [hasGoals, setHasGoals] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [researchCompany, setResearchCompany] = useState(null);
  const [savedCompanies, setSavedCompanies] = useState(() => user?.saved_company_intel || []);
  const [localTargetCompanies, setLocalTargetCompanies] = useState(() => user?.career_goals?.target_companies || []);
  const [showAll, setShowAll] = useState(false);
  const [skippedGoals, setSkippedGoals] = useState(false);
  const [liveSearchLoading, setLiveSearchLoading] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // Discovery state
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverError, setDiscoverError] = useState(null);
  const [addedToList, setAddedToList] = useState([]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [dailyCount, setDailyCount] = useState(() => getDailyCount());

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const researchesLeft = FREE_TIER_DAILY_LIMIT - dailyCount;

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % DISCOVER_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLiveResearch = async (companyName) => {
    if (!companyName.trim()) return;
    if (!isFastIQ && dailyCount >= FREE_TIER_DAILY_LIMIT) { onOpenUpgrade?.(); return; }
    setLiveSearchLoading(true);
    setLiveSearchError(null);
    try {
      const res = await researchSpecificCompany({ companyName: companyName.trim(), userId: user.id, schoolCode: user.school || user.university || '' });
      const data = res?.data || res;
      if (!data?.success || !data?.data) throw new Error('No data');
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
      const newCount = incrementDailyCount();
      setDailyCount(newCount);
      setHasStarted(true);
      setCompanies(prev => [newCompany, ...prev.filter(c => c.name.toLowerCase() !== newCompany.name.toLowerCase())]);
      setSearch(intel.company_name);
      setShowAll(true);
    } catch (e) {
      setLiveSearchError("Couldn't find intel for this company. Try a slightly different name.");
    }
    setLiveSearchLoading(false);
  };

  const handleDiscover = async () => {
    if (!discoverQuery.trim()) return;
    if (!isFastIQ && dailyCount >= FREE_TIER_DAILY_LIMIT) { onOpenUpgrade?.(); return; }
    setDiscoverLoading(true);
    setDiscoverError(null);
    setDiscoverResults([]);
    try {
      const res = await discoverCompanies({ query: discoverQuery.trim() });
      const data = res?.data || res;
      if (!data?.success) throw new Error('Discovery failed');
      const newCount = incrementDailyCount();
      setDailyCount(newCount);
      setDiscoverResults(data.companies || []);
    } catch (e) {
      setDiscoverError("Couldn't find companies for that search. Try rephrasing.");
    }
    setDiscoverLoading(false);
  };

  const handleAddDiscoveredToList = async (companyName) => {
    setAddedToList(prev => [...prev, companyName]);
    const updated = [...localTargetCompanies, companyName];
    setLocalTargetCompanies(updated);
    try {
      const goals = user?.career_goals || {};
      await base44.auth.updateMe({ career_goals: { ...goals, target_companies: updated } });
    } catch (_) {}
  };

  const university = user?.school || user?.university || '';

  useEffect(() => {
    if (!user?.id) return;
    const goals = user?.career_goals || {};
    const goalsExist = (goals.target_industries?.length > 0) || (goals.target_roles?.length > 0) || (goals.target_companies?.length > 0);
    if (!goalsExist) { setHasGoals(false); return; }
    const industries = [...(goals.target_industries || []), ...(user?.target_industries || [])].filter(Boolean);
    const roles = [...(goals.target_roles || []), ...(user?.target_roles || [])].filter(Boolean);
    setTargetRoles(roles);
    setTargetIndustries(industries);
    setHasGoals(true);
  }, [user?.id]);

  const loadCompanies = async () => {
    setLoading(true);
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
      console.error('Company intel error:', e);
    }
    setLoading(false);
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
    if (search) return c.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'hiring') return c.hiring_signal === 'active';
    if (filter === 'cff') return c.cff_parent_count > 0 || c.alumni_count > 0;
    if (filter === 'best') return c.is_combo;
    if (filter === 'saved') return savedCompanies.includes(c.name);
    return true;
  });

  const visibleCompanies = showAll ? filteredCompanies : filteredCompanies.slice(0, 6);

  if (!user) return null;

  const targetCompanies = localTargetCompanies;
  const role = targetRoles[0] || '';
  const industry = targetIndustries[0] || '';

  const renderTargetCompanies = () => {
    if (targetCompanies.length === 0) return (
      <div style={{ background: '#FFF5F0', border: '1px dashed rgba(232,93,32,0.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>Research companies you're interested in</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>We'll show you hiring signals and alumni at the companies you care about most.</p>
        </div>
        <button onClick={() => setShowAddCompanyModal(true)} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 44 }}>+ Add Target Companies →</button>
      </div>
    );

    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', margin: 0 }}>🎯 YOUR TARGET COMPANIES</p>
          <button onClick={() => setShowAddCompanyModal(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#AAAAAA', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Edit →</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 10, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {targetCompanies.map(company => (
            <div key={company} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#E85D20', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                  {company[0]?.toUpperCase()}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{company}</p>
              </div>
              <button
                onClick={() => { setSearch(company); setShowAll(true); if (!hasStarted) { setHasStarted(true); loadCompanies(); } }}
                style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto', width: '100%' }}
              >
                Research →
              </button>
            </div>
          ))}
          <div onClick={() => setShowAddCompanyModal(true)} style={{ background: '#F5F5F5', border: '1px dashed #CCCCCC', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minWidth: 120 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>+ Add</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscoverSection = () => (
    <div style={{ marginBottom: 32 }}>
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 24px' }}>
        <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', margin: '0 0 6px' }}>HELP ME FIND COMPANIES</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 14px' }}>🔍 Don't know where to start? Describe what you're looking for.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={discoverQuery}
          onChange={e => setDiscoverQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDiscover()}
          placeholder={DISCOVER_PLACEHOLDERS[placeholderIdx]}
          style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10, border: '1px solid #E0E0E0', background: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleDiscover}
          disabled={discoverLoading || !discoverQuery.trim()}
          style={{ background: '#0d1117', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: discoverLoading || !discoverQuery.trim() ? 'not-allowed' : 'pointer', opacity: !discoverQuery.trim() ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
        >
          {discoverLoading ? <Loader2 style={{ width: 16, height: 16, animation: 'ciSpin 1s linear infinite', display: 'inline-block' }} /> : 'Find Companies →'}
        </button>
      </div>

      {/* Free tier counter */}
      {!isFastIQ && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: researchesLeft <= 1 ? '#E85D20' : '#AAAAAA', margin: '8px 0 0', fontWeight: researchesLeft <= 1 ? 600 : 400 }}>
          {researchesLeft <= 0 ? '0 free researches left today — ' : `${researchesLeft} of ${FREE_TIER_DAILY_LIMIT} free researches left today`}
          {researchesLeft <= 0 && <button onClick={onOpenUpgrade} style={{ background: 'none', border: 'none', color: '#E85D20', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: 0, minHeight: 'auto', display: 'inline' }}>Upgrade for unlimited →</button>}
        </p>
      )}

      {discoverLoading && (
        <div style={{ background: '#F5F5F5', borderRadius: 12, padding: '20px 24px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Loader2 style={{ width: 20, height: 20, color: '#E85D20', animation: 'ciSpin 1s linear infinite', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>🔍 Finding companies matching "{discoverQuery}"…</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>This takes about 30 seconds.</p>
          </div>
        </div>
      )}

      {discoverError && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', margin: '12px 0 0' }}>{discoverError}</p>
      )}

      {discoverResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '0 0 12px' }}>{discoverResults.length} companies found</p>
          {discoverResults.map(company => (
            <DiscoveredCompanyCard
              key={company.name}
              company={company}
              onAddToList={handleAddDiscoveredToList}
              onResearchMore={handleLiveResearch}
              added={addedToList.includes(company.name)}
            />
          ))}
        </div>
      )}
    </div>
  );

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

      {/* Section 1 — Target Companies */}
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#0d1117', margin: '0 0 14px' }}>Section 1 — <span style={{ color: '#555', fontWeight: 500 }}>Your target companies</span></p>
        {renderTargetCompanies()}
      </div>

      {/* Section 2 — Search a specific company */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', margin: '0 0 6px' }}>I KNOW THE COMPANY I WANT TO RESEARCH</p>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#aaa' }} />
          <input
            type="text"
            placeholder="Search or research a specific company..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowAll(true); setLiveSearchError(null); }}
            onKeyDown={e => { if (e.key === 'Enter' && search.trim() && filteredCompanies.length === 0) handleLiveResearch(search); }}
            style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 100, border: '1px solid #e5e5e5', background: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', minHeight: 44 }}
          />
        </div>

        {/* Start search prompt if not started */}
        {!hasStarted && !search && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9F9F9', borderRadius: 10, padding: '12px 16px', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0 }}>FastIQ will scan careers pages and hiring signals for your goals. ~30 seconds.</p>
            <button onClick={() => { setHasStarted(true); loadCompanies(); }} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
              Search Now →
            </button>
          </div>
        )}

        {liveSearchError && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', margin: '8px 0' }}>{liveSearchError}</p>
        )}
      </div>

      {/* Section 3 — Discover */}
      {renderDiscoverSection()}

      {/* Filter bar + results (only when search started) */}
      {hasStarted && (
        <>
          <FilterBar active={filter} onChange={(f) => { setFilter(f); setSearch(''); setShowAll(false); }} />

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Loader2 style={{ width: 28, height: 28, color: '#E85D20', animation: 'ciSpin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#0d1117', margin: '0 0 8px' }}>⚡ Building your company list...</p>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Finding companies hiring {role || 'for your role'}{industry ? ` in ${industry}` : ''}. About 30 seconds.</p>
            </div>
          )}

          {!loading && (
            filteredCompanies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                {search.trim() ? (
                  <>
                    <p style={{ fontSize: 15, color: '#888', margin: '0 0 16px' }}>No results for "{search}" in your list.</p>
                    {liveSearchLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Loader2 style={{ width: 20, height: 20, color: '#E85D20', animation: 'ciSpin 1s linear infinite' }} />
                        <span style={{ fontSize: 14, color: '#555', fontFamily: "'DM Sans', sans-serif" }}>Researching {search}…</span>
                      </div>
                    ) : (
                      <button onClick={() => handleLiveResearch(search)}
                        style={{ background: '#E85D20', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                        Research {search} now →
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 15, color: '#888', margin: '0 0 12px' }}>No companies match this filter.</p>
                    <button onClick={() => { setFilter('all'); setSearch(''); setShowAll(false); }}
                      style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: 100, padding: '8px 20px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                      Show all companies
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {visibleCompanies.map(company => (
                  <CompanyIntelCard
                    key={company.name}
                    company={company}
                    user={user}
                    isFastIQ={true}
                    onResearch={() => setResearchCompany(company)}
                    savedCompanies={savedCompanies}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                  />
                ))}
                {!showAll && filteredCompanies.length > 6 && (
                  <button onClick={() => setShowAll(true)}
                    style={{ display: 'block', width: '100%', textAlign: 'center', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 500, color: '#555', cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                    Show {filteredCompanies.length - 6} more companies →
                  </button>
                )}
              </>
            )
          )}
        </>
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