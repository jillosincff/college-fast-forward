import React, { useState, useEffect } from 'react';
import { Bookmark, Lock, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const WARM_CACHE_TTL = 24 * 60 * 60 * 1000;

// ─── Company Upgrade Modal ────────────────────────────────────────────────────

function CompanyUpgradeModal({ company, alumniCount, confidence, university, onClose, onUpgrade }) {
  const countLabel = confidence === 'high' ? `${alumniCount}` : `~${alumniCount}`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto', padding: 4, fontSize: 18 }}>✕</button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FASTIQ UNLOCK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
          See Who Works at {company}
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.6 }}>
          FastIQ found {countLabel} {university} alumni at {company}. Upgrade to see who they are.
        </p>
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

// ─── CFF Member Card ──────────────────────────────────────────────────────────

function initials(name) {
  return (name || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function CFFMemberCard({ member, accentColor, onContact, onSave, onUnsave, isSaved }) {
  const company = member.company || '';
  const inits = initials(member.full_name);
  const school = member.school || '';
  const shortSchool = school.replace('University of ', '').replace('University', '').replace(' State University', ' State').trim();

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderLeft: `3px solid ${accentColor}`, borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {inits}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: 0 }}>{member.full_name}</p>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>✓ CFF Member</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '2px 0 0' }}>
            {member.job_title}{company ? ` · ${company}` : ''}
          </p>
          {member.briefing && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '4px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{member.briefing}"
            </p>
          )}
        </div>
      </div>

      {/* School + industry tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ background: '#F5F5F5', color: '#555', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>
          📍 {shortSchool || school}
        </span>
        {member.industry && (
          <span style={{ background: '#FFF5F0', color: '#E85D20', border: '1px solid #FDDBC8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>
            {member.industry}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onContact({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email, school })}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button
          onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: `1px solid ${isSaved ? accentColor : '#E0E0E0'}`, color: isSaved ? accentColor : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? accentColor : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Warm Lead Company Card ───────────────────────────────────────────────────

function WarmCompanyCard({ lead, university, onUnlock, onSave, isSaved }) {
  const countLabel = lead.confidence === 'high' ? `${lead.alumni_count}` : `~${lead.alumni_count}`;
  const hiringColor = lead.hiring_signal === 'active' ? '#15803D' : '#D97706';
  const hiringLabel = lead.hiring_signal === 'active' ? '🟢 Hiring' : lead.hiring_signal === 'selective' ? '🟡 Selective' : null;

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
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B', margin: 0 }}>🔒 See who + reach out with FastIQ</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onUnlock(lead)}
          style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Unlock FastIQ →
        </button>
        <button onClick={() => onSave({ id: `alumni_${lead.company}`, source: 'web_search', company: lead.company })}
          style={{ background: isSaved ? '#F5F3FF' : 'none', border: `1px solid ${isSaved ? '#7C3AED' : '#E0E0E0'}`, color: isSaved ? '#7C3AED' : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#7C3AED' : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function RedHotEmptyState({ university, targetDesc }) {
  return (
    <div style={{ background: '#FFF8F0', border: '1px dashed #FDDBC8', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
        No {university} CFF members in your field yet
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
        CFF is growing — as more {university} parents and alumni
        {targetDesc ? ` in ${targetDesc}` : ''} join, they'll appear here automatically.
        <br />Know someone who should join?
      </p>
      <button
        onClick={() => {
          const url = `mailto:?subject=Join College Fast Forward&body=Hey! I'm using this platform to connect with students and parents from ${university}. You should join — ${window.location.origin}`;
          window.open(url);
        }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
        <UserPlus style={{ width: 15, height: 15 }} />
        Invite a {university} Parent →
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, leadsRef }) {
  const [loading, setLoading] = useState(true);
  const [redHotLeads, setRedHotLeads] = useState([]);
  const [warmLeads, setWarmLeads] = useState([]);
  const [warmLoading, setWarmLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [targetDesc, setTargetDesc] = useState('');

  const goals = user?.career_goals || {};
  const university = user?.school || user?.university || 'UF';

  useEffect(() => { fetchCFFLeads(); }, [user?.email]);

  const fetchCFFLeads = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getLeadsForStudent', { student_id: user?.id });
      const result = response?.data || response;
      if (result?.error) { console.error('Leads error:', result.error); setRedHotLeads([]); setLoading(false); return; }
      setRedHotLeads(result?.redHot || []);
      setTargetDesc(result?.targetDesc || '');
      fetchWarmLeads(result?.hasGoals);
    } catch (e) {
      console.error('CFF leads fetch failed:', e);
      setRedHotLeads([]);
    }
    setLoading(false);
  };

  const fetchWarmLeads = async (hasGoals) => {
    const cached = user?.warm_leads_cache;
    const cachedAt = user?.warm_leads_cached_at;
    if (cached?.length > 0 && cachedAt && (Date.now() - new Date(cachedAt).getTime() < WARM_CACHE_TTL)) {
      setWarmLeads(cached); return;
    }

    setWarmLoading(true);
    const industries = goals.target_industries || goals.industries || [];
    const roles = goals.target_roles || [];
    const location = goals.location_preference || 'the US';
    let targetCompanies = goals.target_companies || (goals.dream_company && goals.dream_company !== 'Not specified' ? [goals.dream_company] : []);

    try {
      // FIX 4: Auto-generate target companies from goals if none set
      if (targetCompanies.length === 0 && (industries.length > 0 || roles.length > 0)) {
        const llm = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate 8 real, well-known companies that someone targeting "${roles.join(', ') || 'entry-level roles'}" in "${industries.join(', ') || 'business'}" in ${location} should target. Return JSON array of company name strings only. No explanation.`,
          response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
        });
        targetCompanies = llm?.companies || [];
      }

      if (targetCompanies.length === 0) { setWarmLoading(false); return; }

      const results = await Promise.all(
        targetCompanies.slice(0, 12).map(async (company) => {
          try {
            return await base44.integrations.Core.InvokeLLM({
              prompt: `How many ${university} alumni currently work at ${company}? Search LinkedIn/professional sources. Return JSON: { "company": "${company}", "alumni_count": number|null, "confidence": "high|medium|low", "hiring_signal": "active|selective|freeze|unknown", "industry": "string" }. Return null for alumni_count if cannot confirm.`,
              add_context_from_internet: true,
              model: 'gemini_3_flash',
              response_json_schema: { type: 'object', properties: { company: { type: 'string' }, alumni_count: { type: 'number' }, confidence: { type: 'string' }, hiring_signal: { type: 'string' }, industry: { type: 'string' } } },
            });
          } catch { return null; }
        })
      );

      const valid = results.filter(r => r && r.alumni_count !== null && r.confidence !== 'low' && r.alumni_count > 0).sort((a, b) => b.alumni_count - a.alumni_count);
      setWarmLeads(valid);
      base44.auth.updateMe({ warm_leads_cache: valid, warm_leads_cached_at: new Date().toISOString() }).catch(() => {});
    } catch (e) { console.error('Warm leads fetch failed:', e); }
    setWarmLoading(false);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  const totalWarmAlumni = warmLeads.reduce((s, r) => s + (r.alumni_count || 0), 0);
  // FIX 5: Honest count — only count relevant leads
  const redHotCount = redHotLeads.length;

  return (
    <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>Finding your CFF leads...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── RED HOT LEADS ── */}
          <section id="red-hot-section" style={{ marginBottom: 36 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#DC2626', margin: '0 0 4px' }}>🔴 RED HOT LEADS</p>
            {/* FIX 5: Consistent header — count only relevant leads */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
              {redHotCount > 0
                ? `${redHotCount} ${university} CFF members in your field`
                : `0 ${university} CFF members in your field yet`}
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {redHotCount > 0 ? 'Same school. Same field. Reach out now.' : 'CFF is growing — invite a parent or alumni to join.'}
            </p>

            {redHotCount > 0 ? (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {redHotLeads.map(m => (
                  <CFFMemberCard key={m.id} member={m} accentColor="#DC2626" onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(m.id)} />
                ))}
              </div>
            ) : (
              <RedHotEmptyState university={university} targetDesc={targetDesc} />
            )}
          </section>

          {/* ── WARM LEADS ── */}
          <section id="warm-section">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7C3AED', margin: '0 0 4px' }}>🌡️ WARM LEADS</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
              {totalWarmAlumni > 0 ? `${totalWarmAlumni} ` : ''}{university} alumni found at your target companies
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7C3AED', fontWeight: 600, margin: '0 0 16px' }}>
              Upgrade to FastIQ to see who they are and reach out.
            </p>

            {warmLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#7C3AED' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lsSpin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0 }}>Searching for {university} alumni at your target companies...</p>
              </div>
            ) : warmLeads.length > 0 ? (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {warmLeads.map((lead, i) => (
                  <WarmCompanyCard key={lead.company || i} lead={lead} university={university} onUnlock={(lead) => setUpgradeModal(lead)} onSave={onSaveLead} isSaved={isSaved(`alumni_${lead.company}`)} />
                ))}
              </div>
            ) : (
              <div style={{ background: '#F5F3FF', border: '1px dashed #DDD6FE', borderRadius: 10, padding: '20px 24px' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
                  Searching for {university} alumni at companies in your target field. This takes a moment...
                </p>
              </div>
            )}
          </section>
        </>
      )}

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

      <style>{`@keyframes lsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}