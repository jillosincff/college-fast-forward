import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import { archiveRemovedTargets } from '@/functions/archiveRemovedTargets';
import { INDUSTRIES, ROLE_TYPES, POSITION_TYPES, START_TIMELINES, JOB_SEARCH_TYPES, migrateIndustries, migrateRoles } from './constants';

export default function ProfileEditModal({ user, profile, onClose, onSaved }) {
  // Migrate legacy values on load
  const initialIndustries = useMemo(() => migrateIndustries(profile?.target_industry), [profile?.target_industry]);
  const initialRoles = useMemo(() => migrateRoles(profile?.target_role, profile?.target_industry), [profile?.target_role, profile?.target_industry]);

  const [industries, setIndustries] = useState(initialIndustries);
  const [roles, setRoles] = useState(initialRoles);
  const [companies, setCompanies] = useState(profile?.target_companies || []);
  const [companyInput, setCompanyInput] = useState('');
  const [jobSearchType, setJobSearchType] = useState(profile?.job_search_type || '');
  const [positionType, setPositionType] = useState(profile?.position_type || '');
  const [startTimeline, setStartTimeline] = useState(profile?.start_timeline || '');
  const [location, setLocation] = useState(profile?.location_preference || '');
  const [major, setMajor] = useState(user?.major || user?.student_major || '');
  const [gradYear, setGradYear] = useState(user?.graduation_year || '');
  const [greekOrg, setGreekOrg] = useState(profile?.greek_organization || '');
  const [saving, setSaving] = useState(false);

  const toggleIndustry = (ind) => {
    setIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  };

  const toggleRole = (role) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const addCompany = () => {
    const name = companyInput.trim();
    if (!name || companies.length >= 5) return;
    if (!companies.some(c => c.toLowerCase() === name.toLowerCase())) {
      setCompanies([...companies, name]);
    }
    setCompanyInput('');
  };

  const removeCompany = (idx) => setCompanies(companies.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    const oldTargets = (profile?.target_companies || []).map(c => titleCase(c));
    const newTargets = companies.map(c => titleCase(c));
    const removedCompanies = oldTargets.filter(c => !newTargets.map(n => n.toLowerCase()).includes(c.toLowerCase()));
    const profileUpdates = {
      target_industry: industries.join(', '),
      target_role: roles.join(', '),
      target_companies: companies,
      job_search_type: jobSearchType,
      position_type: positionType,
      start_timeline: startTimeline,
      career_timeline: startTimeline,
      location_preference: location,
      greek_organization: greekOrg,
      ...(removedCompanies.length > 0 ? { new_alerts_count: 0 } : {}),
    };
    const userUpdates = {};
    if (major) userUpdates.major = major;
    if (gradYear) userUpdates.graduation_year = gradYear;

    await base44.entities.FastTrackProProfile.update(profile.id, profileUpdates);
    if (Object.keys(userUpdates).length > 0) {
      await base44.auth.updateMe(userUpdates);
    }
    if (removedCompanies.length > 0) {
      archiveRemovedTargets({ removed_companies: removedCompanies, profile_id: profile.id }).catch(e => console.warn('Archive error:', e));
    }
    setSaving(false);
    onSaved({ ...profile, ...profileUpdates });
  };

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, background: '#fff',
    color: '#1E293B', outline: 'none', appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
    backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px',
  };
  const inputStyle = { ...selectStyle, appearance: 'auto', backgroundImage: 'none' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' };

  const chipStyle = (selected) => ({
    padding: '6px 14px', borderRadius: 20,
    border: selected ? '2px solid #0021A5' : '1.5px solid #E2E8F0',
    background: selected ? '#EFF6FF' : '#fff',
    color: selected ? '#0021A5' : '#64748B',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto', padding: '28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>Edit Profile</h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>Update your career preferences</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', minHeight: 'auto' }}>
            <X style={{ width: 18, height: 18, color: '#64748B' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Major + Grad Year row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Major</label>
              <input value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Marketing" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Graduation Year</label>
              <input value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="e.g. 2027" style={inputStyle} />
            </div>
          </div>

          {/* Target Industries (multi-select) */}
          <div>
            <label style={labelStyle}>Target Industry</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => toggleIndustry(ind)} style={chipStyle(industries.includes(ind))}>{ind}</button>
              ))}
            </div>
            {industries.length > 0 && (
              <p style={{ fontSize: 10, color: '#64748B', marginTop: 6 }}>{industries.length} selected</p>
            )}
          </div>

          {/* Target Roles (multi-select) */}
          <div>
            <label style={labelStyle}>What type of role are you looking for?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROLE_TYPES.map(role => (
                <button key={role} onClick={() => toggleRole(role)} style={chipStyle(roles.includes(role))}>{role}</button>
              ))}
            </div>
            {roles.length > 0 && (
              <p style={{ fontSize: 10, color: '#64748B', marginTop: 6 }}>{roles.length} selected</p>
            )}
          </div>

          {/* Target Companies */}
          <div>
            <label style={labelStyle}>Target Companies (max 5)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={companyInput} onChange={e => setCompanyInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
                placeholder="Add a company..." style={{ ...inputStyle, flex: 1 }}
                disabled={companies.length >= 5} />
              <button onClick={addCompany} disabled={companies.length >= 5 || !companyInput.trim()} style={{
                background: '#0021A5', color: '#fff', border: 'none', borderRadius: 10, padding: '0 14px',
                cursor: companies.length >= 5 ? 'not-allowed' : 'pointer', opacity: companies.length >= 5 ? 0.5 : 1,
                minHeight: 'auto', display: 'flex', alignItems: 'center',
              }}>
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {companies.map((c, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#EFF6FF', color: '#0021A5', padding: '5px 12px',
                  borderRadius: 20, fontSize: 12, fontWeight: 600,
                }}>
                  {c}
                  <button onClick={() => removeCompany(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#64748B', minHeight: 'auto', display: 'flex',
                  }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Search Type */}
          <div>
            <label style={labelStyle}>What are you looking for right now?</label>
            <select value={jobSearchType} onChange={e => setJobSearchType(e.target.value)} style={selectStyle}>
              <option value="">Select...</option>
              {JOB_SEARCH_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
            </select>
          </div>

          {/* Position Type + Start Timeline row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Position Type</label>
              <select value={positionType} onChange={e => setPositionType(e.target.value)} style={selectStyle}>
                <option value="">Select...</option>
                {POSITION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Looking to Start</label>
              <select value={startTimeline} onChange={e => setStartTimeline(e.target.value)} style={selectStyle}>
                <option value="">Select...</option>
                {START_TIMELINES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location Preference</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Florida, Remote, NYC" style={inputStyle} />
          </div>

          {/* Greek Organization */}
          <div>
            <label style={labelStyle}>Fraternity / Sorority (optional)</label>
            <input value={greekOrg} onChange={e => setGreekOrg(e.target.value)} placeholder="e.g. Kappa Delta, Sigma Chi" style={inputStyle} />
            <p style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>Greek connections respond at 3× the rate of cold outreach</p>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} style={{
          marginTop: 24, width: '100%', padding: '14px', borderRadius: 12,
          background: saving ? '#94A3B8' : '#0021A5', color: '#fff', border: 'none',
          fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          minHeight: 'auto', transition: 'all 0.2s',
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}