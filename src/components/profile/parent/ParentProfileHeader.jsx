import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

function getInitials(user) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'U';
  const cleaned = name.includes(',') ? name.split(',').reverse().map(s => s.trim()).join(' ') : name;
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}

function formatName(user) {
  const full = user?.full_name || '';
  if (full.includes(',')) return full.split(',').map(s => s.trim()).reverse().join(' ');
  return full || user?.email?.split('@')[0] || 'User';
}

function formatIndustry(s) {
  if (!s) return s;
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function completionScore(user) {
  let score = 0;
  let total = 6;
  if (user?.full_name) score++;
  if (user?.current_company || user?.company) score++;
  if (user?.industry || user?.industries?.length) score++;
  if (user?.career_background) score++;
  if (user?.linkedin_url) score++;
  if (user?.bio) score++;
  return { score, total, pct: Math.round((score / total) * 100) };
}

function getNudge(user) {
  if (!user?.linkedin_url) return 'Add your LinkedIn URL — parents with LinkedIn get 3x more intro requests';
  if (!user?.bio) return 'Add a short bio — students want to know who they\'re reaching out to';
  if (!user?.current_company && !user?.company) return 'Add your company — this is your core value to the network';
  if (!user?.career_background) return 'Add your career background — students need context on your experience';
  return 'Your profile is complete ✓ — you\'re fully visible to the network';
}

const INTRO_LABELS = {
  yes: { label: 'Happy to help', color: '#4CAF50' },
  occasionally: { label: 'Occasionally available', color: '#F59E0B' },
  not_now: { label: 'Not right now', color: '#888' },
};

export default function ParentProfileHeader({ user }) {
  const { refreshUser } = useAuth();
  const [editingLinkedIn, setEditingLinkedIn] = useState(false);
  const [linkedInValue, setLinkedInValue] = useState(user?.linkedin_url || '');
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const saveLinkedIn = async () => {
    setSaving(true);
    await base44.auth.updateMe({ linkedin_url: linkedInValue.trim() });
    if (refreshUser) await refreshUser();
    setSaving(false);
    setEditingLinkedIn(false);
  };

  const saveBio = async () => {
    setSaving(true);
    await base44.auth.updateMe({ bio: bioValue.trim() });
    if (refreshUser) await refreshUser();
    setSaving(false);
    setEditingBio(false);
  };

  const name = formatName(user);
  const initials = getInitials(user);
  const company = user?.current_company || user?.company || '';
  const school = user?.school_name || user?.school || user?.university || '';
  const industry = user?.industry || (user?.industries?.length ? user.industries[0] : '');
  const careerBackground = user?.career_background || '';
  const introWillingness = user?.intro_willingness || 'yes';
  const introInfo = INTRO_LABELS[introWillingness] || INTRO_LABELS.yes;
  const { pct } = completionScore(user);
  const nudge = getNudge(user);
  const isComplete = pct === 100;

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
      {/* Banner */}
      <div style={{ height: 60, background: 'linear-gradient(135deg, #111 0%, #0d1117 100%)', position: 'relative', borderRadius: '12px 12px 0 0' }}>
        <button onClick={() => navigate('ParentProfileEdit')} style={{
          position: 'absolute', top: 16, right: 16,
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE,
          background: 'transparent', border: `1px solid ${ORANGE}`,
          borderRadius: 100, padding: '6px 18px', cursor: 'pointer', minHeight: 'auto',
        }}>Edit Profile</button>
      </div>

      <div style={{ padding: '0 16px 24px', marginTop: 24 }}>
         <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#fff', marginTop: 0, marginBottom: 4, lineHeight: 1.2 }}>{name}</h1>

         {/* Intro willingness badge */}
         <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
           <span style={{ width: 7, height: 7, borderRadius: '50%', background: introInfo.color, flexShrink: 0 }} />
           <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: introInfo.color }}>
             {introInfo.label} · Intro Availability
           </span>
         </div>

        {/* Two-column details */}
        <div className="pp-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 8 }}>
          {/* Left — Professional Info */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 14 }}>Professional Info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {company && (
                <InfoRow icon="🏢" label={company} />
              )}
              {careerBackground && (
                <InfoRow icon="💼" label={careerBackground} />
              )}
              {industry && (
                <InfoRow icon="🏷️" label={formatIndustry(industry)} />
              )}
              {!company && !careerBackground && !industry && (
                <InfoRow icon="🏢" label="No professional info yet" muted />
              )}
              <InfoRow icon="✉️" label={user?.email} />
              {editingLinkedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>🔗</span>
                  <input
                    value={linkedInValue}
                    onChange={e => setLinkedInValue(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    autoFocus
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.15)',
                      borderRadius: 8, padding: '6px 10px', fontFamily: dmSans, fontSize: 13, color: '#f4f0e8',
                      outline: 'none', minWidth: 0,
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') saveLinkedIn(); if (e.key === 'Escape') setEditingLinkedIn(false); }}
                  />
                  <button onClick={saveLinkedIn} disabled={saving} style={{ background: ORANGE, border: 'none', borderRadius: 6, padding: '5px 12px', fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.5 : 1 }}>Save</button>
                  <button onClick={() => setEditingLinkedIn(false)} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>Cancel</button>
                </div>
              ) : user?.linkedin_url ? (
                <InfoRow icon="🔗" label={<a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE, textDecoration: 'none', fontFamily: dmSans, fontSize: 13 }}>{user.linkedin_url.replace(/https?:\/\/(www\.)?/, '').slice(0, 40)}</a>} />
              ) : (
                <InfoRow icon="🔗" label={<button onClick={() => setEditingLinkedIn(true)} style={{ background: 'none', border: 'none', padding: 0, fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto' }}>Add LinkedIn →</button>} />
              )}
            </div>
          </div>

          {/* Right — About */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 14 }}>About</p>
            {editingBio ? (
              <div>
                <textarea
                  value={bioValue}
                  onChange={e => setBioValue(e.target.value)}
                  placeholder="Tell students a bit about your background..."
                  autoFocus
                  rows={4}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.15)',
                    borderRadius: 8, padding: '8px 12px', fontFamily: dmSans, fontSize: 13, color: '#f4f0e8',
                    outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveBio} disabled={saving} style={{ background: ORANGE, border: 'none', borderRadius: 6, padding: '5px 14px', fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.5 : 1 }}>Save</button>
                  <button onClick={() => setEditingBio(false)} style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>Cancel</button>
                </div>
              </div>
            ) : user?.bio ? (
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{user.bio}</p>
                <button onClick={() => { setBioValue(user.bio); setEditingBio(true); }} style={{ background: 'none', border: 'none', padding: 0, fontFamily: dmSans, fontSize: 12, color: ORANGE, cursor: 'pointer', minHeight: 'auto', marginTop: 8 }}>Edit bio</button>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#666', fontStyle: 'italic', margin: '0 0 8px' }}>No bio yet.</p>
                <button onClick={() => setEditingBio(true)} style={{ background: 'none', border: 'none', padding: 0, fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto' }}>Add a bio →</button>
              </div>
            )}
          </div>
        </div>

        {/* Student's School — separate section */}
        {school && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #2A2A2A' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 10 }}>Your Student's School</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🎓</span>
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>{school}</span>
            </div>
          </div>
        )}

        {/* Profile Completion */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, margin: 0 }}>Profile Strength</p>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: '#333', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: ORANGE, borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: isComplete ? '#4CAF50' : '#888', marginTop: 8 }}>{nudge}</p>
        </div>
      </div>

      <style>{`@media(max-width:640px){.pp-details-grid{grid-template-columns:1fr !important;gap:20px !important}}`}</style>
    </div>
  );
}

function InfoRow({ icon, label, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, color: muted ? '#555' : '#ccc' }}>{label}</span>
    </div>
  );
}