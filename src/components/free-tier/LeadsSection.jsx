import React, { useState, useEffect } from 'react';
import { Loader2, Bookmark, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';

// ─── Industry taxonomy: expand student industry to related terms ───
const INDUSTRY_ALIASES = {
  'real estate': ['real estate', 'property', 'construction', 'finance', 'financial', 'investment', 'reit', 'mortgage', 'commercial real estate'],
  'finance': ['finance', 'financial', 'banking', 'investment', 'insurance', 'accounting', 'fintech', 'wealth', 'capital', 'asset management'],
  'technology': ['tech', 'software', 'it ', 'information technology', 'saas', 'digital', 'data', 'engineering'],
  'healthcare': ['health', 'medical', 'clinical', 'pharma', 'biotech', 'hospital', 'nursing'],
  'marketing': ['marketing', 'advertising', 'pr', 'communications', 'brand', 'media'],
  'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
};

function getIndustryAliases(industries) {
  const all = new Set();
  industries.forEach(ind => {
    const indLower = ind.toLowerCase();
    all.add(indLower);
    for (const [key, aliases] of Object.entries(INDUSTRY_ALIASES)) {
      if (indLower.includes(key) || aliases.some(a => indLower.includes(a))) {
        aliases.forEach(a => all.add(a));
      }
    }
  });
  return [...all];
}

function matchesIndustry(parent, expandedTerms, targetRoles) {
  const uIndustry = (parent.industry || '').toLowerCase();
  const uTitle = (parent.job_title || parent.current_role || '').toLowerCase();
  const uCompany = (parent.company || '').toLowerCase();
  if (expandedTerms.some(t => uIndustry.includes(t))) return 'exact';
  if (targetRoles?.some(r => uTitle.includes(r.toLowerCase().split(' ')[0]))) return 'role';
  // Adjacent: finance-adjacent for real estate etc.
  const adjacentTerms = expandedTerms.slice(0, 5);
  if (adjacentTerms.some(t => uTitle.includes(t) || uCompany.includes(t))) return 'adjacent';
  return null;
}

const isFastIQUser = (user) =>
  !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

function MatchBadge({ score }) {
  const isStrong = score >= 70;
  return (
    <span style={{
      background: isStrong ? '#E85D20' : '#F59E0B',
      color: '#fff', fontSize: 10, fontWeight: 700,
      padding: '2px 9px', borderRadius: 100,
    }}>
      {isStrong ? 'Strong Match' : 'Good Match'}
    </span>
  );
}

function HotLeadCard({ parent, briefing, user, onContact, onSave, onUnsave, isSaved }) {
  const initials = (parent.full_name || 'P').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const score = parent.intro_willingness === 'happy_to_help' || parent.intro_willingness === 'yes' ? 80 : 65;
  const goals = user?.career_goals || {};

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: '3px solid #E85D20', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {parent.full_name?.split(' ')[0]} {parent.full_name?.split(' ').slice(-1)[0]?.[0]}.
            </p>
            {parent.job_title && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>{parent.job_title}{parent.company ? ` · ${parent.company}` : ''}</p>}
          </div>
        </div>
        <MatchBadge score={score} />
      </div>

      {parent.industry && (
        <span style={{ display: 'inline-block', background: '#FFF5F0', color: '#E85D20', border: '1px solid #FDDBC8', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, alignSelf: 'flex-start' }}>
          {parent.industry}
        </span>
      )}

      {briefing && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', margin: '0 0 4px' }}>WHY THEY'RE A HOT LEAD</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{briefing}"</p>
        </div>
      )}

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: 0, fontWeight: 600 }}>✓ Open to intro requests</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => onContact({ id: parent.id, type: 'hot', name: parent.full_name, title: parent.job_title, company: parent.company, email: parent.email })}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button
          onClick={() => isSaved ? onUnsave(parent.id) : onSave({ id: parent.id, type: 'hot', name: parent.full_name, title: parent.job_title, company: parent.company, email: parent.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: '1px solid', borderColor: isSaved ? '#E85D20' : '#E0E0E0', color: isSaved ? '#E85D20' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : 'Save for Later'}
        </button>
      </div>
    </div>
  );
}

function WarmLeadCard({ company, alumni, onContact, onSave, onUnsave, isSaved, isFastIQ, onUpgrade }) {
  const [showAlumniSelect, setShowAlumniSelect] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const initial = (company.name || 'C')[0].toUpperCase();
  const visibleAlumni = alumni.slice(0, 2);
  const remaining = alumni.length - 2;

  const handleContact = () => {
    if (!isFastIQ) { onUpgrade?.(); return; }

    if (alumni.length === 1) {
      const a = alumni[0];
      onContact({ id: a.id, type: 'warm', name: a.full_name || a.name, title: a.job_title || a.role, company: company.name, email: a.email });
    } else {
      setShowAlumniSelect(true);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: '3px solid #4F8CFF', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#4F8CFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
            {initial}
          </div>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px' }}>{company.name}</p>
            {company.industry && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>{company.industry}</p>}
          </div>
        </div>
        {company.hiring_signal === 'hot' && (
          <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, flexShrink: 0 }}>🟢 Hiring</span>
        )}
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4F8CFF', margin: 0, fontWeight: 600 }}>
        🎓 {alumni.length} alumni work here
      </p>

      {isFastIQ ? (
        <div>
          {visibleAlumni.map((a, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '0 0 2px' }}>
              {a.full_name || a.name} · {a.job_title || a.role}{a.graduation_year ? ` · Class of ${a.graduation_year}` : ''}
            </p>
          ))}
          {remaining > 0 && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '2px 0 0' }}>+{remaining} more</p>}
        </div>
      ) : (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', margin: 0, fontStyle: 'italic' }}>🔒 See who they are + reach out</p>
      )}

      {showAlumniSelect && (
        <div style={{ background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 10, padding: 14 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 10px' }}>Which alumni would you like to contact?</p>
          {alumni.map(a => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
              <input type="radio" name="alumni_select" onChange={() => setSelectedAlumni(a)} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#333' }}>
                {a.full_name || a.name} · {a.job_title || a.role}{a.graduation_year ? ` · Class of ${a.graduation_year}` : ''}
              </span>
            </label>
          ))}
          <button
            onClick={() => {
              if (selectedAlumni) {
                onContact({ id: selectedAlumni.id, type: 'warm', name: selectedAlumni.full_name || selectedAlumni.name, title: selectedAlumni.job_title || selectedAlumni.role, company: company.name, email: selectedAlumni.email });
                setShowAlumniSelect(false);
              }
            }}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', opacity: selectedAlumni ? 1 : 0.5 }}>
            Draft Outreach →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleContact}
          style={{ background: isFastIQ ? '#4F8CFF' : '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          {isFastIQ ? 'Contact Now →' : '🔒 Unlock FastIQ →'}
        </button>
        <button
          onClick={() => isSaved ? onUnsave(company.name) : onSave({ id: company.name, type: 'warm', name: company.name, company: company.name, title: company.industry || '' })}
          style={{ background: isSaved ? '#EFF6FF' : 'none', border: '1px solid', borderColor: isSaved ? '#4F8CFF' : '#E0E0E0', color: isSaved ? '#4F8CFF' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#4F8CFF' : 'none' }} />
          {isSaved ? 'Saved' : 'Save Company'}
        </button>
      </div>
    </div>
  );
}

function BestOpportunityCard({ combo, onContact, onSave, isSaved, isFastIQ }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 16, padding: 24, boxShadow: '0 0 30px rgba(232,93,32,0.1)', marginBottom: 32 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⭐ YOUR BEST OPPORTUNITY</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{combo.company} · {combo.industry}</p>
        {combo.hiring && <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100 }}>🟢 Actively Hiring</span>}
      </div>
      {combo.parent && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px' }}>
          🔥 {combo.parent.name} · {combo.parent.title} · CFF Parent · Open to intros
        </p>
      )}
      {combo.alumniCount > 0 && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>
          🎯 {combo.alumniCount} alumni work here{!isFastIQ ? ' · 🔒 Unlock to see who' : ''}
        </p>
      )}
      {combo.reason && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 0 0', marginTop: 4 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>WHY THIS IS YOUR #1 TARGET RIGHT NOW</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{combo.reason}"</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {combo.parent && (
          <button
            onClick={() => onContact({ id: combo.parent.id, type: 'hot', name: combo.parent.name, title: combo.parent.title, company: combo.company, email: combo.parent.email })}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Request Parent Intro →
          </button>
        )}
        <button
          onClick={() => onSave({ id: `combo_${combo.company}`, type: 'hot', name: combo.parent?.name || combo.company, company: combo.company, title: combo.parent?.title || '' })}
          style={{ background: 'none', border: '1.5px solid rgba(232,93,32,0.5)', color: '#E85D20', borderRadius: 100, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, onOpenUpgrade, leadsRef }) {
  const [loading, setLoading] = useState(true);
  const [hotLeads, setHotLeads] = useState([]);
  const [warmLeads, setWarmLeads] = useState([]);
  const [comboLead, setComboLead] = useState(null);
  const [briefings, setBriefings] = useState({});
  const [loadingBriefings, setLoadingBriefings] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [hotLeadLevel, setHotLeadLevel] = useState(1); // 1=exact, 2=role, 3=any
  const fastiq = isFastIQUser(user);
  const goals = user?.career_goals || {};

  useEffect(() => {
    fetchLeads();
  }, [user?.email, JSON.stringify(goals.target_industries)]);

  const [adjacentLeads, setAdjacentLeads] = useState([]);
  const [suggestedCompanies, setSuggestedCompanies] = useState([]);

  const fetchLeads = async () => {
    setLoading(true);
    setAdjacentLeads([]);
    setSuggestedCompanies([]);
    const industries = goals.target_industries || goals.industries || [];
    const targetRoles = goals.target_roles || [];
    const targetCompanies = goals.target_companies || (goals.dream_company ? [goals.dream_company] : []);
    const location = goals.location_preference || goals.locations?.[0] || 'the United States';
    const school = user?.school || user?.university || '';
    const schoolWord = school.toLowerCase().split(' ')[0];
    const expandedIndustries = getIndustryAliases(industries);

    try {
      const [dirRes, discoveredAlumni] = await Promise.all([
        getDirectoryUsers({}).then(r => r?.data?.data || []).catch(() => []),
        base44.entities.DiscoveredAlumni.filter({}, '-created_date', 300).catch(() => []),
      ]);
      const allUsers = dirRes;

      // Collect ALL parents for debug + 3-level matching
      const allParents = allUsers.filter(u => {
        if (u.persona !== 'parent' && !u.roles?.includes('parent')) return false;
        return !!(u.show_in_directory || u.directory_visible || u.is_directory_visible || u.full_name);
      });
      const parentsWithIndustry = allParents.filter(u => u.industry);
      const sampleIndustries = [...new Set(parentsWithIndustry.slice(0, 20).map(u => u.industry))].slice(0, 5);
      setDebugInfo({
        searching: industries,
        totalParents: allParents.length,
        withIndustry: parentsWithIndustry.length,
        sampleIndustries,
      });

      // LEVEL 1 — industry/taxonomy match (open to intro)
      const openParents = allParents.filter(u =>
        u.intro_availability === 'happy_to_help' || u.intro_availability === 'yes' ||
        u.intro_willingness === 'happy_to_help' || u.intro_willingness === 'yes'
      );
      let level1 = openParents.filter(u => {
        const match = industries.length === 0 ? 'exact' : matchesIndustry(u, expandedIndustries, targetRoles);
        return match === 'exact' || match === 'role';
      });

      // LEVEL 2 — role/title keyword fallback (all titles, open to intro)
      let level2 = [];
      if (level1.length === 0 && targetRoles.length > 0) {
        const roleKeywords = targetRoles.flatMap(r => r.toLowerCase().split(/[\s,]+/)).filter(w => w.length > 3);
        level2 = openParents.filter(u => {
          const title = (u.job_title || u.current_role || '').toLowerCase();
          return roleKeywords.some(k => title.includes(k));
        });
      }

      // LEVEL 3 — any business/finance parent (open to intro)
      let level3 = [];
      const broadTerms = ['finance', 'business', 'investment', 'banking', 'accounting', 'real estate', 'property', 'consulting', 'analyst', 'manager', 'director', 'executive', 'president', 'vp ', 'cfo', 'ceo', 'partner'];
      if (level1.length === 0 && level2.length === 0) {
        level3 = openParents.filter(u => {
          const text = ((u.job_title || '') + ' ' + (u.industry || '')).toLowerCase();
          return broadTerms.some(t => text.includes(t));
        });
        // If still nothing, just take any open-to-intro parent
        if (level3.length === 0) level3 = openParents;
      }

      const level = level1.length > 0 ? 1 : level2.length > 0 ? 2 : 3;
      const parents = (level === 1 ? level1 : level === 2 ? level2 : level3).slice(0, 6);
      setHotLeadLevel(level);
      setHotLeads(parents);
      if (parents.length === 0) setAdjacentLeads(openParents.filter(u => !parents.includes(u)).slice(0, 4));

      // Warm leads — Mode A (named companies) or Mode B (LLM-generated)
      let companyTargets = targetCompanies;
      if (companyTargets.length === 0 && industries.length > 0) {
        // Mode B: generate company list via LLM
        try {
          const llmRes = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a list of 12 real companies that a student targeting ${targetRoles.join(', ') || 'entry-level roles'} in ${industries.join(', ')} in ${location} should be targeting. Include major employers, known campus recruiters, and 2-3 growing mid-size companies. Return ONLY a JSON array of company name strings.`,
            response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
          });
          companyTargets = llmRes?.companies || [];
          if (companyTargets.length > 0) setSuggestedCompanies(companyTargets);
        } catch { companyTargets = []; }
      }

      const companyAlumniMap = {};
      const addAlumni = (list, source) => {
        list.forEach(a => {
          const co = (a.company || a.current_company || '').trim();
          if (!co) return;
          const isTarget = companyTargets.length === 0 || companyTargets.some(t => co.toLowerCase().includes(t.toLowerCase()));
          const isIndustry = expandedIndustries.length === 0 || expandedIndustries.some(i => (a.industry || '').toLowerCase().includes(i));
          const isSchoolAlum = !schoolWord || (a.school || a.university || '').toLowerCase().includes(schoolWord);
          if ((isTarget || isIndustry) && isSchoolAlum) {
            if (!companyAlumniMap[co]) companyAlumniMap[co] = { name: co, industry: a.industry || '', hiring_signal: 'warm', alumni: [] };
            companyAlumniMap[co].alumni.push({ ...a, source });
          }
        });
      };

      const alumniUsers = allUsers.filter(u => (u.persona === 'alumni' || u.roles?.includes('alumni')) && u.full_name);
      addAlumni(alumniUsers, 'user');
      addAlumni(discoveredAlumni, 'discovered');

      const warmCompanies = Object.values(companyAlumniMap)
        .filter(c => c.alumni.length > 0)
        .sort((a, b) => b.alumni.length - a.alumni.length)
        .slice(0, 6);
      setWarmLeads(warmCompanies);

      // Combo lead
      let best = null;
      for (const co of warmCompanies) {
        const parent = parents.find(p => (p.company || '').toLowerCase() === co.name.toLowerCase());
        if (parent) {
          best = { company: co.name, industry: co.industry, alumniCount: co.alumni.length, hiring: co.hiring_signal === 'hot', parent: { id: parent.id, name: parent.full_name, title: parent.job_title, email: parent.email } };
          break;
        }
      }
      setComboLead(best);

      // Briefings for hot leads
      if (parents.length > 0 && (industries.length > 0 || targetRoles.length > 0)) {
        setLoadingBriefings(true);
        base44.integrations.Core.InvokeLLM({
          prompt: `You are FastIQ generating brief lead briefings for a student.

Student goals:
- Target roles: ${targetRoles.join(', ') || 'not set'}
- Target industries: ${industries.join(', ') || 'not set'}

For each parent below, write a 1-2 sentence explanation of why they are a hot lead. Be specific.

Parents:
${parents.map((p, i) => `${i + 1}. ${p.full_name} — ${p.job_title || 'Professional'} at ${p.company || 'their company'} (${p.industry || 'unknown industry'})`).join('\n')}

Return an array of exactly ${parents.length} strings.`,
          response_json_schema: { type: 'object', properties: { briefings: { type: 'array', items: { type: 'string' } } } },
        }).then(res => {
          const arr = res?.briefings || [];
          const map = {};
          parents.forEach((p, i) => { map[p.id] = arr[i] || ''; });
          setBriefings(map);
        }).catch(() => {}).finally(() => setLoadingBriefings(false));

        if (best) {
          base44.integrations.Core.InvokeLLM({
            prompt: `In 2 sentences, explain why ${best.company} (${best.industry}) is the #1 opportunity for a student targeting ${targetRoles.join(', ') || 'general business'} in ${industries.join(', ')}. They have a CFF parent contact open to intros and ${best.alumniCount} alumni in the network. Be specific and motivating.`,
          }).then(reason => {
            setComboLead(prev => prev ? { ...prev, reason: typeof reason === 'string' ? reason : reason?.message || '' } : prev);
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('LeadsSection fetch failed:', e);
    }
    setLoading(false);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));

  if (loading) {
    return (
      <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'orbPulse 1.4s ease-in-out infinite' }}>⚡</div>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', textAlign: 'center', margin: '0 0 4px' }}>Finding your leads...</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', textAlign: 'center', margin: 0 }}>Searching CFF network and alumni database for your best opportunities.</p>
        </div>
        <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.15);opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div ref={leadsRef}>
      {/* Best Opportunity */}
      {comboLead && (
        <BestOpportunityCard
          combo={comboLead}
          onContact={onContact}
          onSave={onSaveLead}
          isSaved={isSaved(`combo_${comboLead.company}`)}
          isFastIQ={fastiq}
        />
      )}

      {/* Hot Leads */}
      <section style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>🔥 HOT LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>CFF Parents in Your Industries</h3>
        {hotLeads.length > 0 ? (
          <>
            {hotLeadLevel === 2 && (
              <div style={{ background: '#FFF8E7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#92400E', margin: 0 }}>No parents in your exact industry yet — showing parents whose titles match your target roles.</p>
              </div>
            )}
            {hotLeadLevel === 3 && (
              <div style={{ background: '#FFF5F0', border: '1px solid #FDDBC8', borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', margin: 0 }}>No exact match yet — showing finance & business parents who may still be helpful:</p>
              </div>
            )}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {hotLeads.length} parent{hotLeads.length > 1 ? 's' : ''} in your network {hotLeads.length === 1 ? 'is' : 'are'} ready to help students targeting {(goals.target_industries || goals.industries || [])[0] || 'your field'}.
            </p>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {hotLeads.map(p => (
                <HotLeadCard
                  key={p.id} parent={p}
                  briefing={briefings[p.id]}
                  user={user}
                  onContact={onContact}
                  onSave={onSaveLead}
                  onUnsave={onUnsaveLead}
                  isSaved={isSaved(p.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 4px' }}>No CFF parents found yet.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 12px' }}>Know a parent who should join?</p>
            <button onClick={() => {}} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Invite a Parent →</button>
            {debugInfo && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, color: '#856404' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Debug: Hot Leads</p>
                <p style={{ margin: '0 0 2px' }}>Searching industries: {JSON.stringify(debugInfo.searching)}</p>
                <p style={{ margin: '0 0 2px' }}>Total parents: {debugInfo.totalParents} | With industry set: {debugInfo.withIndustry}</p>
                <p style={{ margin: 0 }}>Sample industry values: {debugInfo.sampleIndustries.join(', ') || '(none found)'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Warm Leads */}
      <section style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4F8CFF', margin: '0 0 4px' }}>🎯 WARM LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Alumni at Your Target Companies</h3>
        {warmLeads.length > 0 ? (
          <>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {warmLeads.reduce((sum, c) => sum + c.alumni.length, 0)} alumni found across {warmLeads.length} compan{warmLeads.length > 1 ? 'ies' : 'y'} in your target industries.
            </p>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {warmLeads.map(co => (
                <WarmLeadCard
                  key={co.name}
                  company={co}
                  alumni={co.alumni}
                  onContact={onContact}
                  onSave={onSaveLead}
                  onUnsave={onUnsaveLead}
                  isSaved={isSaved(co.name)}
                  isFastIQ={fastiq}
                  onUpgrade={onUpgrade}
                />
              ))}
            </div>
          </>
        ) : suggestedCompanies.length > 0 ? (
          <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '20px 24px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#1E40AF', margin: '0 0 6px' }}>🎯 We're still building alumni coverage in your field.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '0 0 16px', lineHeight: 1.5 }}>Here are the top companies you should be targeting — invite alumni you know to join CFF:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
              {suggestedCompanies.slice(0, 10).map((c, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#1E3A8A', margin: '0 0 4px' }}>{c}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 8px' }}>{(goals.target_industries || [])[0] || 'Your field'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#888' }}>🎓 ? alumni</span>
                    <span style={{ fontSize: 11, color: '#15803D', fontWeight: 600 }}>🟢 Hiring</span>
                  </div>
                  <button onClick={() => {}} style={{ background: 'none', border: '1px solid #93C5FD', color: '#1E40AF', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', width: '100%' }}>Invite Alumni →</button>
                </div>
              ))}
            </div>
            <button onClick={() => {}} style={{ background: '#4F8CFF', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>+ Invite Alumni →</button>
          </div>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              No alumni found yet. Try updating your goals with specific target companies or industries.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}