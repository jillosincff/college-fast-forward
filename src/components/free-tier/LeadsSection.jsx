import React, { useState, useEffect } from 'react';
import { Bookmark, Lock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INDUSTRY_ALIASES = {
  'real estate': ['real estate', 'property', 'construction', 'finance', 'investment', 'reit', 'mortgage'],
  'finance': ['finance', 'financial', 'banking', 'investment', 'insurance', 'accounting', 'fintech', 'wealth'],
  'technology': ['tech', 'software', 'information technology', 'saas', 'digital', 'data', 'engineering'],
  'healthcare': ['health', 'medical', 'clinical', 'pharma', 'biotech', 'hospital', 'nursing'],
  'marketing': ['marketing', 'advertising', 'communications', 'brand', 'media', 'pr'],
  'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
};

function expandIndustries(industries) {
  const all = new Set();
  industries.forEach(ind => {
    const lower = ind.toLowerCase();
    all.add(lower);
    for (const [key, aliases] of Object.entries(INDUSTRY_ALIASES)) {
      if (lower.includes(key) || aliases.some(a => lower.includes(a))) {
        aliases.forEach(a => all.add(a));
      }
    }
  });
  return [...all];
}

function memberText(u) {
  return [u.company, u.current_company, u.employer, u.job_title, u.current_role, u.industry].filter(Boolean).join(' ').toLowerCase();
}

function memberCompany(u) {
  return (u.company || u.current_company || u.employer || '').trim();
}

function initials(name) {
  return (name || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function hasIndustryMatch(member, expanded) {
  return expanded.some(t => memberText(member).includes(t));
}

const WARM_CACHE_TTL = 24 * 60 * 60 * 1000;

// ─── Company Upgrade Modal ────────────────────────────────────────────────────

function CompanyUpgradeModal({ company, alumniCount, confidence, university, onClose, onUpgrade }) {
  const countLabel = confidence === 'high' ? `${alumniCount}` : `~${alumniCount}`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto', padding: 4 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FASTIQ UNLOCK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
          See Who Works at {company}
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.6 }}>
          FastIQ found {countLabel} {university} alumni at {company}. Upgrade to see:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {['Full names and current roles', 'Graduation years', 'AI-drafted personalized outreach', 'Follow-up reminders', 'Alumni at ALL your target companies'].map((f, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>✓ {f}</p>
          ))}
        </div>
        <button onClick={onUpgrade} style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', marginBottom: 10 }}>
          Unlock FastIQ — $29/month →
        </button>
        <button onClick={onUpgrade} style={{ width: '100%', background: 'none', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', borderRadius: 100, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          See founding member rate — $187/year →
        </button>
      </div>
    </div>
  );
}

// ─── CFF Member Card (Tiers 1 & 2, fully free) ───────────────────────────────

function CFFMemberCard({ member, accentColor, schoolLabel, onContact, onSave, onUnsave, isSaved, currentUser, expanded }) {
  const company = memberCompany(member);
  const inits = initials(member.full_name);
  const industryMatch = hasIndustryMatch(member, expanded);
  const memberSchoolLabel = member.school || member.university || schoolLabel || 'CFF';
  const sharedSchools = member.shared_schools || [];
  const doubleConnection = sharedSchools.length > 1;
  // Short label: abbreviate school names
  const shortSchool = (s) => s.replace('University of ', '').replace('University', '').replace(' State University', ' State').trim();
  const schoolBadgeLabel = doubleConnection
    ? sharedSchools.map(shortSchool).join(' + ') + ' Alumni'
    : shortSchool(memberSchoolLabel) + ' Alumni';

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: `3px solid ${accentColor}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {inits}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px' }}>{member.full_name}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>
            {member.job_title || member.current_role || 'Professional'}{company ? ` · ${company}` : ''}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: doubleConnection ? '#7C3AED' : accentColor, margin: '3px 0 0', fontWeight: 600 }}>
            ● CFF Member · {doubleConnection ? '🏫 ' + schoolBadgeLabel : memberSchoolLabel}
          </p>
        </div>
        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>✓ CFF Member</span>
      </div>

      {industryMatch && member.industry && (
        <span style={{ display: 'inline-block', background: '#FFF5F0', color: '#E85D20', border: '1px solid #FDDBC8', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, alignSelf: 'flex-start' }}>
          {member.industry}
        </span>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onContact({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title || member.current_role, company, email: member.email, school: memberSchoolLabel })}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button
          onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: `1px solid ${isSaved ? accentColor : '#E0E0E0'}`, color: isSaved ? accentColor : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? accentColor : 'none' }} />
          {isSaved ? 'Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Warm Lead Company Card (gated) ──────────────────────────────────────────

function WarmCompanyCard({ lead, university, onUnlock, onSave, isSaved }) {
  const countLabel = lead.confidence === 'high' ? `${lead.alumni_count}` : `~${lead.alumni_count}`;
  const hiringColor = lead.hiring_signal === 'active' ? '#15803D' : lead.hiring_signal === 'selective' ? '#D97706' : '#94A3B8';
  const hiringLabel = lead.hiring_signal === 'active' ? '🟢 Hiring' : lead.hiring_signal === 'selective' ? '🟡 Selective' : '';

  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E2E8F0', borderLeft: '3px solid #7C3AED', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: '0 0 2px' }}>{lead.company}</p>
          {lead.industry && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{lead.industry}</p>}
        </div>
        {hiringLabel && <span style={{ fontSize: 11, color: hiringColor, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{hiringLabel}</span>}
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#E85D20', fontWeight: 700, margin: 0 }}>
        🎓 {countLabel} {university} alumni work here
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
        <Lock style={{ width: 14, height: 14, color: '#7C3AED', flexShrink: 0 }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>
          🔒 See who + reach out
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onUnlock(lead)}
          style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Unlock FastIQ →
        </button>
        <button
          onClick={() => onSave({ id: `alumni_${lead.company}`, source: 'web_search', company: lead.company })}
          style={{ background: isSaved ? '#F5F3FF' : 'none', border: `1px solid ${isSaved ? '#7C3AED' : '#E0E0E0'}`, color: isSaved ? '#7C3AED' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#7C3AED' : 'none' }} />
          {isSaved ? 'Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Lead Count Widgets ───────────────────────────────────────────────────────

function LeadCountWidget({ emoji, label, sublabel, count, locked, onClick, accentColor }) {
  return (
    <div
      onClick={onClick}
      style={{ flex: 1, minWidth: 0, background: '#fff', border: `1px solid ${locked ? '#E2E8F0' : '#E0E0E0'}`, borderTop: `3px solid ${accentColor}`, borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: accentColor, margin: 0, lineHeight: 1 }}>{count}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#888', margin: 0 }}>{sublabel}</p>
      <span style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: locked ? '#7C3AED' : accentColor }}>
        {locked ? '🔒 Unlock →' : 'View →'}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, leadsRef }) {
  const [loading, setLoading] = useState(true);
  const [redHotLeads, setRedHotLeads] = useState([]);
  const [redHotFallback, setRedHotFallback] = useState([]);
  const [warmLeads, setWarmLeads] = useState([]);
  const [warmLoading, setWarmLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(null);

  const goals = user?.career_goals || {};
  const university = user?.school || user?.university || 'UF';
  const userSchool = (user?.school || user?.university || '').toLowerCase().trim();

  useEffect(() => { fetchCFFLeads(); }, [user?.email]);

  const fetchCFFLeads = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getLeadsForStudent', { student_id: user?.id });
      const result = response?.data || response;
      
      if (result?.error) {
        console.error('Error fetching leads:', result.error);
        setRedHotLeads([]);
        setHotLeads([]);
        setLoading(false);
        return;
      }

      console.log('✓ Leads debug:', result?.debug);
      console.log('✓ Red Hot count:', result?.redHotTotal);
      
      setRedHotLeads(result?.redHot || []);
      setRedHotFallback(result?.redHotFallback || []);
    } catch (e) {
      console.error('CFF leads fetch failed:', e);
      setRedHotLeads([]);
      setRedHotFallback([]);
    }
    setLoading(false);
    fetchWarmLeads();
  };

  const fetchWarmLeads = async () => {
    // Check user cache
    const cached = user?.warm_leads_cache;
    const cachedAt = user?.warm_leads_cached_at;
    if (cached?.length > 0 && cachedAt && (Date.now() - new Date(cachedAt).getTime() < WARM_CACHE_TTL)) {
      setWarmLeads(cached);
      return;
    }

    setWarmLoading(true);
    const industries = goals.target_industries || goals.industries || [];
    const targetRoles = goals.target_roles || [];
    const location = goals.location_preference || 'the US';
    const targetCompanies = goals.target_companies || (goals.dream_company ? [goals.dream_company] : []);

    try {
      // Generate target company list if not set
      let companies = targetCompanies;
      if (companies.length === 0 && (industries.length > 0 || targetRoles.length > 0)) {
        const llm = await base44.integrations.Core.InvokeLLM({
          prompt: `List 10 top companies a student targeting ${targetRoles.join(', ') || 'entry-level roles'} in ${industries.join(', ') || 'business'} in ${location} should pursue. Mix major employers and fast-growing companies. Return JSON array of company name strings only.`,
          response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
        });
        companies = llm?.companies || [];
      }

      if (companies.length === 0) { setWarmLoading(false); return; }

      // Search alumni counts for each company in parallel
      const results = await Promise.all(
        companies.slice(0, 12).map(async (company) => {
          try {
            const r = await base44.integrations.Core.InvokeLLM({
              prompt: `How many ${university} alumni currently work at ${company}? Search LinkedIn and professional sources. Return JSON: { "company": "${company}", "alumni_count": number|null, "confidence": "high|medium|low", "hiring_signal": "active|selective|freeze|unknown", "industry": "string" }. Return null for alumni_count if you cannot find reliable data. Never guess.`,
              add_context_from_internet: true,
              model: 'gemini_3_flash',
              response_json_schema: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  alumni_count: { type: 'number' },
                  confidence: { type: 'string' },
                  hiring_signal: { type: 'string' },
                  industry: { type: 'string' },
                },
              },
            });
            return r;
          } catch { return null; }
        })
      );

      const valid = results
        .filter(r => r && r.alumni_count !== null && r.confidence !== 'low' && r.alumni_count > 0)
        .sort((a, b) => b.alumni_count - a.alumni_count);

      setWarmLeads(valid);

      // Cache in user record
      base44.auth.updateMe({ warm_leads_cache: valid, warm_leads_cached_at: new Date().toISOString() }).catch(() => {});
    } catch (e) {
      console.error('Warm leads fetch failed:', e);
    }
    setWarmLoading(false);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  const totalWarmAlumni = warmLeads.reduce((s, r) => s + (r.alumni_count || 0), 0);
  const displayRedHot = redHotLeads.length > 0 ? redHotLeads : redHotFallback;
  const isFallback = redHotLeads.length === 0 && redHotFallback.length > 0;
  const expanded = expandIndustries(goals.target_industries || goals.industries || []);

  return (
    <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* ── Lead Count Widgets ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <LeadCountWidget
          emoji="🔴"
          label={`${university} CFF Members`}
          sublabel="Same school"
          count={loading ? '...' : displayRedHot.length}
          locked={false}
          accentColor="#DC2626"
          onClick={() => document.getElementById('red-hot-section')?.scrollIntoView({ behavior: 'smooth' })}
        />
        <LeadCountWidget
          emoji="🌡️"
          label="Alumni Found"
          sublabel={`${university} at target cos`}
          count={warmLoading ? '...' : totalWarmAlumni || '?'}
          locked={true}
          accentColor="#7C3AED"
          onClick={() => onUpgrade?.()}
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>Finding your CFF leads...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── TIER 1: RED HOT LEADS ── */}
          <section id="red-hot-section" style={{ marginBottom: 36 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#DC2626', margin: '0 0 4px' }}>🔴 RED HOT LEADS</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
              {displayRedHot.length} {university} CFF members ready to help
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              Same school. Same network. Reach out now.
            </p>
            {isFallback && (
              <div style={{ background: '#FFF8F0', border: '1px solid #FDDBC8', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#E85D20', margin: 0 }}>
                  No {university} CFF members in your exact field yet — here are other {university} members who may still be valuable:
                </p>
              </div>
            )}
            {displayRedHot.length > 0 ? (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {displayRedHot.map(m => (
                  <CFFMemberCard key={m.id} member={m} accentColor="#DC2626" schoolLabel={university} onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(m.id)} currentUser={user} expanded={expanded} />
                ))}
              </div>
            ) : (
              <div style={{ background: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: 10, padding: '20px 24px' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
                  No {university} CFF members found yet. The network is growing — invite a classmate or alumni to join.
                </p>
              </div>
            )}
          </section>

          {/* ── TIER 3: WARM LEADS ── */}
          <section id="warm-section">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7C3AED', margin: '0 0 4px' }}>🌡️ WARM LEADS</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
              {totalWarmAlumni > 0 ? `${totalWarmAlumni} ` : ''}{university} alumni found at your target companies
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7C3AED', fontWeight: 600, margin: '0 0 16px' }}>
              Upgrade to FastIQ to see who they are.
            </p>

            {warmLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#7C3AED' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lsSpin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0 }}>FastIQ is searching for {university} alumni at your target companies...</p>
              </div>
            ) : warmLeads.length > 0 ? (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {warmLeads.map((lead, i) => (
                  <WarmCompanyCard
                    key={lead.company || i}
                    lead={lead}
                    university={university}
                    onUnlock={(lead) => setUpgradeModal(lead)}
                    onSave={onSaveLead}
                    isSaved={isSaved(`alumni_${lead.company}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ background: '#F5F3FF', border: '1px dashed #DDD6FE', borderRadius: 10, padding: '20px 24px' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 12px' }}>
                  Set target companies in your career goals to unlock alumni search.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Company-specific upgrade modal */}
      {upgradeModal && (
        <CompanyUpgradeModal
          company={upgradeModal.company}
          alumniCount={upgradeModal.alumni_count}
          confidence={upgradeModal.confidence}
          university={university}
          onClose={() => setUpgradeModal(null)}
          onUpgrade={() => { setUpgradeModal(null); onUpgrade?.(); }}
        />
      )}

      <style>{`
        @keyframes lsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}