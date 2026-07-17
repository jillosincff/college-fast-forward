import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import AvoidingPreferencesStrip from './AvoidingPreferencesStrip';

export default function EditGoalsModal({ goals, user, onClose, onSave, onStartFresh, openedFromNudge = false }) {
  const queryClient = useQueryClient();
  // Use goals prop if provided, otherwise fall back to user.career_goals
  const effectiveGoals = goals || user?.career_goals;
  const [roles, setRoles] = useState(effectiveGoals?.target_roles || []);
  const [industries, setIndustries] = useState(effectiveGoals?.target_industries || []);
  const [companySize, setCompanySize] = useState(effectiveGoals?.company_size_preference || 'all');
  const [seeking, setSeeking] = useState(effectiveGoals?.seeking || 'both');
  const [location, setLocation] = useState(user?.location || '');
  const [roleInput, setRoleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const COMPANY_SIZE_OPTS = [
    { key: 'startup', emoji: '🚀', label: 'Startup', sub: '1–50 team' },
    { key: 'midmarket', emoji: '📈', label: 'Mid-Sized', sub: '51–500 team' },
    { key: 'enterprise', emoji: '🏢', label: 'Enterprise', sub: '500+ team' },
    { key: 'all', emoji: '💼', label: 'Open to All', sub: 'No preference' },
  ];

  const handleAddRole = (role) => {
    if (role.trim() && !roles.includes(role.trim())) {
      setRoles([...roles, role.trim()]);
      setRoleInput('');
    }
  };

  const handleAddIndustry = (ind) => {
    if (ind.trim() && !industries.includes(ind.trim())) {
      setIndustries([...industries, ind.trim()]);
      setIndustryInput('');
    }
  };

  const handleSave = async () => {
    // Auto-add any text in the input fields before saving
    let finalRoles = [...roles];
    let finalIndustries = [...industries];
    
    if (roleInput.trim() && !finalRoles.includes(roleInput.trim())) {
      finalRoles.push(roleInput.trim());
    }
    if (industryInput.trim() && !finalIndustries.includes(industryInput.trim())) {
      finalIndustries.push(industryInput.trim());
    }
    
    if (finalRoles.length === 0 && finalIndustries.length === 0) {
      setError('Please add at least one role or industry.');
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({
        location: location.trim() || undefined,
        career_goals: {
          ...effectiveGoals,
          target_roles: finalRoles,
          target_industries: finalIndustries,
          company_size_preference: companySize,
          seeking,
          location_preference: location.trim() || undefined,
          saved_at: new Date().toISOString()
        }
      });
      // Refresh user data so the dashboard shows updated goals
      const refreshedUser = await base44.auth.me();
      // Delete cached daily drop so a fresh one is generated with new goals
      await base44.functions.invoke('refreshDailyDrop', {}).catch(() => {});
      // Regenerate action plan with new goals (fire-and-forget)
      base44.functions.invoke('generateActionPlan', { force: true }).catch(() => {});
      // Dispatch event to tell feeds to refetch immediately
      window.dispatchEvent(new CustomEvent('cff:refresh-daily-drop', { detail: { force_refresh: true } }));
      window.dispatchEvent(new CustomEvent('cff:goals-updated'));
      // Invalidate ALL career-goal-dependent React Query caches
      queryClient.removeQueries({ queryKey: ['dailyDrop', refreshedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['organizedFeeds'] });
      queryClient.invalidateQueries({ queryKey: ['personalizedNetworkCarousel'] });
      queryClient.invalidateQueries({ queryKey: ['dualConstraintLeads'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onSave({ target_roles: finalRoles, target_industries: finalIndustries, company_size_preference: companySize }, refreshedUser);
    } catch (e) {
      console.error('Save failed:', e);
      setError('Failed to save. Try again.');
    }
    setSaving(false);
  };

  const currentRoles = effectiveGoals?.target_roles || [];
  const currentIndustries = effectiveGoals?.target_industries || [];
  const rolesChanged = JSON.stringify(roles.sort()) !== JSON.stringify(currentRoles.sort());
  const industriesChanged = JSON.stringify(industries.sort()) !== JSON.stringify(currentIndustries.sort());

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 16px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>✏️ Edit Your Career Goals</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#888' }}>×</button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 28px' }}>
          {/* Current snapshot banner */}
          {currentRoles.length > 0 || currentIndustries.length > 0 ? (
            <div style={{ background: '#F8F9FF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.07em', margin: '0 0 8px', textTransform: 'uppercase' }}>📋 Currently Saved</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {currentRoles.map(r => (
                  <span key={r} style={{ background: '#FFF5F0', border: '1px solid #FBBF7A', color: '#92400E', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{r}</span>
                ))}
                {currentIndustries.map(i => (
                  <span key={i} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{i}</span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Negative preferences CLIFF remembers (e.g. "no sales") — read-only here */}
          <AvoidingPreferencesStrip userEmail={user?.email} />

          {error && <div style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {/* Seeking: internship vs full-time — controls which job types appear in the feed */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>I'M LOOKING FOR</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { key: 'internship', emoji: '🎓', label: 'Internships' },
                { key: 'fulltime', emoji: '💼', label: 'Full-time' },
                { key: 'both', emoji: '🎯', label: 'Both' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSeeking(opt.key)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 10, border: `1.5px solid ${seeking === opt.key ? '#6d28d9' : '#E0E0E0'}`, background: seeking === opt.key ? '#F5F3FF' : '#fff', cursor: 'pointer', minHeight: 'auto' }}
                >
                  <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: seeking === opt.key ? 700 : 500, color: seeking === opt.key ? '#6d28d9' : '#1A1A1A' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Roles */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>
              TARGET ROLES
              {rolesChanged && currentRoles.length > 0 && (
                <span style={{ display: 'block', marginTop: 4, fontWeight: 500, color: '#E85D20', fontSize: 11 }}>
                  ← Was: {currentRoles.join(', ')}
                </span>
              )}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {roles.map(r => (
                <span key={r} style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', padding: '6px 12px', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {r}
                  <button onClick={() => setRoles(roles.filter(x => x !== r))} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#E85D20', fontSize: 16, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={roleInput}
              onChange={e => setRoleInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(roleInput); } }}
              placeholder="Add a role and press Enter..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Company Size */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>COMPANY SIZE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {COMPANY_SIZE_OPTS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setCompanySize(opt.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${companySize === opt.key ? '#E85D20' : '#E0E0E0'}`, background: companySize === opt.key ? '#FFF5F0' : '#fff', cursor: 'pointer', minHeight: 'auto', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: companySize === opt.key ? 700 : 500, color: companySize === opt.key ? '#E85D20' : '#1A1A1A', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0 }}>{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>
              INDUSTRIES
              {industriesChanged && currentIndustries.length > 0 && (
                <span style={{ display: 'block', marginTop: 4, fontWeight: 500, color: '#4F8CFF', fontSize: 11 }}>
                  ← Was: {currentIndustries.join(', ')}
                </span>
              )}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {industries.map(i => (
                <span key={i} style={{ background: '#F0F5FF', border: '1px solid #4F8CFF', color: '#4F8CFF', padding: '6px 12px', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i}
                  <button onClick={() => setIndustries(industries.filter(x => x !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#4F8CFF', fontSize: 16, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={industryInput}
              onChange={e => setIndustryInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddIndustry(industryInput); } }}
              placeholder="Add an industry and press Enter..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>📍 PREFERRED LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. New York, NY · Remote · Open to Relocation"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', minHeight: 'auto', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes →'}
            </button>
            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid #E0E0E0', color: '#666', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}