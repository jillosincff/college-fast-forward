import React from 'react';
import { navigate } from '@/components/utils/navigation';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const VIOLET = '#7c3aed';
const TEAL = '#06b6d4';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const BG = '#f8f9ff';
const CARD = '#ffffff';
const R = 16;
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';

const SEEKING_LABELS = {
  internship: { emoji: '🎓', label: 'Internship', sub: 'This semester or summer' },
  fulltime: { emoji: '💼', label: 'Full-time job', sub: 'After graduation' },
  both: { emoji: '🎯', label: 'Both internships & full-time', sub: 'Keeping options open' },
  exploring: { emoji: '🔭', label: 'Just exploring', sub: 'Not sure yet' },
};

const BLOCKER_LABELS = {
  resume: { icon: '📄', label: "Resume isn't getting responses" },
  ghosted: { icon: '👻', label: 'Getting ghosted after applying' },
  no_direction: { icon: '🧩', label: 'Not sure what I want to do yet' },
  which_jobs: { icon: '🔍', label: "Don't know which jobs to apply for" },
  outreach: { icon: '🤝', label: "Don't know how to reach the right people" },
  disorganized: { icon: '📁', label: 'Disorganized and losing track' },
  interviews: { icon: '🎤', label: 'Interviewing makes me nervous' },
};

function getInitials(user) {
  const name = user?.full_name || user?.first_name || user?.email?.split('@')[0] || 'U';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}

function formatName(user) {
  if (user?.first_name) return user.first_name;
  if (user?.full_name) {
    if (user.full_name.includes(',')) return user.full_name.split(',').map(s => s.trim()).reverse().join(' ');
    return user.full_name;
  }
  return user?.email?.split('@')[0] || 'User';
}

function frustrationLabel(level) {
  const n = Number(level) || 0;
  if (n <= 2) return { emoji: '😌', text: 'Calm and in control', color: TEAL };
  if (n <= 4) return { emoji: '😐', text: 'Feeling the pressure', color: '#F59E0B' };
  if (n <= 6) return { emoji: '😟', text: 'In the danger zone', color: '#F59E0B' };
  if (n <= 8) return { emoji: '😰', text: 'Exhausted by the search', color: '#EF4444' };
  return { emoji: '🆘', text: 'At breaking point', color: '#EF4444' };
}

export default function ProfileCard({ user, parentCompany, onboardingData, isMyProfile }) {
  const displayName = formatName(user);
  const initials = getInitials(user);
  const school = user?.school_name || user?.school || user?.university || onboardingData?.college || '';

  const seeking = onboardingData?.seeking || '';
  const seekingInfo = SEEKING_LABELS[seeking] || null;
  const frustration = onboardingData?.frustration || user?.frustration_level;
  const frustInfo = frustration ? frustrationLabel(frustration) : null;
  const industries = onboardingData?.industries || user?.industries_interested || [];
  const blockers = onboardingData?.blockers || user?.career_blockers || [];
  const locationPref = onboardingData?.locationPref || user?.location_preference || '';
  const locationCity = onboardingData?.locationCity || user?.location_city || '';
  const targetRoles = onboardingData?.targetRoles || user?.target_roles || [];

  const locationLabel = locationPref === 'remote' ? 'Remote' : locationPref === 'hybrid' ? 'Hybrid / Flexible' : locationCity || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Hero Card ── */}
      <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, overflow: 'hidden' }}>
        {/* Cover */}
        <div style={{ height: 80, background: GRAD_INDIGO, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.15), transparent 60%)', pointerEvents: 'none' }} />
        </div>

        {/* Profile info */}
        <div style={{ padding: '0 24px 24px', marginTop: -32, position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: GRAD_INDIGO,
            border: '3px solid #ffffff', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
            boxShadow: '0 4px 12px rgba(109,40,217,0.25)',
          }}>
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt={displayName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: '#fff' }}>{initials}</span>
            )}
          </div>

          {/* Name + school */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: TEXT, letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.2 }}>{displayName}</h1>
              {school && <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>{school}</p>}
              {user?.email && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '4px 0 0' }}>{user.email}</p>
              )}
            </div>
            {isMyProfile && (
              <button onClick={() => navigate('ProfileEdit')} style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#fff',
                background: GRAD_INDIGO, border: 'none', borderRadius: 8,
                padding: '9px 18px', cursor: 'pointer', minHeight: 'auto',
                boxShadow: '0 4px 12px rgba(109,40,217,0.2)',
              }}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Career Coordinates Card ── */}
      <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px' }}>
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 16 }}>
          Career Coordinates
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Seeking */}
          {seekingInfo && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Focus</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{seekingInfo.emoji}</span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>{seekingInfo.label}</span>
              </div>
            </div>
          )}

          {/* Location */}
          {locationLabel && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Target Location</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{locationPref === 'remote' ? '🌐' : locationPref === 'hybrid' ? '🔀' : '📍'}</span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>{locationLabel}</span>
              </div>
            </div>
          )}

          {/* Parent company */}
          {parentCompany && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Parent Connection</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🏢</span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>{parentCompany}</span>
              </div>
            </div>
          )}

          {/* Major (if available) */}
          {user?.major && (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Major</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎓</span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT }}>{user.major}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Frustration Level Card ── */}
      {frustInfo && (
        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px', border: `1px solid ${INDIGO_BORDER}` }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 16 }}>
            Frustration Level
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>{frustInfo.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: frustInfo.color }}>{frustration}</span>
                <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT3 }}>/10</span>
              </div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>{frustInfo.text}</p>
            </div>
          </div>
          {/* Mini progress bar */}
          <div style={{ marginTop: 14, height: 6, background: '#E2E8F0', borderRadius: 100 }}>
            <div style={{ height: '100%', width: `${((Number(frustration) || 1) / 10) * 100}%`, background: frustInfo.color, borderRadius: 100, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* ── Industries Card ── */}
      {industries.length > 0 && (
        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px' }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 12 }}>
            Industries of Interest
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {industries.map((ind, i) => (
              <span key={i} style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 600, color: INDIGO,
                background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`,
                borderRadius: 100, padding: '6px 14px',
              }}>
                {typeof ind === 'string' ? ind.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ind}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Target Roles Card ── */}
      {targetRoles.length > 0 && (
        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px' }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 12 }}>
            Target Roles
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {targetRoles.map((role, i) => (
              <span key={i} style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#0891b2',
                background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`,
                borderRadius: 100, padding: '6px 14px',
              }}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Blockers Card ── */}
      {blockers.length > 0 && (
        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px' }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 12 }}>
            Your Roadblocks
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {blockers.map((key, i) => {
              const b = BLOCKER_LABELS[key] || (typeof key === 'string' ? { icon: '•', label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) } : { icon: '•', label: String(key) });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TEAL_LIGHT, borderRadius: 8, border: `1px solid ${TEAL_BORDER}`, flexShrink: 0 }}>
                    {b.icon}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT, fontWeight: 500 }}>{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@media(max-width:600px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}