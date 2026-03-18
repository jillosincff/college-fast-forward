import React from 'react';
import { navigate } from '@/components/utils/navigation';

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

function completionScore(user) {
  let score = 0;
  let total = 5;
  if (user?.full_name) score++;
  if (user?.current_company || user?.company) score++;
  if (user?.industry || user?.industries?.length) score++;
  if (user?.linkedin_url) score++;
  if (user?.bio) score++;
  return { score, total, pct: Math.round((score / total) * 100) };
}

function getNudge(user) {
  if (!user?.linkedin_url) return 'Add your LinkedIn URL — parents with LinkedIn get 3x more intro requests';
  if (!user?.bio) return 'Add a short bio — students want to know who they\'re reaching out to';
  if (!user?.current_company && !user?.company) return 'Add your company — this is your core value to the network';
  return 'Your profile is complete ✓ — you\'re fully visible to the network';
}

export default function ParentProfileHeader({ user }) {
  const name = formatName(user);
  const initials = getInitials(user);
  const company = user?.current_company || user?.company || '';
  const industry = user?.industry || (user?.industries?.length ? user.industries[0] : '');
  const { pct } = completionScore(user);
  const nudge = getNudge(user);
  const isComplete = pct === 100;

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Banner */}
      <div style={{ height: 90, background: 'linear-gradient(135deg, #111 0%, #0d1117 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(232,93,32,0.08), transparent 70%)' }} />
        <button onClick={() => navigate('ProfileEdit')} style={{
          position: 'absolute', top: 16, right: 16,
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE,
          background: 'transparent', border: `1px solid ${ORANGE}`,
          borderRadius: 100, padding: '6px 18px', cursor: 'pointer', minHeight: 'auto',
        }}>Edit Profile</button>
      </div>

      <div style={{ padding: '0 24px 24px', marginTop: -36 }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#0d1117',
          border: `3px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#fff' }}>{initials}</span>
          )}
        </div>

        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#fff', marginTop: 12, marginBottom: 0, lineHeight: 1.2 }}>{name}</h1>

        {/* Two-column details */}
        <div className="pp-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 24 }}>
          {/* Left — Professional Info */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 14 }}>Professional Info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon="🏢" label={company || 'No company'} muted={!company} />
              <InfoRow icon="🏷️" label={industry ? industry.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'No industry'} muted={!industry} />
              <InfoRow icon="✉️" label={user?.email} />
              {user?.linkedin_url ? (
                <InfoRow icon="💼" label={<a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE, textDecoration: 'none', fontFamily: dmSans, fontSize: 13 }}>{user.linkedin_url.replace(/https?:\/\/(www\.)?/, '').slice(0, 40)}</a>} />
              ) : (
                <InfoRow icon="💼" label={<button onClick={() => navigate('ProfileEdit')} style={{ background: 'none', border: 'none', padding: 0, fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto' }}>Add LinkedIn →</button>} />
              )}
            </div>
          </div>

          {/* Right — About */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 14 }}>About</p>
            {user?.bio ? (
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{user.bio}</p>
            ) : (
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#666', fontStyle: 'italic', margin: '0 0 8px' }}>No bio yet.</p>
                <button onClick={() => navigate('ProfileEdit')} style={{ background: 'none', border: 'none', padding: 0, fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto' }}>Add a bio →</button>
              </div>
            )}
          </div>
        </div>

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