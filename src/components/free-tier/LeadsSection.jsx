import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Lock, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';

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
  const isEnriched = !!(member.enriched_at || member.enriched);
  const locationLine = [member.location_city, member.location_state].filter(Boolean).join(', ') || 'Florida';
  const helpTags = (member.ways_to_help || []).slice(0, 3).map(w => WAYS_TO_HELP_LABELS[w]).filter(Boolean);
  const introSignal = getIntroSignal(member);
  const personaLabel = getPersonaLabel(member);
  const outreachSuggestion = getOutreachSuggestion(member);
  const displaySkills = member.skills?.slice(0, 3) || [];

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${isEnriched || (member._score > 5) ? accentColor : '#E5E5E5'}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: member._score > 5 ? '0 4px 16px rgba(220,38,38,0.07)' : '0 1px 4px rgba(0,0,0,0.04)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {member.profile_image_url ? (
          <img src={member.profile_image_url} alt={member.full_name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentColor, color: '#fff', display: member.profile_image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {inits}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1A1A1A', margin: 0 }}>{member.full_name}</p>
            {member.can_provide_referrals && (
              <span style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>✉️ Can refer</span>
            )}
          </div>
          {company && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '2px 0 0' }}>{company}</p>}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', margin: '2px 0 0' }}>{personaLabel}</p>
        </div>
      </div>

      {/* Intro availability signal */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: introSignal.bg, color: introSignal.color, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, alignSelf: 'flex-start', fontFamily: "'DM Sans', sans-serif" }}>
        {introSignal.label}
      </div>

      {/* Ways to help chips */}
      {helpTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {helpTags.map((tag, i) => (
            <span key={i} style={{ background: '#FFF5F0', border: '1px solid #fdd5c0', color: '#E85D20', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif" }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Skills (only if enriched) */}
      {displaySkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {displaySkills.map((skill, i) => (
            <span key={i} style={{ background: '#F0F0F0', color: '#555', fontSize: 11, padding: '3px 8px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif" }}>{skill}</span>
          ))}
        </div>
      )}

      {/* Meta: location + industry */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}>📍 {locationLine}</span>
        {member.industry && <span style={{ background: '#F5F5F5', color: '#555', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif" }}>{member.industry}</span>}
      </div>

      {/* Bio (if enriched) */}
      {member.bio && isEnriched && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', fontStyle: 'italic', lineHeight: 1.5, margin: 0, padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, borderLeft: `3px solid ${accentColor}` }}>
          "{member.bio.slice(0, 120)}{member.bio.length > 120 ? '...' : ''}"
        </p>
      )}

      {/* Outreach suggestion */}
      {outreachSuggestion && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', fontStyle: 'italic', margin: 0, paddingTop: 8, borderTop: '1px solid #F5F5F5' }}>
          💡 {outreachSuggestion}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 }}>
        <button onClick={() => onContact({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Contact Now →
        </button>
        <button onClick={() => isSaved ? onUnsave(member.id) : onSave({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company, email: member.email })}
          style={{ background: isSaved ? '#FFF5F0' : 'none', border: `1px solid ${isSaved ? accentColor : '#E0E0E0'}`, color: isSaved ? accentColor : '#666', borderRadius: 100, padding: '8px 14px', fontSize: 13, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bookmark style={{ width: 13, height: 13, fill: isSaved ? accentColor : 'none' }} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
            style={{ width: 32, height: 32, background: '#0077B5', color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, textDecoration: 'none', flexShrink: 0 }}>
            in
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Warm Company Card ────────────────────────────────────────────────────────

function WarmCompanyCard({ lead, maxAlumni, university, onUnlock, onContact, isFastIQ, style }) {
  const barWidth = (lead.alumni_count && maxAlumni > 0) ? Math.round((lead.alumni_count / maxAlumni) * 100) : 0;
  const hiringColor = lead.hiring_signal === 'active' ? '#15803D' : lead.hiring_signal === 'selective' ? '#D97706' : '#94A3B8';
  const hiringLabel = { active: '🟢 Actively Hiring', selective: '🟡 Selective', freeze: '🔴 Freeze' }[lead.hiring_signal] || null;
  const cffMembers = lead.cff_parents || [];
  const hasAlumniCount = lead.alumni_count > 0;

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
      {hasAlumniCount && lead.confidence === 'verified' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#0d1117', lineHeight: 1 }}>{lead.alumni_count.toLocaleString()}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>{university} alumni work here</span>
            {lead.source === 'linkedin_proxycurl' && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#15803D', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 100, padding: '2px 8px', marginLeft: 4 }}>✓ LinkedIn verified</span>
            )}
          </div>
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, #E85D20, #ff8c5a)', borderRadius: 100, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      )}

      {/* CFF Members — always visible, free to contact */}
      {cffMembers.length > 0 && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', margin: '0 0 8px' }}>CFF members here</p>
          {cffMembers.map((parent, i) => {
            const inits = (parent.full_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={parent.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < cffMembers.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{inits}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{parent.full_name}</p>
                  {parent.job_title && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0 }}>{parent.job_title}</p>}
                </div>
                <button
                  onClick={() => onContact?.({ id: parent.id, source: 'cff_database', name: parent.full_name, title: parent.job_title, company: lead.company, email: parent.email })}
                  style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#E85D20', cursor: 'pointer', minHeight: 'auto', flexShrink: 0 }}
                >
                  Connect →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* UF Alumni (non-CFF) — count visible, profiles gated */}
      {hasAlumniCount && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', margin: '0 0 8px' }}>UF alumni here</p>

          {/* Teaser blurred profile */}
          {lead.teaser_profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e5e5', filter: 'blur(4px)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, filter: 'blur(5px)', userSelect: 'none' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{lead.teaser_profile.display_name || 'S.K.'}</span>
                {lead.teaser_profile.title && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}> · {lead.teaser_profile.title}</span>}
                {lead.teaser_profile.grad_year && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}> · UF {lead.teaser_profile.grad_year}</span>}
              </div>
              <span style={{ fontSize: 14 }}>🔒</span>
            </div>
          )}

          {/* Unlock CTA */}
          <button
            onClick={() => onUnlock(lead)}
            style={{ marginTop: 10, background: 'none', border: '1px solid #E5E5E5', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: '#666', cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}
          >
            {lead.teaser_profile
              ? `🔒 See ${lead.teaser_profile.display_name} and ${Math.max(0, (lead.alumni_count || 1) - 1)} more →`
              : `🔒 See ${lead.alumni_count} UF alumni at ${lead.company} →`}
          </button>
        </div>
      )}

      {/* Fallback if no CFF members and no alumni count — teaser roles */}
      {!cffMembers.length && !hasAlumniCount && lead.teaser_roles?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lead.teaser_roles.slice(0, 3).map((role, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
              <div style={{ height: 12, background: '#ddd', borderRadius: 4, flexShrink: 0, width: ['88px','104px','76px'][i % 3] }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}>· {role}</span>
            </div>
          ))}
          <button onClick={() => onUnlock(lead)} style={{ marginTop: 6, background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            🔒 Unlock to See Who →
          </button>
        </div>
      )}
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

// ─── School name normalization ───────────────────────────────────────────────

const SCHOOL_NAMES = {
  'uf': 'University of Florida', 'usc': 'University of Southern California',
  'osu': 'Ohio State University', 'ucf': 'University of Central Florida',
  'umich': 'University of Michigan', 'udel': 'University of Delaware',
  'uga': 'University of Georgia', 'psu': 'Penn State University',
  'tulane': 'Tulane University', 'umd': 'University of Maryland',
  'fau': 'Florida Atlantic University', 'fsu': 'Florida State University',
  'jmu': 'James Madison University', 'miami': 'University of Miami',
  'utexas': 'University of Texas', 'uky': 'University of Kentucky'
};
const normalizeSchool = (s) => SCHOOL_NAMES[s?.toLowerCase?.()?.trim?.()] || s?.trim?.() || '';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadsSection({ user, onContact, savedLeads, onSaveLead, onUnsaveLead, onUpgrade, leadsRef, onUnlockFastIQ }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [redHotLoading, setRedHotLoading] = useState(true);
  const [alumniQuery, setAlumniQuery] = useState('');
  const [alumniResults, setAlumniResults] = useState([]);
  const [alumniSearching, setAlumniSearching] = useState(false);
  const [alumniSearched, setAlumniSearched] = useState(false);
  const [showAlumniGate, setShowAlumniGate] = useState(false);
  const [sentTo, setSentTo] = useState([]);
  const [connectLoading, setConnectLoading] = useState(null);
  const [outreachModal, setOutreachModal] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [redHotLeads, setRedHotLeads] = useState([]);
  const [redHotTotal, setRedHotTotal] = useState(0);
  const [warmLeads, setWarmLeads] = useState([]);
  const [warmLoading, setWarmLoading] = useState(false);
  const [exploreChips, setExploreChips] = useState([]);
  const [selectedChip, setSelectedChip] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [targetDesc, setTargetDesc] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [warmSearchType, setWarmSearchType] = useState('company_based');

  const university = studentSchool || normalizeSchool(user?.school || user?.university || '') || 'UF';

  const handleInviteParent = async () => {
    const school = user?.school_code || user?.school || '';
    const referralLink = `https://app.collegefastforward.com/join?school=${school}&role=parent`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      if (navigator.share) {
        navigator.share({
          title: 'Join College Fast Forward',
          text: `I'm using CFF to connect with professionals for my job search — would love for you to join so I can tap your network. Takes 2 minutes to set up.`,
          url: referralLink,
        });
      }
    }
  };

  const DEPRIORITIZE_INDUSTRIES = ['healthcare', 'medical', 'nursing', 'dental', 'veterinary', 'pharmacy'];

  // ── Minimum viable lead ──
  const hasUsefulProfile = (u) => {
    // Exclude current students
    if (u.persona === 'student' || u.persona === 'seeker' || u.persona === 'gator') return false;
    if (u.roles?.includes('student')) return false;
    if (u.roles?.includes('gator') && !u.roles?.includes('parent') && !u.roles?.includes('alumni')) return false;
    // Exclude future grads (still in school)
    if (u.graduation_year) {
      const gradYear = parseInt(u.graduation_year);
      if (gradYear > new Date().getFullYear()) return false;
    }
    // Must have job title, company, OR LinkedIn
    const hasProfessionalContext =
      (u.job_title?.trim()) ||
      (u.current_role?.trim()) ||
      (u.company?.trim()) ||
      (u.current_company?.trim()) ||
      (u.linkedin_url?.trim());
    return !!hasProfessionalContext;
  };

  // ── Red Hot: load and filter ──
  const fetchRedHotLeads = async () => {
    setRedHotLoading(true);
    try {
      console.log('[RedHot] Step 1: calling getDirectoryUsers');
      const res = await getDirectoryUsers({});
      console.log('[RedHot] Step 2: res received', typeof res, res);

      const allUsers = res?.data?.data || res?.data || res || [];
      console.log('[RedHot] Step 3: allUsers count', allUsers.length);

      // Persona distribution
      const personaCounts = {};
      allUsers.forEach(u => { const p = u.persona || 'undefined'; personaCounts[p] = (personaCounts[p] || 0) + 1; });
      console.log('[RedHot] Persona distribution:', personaCounts);

      // Parents specifically
      const parents = allUsers.filter(u => u.persona === 'parent' || u.roles?.includes('parent'));
      console.log('[RedHot] Total parents:', parents.length);

      // Parent school distribution
      const parentSchools = {};
      parents.forEach(u => { const s = u.school || u.university || 'no_school'; parentSchools[s] = (parentSchools[s] || 0) + 1; });
      console.log('[RedHot] Parent school distribution:', parentSchools);

      // Sample 3 parents
      console.log('[RedHot] Sample parents:', parents.slice(0, 3).map(u => ({ name: u.full_name, school: u.school, university: u.university, persona: u.persona, roles: u.roles, job_title: u.job_title, company: u.company })));

      const studentSchoolNorm = normalizeSchool(user?.school || user?.university || '');
      setStudentSchool(studentSchoolNorm);
      const studentEmail = user?.email?.toLowerCase()?.trim();
      const studentId = user?.id;
      console.log('[RedHot] Step 4: studentSchool', studentSchoolNorm, '| studentEmail', studentEmail);

      console.log('[RedHot] Step 5: first 3 raw members', JSON.stringify(allUsers.slice(0, 3)));

      const sameSchool = allUsers.filter(u => {
        if (u.id === studentId) return false;
        if (u.email?.toLowerCase()?.trim() === studentEmail) return false;
        const memberSchool = normalizeSchool(u.school || u.university || '');
        // Parents often have no school set — include them (they're platform parents)
        if (u.persona === 'parent' || u.roles?.includes('parent')) {
          return memberSchool === studentSchoolNorm || memberSchool === '';
        }
        return memberSchool === studentSchoolNorm;
      });
      console.log('[RedHot] Step 6: sameSchool with parents:', sameSchool.length);

      // Quality filter using correct field names
      const hasUsefulProfile = (u) => {
        if (u.graduation_year && parseInt(u.graduation_year) > new Date().getFullYear()) return false;
        if (u.persona === 'student' && !u.roles?.includes('parent') && !u.roles?.includes('alumni')) return false;
        return !!(u.company || u.industry || u.job_title || u.bio || u.linkedin_url || u.ways_to_help?.length > 0);
      };

      const careerGoals = user?.career_goals || {};
      const industries = [...(Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : [careerGoals.target_industries].filter(Boolean))].filter(Boolean);
      const roles = [...(Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles].filter(Boolean))].filter(Boolean);
      if (industries.length || roles.length) setTargetDesc([...roles, ...industries].join(', '));

      const INDUSTRY_TO_KEYWORDS = {
        'Marketing & Brand': ['marketing', 'brand', 'advertising', 'social media', 'social', 'pr', 'public relations', 'communications', 'creative', 'digital marketing', 'media buyer', 'content', 'growth'],
        'Financial Services & Banking': ['finance', 'banking', 'investment banking', 'investment bank', 'ib', 'm&a', 'mergers', 'acquisitions', 'private equity', 'pe', 'hedge fund', 'asset management', 'capital markets', 'equity research', 'corporate finance', 'goldman', 'jpmorgan', 'morgan stanley', 'bank of america', 'citi', 'financial', 'wealth management'],
        'Technology & Software': ['tech', 'software', 'engineering', 'developer', 'product', 'saas', 'startup', 'cloud', 'data', 'ai', 'machine learning'],
        'Consulting': ['consulting', 'consultant', 'advisory', 'strategy', 'management consulting', 'mckinsey', 'bain', 'bcg', 'deloitte', 'accenture'],
        'Healthcare & Life Sciences': ['healthcare', 'health', 'medical', 'pharma', 'biotech', 'clinical', 'hospital', 'life sciences'],
        'Media & Entertainment': ['media', 'entertainment', 'film', 'music', 'publishing', 'journalism', 'broadcasting', 'streaming', 'content creation'],
        'Real Estate': ['real estate', 'realty', 'property', 'cre', 'reit', 'construction', 'development'],
        'Consulting / Advisory': ['consulting', 'consultant', 'advisory', 'strategy'],
        'Consumer Goods & Retail': ['retail', 'consumer goods', 'cpg', 'ecommerce', 'merchandise', 'fashion'],
        'Government & Nonprofit': ['government', 'nonprofit', 'ngo', 'public sector', 'policy', 'advocacy'],
        'Sports & Athletics': ['sports', 'athletics', 'nfl', 'nba', 'mlb', 'nhl', 'mlb', 'league'],
        'Logistics & Supply Chain': ['logistics', 'supply chain', 'operations', 'procurement', 'fulfillment'],
        'Energy & Utilities': ['energy', 'oil', 'gas', 'utilities', 'renewable', 'solar', 'wind'],
        'Education': ['education', 'edtech', 'teaching', 'university', 'school', 'curriculum'],
      };

      const FUNCTION_TO_KEYWORDS = {
        'Marketing & Brand': ['marketing', 'brand', 'advertising', 'social media', 'social', 'pr', 'public relations', 'digital marketing', 'media buyer', 'growth', 'content', 'creative', 'communications'],
        'Finance & Accounting': ['finance', 'accounting', 'cfo', 'controller', 'audit', 'tax', 'investment banking', 'investment bank', 'ib', 'm&a', 'mergers', 'acquisitions', 'private equity', 'pe', 'hedge fund', 'asset management', 'capital markets', 'equity research', 'corporate finance', 'goldman', 'jpmorgan', 'morgan stanley', 'bank of america', 'citi', 'financial analyst', 'treasurer'],
        'Software Engineering': ['software engineer', 'developer', 'engineering', 'programmer', 'backend', 'frontend', 'fullstack', 'devops', 'swe'],
        'Product Management': ['product manager', 'product management', 'pm', 'product lead'],
        'Sales & Business Development': ['sales', 'business development', 'bdr', 'sdr', 'account executive', 'ae', 'revenue'],
        'Operations & Strategy': ['operations', 'strategy', 'ops', 'chief of staff', 'biz ops', 'strategic'],
        'Data & Analytics': ['data', 'analytics', 'analyst', 'bi', 'business intelligence', 'data science', 'sql'],
        'Human Resources': ['hr', 'human resources', 'recruiting', 'talent', 'people ops'],
        'Consulting / Advisory': ['consulting', 'consultant', 'advisory', 'management consulting', 'strategy consulting'],
        'Supply Chain & Logistics': ['supply chain', 'logistics', 'procurement', 'operations', 'fulfillment'],
        'Healthcare / Clinical': ['healthcare', 'clinical', 'medical', 'nursing', 'physician', 'pharma'],
        'Legal & Compliance': ['legal', 'compliance', 'attorney', 'counsel', 'law', 'regulatory'],
      };

      const scoreMatch = (member) => {
        let score = 0;
        let industryScore = 0;
        const text = [member.industry, member.company, member.job_title, member.bio, member.ways_to_help?.join(' '), member.expertise_areas?.join(' '), member.mentorship_topics?.join(' ')].filter(Boolean).join(' ').toLowerCase();

        // Industry keyword matching (Tier 1 signal)
        industries.forEach(ind => {
          const keywords = INDUSTRY_TO_KEYWORDS[ind] || [ind.toLowerCase()];
          const matched = keywords.some(kw => text.includes(kw));
          if (matched) { score += 4; industryScore += 4; }
          else if (ind && text.includes(ind.toLowerCase())) { score += 4; industryScore += 4; }
        });

        // Target function keyword matching
        const targetFunctions = user?.career_goals?.target_functions || [];
        targetFunctions.forEach(fn => {
          const keywords = FUNCTION_TO_KEYWORDS[fn] || [fn.toLowerCase()];
          if (keywords.some(kw => text.includes(kw))) score += 3;
        });

        // Target role keyword matching
        roles.forEach(role => { if (role && text.includes(role.toLowerCase())) score += 2; });

        if (member.persona === 'parent' || member.roles?.includes('parent')) score += 1;
        if (member.company) score += 1;
        if (member.industry) score += 1;
        if (member.ways_to_help?.length > 0) score += 1;
        if (member.updated_date) {
          const daysSince = (Date.now() - new Date(member.updated_date).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < 30) score += 1;
        }
        member._industryScore = industryScore;
        return score;
      };

      // Score all qualified members
      const scoredMembers = sameSchool
        .filter(hasUsefulProfile)
        .map(m => { m._score = scoreMatch(m); return m; })
        .filter(m => m._score > 0); // remove score 0

      // Tier 1 (score >= 3) + Tier 2 (score === 2)
      let tier12 = scoredMembers.filter(m => m._score >= 2).sort((a, b) => b._score - a._score);

      // Tier 3 fallback: only members with explicit industry keyword match
      let finalLeads = tier12;
      if (tier12.length === 0) {
        finalLeads = scoredMembers
          .filter(m => (m._industryScore || 0) > 0)
          .sort((a, b) => b._score - a._score);
      }

      const top20 = finalLeads.slice(0, 20);
      console.log('[RedHot] After quality filter — tier12:', tier12.length, 'final:', finalLeads.length);
      setRedHotLeads(top20);
      setRedHotTotal(finalLeads.length);

      // Background enrichment — don't block UI
      const enrichInBackground = async (leads) => {
        const toEnrich = leads.filter(l => l.linkedin_url?.trim() && !l.enriched_at).slice(0, 10);
        if (toEnrich.length === 0) return;
        console.log(`[Enrichment] Enriching ${toEnrich.length} leads in background`);
        for (const lead of toEnrich) {
          try {
            const result = await base44.functions.invoke('enrichRedHotLead', { userId: lead.id, linkedinUrl: lead.linkedin_url });
            if (result?.data?.success || result?.success) {
              const data = result?.data?.data || result?.data;
              setRedHotLeads(prev => prev.map(l => l.id === lead.id ? { ...l, ...data, enriched: true } : l));
            }
            await new Promise(r => setTimeout(r, 600));
          } catch (err) {
            console.error(`[Enrichment] Failed for ${lead.id}:`, err);
          }
        }
        console.log('[Enrichment] Background enrichment complete');
      };
      enrichInBackground(top20);

    } catch (err) {
      console.error('[RedHot] CAUGHT ERROR:', err.message, err.stack);
      setRedHotLeads([]);
      setRedHotTotal(0);
    } finally {
      setRedHotLoading(false);
    }
  };

  // ── Warm Leads: still use getLeadsForStudent ──
  const fetchWarmLeads = async () => {
    setWarmLoading(true);
    try {
      const response = await base44.functions.invoke('getLeadsForStudent', { student_id: user?.id });
      const result = response?.data || response;
      if (result?.error) { console.error('Warm leads error:', result.error); return; }
      setWarmLeads(result?.warmLeads || []);
      setExploreChips(result?.exploreChips || []);
      setWarmSearchType(result?.warmSearchType || 'company_based');
      if (result?.targetDesc) setTargetDesc(result.targetDesc);
    } catch (e) {
      console.error('Warm leads fetch failed:', e);
    } finally {
      setWarmLoading(false);
    }
  };

  useEffect(() => {
    fetchRedHotLeads();
    fetchWarmLeads();
  }, [user?.id]);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  const handleAlumniSearch = async () => {
    if (!alumniQuery.trim()) return;

    // If free user already used their search, show gate immediately
    if (!isFastIQ && user?.alumni_search_used) {
      setShowAlumniGate(true);
      return;
    }

    setAlumniSearching(true);
    setAlumniSearched(false);
    setShowAlumniGate(false);
    try {
      const res = await base44.functions.invoke('exaService', {
        action: 'searchAlumni',
        query: alumniQuery,
        universityName: studentSchool || 'University of Florida',
        maxResults: 5,
      });
      setAlumniResults(res?.profiles || []);

      // Mark free search as used after first successful search
      if (!isFastIQ && !user?.alumni_search_used) {
        base44.auth.updateMe({ alumni_search_used: true }).catch(() => {});
      }
    } catch (e) {
      setAlumniResults([]);
    } finally {
      setAlumniSearching(false);
      setAlumniSearched(true);
    }
  };

  const generateOutreachDraft = async (alum) => {
    try {
      const res = await base44.functions.invoke('generateOutreachDraft', {
        studentName: user?.full_name || 'Student',
        major: user?.major || user?.career_goals?.major || '',
        targetRole: (user?.career_goals?.target_roles || [])[0] || alum.headline || '',
        graduationYear: user?.career_goals?.graduation_year || '',
        alumniName: alum.full_name,
        alumniTitle: alum.headline,
        alumniCompany: alum.company || '',
      });
      return res?.data?.message || res?.message || '';
    } catch { return ''; }
  };

  const handleConnect = async (alum) => {
    if (sentTo.includes(alum.linkedin_url)) return;
    setConnectLoading(alum.linkedin_url);
    try {
      const draft = await generateOutreachDraft(alum);
      setOutreachModal({ open: true, alum, draft, mode: 'linkedin' });
      setEditedDraft(draft);
    } finally {
      setConnectLoading(null);
    }
  };

  const handleSendLinkedIn = () => {
    if (!outreachModal) return;
    navigator.clipboard.writeText(editedDraft).then(() => { setCopyToast(true); setTimeout(() => setCopyToast(false), 3000); });
    window.open(outreachModal.alum.linkedin_url, '_blank');
    setSentTo(prev => [...prev, outreachModal.alum.linkedin_url]);
    setOutreachModal(null);
  };

  const isSaved = (id) => savedLeads.some(l => l.id === String(id));
  const isRoleBased = warmSearchType === 'role_based' || warmLeads.some(w => w.type === 'role_based');
  const verifiedWarmLeads = isRoleBased
    ? warmLeads.filter(r => r.total_count > 0 && r.confidence === 'verified')
    : warmLeads.filter(r => r.alumni_count && r.confidence === 'verified');
  const verifiedTotal = isRoleBased
    ? verifiedWarmLeads.reduce((s, r) => s + (r.total_count || 0), 0)
    : verifiedWarmLeads.reduce((s, r) => s + (r.alumni_count || 0), 0);
  const maxAlumni = Math.max(...warmLeads.map(c => c.alumni_count || c.total_count || 0), 1);
  const memberLabel = redHotLeads.length === 1 ? 'member' : 'members';
  const selectedCardData = selectedChip ? warmLeads.find(w => w.company === selectedChip) : null;

  const INVALID_CHIP_VALUES = ['no dream company yet','not specified','not specified yet','not sure yet','not sure','unsure','tbd','n/a','none','none yet',''];
  const validExploreChips = (exploreChips || []).filter(c => c && !INVALID_CHIP_VALUES.includes(c.toLowerCase().trim()));

  if (redHotLoading && warmLoading) {
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
        {redHotLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
            <div style={{ width: 20, height: 20, border: '2px solid #DC2626', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lsSpin 0.8s linear infinite' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0, color: '#888' }}>Scanning {university} CFF members...</p>
          </div>
        ) : redHotLeads.length > 0 ? (
          <>
            {(() => {
              const careerGoals = user?.career_goals || {};
              const targetIndustries = careerGoals.target_industries || [];
              const targetRoles = careerGoals.target_roles || [];
              const hasGoals = targetIndustries.length > 0 || targetRoles.length > 0;
              const hasOnlyLowQualityLeads = hasGoals && redHotLeads.every(m => {
                const text = [m.industry, m.job_title, m.company, m.bio].filter(Boolean).join(' ').toLowerCase();
                return !targetIndustries.some(i => text.includes(i.toLowerCase())) &&
                       !targetRoles.some(r => text.includes(r.toLowerCase()));
              });
              return hasOnlyLowQualityLeads ? (
                <div style={{ fontSize: 12, color: '#888', padding: '8px 12px', background: '#FAFAFA', borderRadius: 8, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                  These members haven't listed their industry yet — matches will improve as profiles are completed.
                </div>
              ) : null;
            })()}
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {redHotLeads.map(member => {
              const WAYS_TO_HELP_LABELS = {
                'career_advice': '💬 Career Advice',
                'introductions': '🤝 Introductions',
                'resume_interviews': '📄 Resume & Interviews',
                'resume_review': '📄 Resume Review',
                'mock_interviews': '🎤 Mock Interviews',
                'industry_insights': '💡 Industry Insights',
                'mentorship': '⭐ Mentorship',
                'jobs_referrals': '✉️ Can Refer You',
                'networking': '🌐 Networking',
                'career_guidance': '🧭 Career Guidance',
                'grad_school': '🎓 Grad School Advice',
                'salary_negotiation': '💰 Salary Negotiation',
                'interview_prep': '🎯 Interview Prep',
              };

              const getIntroSignal = (m) => {
                const w = (m.intro_willingness || m.intro_availability || '').toLowerCase();
                if (w === 'happy_to_help' || w === 'yes') return { label: '✓ Open to intro requests', color: '#22C55E', bg: '#F0FDF4', border: '#86EFAC' };
                if (w === 'occasionally') return { label: '◎ Available occasionally', color: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D' };
                return { label: '✓ In the CFF network', color: '#22C55E', bg: '#F0FDF4', border: '#86EFAC' };
              };

              const getPersonaLabel = (m) => {
                if (m.persona === 'parent' || m.roles?.includes('parent')) return '👨‍👩‍👧 CFF Parent';
                if (m.persona === 'alumni' || m.roles?.includes('alumni')) return '🎓 CFF Alumni';
                return '✓ CFF Member';
              };

              const getOutreachSuggestion = (m) => {
                const helps = m.ways_to_help || [];
                if (helps.includes('jobs_referrals')) return 'Ask about open roles at their company';
                if (helps.includes('mock_interviews')) return 'Ask if they\'d do a mock interview';
                if (helps.includes('introductions')) return 'Ask for an intro to someone in your field';
                if (helps.includes('salary_negotiation')) return 'Ask about salary expectations in their field';
                if (helps.includes('industry_insights')) return 'Ask about breaking into their industry';
                if (helps.includes('resume_interviews') || helps.includes('resume_review')) return 'Ask them to review your resume';
                if (helps.includes('mentorship')) return 'Ask if they\'d be open to a mentorship conversation';
                if (helps.includes('career_advice') || helps.includes('career_guidance')) return 'Ask for 15 minutes of career advice';
                return 'Introduce yourself and ask for advice';
              };

              const displayName = (() => {
                const name = member.full_name || member.name || '';
                if (!name) return 'CFF Member';
                if (!name.includes(' ') && name === name.toLowerCase()) return 'CFF Member';
                if (name.includes('@')) return 'CFF Member';
                return name;
              })();

              const initials = displayName.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const displayCompany = member.company || member.current_company || null;
              const displayIndustry = member.industry || null;
              const displayLocation = [member.location_city, member.location_state || member.state].filter(Boolean).join(', ') || 'Florida';
              const helpTags = (member.ways_to_help || []).filter(w => WAYS_TO_HELP_LABELS[w]).slice(0, 3).map(w => WAYS_TO_HELP_LABELS[w]);
              const introSignal = getIntroSignal(member);
              const personaLabel = getPersonaLabel(member);
              const outreachTip = getOutreachSuggestion(member);
              const isHighMatch = (member._score || 0) > 5;
              const canRefer = member.can_provide_referrals === true;

              return (
                <div key={member.id} style={{ background: 'white', border: isHighMatch ? '1.5px solid #E85D20' : '1px solid #f0f0f0', borderRadius: '12px', padding: '16px', boxShadow: isHighMatch ? '0 4px 16px rgba(232,93,32,0.08)' : '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E85D20', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: '600', fontSize: '15px', color: '#0d1117' }}>{displayName}</span>
                        <span style={{ background: '#F0FDF4', color: '#22C55E', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', fontFamily: "'DM Sans', sans-serif", border: '1px solid #86EFAC' }}>✓ CFF</span>
                        {canRefer && <span style={{ background: '#FFF5F0', color: '#E85D20', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', fontFamily: "'DM Sans', sans-serif", border: '1px solid #fdd5c0' }}>✉️ Can Refer</span>}
                      </div>
                      {displayCompany && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#555', margin: '2px 0 0 0' }}>{displayCompany}</p>}
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#999', margin: '2px 0 0 0' }}>{personaLabel}</p>
                    </div>
                  </div>

                  {/* Intro availability signal */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: introSignal.bg, color: introSignal.color, border: `1px solid ${introSignal.border}`, borderRadius: '100px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", width: 'fit-content' }}>{introSignal.label}</div>

                  {/* Ways to help chips */}
                  {helpTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {helpTags.map((tag, i) => <span key={i} style={{ background: '#FFF5F0', border: '1px solid #fdd5c0', color: '#E85D20', fontSize: '11px', fontWeight: '500', padding: '4px 10px', borderRadius: '100px', fontFamily: "'DM Sans', sans-serif" }}>{tag}</span>)}
                    </div>
                  )}

                  {/* Location + industry */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888' }}>📍 {displayLocation}</span>
                    {displayIndustry && <span style={{ background: '#f5f5f5', color: '#555', fontSize: '11px', padding: '3px 10px', borderRadius: '100px', fontFamily: "'DM Sans', sans-serif" }}>{displayIndustry}</span>}
                  </div>

                  {/* Outreach suggestion */}
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#888', fontStyle: 'italic', margin: '0', paddingTop: '8px', borderTop: '1px solid #f5f5f5' }}>💡 What to ask: {outreachTip}</p>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <button onClick={() => onContact({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company: displayCompany, email: member.email })} style={{ background: '#E85D20', color: 'white', border: 'none', borderRadius: '100px', padding: '9px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: '600', fontSize: '13px', cursor: 'pointer', flex: 1, minHeight: 'auto' }}>Contact Now →</button>
                    <button onClick={() => onSaveLead({ id: member.id, source: 'cff_database', name: member.full_name, title: member.job_title, company: displayCompany, email: member.email })} style={{ background: 'white', color: '#555', border: '1px solid #e0e0e0', borderRadius: '100px', padding: '9px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', cursor: 'pointer', minHeight: 'auto' }}>🔖 Save</button>
                    {member.linkedin_url && member.linkedin_url.trim() !== '' && <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', background: '#0077B5', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', textDecoration: 'none', flexShrink: 0 }}>in</a>}
                  </div>

                </div>
              );
            })}
          </div>
          </>  
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '32px 24px', textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
              No {user?.career_goals?.target_industries?.[0] || 'relevant'} professionals in CFF yet
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 8px', lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              The network is growing. When a {user?.career_goals?.target_industries?.[0] || 'parent'} professional joins from your school, they'll appear here automatically.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              In the meantime, check your Warm Leads — they have {university} alumni at companies hiring in your field right now.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#warm-leads" style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>See Warm Leads →</a>
              <button onClick={handleInviteParent} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 20px', fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>
                {copySuccess ? 'Link copied! ✓' : 'Invite a parent →'}
              </button>
            </div>
          </div>
        )}
        {/* Always-visible invite strip */}
        <div style={{ marginTop: redHotLeads.length > 0 ? 32 : 0, padding: '20px 24px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#1A1A1A', margin: '0 0 4px' }}>
              Know a parent who works in {user?.career_goals?.target_industries?.[0] || 'your field'}?
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5 }}>
              Invite them to CFF — when they join, they'll show up in your leads.
            </p>
          </div>
          <button onClick={handleInviteParent} style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 500, color: '#E85D20', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto' }}>
            {copySuccess ? 'Link copied! ✓' : 'Share invite link →'}
          </button>
        </div>
      </section>

      {copySuccess && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#1A1A1A', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
          ✓ Invite link copied — send it to your parent via text or email
        </div>
      )}

      {/* ── Find a Specific Alumni ── */}
      <section style={{ marginTop: 40, marginBottom: 40 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>🔍 FIND A SPECIFIC ALUMNI</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Search by role, company, or industry</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 16px' }}>Natural language · {studentSchool || 'UF'} alumni only · Powered by Exa</p>

        {/* Always show search bar — free users get 1 free search */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={alumniQuery}
              onChange={e => setAlumniQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAlumniSearch()}
              placeholder='Try: "investment banker at Goldman" or "UF grad in marketing at Nike"'
              style={{ flex: 1, fontSize: 13, padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, background: '#fff', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
            />
            <button
              onClick={handleAlumniSearch}
              disabled={alumniSearching || !alumniQuery.trim()}
              style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: alumniSearching || !alumniQuery.trim() ? 'not-allowed' : 'pointer', opacity: alumniSearching || !alumniQuery.trim() ? 0.7 : 1, whiteSpace: 'nowrap', minHeight: 'auto' }}
            >
              {alumniSearching ? 'Searching...' : 'Search →'}
            </button>
          </div>

          {/* Free search entitlement label */}
          {!isFastIQ && !user?.alumni_search_used && !alumniSearched && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', fontWeight: 500, margin: '0 0 12px' }}>
              ✓ You have 1 free alumni search — make it count
            </p>
          )}
          {!isFastIQ && user?.alumni_search_used && !alumniSearched && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '0 0 12px' }}>
              You've used your free search.{' '}
              <span onClick={() => onUnlockFastIQ?.()} style={{ color: '#E85D20', cursor: 'pointer', fontWeight: 500 }}>
                Unlock FastIQ for unlimited searches →
              </span>
            </p>
          )}

          {!alumniSearched && !showAlumniGate && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['VP of Marketing at Fortune 500', 'investment banking at bulge bracket firms', 'started their own company in tech', 'sports management or athletics', 'consulting at McKinsey, Bain, or BCG', 'hospitals or health systems in Miami'].map(ex => (
                <button key={ex} onClick={() => { setAlumniQuery(ex); setTimeout(handleAlumniSearch, 100); }}
                  style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#666', cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* Already used gate — show before search runs */}
          {showAlumniGate && (
            <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#1A1A1A', margin: '0 0 8px' }}>You've used your free search.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '0 0 16px', lineHeight: 1.5 }}>Unlock FastIQ to search unlimited {studentSchool || 'UF'} alumni by role, company, or industry.</p>
              <button onClick={() => onUnlockFastIQ?.()} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer', minHeight: 'auto' }}>
                Unlock FastIQ →
              </button>
            </div>
          )}
        </div>
      </section>

      {copyToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#1A1A1A', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
          ✓ Message copied — paste it into your LinkedIn connection request
        </div>
      )}

      <style>{`
        @keyframes lsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}