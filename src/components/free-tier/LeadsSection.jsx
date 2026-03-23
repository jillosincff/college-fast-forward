import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Lock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INDUSTRY_ALIASES = {
  'real estate': ['real estate', 'property', 'construction', 'finance', 'financial', 'investment', 'reit', 'mortgage'],
  'finance': ['finance', 'financial', 'banking', 'investment', 'insurance', 'accounting', 'fintech', 'wealth', 'capital'],
  'technology': ['tech', 'software', 'it ', 'information technology', 'saas', 'digital', 'data', 'engineering'],
  'healthcare': ['health', 'medical', 'clinical', 'pharma', 'biotech', 'hospital', 'nursing'],
  'marketing': ['marketing', 'advertising', 'pr', 'communications', 'brand', 'media'],
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

// ─── Alumni Count Cache (in-memory, 24h) ─────────────────────────────────────

const alumniCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function fetchAlumniCount(company, university) {
  const key = `${university.toLowerCase()}_${company.toLowerCase()}`;
  const cached = alumniCache[key];
  if (cached && (Date.now() - cached.ts < CACHE_TTL)) return cached.data;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `How many alumni from ${university} currently work at ${company}? Search LinkedIn and professional sources for an approximate count of ${university} graduates employed at ${company} right now. Return only verifiable data.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          alumni_count: { type: 'number' },
          confidence: { type: 'string' },
          roles_found: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    const data = result?.alumni_count > 0 ? result : null;
    alumniCache[key] = { data, ts: Date.now() };
    return data;
  } catch {
    return null;
  }
}

// ─── Company-specific Upgrade Modal ──────────────────────────────────────────

function CompanyUpgradeModal({ company, alumniCount, university, onClose, onUpgrade }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 0 40px rgba(232,93,32,0.15)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FASTIQ UNLOCK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
          See Who Works at {company}
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.6 }}>
          FastIQ found {alumniCount ? `${alumniCount} ${university} alumni` : 'alumni'} at {company}. Upgrade to see:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {['Their full names and current roles', 'Graduation years', 'AI-drafted outreach messages', 'Follow-up reminders', 'Alumni at all your target companies'].map((f, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>✓ {f}</p>
          ))}
        </div>
        <button onClick={onUpgrade} style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', marginBottom: 10 }}>
          Unlock FastIQ — $29/month →
        </button>
        <button onClick={onUpgrade} style={{ width: '100%', background: 'none', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', borderRadius: 100, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          See founding member rate →
        </button>
      </div>
    </div>
  );
}

// ─── CFF Member Card (free, ungated) ─────────────────────────────────────────

function CFFMemberCard({ member, label = 'CFF Network', accentColor = '#E85D20', onContact, onSave, onUnsave, isSaved, currentUser }) {
  const schoolWord = (currentUser?.school || currentUser?.university || '').toLowerCase().split(' ')[0];
  const memberSchool = (member.school || member.university || '').toLowerCase();
  const sameSchool = !!(schoolWord && memberSchool.includes(schoolWord));
  const company = memberCompany(member);

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: `3px solid ${accentColor}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {initials(member.full_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px' }}>
            {member.full_name}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>
            {member.job_title || member.current_role || 'Professional'}{company ? ` · ${company}` : ''}
          </p>
          {sameSchool && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: accentColor, margin: '2px 0 0', fontWeight: 600 }}>🏫 {member.school || member.university} connection</p>}
        </div>
        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>✓ {label}</span>
      </div>

      {member.industry && (
        <span style={{ display: 'inline-block', background: '#FFF5F0', color: '#E85D20', border: '1px solid #FDDBC8', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, alignSelf: 'flex-start' }}>
          {member.industry}
        </span>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onContact({ id: member.id, source: 'cff_database', type: label === 'CFF Parent' ? 'hot' : 'warm', name: member.full_name, title: member.job_title || member.current_role, company, email: member.email, school: member.school || member.university })}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button
          onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, source: 'cff_database', type: 'network', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: '1px solid', borderColor: isSaved ? accentColor : '#E0E0E0', color: isSaved ? accentColor : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? accentColor : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Web-Discovered Alumni Company Card (gated) ───────────────────────────────

function AlumniCompanyCard({ company, alumniData, university, onUnlock, onSave, isSaved }) {
  const count = alumniData?.alumni_count;
  const confidence = alumniData?.confidence;
  const countLabel = confidence === 'high' ? `${count}` : confidence === 'medium' ? `~${count}` : null;

  return (
    <div style={{ background: '#F9F9F9', border: '1px solid #E0E0E0', borderLeft: '3px solid #94A3B8', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: '0 0 2px' }}>{company.name}</p>
          {company.industry && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{company.industry}</p>}
        </div>
        <span style={{ fontSize: 11, color: '#15803D', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>🟢 Hiring</span>
      </div>

      {countLabel ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#E85D20', fontWeight: 700, margin: 0 }}>
          🎓 {countLabel} {university} alumni work here
        </p>
      ) : (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
          🎓 {university} alumni work here
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 14px' }}>
        <Lock style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0, lineHeight: 1.4 }}>
          Upgrade to FastIQ to see who they are and reach out
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onUnlock(company, alumniData)}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Unlock FastIQ →
        </button>
        <button
          onClick={() => onSave({ id: `alumni_${company.name}`, source: 'web_search', type: 'alumni', company: company.name })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: '1px solid', borderColor: isSaved ? '#E85D20' : '#E0E0E0', color: isSaved ? '#E85D20' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, leadsRef }) {
  const [loading, setLoading] = useState(true);
  const [hotLeads, setHotLeads] = useState([]);    // CFF Parents
  const [networkLeads, setNetworkLeads] = useState([]); // CFF Members (non-parent)
  const [targetCompanies, setTargetCompanies] = useState([]); // for alumni search
  const [alumniData, setAlumniData] = useState({}); // { companyName: { alumni_count, confidence } }
  const [upgradeModal, setUpgradeModal] = useState(null); // { company, alumniData }
  const goals = user?.career_goals || {};
  const university = user?.school || user?.university || 'UF';

  useEffect(() => { fetchLeads(); }, [user?.email]);

  const fetchLeads = async () => {
    setLoading(true);
    const industries = goals.target_industries || goals.industries || [];
    const expanded = expandIndustries(industries);
    const targetCos = goals.target_companies || (goals.dream_company ? [goals.dream_company] : []);

    try {
      const allUsers = await getDirectoryUsers({}).then(r => r?.data?.data || []).catch(() => []);

      // HOT LEADS — CFF Parents
      const parents = allUsers.filter(u => u.persona === 'parent' || u.roles?.includes('parent'));
      let hot = parents.filter(u => expanded.some(t => memberText(u).includes(t)));
      if (hot.length === 0) hot = parents.filter(u => u.intro_availability === 'happy_to_help' || u.intro_willingness === 'happy_to_help');
      if (hot.length === 0) hot = parents;

      // Sort: same school first
      const schoolWord = (user?.school || user?.university || '').toLowerCase().split(' ')[0];
      hot.sort((a, b) => {
        const aS = schoolWord && (a.school || a.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
        const bS = schoolWord && (b.school || b.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
        return bS - aS;
      });
      setHotLeads(hot.slice(0, 6));

      // NETWORK LEADS — CFF Members (non-parent)
      const members = allUsers.filter(u =>
        !u.roles?.includes('parent') && u.persona !== 'parent' && u.full_name && u.email !== user?.email
      );
      let net = members.filter(u => expanded.some(t => memberText(u).includes(t)));
      if (net.length === 0) net = members.slice(0, 6);
      net.sort((a, b) => {
        const aS = schoolWord && (a.school || a.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
        const bS = schoolWord && (b.school || b.university || '').toLowerCase().includes(schoolWord) ? 1 : 0;
        return bS - aS;
      });
      setNetworkLeads(net.slice(0, 6));

      // WARM LEADS — generate target company list if not set
      let cos = targetCos.length > 0 ? targetCos.map(c => ({ name: c, industry: industries[0] || '' })) : [];
      if (cos.length === 0 && industries.length > 0) {
        try {
          const role = (goals.target_roles || [])[0] || 'entry-level professional';
          const llm = await base44.integrations.Core.InvokeLLM({
            prompt: `List 8 top companies that hire ${role}s in ${industries.join(', ')} in the ${goals.location_preference || 'US'}. Include major employers and 2-3 fast-growing companies. Return as JSON array of objects with name and industry.`,
            response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, industry: { type: 'string' } } } } } },
          });
          cos = llm?.companies || [];
        } catch { cos = []; }
      }
      setTargetCompanies(cos.slice(0, 8));

      // Fetch alumni counts in parallel
      if (cos.length > 0) {
        const counts = {};
        await Promise.all(
          cos.slice(0, 8).map(async co => {
            const data = await fetchAlumniCount(co.name, university);
            if (data) counts[co.name] = data;
          })
        );
        setAlumniData(counts);
      }
    } catch (e) {
      console.error('LeadsSection fetch failed:', e);
    }
    setLoading(false);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  const primaryIndustry = (goals.target_industries || goals.industries || [])[0] || 'your field';
  const totalAlumni = Object.values(alumniData).reduce((sum, d) => sum + (d?.alumni_count || 0), 0);

  if (loading) {
    return (
      <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'lsPulse 1.4s ease-in-out infinite' }}>⚡</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Finding your leads...</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>Searching CFF network and target companies.</p>
        </div>
        <style>{`@keyframes lsPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.15);opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* ── SECTION 1: HOT LEADS — CFF Parents ── */}
      <section>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>🔥 HOT LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>CFF Parents Across the Network</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>
          {hotLeads.length} CFF parent{hotLeads.length !== 1 ? 's' : ''} open to helping students in your target field. Free to contact — they're here for you.
        </p>
        {hotLeads.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {hotLeads.map(p => (
              <CFFMemberCard key={p.id} member={p} label="CFF Parent" accentColor="#E85D20" onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(p.id)} currentUser={user} />
            ))}
          </div>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              No CFF parents found yet for your field. Try updating your career goals or invite a parent to join.
            </p>
          </div>
        )}
      </section>

      {/* ── SECTION 2: NETWORK LEADS — CFF Members ── */}
      <section>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4F8CFF', margin: '0 0 4px' }}>🤝 NETWORK LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>CFF Members in Your Target Field</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>
          {networkLeads.length} CFF member{networkLeads.length !== 1 ? 's' : ''} working in {primaryIndustry}. Free to contact — all in the CFF network.
        </p>
        {networkLeads.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {networkLeads.map(m => (
              <CFFMemberCard key={m.id} member={m} label="CFF Network" accentColor="#4F8CFF" onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(m.id)} currentUser={user} />
            ))}
          </div>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              No CFF members found in {primaryIndustry} yet. The network is growing — check back soon.
            </p>
          </div>
        )}
      </section>

      {/* ── SECTION 3: WARM LEADS — Web-discovered alumni ── */}
      {targetCompanies.length > 0 && (
        <section>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7C3AED', margin: '0 0 4px' }}>🎯 WARM LEADS</p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Alumni Found at Your Target Companies</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 4px', lineHeight: 1.5 }}>
            FastIQ found{totalAlumni > 0 ? ` ${totalAlumni}` : ''} {university} alumni across your target companies.
          </p>
          {totalAlumni > 0 && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#7C3AED', margin: '0 0 16px' }}>
              Upgrade to see who they are.
            </p>
          )}
          {totalAlumni === 0 && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              Upgrade to see who they are and reach out.
            </p>
          )}
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {targetCompanies
              .filter(co => !alumniData[co.name] || alumniData[co.name]?.alumni_count > 0)
              .map(co => (
                <AlumniCompanyCard
                  key={co.name}
                  company={co}
                  alumniData={alumniData[co.name]}
                  university={university}
                  onUnlock={(company, data) => setUpgradeModal({ company, alumniData: data })}
                  onSave={onSaveLead}
                  isSaved={isSaved(`alumni_${co.name}`)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Company-specific upgrade modal */}
      {upgradeModal && (
        <CompanyUpgradeModal
          company={upgradeModal.company.name}
          alumniCount={upgradeModal.alumniData?.alumni_count}
          university={university}
          onClose={() => setUpgradeModal(null)}
          onUpgrade={() => { setUpgradeModal(null); onUpgrade?.(); }}
        />
      )}
    </div>
  );
}