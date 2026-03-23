import React, { useState, useEffect } from 'react';
import { Loader2, Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';

const isFastIQUser = (user) =>
  !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BROAD_FINANCE_TERMS = [
  'finance', 'financial', 'investment', 'banking', 'accounting', 'real estate',
  'property', 'consulting', 'analyst', 'manager', 'director', 'executive',
  'president', 'vp', 'cfo', 'ceo', 'partner', 'insurance', 'asset', 'wealth',
  'capital', 'fund', 'portfolio', 'mortgage', 'broker', 'acquisitions', 'reit',
];

const INDUSTRY_ALIASES = {
  'real estate': ['real estate', 'property', 'construction', 'finance', 'financial', 'investment', 'reit', 'mortgage', 'commercial real estate'],
  'finance': ['finance', 'financial', 'banking', 'investment', 'insurance', 'accounting', 'fintech', 'wealth', 'capital', 'asset management'],
  'technology': ['tech', 'software', 'it ', 'information technology', 'saas', 'digital', 'data', 'engineering'],
  'healthcare': ['health', 'medical', 'clinical', 'pharma', 'biotech', 'hospital', 'nursing'],
  'marketing': ['marketing', 'advertising', 'pr', 'communications', 'brand', 'media'],
  'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
};

function getExpandedIndustries(industries) {
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

function memberTextField(u) {
  return [
    u.company, u.current_company, u.employer, u.job_title,
    u.current_role, u.industry, u.school, u.university, u.location,
    u.location_city, u.location_state,
  ].filter(Boolean).join(' ').toLowerCase();
}

function memberCompany(u) {
  return (u.company || u.current_company || u.employer || '').trim();
}

function getRoleKeywords(targetRoles, targetIndustries) {
  const fromRoles = targetRoles.flatMap(r => r.toLowerCase().split(/[\s,/]+/)).filter(w => w.length > 3);
  const fromIndustries = targetIndustries.flatMap(ind => {
    const lower = ind.toLowerCase();
    for (const [key, aliases] of Object.entries(INDUSTRY_ALIASES)) {
      if (lower.includes(key)) return aliases;
    }
    return [lower];
  });
  return [...new Set([...fromRoles, ...fromIndustries])];
}

function isRecentGrad(u) {
  const year = parseInt(u.graduation_year || u.grad_year || '0');
  if (!year) return false;
  return year <= new Date().getFullYear() - 2;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelBanner({ level, context }) {
  if (level <= 1) return null;
  const msgs = {
    2: `No exact industry match — showing parents whose roles match "${context}":`,
    3: `No role title match — showing finance & business parents who may still help:`,
    4: `Showing parents in related professional fields:`,
    5: `Active CFF parents open to helping students:`,
  };
  const colors = {
    2: { bg: '#FFF8E7', border: '#FDE68A', color: '#92400E' },
    3: { bg: '#FFF5F0', border: '#FDDBC8', color: '#E85D20' },
    4: { bg: '#F9F9F9', border: '#E0E0E0', color: '#666' },
    5: { bg: '#F0F7FF', border: '#BFDBFE', color: '#1E40AF' },
  };
  const c = colors[level] || colors[5];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: c.color, margin: 0 }}>{msgs[level]}</p>
    </div>
  );
}

function WarmLevelBanner({ level, context }) {
  if (level <= 1) return null;
  const msgs = {
    2: `No members at exact companies — showing alumni in your target role:`,
    3: `Showing alumni working in your target industry:`,
    4: `Showing CFF members in ${context || 'your location'} who can help:`,
    5: `Active CFF alumni open to helping students:`,
  };
  const c = { bg: '#F0F7FF', border: '#BFDBFE', color: '#1E40AF' };
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: c.color, margin: 0 }}>{msgs[level]}</p>
    </div>
  );
}

function MatchBadge({ score }) {
  return (
    <span style={{
      background: score >= 70 ? '#E85D20' : '#F59E0B',
      color: '#fff', fontSize: 10, fontWeight: 700,
      padding: '2px 9px', borderRadius: 100,
    }}>
      {score >= 70 ? 'Strong Match' : 'Good Match'}
    </span>
  );
}

function HotLeadCard({ parent, briefing, onContact, onSave, onUnsave, isSaved, currentUser }) {
  const initials = (parent.full_name || 'P').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const baseScore = parent.intro_availability === 'happy_to_help' || parent.intro_willingness === 'happy_to_help' ? 80 : 65;
  const userSchool = (currentUser?.school || currentUser?.university || '').toLowerCase();
  const parentSchool = (parent.school || parent.university || '').toLowerCase();
  const sameSchool = !!(userSchool && parentSchool && userSchool.split(' ')[0] === parentSchool.split(' ')[0]);
  const score = baseScore + (sameSchool ? 15 : 0);
  const schoolLabel = parent.school || parent.university || 'CFF';
  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: '3px solid #E85D20', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {parent.full_name?.split(' ')[0]} {parent.full_name?.split(' ').slice(-1)[0]?.[0]}.
            </p>
            {parent.job_title && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: '0 0 2px' }}>{parent.job_title}{parent.company ? ` · ${parent.company}` : ''}</p>}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: sameSchool ? '#E85D20' : '#888', margin: 0, fontWeight: 500 }}>🏫 {schoolLabel} Parent</p>
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
        <button onClick={() => onContact({ id: parent.id, type: 'hot', name: parent.full_name, title: parent.job_title, company: parent.company, email: parent.email, school: parent.school || parent.university })}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button onClick={() => isSaved ? onUnsave(parent.id) : onSave({ id: parent.id, type: 'hot', name: parent.full_name, title: parent.job_title, company: parent.company, email: parent.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: '1px solid', borderColor: isSaved ? '#E85D20' : '#E0E0E0', color: isSaved ? '#E85D20' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : 'Save for Later'}
        </button>
      </div>
    </div>
  );
}

function WarmMemberCard({ member, onContact, onSave, onUnsave, isSaved, isFastIQ, onUpgrade }) {
  const initials = (member.full_name || 'A').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const company = memberCompany(member);
  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderLeft: '3px solid #4F8CFF', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#4F8CFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{initials}</div>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: '0 0 2px' }}>
            {member.full_name?.split(' ')[0]} {member.full_name?.split(' ').slice(-1)[0]?.[0]}.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>
            {member.job_title || member.current_role || 'Professional'}{company ? ` · ${company}` : ''}
          </p>
          {member.graduation_year && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#4F8CFF', margin: '2px 0 0' }}>Class of {member.graduation_year}</p>}
        </div>
      </div>
      {!isFastIQ && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', margin: 0, fontStyle: 'italic' }}>🔒 Unlock FastIQ to see full profile & reach out</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => isFastIQ ? onContact({ id: member.id, type: 'warm', name: member.full_name, title: member.job_title, company, email: member.email }) : onUpgrade?.()}
          style={{ background: isFastIQ ? '#4F8CFF' : '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          {isFastIQ ? 'Contact →' : '🔒 Unlock FastIQ →'}
        </button>
        <button onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, type: 'warm', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#EFF6FF' : 'none', border: '1px solid', borderColor: isSaved ? '#4F8CFF' : '#E0E0E0', color: isSaved ? '#4F8CFF' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#4F8CFF' : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function CompanyChipCard({ name, memberCount, industry }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 14px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#1E3A8A', margin: '0 0 4px' }}>{name}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#64748B', margin: '0 0 8px' }}>{industry || 'Your field'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {memberCount > 0
          ? <span style={{ fontSize: 11, color: '#4F8CFF', fontWeight: 600 }}>🎓 {memberCount} CFF member{memberCount > 1 ? 's' : ''} here</span>
          : <span style={{ fontSize: 11, color: '#888' }}>🎓 ? · Invite alumni</span>}
        <span style={{ fontSize: 11, color: '#15803D', fontWeight: 600 }}>🟢 Hiring</span>
      </div>
      <button onClick={() => {}} style={{ background: 'none', border: '1px solid #93C5FD', color: '#1E40AF', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', width: '100%' }}>
        {memberCount > 0 ? 'See Who →' : 'Invite Alumni →'}
      </button>
    </div>
  );
}

function BestOpportunityCard({ combo, onContact, onSave, isSaved, isFastIQ }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 16, padding: 24, boxShadow: '0 0 30px rgba(232,93,32,0.1)', marginBottom: 32 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⭐ YOUR BEST OPPORTUNITY</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{combo.company}{combo.industry ? ` · ${combo.industry}` : ''}</p>
        {combo.hiring && <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100 }}>🟢 Actively Hiring</span>}
      </div>
      {combo.parent && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px' }}>🔥 {combo.parent.name} · {combo.parent.title} · CFF Parent · Open to intros</p>}
      {combo.alumniCount > 0 && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>🎯 {combo.alumniCount} alumni work here{!isFastIQ ? ' · 🔒 Unlock to see who' : ''}</p>}
      {combo.reason && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 0 0', marginTop: 4 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>WHY THIS IS YOUR #1 TARGET</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{combo.reason}"</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {combo.parent && (
          <button onClick={() => onContact({ id: combo.parent.id, type: 'hot', name: combo.parent.name, title: combo.parent.title, company: combo.company, email: combo.parent.email })}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Request Parent Intro →
          </button>
        )}
        <button onClick={() => onSave({ id: `combo_${combo.company}`, type: 'hot', name: combo.parent?.name || combo.company, company: combo.company, title: combo.parent?.title || '' })}
          style={{ background: 'none', border: '1.5px solid rgba(232,93,32,0.5)', color: '#E85D20', borderRadius: 100, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, onOpenUpgrade, leadsRef }) {
  const [loading, setLoading] = useState(true);
  const [hotLeads, setHotLeads] = useState([]);
  const [hotLevel, setHotLevel] = useState(1);
  const [warmMembers, setWarmMembers] = useState([]);
  const [warmLevel, setWarmLevel] = useState(1);
  const [warmLabel, setWarmLabel] = useState('');
  const [suggestedCompanies, setSuggestedCompanies] = useState([]);
  const [companyCounts, setCompanyCounts] = useState({});
  const [comboLead, setComboLead] = useState(null);
  const [briefings, setBriefings] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);
  const fastiq = isFastIQUser(user);
  const goals = user?.career_goals || {};

  useEffect(() => { fetchLeads(); }, [user?.email, JSON.stringify(goals.target_industries)]);

  const fetchLeads = async () => {
    setLoading(true);
    const industries = goals.target_industries || goals.industries || [];
    const targetRoles = goals.target_roles || [];
    const targetCompanies = goals.target_companies || (goals.dream_company ? [goals.dream_company] : []);
    const location = goals.location_preference || goals.locations?.[0] || '';
    const expandedIndustries = getExpandedIndustries(industries);
    const roleKeywords = getRoleKeywords(targetRoles, industries);

    try {
      const [dirRes, discoveredAlumni] = await Promise.all([
        getDirectoryUsers({}).then(r => r?.data?.data || []).catch(() => []),
        base44.entities.DiscoveredAlumni.filter({}, '-created_date', 300).catch(() => []),
      ]);
      const allUsers = dirRes;

      // ── HOT LEADS: ALL parents across ALL schools, no school filter ──────────
      const allParents = allUsers.filter(u =>
        (u.persona === 'parent' || u.roles?.includes('parent')) && u.full_name
      );
      const openParents = allParents.filter(u =>
        u.intro_availability === 'happy_to_help' || u.intro_availability === 'yes' ||
        u.intro_willingness === 'happy_to_help' || u.intro_willingness === 'yes'
      );

      const parentsWithIndustry = allParents.filter(u => u.industry);
      setDebugInfo({
        searching: industries,
        totalParents: allParents.length,
        withIndustry: parentsWithIndustry.length,
        sampleIndustries: [...new Set(parentsWithIndustry.slice(0, 20).map(u => u.industry))].slice(0, 5),
      });

      // L1: exact industry match, open to intro
      let hot = openParents.filter(u => {
        const text = memberTextField(u);
        return expandedIndustries.some(t => text.includes(t));
      });
      let level = 1;

      // L2: role/title keyword match, open to intro
      if (hot.length === 0 && roleKeywords.length > 0) {
        hot = openParents.filter(u => {
          const title = (u.job_title || u.current_role || '').toLowerCase();
          return roleKeywords.some(k => title.includes(k));
        });
        if (hot.length > 0) level = 2;
      }

      // L3: broad finance/business terms, open to intro
      if (hot.length === 0) {
        hot = openParents.filter(u => {
          const text = memberTextField(u);
          return BROAD_FINANCE_TERMS.some(t => text.includes(t));
        });
        if (hot.length > 0) level = 3;
      }

      // L4: any parent, open to intro (industry-agnostic)
      if (hot.length === 0) {
        hot = openParents;
        if (hot.length > 0) level = 4;
      }

      // L5: safety net — any parent regardless of intro preference
      if (hot.length === 0) {
        hot = allParents;
        level = 5;
      }

      // Sort: same school first, then by open-to-intro
      const userSchoolWord = (user?.school || user?.university || '').toLowerCase().split(' ')[0];
      hot.sort((a, b) => {
        const aSchool = userSchoolWord && (a.school || a.university || '').toLowerCase().includes(userSchoolWord) ? 1 : 0;
        const bSchool = userSchoolWord && (b.school || b.university || '').toLowerCase().includes(userSchoolWord) ? 1 : 0;
        return bSchool - aSchool;
      });

      const parents = hot.slice(0, 6);
      setHotLeads(parents);
      setHotLevel(level);

      // ── WARM LEADS ─────────────────────────────────────────────────────────
      const allMembers = allUsers.filter(u => u.full_name && u.email !== user?.email);

      const compMap = {};
      allMembers.forEach(u => {
        const co = memberCompany(u);
        if (co) compMap[co.toLowerCase()] = (compMap[co.toLowerCase()] || 0) + 1;
      });

      let warm = [];
      let wLevel = 1;
      let wLabel = '';

      if (targetCompanies.length > 0) {
        warm = allMembers.filter(u => {
          const co = memberCompany(u).toLowerCase();
          return targetCompanies.some(t => co.includes(t.toLowerCase()));
        });
      }

      let generatedCompanies = targetCompanies;
      if (targetCompanies.length === 0 && industries.length > 0) {
        try {
          const llmRes = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a list of 12 real companies that a student targeting ${targetRoles.join(', ') || 'entry-level roles'} in ${industries.join(', ')} in ${location || 'the United States'} should be targeting. Include major employers, known campus recruiters, and 2-3 growing mid-size companies. Return ONLY a JSON array of company name strings.`,
            response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
          });
          generatedCompanies = llmRes?.companies || [];
          if (generatedCompanies.length > 0) {
            const counts = {};
            generatedCompanies.forEach(c => {
              counts[c] = allMembers.filter(u => memberCompany(u).toLowerCase().includes(c.toLowerCase())).length;
            });
            setCompanyCounts(counts);
            setSuggestedCompanies(generatedCompanies);
            if (warm.length === 0) {
              warm = allMembers.filter(u => {
                const co = memberCompany(u).toLowerCase();
                return generatedCompanies.some(t => co.includes(t.toLowerCase()));
              });
            }
          }
        } catch { generatedCompanies = []; }
      }

      if (warm.length === 0 && roleKeywords.length > 0) {
        warm = allMembers.filter(u => {
          const title = (u.job_title || u.current_role || '').toLowerCase();
          return roleKeywords.some(k => title.includes(k));
        });
        if (warm.length > 0) { wLevel = 2; wLabel = 'Alumni in your target role'; }
      }

      if (warm.length === 0 && expandedIndustries.length > 0) {
        warm = allMembers.filter(u => {
          const text = memberTextField(u);
          return expandedIndustries.some(t => text.includes(t));
        });
        if (warm.length > 0) { wLevel = 3; wLabel = 'Alumni in your target field'; }
      }

      if (warm.length === 0 && location) {
        const locLower = location.toLowerCase().split(/[,\s]+/)[0];
        warm = allMembers.filter(u => {
          const text = memberTextField(u);
          return text.includes(locLower);
        });
        if (warm.length > 0) { wLevel = 4; wLabel = `CFF members in ${location}`; }
      }

      if (warm.length === 0) {
        warm = allMembers.filter(u =>
          u.persona === 'alumni' || u.roles?.includes('alumni') || isRecentGrad(u)
        ).slice(0, 6);
        if (warm.length === 0) warm = allMembers.slice(0, 6);
        wLevel = 5;
        wLabel = 'Active CFF alumni open to helping students';
      }

      setWarmMembers(warm.slice(0, 6));
      setWarmLevel(wLevel);
      setWarmLabel(wLabel);

      let best = null;
      for (const m of warm.slice(0, 6)) {
        const co = memberCompany(m);
        if (!co) continue;
        const parent = parents.find(p => (p.company || '').toLowerCase() === co.toLowerCase());
        if (parent) {
          best = { company: co, industry: m.industry || '', alumniCount: warm.filter(w => memberCompany(w).toLowerCase() === co.toLowerCase()).length, hiring: true, parent: { id: parent.id, name: parent.full_name, title: parent.job_title, email: parent.email } };
          break;
        }
      }
      setComboLead(best);

      if (parents.length > 0 && (industries.length > 0 || targetRoles.length > 0)) {
        base44.integrations.Core.InvokeLLM({
          prompt: `You are FastIQ. For each parent, write a 1-2 sentence explanation of why they are a valuable lead for a student targeting ${targetRoles.join(', ') || 'business roles'} in ${industries.join(', ') || 'finance'}.\n\nParents:\n${parents.map((p, i) => `${i + 1}. ${p.full_name} — ${p.job_title || 'Professional'} at ${p.company || 'their company'} (${p.industry || 'business'})`).join('\n')}\n\nReturn exactly ${parents.length} strings.`,
          response_json_schema: { type: 'object', properties: { briefings: { type: 'array', items: { type: 'string' } } } },
        }).then(res => {
          const arr = res?.briefings || [];
          const map = {};
          parents.forEach((p, i) => { map[p.id] = arr[i] || ''; });
          setBriefings(map);
        }).catch(() => {});
      }
    } catch (e) {
      console.error('LeadsSection fetch failed:', e);
    }
    setLoading(false);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  const primaryIndustry = (goals.target_industries || goals.industries || [])[0] || 'your field';

  if (loading) {
    return (
      <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'orbPulse 1.4s ease-in-out infinite' }}>⚡</div>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', textAlign: 'center', margin: '0 0 4px' }}>Finding your leads...</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', textAlign: 'center', margin: 0 }}>Searching CFF network and alumni database.</p>
        </div>
        <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.15);opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div ref={leadsRef}>
      {/* Best Opportunity */}
      {comboLead && (
        <BestOpportunityCard combo={comboLead} onContact={onContact} onSave={onSaveLead} isSaved={isSaved(`combo_${comboLead.company}`)} isFastIQ={fastiq} />
      )}

      {/* HOT LEADS */}
      <section style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>🔥 HOT LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>CFF Parents Across the Network</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 12px', lineHeight: 1.5 }}>Parents from CFF schools who work in your target field and are open to helping students.</p>
        <LevelBanner level={hotLevel} context={primaryIndustry} />
        {hotLeads.length > 0 ? (
          <>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {hotLeads.length} parent{hotLeads.length > 1 ? 's' : ''} across the CFF network ready to help — reach out directly.
            </p>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {hotLeads.map(p => (
                <HotLeadCard key={p.id} parent={p} briefing={briefings[p.id]} onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(p.id)} currentUser={user} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 12px' }}>No parents found. Help us grow the network!</p>
            <button onClick={() => {}} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Invite a Parent →</button>
            {debugInfo && (
              <div style={{ marginTop: 16, padding: '10px 12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, color: '#856404' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700 }}>🔍 Debug: Hot Leads</p>
                <p style={{ margin: '0 0 2px' }}>Searching: {JSON.stringify(debugInfo.searching)}</p>
                <p style={{ margin: '0 0 2px' }}>Total parents: {debugInfo.totalParents} | With industry: {debugInfo.withIndustry}</p>
                <p style={{ margin: 0 }}>Sample industries: {debugInfo.sampleIndustries.join(', ') || '(none)'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* WARM LEADS */}
      <section style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4F8CFF', margin: '0 0 4px' }}>🎯 WARM LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          {warmLabel || 'Alumni at Your Target Companies'}
        </h3>
        {warmMembers.length > 0 ? (
          <>
            <WarmLevelBanner level={warmLevel} context={goals.location_preference} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              🎯 {warmMembers.length} CFF member{warmMembers.length > 1 ? 's' : ''} found who can help with your path in {primaryIndustry}.
            </p>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {warmMembers.map(m => (
                <WarmMemberCard key={m.id} member={m} onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(m.id)} isFastIQ={fastiq} onUpgrade={onUpgrade} />
              ))}
            </div>
          </>
        ) : suggestedCompanies.length > 0 ? (
          <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '20px 24px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#1E40AF', margin: '0 0 6px' }}>🎯 We're still building alumni coverage in your field.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '0 0 16px', lineHeight: 1.5 }}>Here are the top companies you should target — invite alumni you know to join CFF:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
              {suggestedCompanies.slice(0, 10).map((c, i) => (
                <CompanyChipCard key={i} name={c} memberCount={companyCounts[c] || 0} industry={primaryIndustry} />
              ))}
            </div>
            <button onClick={() => {}} style={{ background: '#4F8CFF', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>+ Invite Alumni →</button>
          </div>
        ) : (
          <div style={{ background: '#F9F9F9', border: '1px dashed #E0E0E0', borderRadius: 10, padding: '20px 24px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              Loading alumni data… Try updating your goals with specific target companies.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}