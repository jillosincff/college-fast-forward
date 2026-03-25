import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Lock, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ modalData, university, onClose, onUpgrade }) {
  const isRole = modalData?.isRole || modalData?.type === 'role_based';
  const countLabel = isRole
    ? (modalData?.total_count || 0).toLocaleString()
    : modalData?.confidence === 'verified' ? (modalData?.alumni_count || 0).toLocaleString() : `~${(modalData?.alumni_count || 0).toLocaleString()}`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', fontSize: 20, padding: 4 }}>✕</button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>⚡ FASTIQ UNLOCK</p>
        {isRole ? (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>Meet {university} Alumni Working as {modalData.job_title}</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', lineHeight: 1.6 }}><strong style={{ color: '#E85D20' }}>{countLabel} {university} alumni</strong> currently hold this role.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: '0 0 16px' }}>✓ Source: LinkedIn</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>These people went to your school, landed exactly the role you want, and can tell you how they got there.</p>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>See Who Works at {modalData?.company}</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.6 }}>FastIQ found <strong style={{ color: '#E85D20' }}>{countLabel} {university} alumni</strong> at {modalData?.company}. Upgrade to see exactly who they are.</p>
          </>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {['Full names and current roles', "Who's in your exact target function", 'AI-drafted personalized outreach for each', 'Follow-up reminders', 'Alumni at ALL your target companies'].map((f, i) => (
            <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>✓ {f}</p>
          ))}
        </div>
        <button onClick={onUpgrade} style={{ width: '100%', background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', marginBottom: 10 }}>🔒 Unlock FastIQ — $29/month →</button>
        <button onClick={onUpgrade} style={{ width: '100%', background: 'none', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', borderRadius: 100, padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>⭐ Founding member rate — $187/year →</button>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {inits}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: 0 }}>{member.full_name}</p>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>✓ CFF</span>
          </div>
          {(member.job_title || member.industry) && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '2px 0 0' }}>
              {member.job_title}{company ? ` · ${company}` : ''}
            </p>
          )}
          {member.briefing && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '4px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{member.briefing}"
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ background: '#F5F5F5', color: '#555', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>📍 {shortSchool || school}</span>
        {member.industry && (
          <span style={{ background: '#FFF5F0', color: '#E85D20', border: '1px solid #FDDBC8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>{member.industry}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onContact({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email, school })}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: `1px solid ${isSaved ? accentColor : '#E0E0E0'}`, color: isSaved ? accentColor : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? accentColor : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Warm Company Card ────────────────────────────────────────────────────────

function WarmCompanyCard({ lead, maxAlumni, university, onUnlock, onSave, isSaved, style }) {
  const countLabel = (lead.alumni_count && lead.confidence === 'verified') ? lead.alumni_count.toLocaleString() : null;
  const barWidth = countLabel && maxAlumni > 0 ? Math.round((lead.alumni_count / maxAlumni) * 100) : 0;
  const hiringColor = lead.hiring_signal === 'active' ? '#15803D' : lead.hiring_signal === 'selective' ? '#D97706' : '#94A3B8';
  const hiringLabel = { active: '🟢 Actively Hiring', selective: '🟡 Selective', freeze: '🔴 Freeze' }[lead.hiring_signal] || null;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: '#0d1117', margin: '0 0 2px' }}>{lead.company}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
            {[lead.industry, lead.location].filter(Boolean).join(' · ')}
          </p>
        </div>
        {hiringLabel && <span style={{ fontSize: 11, color: hiringColor, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{hiringLabel}</span>}
      </div>

      {/* Alumni count + bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          {lead.alumni_count && lead.confidence === 'verified' ? (
            <>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#0d1117', lineHeight: 1 }}>{lead.alumni_count.toLocaleString()}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>{university} alumni work here</span>
              {lead.source === 'linkedin_proxycurl' && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#15803D', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 100, padding: '2px 8px', marginLeft: 4 }}>✓ LinkedIn verified</span>
              )}
            </>
          ) : (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', fontWeight: 500 }}>🎓 {university} alumni work here</span>
          )}
        </div>
        {lead.alumni_count && lead.confidence === 'verified' && (
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, #E85D20, #ff8c5a)', borderRadius: 100, transition: 'width 0.8s ease' }} />
          </div>
        )}
      </div>

      {/* Blurred teaser names */}
      {lead.teaser_roles?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lead.teaser_roles.slice(0, 3).map((role, i) => {
            const WIDTHS = ['88px', '104px', '76px', '112px'];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
                <div style={{ height: 12, background: '#ddd', borderRadius: 4, flexShrink: 0, width: WIDTHS[i % 4] }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}>· {role}</span>
              </div>
            );
          })}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa', margin: '2px 0 0', paddingLeft: 32 }}>
            + {Math.max(0, lead.alumni_count - 3).toLocaleString()} more
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onUnlock(lead)}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          🔒 Unlock to See Who →
        </button>
        <button onClick={() => onSave({ id: `alumni_${lead.company}`, source: 'web_search', company: lead.company })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: `1px solid ${isSaved ? '#E85D20' : '#E0E0E0'}`, color: isSaved ? '#E85D20' : '#666', borderRadius: 100, padding: '10px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? '#E85D20' : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Role-Based Warm Lead Card ──────────────────────────────────────────────

function RoleBasedWarmLeadCard({ roleData, university, onUnlock }) {
  const { job_title, total_count, profiles, confidence } = roleData;
  const barWidth = Math.min(((total_count || 0) / 100) * 100, 100);
  const WIDTHS = ['88px', '104px', '76px'];
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderLeft: '3px solid #E85D20', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: '#0d1117', margin: '0 0 2px' }}>💼 {job_title}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{university} alumni doing this role right now</p>
        </div>
        {confidence === 'verified' && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#15803D', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 100, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>✓ LinkedIn verified</span>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#0d1117', lineHeight: 1 }}>{(total_count || 0).toLocaleString()}</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>{university} alumni have this role</span>
        </div>
        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, #E85D20, #ff8c5a)', borderRadius: 100, transition: 'width 0.8s ease' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(profiles || []).slice(0, 3).map((profile, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
            <div style={{ height: 12, background: '#ddd', borderRadius: 4, flexShrink: 0, width: WIDTHS[i % 3] }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}>· {profile.current_company || 'Company hidden'}</span>
          </div>
        ))}
        {total_count > 3 && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa', margin: '2px 0 0', paddingLeft: 32 }}>+ {(total_count - 3).toLocaleString()} more</p>
        )}
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', margin: 0, lineHeight: 1.5 }}>
        💡 These alumni can tell you exactly what it takes to land a {job_title} role and what the day-to-day really looks like.
      </p>
      <button onClick={onUnlock} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
        🔒 See Who They Are →
      </button>
    </div>
  );
}

// ─── Red Hot Empty State ──────────────────────────────────────────────────────

function RedHotEmptyState({ university, targetDesc }) {
  return (
    <div style={{ background: '#FFF8F0', border: '1px dashed #FDDBC8', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
        No {university} CFF members in your field yet
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
        CFF is growing — as more {university} parents and alumni{targetDesc ? ` in ${targetDesc}` : ''} join, they'll appear here automatically.
        <br />Know someone who should join?
      </p>
      <button
        onClick={() => window.open(`mailto:?subject=Join College Fast Forward&body=Hey! I'm using CFF to connect with students and professionals from ${university}. You should join — ${window.location.origin}`)}
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
  const [exploreChips, setExploreChips] = useState([]);
  const [selectedChip, setSelectedChip] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [targetDesc, setTargetDesc] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [warmSearchType, setWarmSearchType] = useState('company_based');

  const university = studentSchool || user?.school || user?.university || 'UF';

  useEffect(() => { fetchLeads(); }, [user?.email]);

  const fetchLeads = async () => {
    setLoading(true);
    setWarmLoading(true);
    try {
      const response = await base44.functions.invoke('getLeadsForStudent', { student_id: user?.id });
      const result = response?.data || response;
      if (result?.error) { console.error('Leads error:', result.error); setLoading(false); setWarmLoading(false); return; }

      setRedHotLeads(result?.redHot || []);
      setWarmLeads(result?.warmLeads || []);
      setExploreChips(result?.exploreChips || []);
      setTargetDesc(result?.targetDesc || '');
      setStudentSchool(result?.studentSchool || '');
      setWarmSearchType(result?.warmSearchType || 'company_based');
    } catch (e) {
      console.error('Leads fetch failed:', e);
    }
    setLoading(false);
    setWarmLoading(false);
  };

  // FIX 1: Frontend self-exclusion safety net
  const safeRedHotLeads = (redHotLeads || []).filter(
    lead => lead.id !== user?.id && lead.email?.toLowerCase() !== user?.email?.toLowerCase()
  );

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  // Handle both company-based (alumni_count) and role-based (total_count)
  const isRoleBased = warmSearchType === 'role_based' || warmLeads.some(w => w.type === 'role_based');
  const verifiedWarmLeads = isRoleBased
    ? warmLeads.filter(r => r.total_count > 0 && r.confidence === 'verified')
    : warmLeads.filter(r => r.alumni_count && r.confidence === 'verified');
  const verifiedTotal = isRoleBased
    ? verifiedWarmLeads.reduce((s, r) => s + (r.total_count || 0), 0)
    : verifiedWarmLeads.reduce((s, r) => s + (r.alumni_count || 0), 0);
  const maxAlumni = Math.max(...warmLeads.map(c => c.alumni_count || c.total_count || 0), 1);
  const memberLabel = safeRedHotLeads.length === 1 ? 'member' : 'members';
  const selectedCardData = selectedChip ? warmLeads.find(w => w.company === selectedChip) : null;

  const INVALID_CHIP_VALUES = ['no dream company yet','not specified','not specified yet','not sure yet','not sure','unsure','tbd','n/a','none','none yet',''];
  const validExploreChips = (exploreChips || []).filter(c => c && !INVALID_CHIP_VALUES.includes(c.toLowerCase().trim()));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>Finding your leads...</p>
      </div>
    );
  }

  return (
    <div ref={leadsRef} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── RED HOT ── */}
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#DC2626', margin: '0 0 4px' }}>🔴 RED HOT LEADS</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
          {redHotLeads.length > 0
            ? `${redHotLeads.length} ${university} CFF ${memberLabel} in your field`
            : `0 ${university} CFF members in your field yet`}
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
          {redHotLeads.length > 0 ? 'Same school. Same field. Free to contact now.' : ''}
        </p>
        {safeRedHotLeads.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {safeRedHotLeads.map(m => (
              <CFFMemberCard key={m.id} member={m} accentColor="#DC2626" onContact={onContact} onSave={onSaveLead} onUnsave={onUnsaveLead} isSaved={isSaved(m.id)} />
            ))}
          </div>
        ) : (
          <RedHotEmptyState university={university} targetDesc={targetDesc} />
        )}
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 40px' }} />

      {/* ── WARM LEADS HERO ── */}
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>🌡️ WARM LEADS</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>
          {isRoleBased
            ? `${university} alumni doing your target role`
            : `${university} alumni at your target companies`}
        </p>

        {warmLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0' }}>
            <div style={{ width: 20, height: 20, border: '2px solid #E85D20', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lsSpin 0.8s linear infinite' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0, color: '#888' }}>Searching for {university} alumni at your target companies...</p>
          </div>
        ) : warmLeads.length > 0 ? (
          <>
            {/* Hero stat block */}
            <div style={{ marginBottom: 28, padding: '28px 32px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 16 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: verifiedTotal > 0 ? 72 : 48, fontWeight: 700, color: '#0d1117', lineHeight: 1, margin: '0 0 8px' }}>
                {verifiedTotal > 0 ? verifiedTotal.toLocaleString() : warmLeads.length.toString()}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#555', margin: '0 0 4px' }}>
                {verifiedTotal > 0
                  ? isRoleBased
                    ? `verified ${university} alumni currently working in your target role.`
                    : `verified ${university} alumni at your target companies.`
                  : isRoleBased
                    ? `${university} alumni doing your target role.`
                    : `companies in your field where ${university} alumni work.`
                }
              </p>
              {verifiedTotal > 0 && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#15803D', margin: '0 0 4px' }}>✓ Source: LinkedIn · Updated weekly</p>
              )}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: '0 0 20px' }}>
                You can't see who they are yet.
              </p>
              <button onClick={() => onUpgrade?.()}
                style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 'auto' }}>
                ⚡ Unlock FastIQ — See Who They Are →
              </button>
            </div>

            {/* Explore chips — horizontal scroll */}
            {validExploreChips.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: '0 0 10px' }}>⚡ EXPLORE COMPANIES IN YOUR FIELD</p>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 8, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {validExploreChips.map((chip, i) => {
                    const hasData = warmLeads.some(w => w.company === chip);
                    const isSelected = selectedChip === chip;
                    return (
                      <button key={i} onClick={() => setSelectedChip(isSelected ? null : chip)}
                        style={{ background: isSelected ? '#FFF5F0' : '#fff', border: `1.5px solid ${isSelected ? '#E85D20' : '#e5e5e5'}`, borderRadius: 100, padding: '8px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: isSelected ? '#E85D20' : '#333', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease', opacity: hasData ? 1 : 0.6 }}>
                        {chip}
                      </button>
                    );
                  })}
                </div>
                {selectedChip && selectedCardData && (
                  <div style={{ marginTop: 16, animation: 'slideDown 0.3s ease' }}>
                    <WarmCompanyCard lead={selectedCardData} maxAlumni={maxAlumni} university={university} onUnlock={(lead) => setUpgradeModal(lead)} onSave={onSaveLead} isSaved={isSaved(`alumni_${selectedCardData.company}`)} />
                  </div>
                )}
              </div>
            )}

            {/* All company or role cards */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {warmLeads.map((lead, i) =>
                lead.type === 'role_based'
                  ? <RoleBasedWarmLeadCard key={lead.job_title || i} roleData={lead} university={university} onUnlock={() => setUpgradeModal({ ...lead, isRole: true })} onUpgrade={onUpgrade} />
                  : <WarmCompanyCard key={lead.company || i} lead={lead} maxAlumni={maxAlumni} university={university} onUnlock={(lead) => setUpgradeModal(lead)} onSave={onSaveLead} isSaved={isSaved(`alumni_${lead.company}`)} />
              )}
            </div>
          </>
        ) : (
          <div style={{ background: '#FFF8F0', border: '1px dashed #FDDBC8', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
              Searching for {university} alumni at companies in your target field. This may take a moment on first load.
            </p>
          </div>
        )}
      </section>

      {upgradeModal && (
        <UpgradeModal
          modalData={upgradeModal}
          university={university}
          onClose={() => setUpgradeModal(null)}
          onUpgrade={() => { setUpgradeModal(null); onUpgrade?.(); }}
        />
      )}

      <style>{`
        @keyframes lsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}