import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getCompanyIntel } from '@/functions/getCompanyIntel';
import CompanyIntelCard from './CompanyIntelCard';
import CompanyResearchChat from './CompanyResearchChat';

function AlumniUpgradeModal({ company, university, onClose, onUpgrade }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', overflow: 'hidden' }}>
        <div style={{ background: '#0d1117', padding: '24px 24px 20px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FASTIQ</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            See {university} Alumni at {company?.name}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            FastIQ found ~{company?.alumni_count} {university} alumni at {company?.name}.
          </p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {['Full names and current roles', 'Who works in your target department', 'AI-drafted personalized outreach', `Interview prep for ${company?.name}`, 'Follow-up reminders'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>✓</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#333' }}>{item}</span>
            </div>
          ))}
          <button onClick={onUpgrade} style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
            Unlock FastIQ — $29/month →
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', textAlign: 'center', margin: '8px 0 4px' }}>⭐ Founding rate: $187/year</p>
          <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

function NoGoalsGate({ onSetGoals }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 16, padding: '40px 36px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 16px' }}>COMPANY INTEL</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 }}>Your company list is personalized to your career goals.</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 28px', lineHeight: 1.7 }}>We show hiring signals, CFF network presence, and alumni counts for companies that actually matter for your path — not a generic list.</p>
        <button onClick={onSetGoals} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
          Set My Career Goals →
        </button>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'hiring', label: '🟢 Actively Hiring' },
  { key: 'cff',    label: '👥 CFF Network' },
  { key: 'best',   label: '⭐ Best Opportunities' },
  { key: 'saved',  label: '🔖 Saved' },
];

function FilterBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: '#f5f5f5', borderRadius: 100, width: 'fit-content', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {FILTERS.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)} style={{
          padding: '8px 16px', borderRadius: 100,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          fontWeight: active === f.key ? 600 : 500,
          cursor: 'pointer', border: 'none',
          background: active === f.key ? '#fff' : 'transparent',
          color: active === f.key ? '#0d1117' : '#666',
          boxShadow: active === f.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s ease', whiteSpace: 'nowrap', minHeight: 'auto',
        }}>
          {f.label}
        </button>
      ))}
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
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [researchCompany, setResearchCompany] = useState(null);
  const [savedCompanies, setSavedCompanies] = useState(() => user?.saved_company_intel || []);
  const [showAll, setShowAll] = useState(false);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const university = user?.school || user?.university || 'UF';

  useEffect(() => {
    if (!user?.id) return;
    const goals = user?.career_goals || {};
    const goalsExist =
      (goals.target_industries?.length > 0) ||
      (goals.target_roles?.length > 0) ||
      (goals.target_functions?.length > 0) ||
      (goals.target_companies?.length > 0);

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
      setCompanies(data.companies || []);
      setTargetRoles(data.targetRoles || []);
      setTargetIndustries(data.targetIndustries || []);
    } catch (e) {
      console.error('Company intel error:', e);
    }
    setLoading(false);
  };

  const handleStartSearch = () => {
    setHasStarted(true);
    loadCompanies();
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
  if (!hasGoals) return <NoGoalsGate onSetGoals={() => onTabChange?.('career_goals')} />;

  const targetCompanies = user?.career_goals?.target_companies || [];
  const role = targetRoles[0] || '';
  const industry = targetIndustries[0] || '';

  // Target companies — always visible
  const renderTargetCompanies = () => {
    if (targetCompanies.length === 0) return (
      <div style={{ background: '#FFF5F0', border: '1px dashed rgba(232,93,32,0.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>Add your dream companies</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>We'll show you hiring signals and alumni at the companies you care about most.</p>
        </div>
        <button onClick={() => onTabChange?.('career_goals')} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}>+ Add Target Companies →</button>
      </div>
    );

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: 0 }}>🎯 YOUR TARGET COMPANIES</p>
          <button onClick={() => onTabChange?.('career_goals')} style={{ background: 'none', border: 'none', fontSize: 12, color: '#AAAAAA', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Edit →</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {targetCompanies.map(company => (
            <div key={company} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#E85D20', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                {company[0]?.toUpperCase()}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{company}</p>
              <button
                onClick={() => {
                  setSearch(company);
                  setShowAll(true);
                  if (!hasStarted) { setHasStarted(true); loadCompanies(); }
                }}
                style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto' }}
              >
                Research →
              </button>
            </div>
          ))}
          <div onClick={() => onTabChange?.('career_goals')} style={{ background: '#F5F5F5', border: '1px dashed #CCCCCC', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 120, justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', fontWeight: 600 }}>+ Add company</span>
          </div>
        </div>
        <div style={{ height: 1, background: '#F0F0F0', margin: '20px 0' }} />
      </div>
    );
  };

  // Pre-search landing
  if (!hasStarted) return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>COMPANY INTEL</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#0d1117', margin: '0 0 6px', lineHeight: 1.2 }}>
        {targetCompanies.length > 0 ? `Companies hiring ${role || 'in your field'}.` : 'Your Target Companies.'}
      </h1>
      <p style={{ fontSize: 14, color: '#888', margin: '0 0 28px' }}>
        {targetCompanies.length > 0 ? 'Updated daily by FastIQ. Sorted by opportunity strength.' : 'FastIQ will scan careers pages and hiring signals across companies matching your goals.'}
      </p>
      {renderTargetCompanies()}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', gap: '16px' }}>
        <div style={{ fontSize: '13px', color: '#666', maxWidth: '400px', lineHeight: '1.6' }}>
          FastIQ will scan careers pages and hiring signals across companies matching your goals. Takes about 30 seconds.
        </div>
        <button onClick={handleStartSearch} style={{ background: '#E85D20', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '500', color: '#fff', cursor: 'pointer', marginTop: '8px', minHeight: 'auto' }}>
          Search Now →
        </button>
        <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>
          Results are cached for 24 hours — you won't wait again today
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header with CTA button in top right */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>COMPANY INTEL</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: '#0d1117', margin: '0 0 6px', lineHeight: 1.2 }}>
            {targetCompanies.length > 0 ? `Companies hiring ${role || 'in your field'}.` : 'Your Target Companies.'}
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            {targetCompanies.length > 0 ? 'Updated daily by FastIQ. Sorted by opportunity strength.' : 'FastIQ will scan careers pages and hiring signals across companies matching your goals.'}
          </p>
        </div>
        {!loading && companies.length > 0 && (
          <button
            onClick={() => onTabChange?.('directory')}
            style={{ position: 'absolute', top: 0, right: 0, background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto', whiteSpace: 'nowrap' }}
          >
            Next: Find Your CFF Connections →
          </button>
        )}
      </div>

      {/* Target companies — always visible */}
      {renderTargetCompanies()}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#aaa' }} />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowAll(true); }}
          style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 100, border: '1px solid #e5e5e5', background: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Filter bar */}
      <FilterBar active={filter} onChange={(f) => { setFilter(f); setSearch(''); setShowAll(false); }} />

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 style={{ width: 28, height: 28, color: '#E85D20', animation: 'ciSpin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#0d1117', margin: '0 0 8px' }}>⚡ Building your company list...</p>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Finding companies hiring {role || 'for your role'}{industry ? ` in ${industry}` : ''}. About 30 seconds.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && (
        filteredCompanies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 15, color: '#888', margin: '0 0 12px' }}>No companies match this filter.</p>
            <button onClick={() => { setFilter('all'); setSearch(''); setShowAll(false); }}
              style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: 100, padding: '8px 20px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
              Show all companies
            </button>
          </div>
        ) : (
          <>
            {visibleCompanies.map(company => (
              <CompanyIntelCard
                key={company.name}
                company={company}
                user={user}
                isFastIQ={isFastIQ}
                onUpgrade={() => setUpgradeModal(company)}
                onUnlockFastIQ={() => onOpenUpgrade?.()}
                onViewAlumni={() => setUpgradeModal(company)}
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

      {/* Similar companies prompt */}
      {!loading && companies.length > 0 && (
        <div style={{ background: '#F5F5F5', borderRadius: 12, padding: '16px 20px', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', margin: 0 }}>
            Want to explore similar companies in {industry || role || 'your field'}?
          </p>
          <button
            onClick={() => { setSearch(''); setFilter('all'); setShowAll(true); }}
            style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
          >
            Search {industry || 'Similar Companies'} →
          </button>
        </div>
      )}



      {upgradeModal && (
        <AlumniUpgradeModal
          company={upgradeModal}
          university={university}
          onClose={() => setUpgradeModal(null)}
          onUpgrade={() => { setUpgradeModal(null); onOpenUpgrade?.(); }}
        />
      )}
      {researchCompany && (
        <CompanyResearchChat
          company={researchCompany}
          user={user}
          isFastIQ={isFastIQ}
          onClose={() => setResearchCompany(null)}
          onUpgrade={() => { setResearchCompany(null); onOpenUpgrade?.(); }}
        />
      )}

      <style>{`@keyframes ciSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}