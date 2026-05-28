import React, { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ROLE_SUGGESTIONS = [
  'Marketing Manager', 'Brand Strategist', 'Content Marketing Specialist', 'Marketing Coordinator',
  'Product Manager', 'Data Analyst', 'UX Designer', 'Software Engineer', 'Sales Manager',
  'Business Analyst', 'Financial Analyst', 'Consultant', 'Operations Manager'
];

const INDUSTRY_OPTIONS = [
  'Advertising', 'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Consulting',
  'Education', 'Nonprofit', 'Retail', 'Manufacturing', 'Media', 'Government'
];

const MAJOR_SUGGESTIONS = [
  'Business Administration', 'Marketing', 'Finance', 'Accounting', 'Communications',
  'Computer Science', 'Engineering', 'Economics', 'Psychology', 'English'
];

const LOCATION_SUGGESTIONS = [
  'New York', 'Los Angeles', 'San Francisco', 'Chicago', 'Austin', 'Miami', 'Boston',
  'Seattle', 'Denver', 'Atlanta', 'Remote only', 'Open to anything'
];

export default function EditGoalsModal({ goals, user, onClose, onSave, onStartFresh, openedFromNudge = false }) {
  const [roles, setRoles] = useState(goals?.target_roles || []);
  const [industries, setIndustries] = useState(goals?.target_industries || []);
  const [lookingFor, setLookingFor] = useState(goals?.seeking || 'Full-time');
  const [gradYear, setGradYear] = useState(goals?.graduation_year || '');
  const [location, setLocation] = useState(goals?.location_preference || '');
  const [targetCompanies, setTargetCompanies] = useState(goals?.target_companies || []);
  const [companyInput, setCompanyInput] = useState('');
  const [experience, setExperience] = useState(goals?.experience_level || 'Entry-level');
  const [major, setMajor] = useState(goals?.major || '');
  const [roleInput, setRoleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddRole = (role) => {
    console.log('handleAddRole called with:', role);
    if (role.trim() && !roles.includes(role.trim())) {
      console.log('Adding role:', role.trim());
      setRoles([...roles, role.trim()]);
      setRoleInput('');
    } else {
      console.log('Role not added - empty or duplicate');
    }
  };

  const handleAddIndustry = (ind) => {
    console.log('handleAddIndustry called with:', ind);
    if (ind.trim() && !industries.includes(ind.trim())) {
      console.log('Adding industry:', ind.trim());
      setIndustries([...industries, ind.trim()]);
      setIndustryInput('');
    } else {
      console.log('Industry not added - empty or duplicate');
    }
  };

  const handleAddCompany = (company) => {
    if (company.trim() && !targetCompanies.includes(company.trim())) {
      setTargetCompanies([...targetCompanies, company.trim()]);
      setCompanyInput('');
    }
  };

  const handleSave = async () => {
    console.log('Save clicked - roles:', roles, 'industries:', industries);
    if (roles.length === 0 && industries.length === 0) {
      console.log('Validation failed: no roles or industries');
      setError('Please add at least one role or industry.');
      return;
    }
    console.log('Validation passed, saving...');
    setSaving(true);
    try {
      console.log('Calling updateMe with career_goals:', {
        target_roles: roles,
        target_industries: industries,
        seeking: lookingFor,
        graduation_year: gradYear,
        location_preference: location,
        target_companies: targetCompanies,
        experience_level: experience,
        major: major,
      });
      await base44.auth.updateMe({
        career_goals: {
          ...goals,
          target_roles: roles,
          target_industries: industries,
          seeking: lookingFor,
          graduation_year: gradYear,
          location_preference: location,
          target_companies: targetCompanies,
          experience_level: experience,
          major: major,
          saved_at: new Date().toISOString()
        }
      });
      console.log('Save successful!');
      onSave({ target_roles: roles, target_industries: industries, seeking: lookingFor, graduation_year: gradYear, location_preference: location, target_companies: targetCompanies, experience_level: experience, major });
    } catch (e) {
      console.error('Save failed:', e);
      setError('Failed to save. Try again.');
    }
    setSaving(false);
  };

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
          {goals && (goals.target_roles?.length > 0 || goals.target_industries?.length > 0 || goals.location_preference || goals.seeking) && (
            <div style={{ background: '#F8F9FF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.07em', margin: '0 0 8px', textTransform: 'uppercase' }}>📋 Your Current Goals</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {goals.target_roles?.map(r => (
                  <span key={r} style={{ background: '#FFF5F0', border: '1px solid #FBBF7A', color: '#92400E', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{r}</span>
                ))}
                {goals.target_industries?.map(i => (
                  <span key={i} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{i}</span>
                ))}
                {goals.location_preference && (
                  <span style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>📍 {goals.location_preference}</span>
                )}
                {goals.seeking && (
                  <span style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', color: '#5B21B6', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{goals.seeking}</span>
                )}
                {goals.graduation_year && (
                  <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>Class of {goals.graduation_year}</span>
                )}
                {goals.target_companies?.map(c => (
                  <span key={c} style={{ background: '#FDF4FF', border: '1px solid #E9D5FF', color: '#6B21A8', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>🏢 {c}</span>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {/* Target Roles */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>TARGET ROLES</label>
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
              placeholder="Add a role..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Industries */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>INDUSTRIES</label>
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
              placeholder="Add an industry..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Looking For */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>LOOKING FOR</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Internship', 'Full-time', 'Both'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" checked={lookingFor === opt} onChange={() => setLookingFor(opt)} style={{ cursor: 'pointer' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Graduation Year */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>GRADUATION YEAR</label>
            <select value={gradYear} onChange={e => setGradYear(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}>
              <option value="">Not specified</option>
              {['2025', '2026', '2027', '2028', 'Already graduated'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or region..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Target Companies */}
          <div style={{
            marginBottom: 20,
            border: openedFromNudge ? '2px solid #E85D20' : '1px solid #E0E0E0',
            borderRadius: '10px',
            padding: '14px',
            background: openedFromNudge ? 'rgba(232, 93, 32, 0.04)' : 'transparent',
          }}>
            <label style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '.06em',
              color: openedFromNudge ? '#E85D20' : '#1A1A1A',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>
              Target Companies {openedFromNudge && '← Add 2–3 to sharpen your matches'}
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {targetCompanies.map((company, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: '#FFF5F0',
                  border: '1px solid #E85D20',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: '#E85D20',
                }}>
                  {company}
                  <button
                    onClick={() => setTargetCompanies(targetCompanies.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', fontSize: '14px', lineHeight: 1, padding: 0, minHeight: 'auto', minWidth: 'auto' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. BuzzFeed, Spotify, Nike..."
                value={companyInput}
                onChange={e => setCompanyInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompany(companyInput);
                  }
                }}
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '8px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#1A1A1A',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => handleAddCompany(companyInput)}
                style={{
                  background: '#E85D20', border: 'none',
                  borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12px', color: '#fff', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  minHeight: 'auto',
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>EXPERIENCE LEVEL</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['None', 'Entry-level', 'Some', 'Experienced'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" checked={experience === opt} onChange={() => setExperience(opt)} style={{ cursor: 'pointer' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Major */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>MAJOR</label>
            <input
              type="text"
              value={major}
              onChange={e => setMajor(e.target.value)}
              placeholder="Your major..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', minHeight: 'auto', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes →'}
            </button>
            <button onClick={() => { setCompanyInput(''); onClose(); }} style={{ flex: 1, background: 'none', border: '1px solid #E0E0E0', color: '#666', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
          </div>


        </div>
      </div>
    </div>
  );
}