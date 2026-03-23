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

export default function EditGoalsModal({ goals, user, onClose, onSave, onStartFresh }) {
  const [roles, setRoles] = useState(goals?.target_roles || []);
  const [industries, setIndustries] = useState(goals?.target_industries || []);
  const [lookingFor, setLookingFor] = useState(goals?.seeking || 'Full-time');
  const [gradYear, setGradYear] = useState(goals?.graduation_year || '');
  const [location, setLocation] = useState(goals?.location_preference || '');
  const [dreamCompany, setDreamCompany] = useState(goals?.dream_company || '');
  const [experience, setExperience] = useState(goals?.experience_level || 'Entry-level');
  const [major, setMajor] = useState(goals?.major || '');
  const [roleInput, setRoleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    if (roles.length === 0 && industries.length === 0) {
      setError('Please add at least one role or industry.');
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({
        career_goals: {
          ...goals,
          target_roles: roles,
          target_industries: industries,
          seeking: lookingFor,
          graduation_year: gradYear,
          location_preference: location,
          dream_company: dreamCompany,
          experience_level: experience,
          major: major,
          saved_at: new Date().toISOString()
        }
      });
      onSave({ target_roles: roles, target_industries: industries, seeking: lookingFor, graduation_year: gradYear, location_preference: location, dream_company: dreamCompany, experience_level: experience, major });
      onClose();
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

          {/* Dream Company */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>DREAM COMPANY</label>
            <input
              type="text"
              value={dreamCompany}
              onChange={e => setDreamCompany(e.target.value)}
              placeholder="Company name..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
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
            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid #E0E0E0', color: '#666', borderRadius: 100, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
          </div>

          {/* Secondary option */}
          <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
            <p style={{ margin: '0 0 8px' }}>Want to redo the full conversation instead?</p>
            <button onClick={onStartFresh} style={{ background: 'none', border: 'none', color: '#E85D20', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Start fresh with FastIQ →</button>
          </div>
        </div>
      </div>
    </div>
  );
}