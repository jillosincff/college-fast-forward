import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const INDUSTRIES = [
  'Architecture & Design', 'Biotech & Life Sciences', 'Consumer Goods & Retail',
  'Education', 'Energy & Utilities', 'Engineering', 'Financial Services & Banking',
  'Government & Nonprofit', 'Healthcare & Life Sciences', 'Hospitality & Tourism',
  'Human Resources', 'Legal & Compliance', 'Logistics & Supply Chain',
  'Marketing & Brand', 'Media & Entertainment', 'Nonprofit & Social Impact',
  'Pre-Med & Healthcare', 'Real Estate', 'Sports & Athletics', 'Technology & Software',
];

const sectionStyle = { marginBottom: 32 };

const labelStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: '#888', margin: '0 0 10px', display: 'block',
};

const chipStyle = (selected) => ({
  background: selected ? '#E85D20' : '#fff',
  border: `1px solid ${selected ? '#E85D20' : '#E0E0E0'}`,
  borderRadius: 20, padding: '7px 14px',
  fontSize: 13, fontWeight: selected ? 600 : 400,
  color: selected ? '#fff' : '#444',
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  transition: 'all 0.15s', minHeight: 'auto',
});

const inputStyle = {
  width: '100%', fontSize: 14,
  padding: '11px 14px',
  border: '1px solid #E0E0E0',
  borderRadius: 8, background: '#fff',
  color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box', outline: 'none',
};

const PRESET_LOCATIONS = ['New York', 'Miami', 'Los Angeles', 'Chicago', 'Remote', 'Open to anything'];

export default function FreeTierCareerGoalsTab({ user, onGoalsSaved, onTabChange, onOpenUpgrade }) {
  const [form, setForm] = useState({
    major: user?.major || user?.career_goals?.major || '',
    target_roles: user?.career_goals?.target_roles || [],
    target_industries: user?.career_goals?.target_industries || [],
    job_type: user?.career_goals?.job_type || user?.career_goals?.seeking || '',
    graduation_year: user?.career_goals?.graduation_year || '',
    location: user?.career_goals?.location || user?.career_goals?.location_preference || '',
    company_size_preference: user?.career_goals?.company_size_preference || '',
    target_companies: user?.career_goals?.target_companies || [],
    biggest_struggle: user?.career_goals?.biggest_struggle || user?.career_goals?.perceived_gap || '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [roleInput, setRoleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleChip = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const addRole = () => {
    if (!roleInput.trim()) return;
    update('target_roles', [...form.target_roles, roleInput.trim()]);
    setRoleInput('');
  };

  const addCompany = () => {
    if (!companyInput.trim()) return;
    update('target_companies', [...form.target_companies, companyInput.trim()]);
    setCompanyInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        major: form.major,
        career_goals: {
          ...(user?.career_goals || {}),
          major: form.major,
          target_roles: form.target_roles,
          target_industries: form.target_industries,
          job_type: form.job_type,
          seeking: form.job_type,
          graduation_year: form.graduation_year,
          location: form.location,
          location_preference: form.location,
          company_size_preference: form.company_size_preference,
          target_companies: form.target_companies,
          biggest_struggle: form.biggest_struggle,
          perceived_gap: form.biggest_struggle,
          saved_at: new Date().toISOString(),
        },
      });
      setSaved(true);
      onGoalsSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  };

  const isPresetLocation = PRESET_LOCATIONS.includes(form.location);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>
          CAREER GOALS
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Tell us what you're looking for.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
          The more you share, the better we can match you.
        </p>
      </div>

      {/* Major */}
      <div style={sectionStyle}>
        <label style={labelStyle}>What are you studying?</label>
        <input
          value={form.major}
          onChange={e => update('major', e.target.value)}
          placeholder="e.g. Finance, Marketing, Computer Science..."
          style={inputStyle}
        />
      </div>

      {/* Target Roles */}
      <div style={sectionStyle}>
        <label style={labelStyle}>What roles are you targeting?</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={roleInput}
            onChange={e => setRoleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRole()}
            placeholder="e.g. Marketing Manager, Software Engineer..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={addRole} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '0 16px', color: '#fff', cursor: 'pointer', fontSize: 22, fontWeight: 300, minHeight: 'auto' }}>+</button>
        </div>
        {form.target_roles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.target_roles.map(role => (
              <span key={role} style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#E85D20', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {role}
                <span onClick={() => update('target_roles', form.target_roles.filter(r => r !== role))} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 16, lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Industries */}
      <div style={sectionStyle}>
        <label style={labelStyle}>What industries interest you? (pick all that apply)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INDUSTRIES.map(ind => (
            <button key={ind} onClick={() => toggleChip('target_industries', ind)} style={chipStyle(form.target_industries.includes(ind))}>
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Internship or full-time?</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Internship', 'Full-time', 'Both'].map(opt => (
            <button key={opt} onClick={() => update('job_type', opt)} style={chipStyle(form.job_type === opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* Graduation Year */}
      <div style={sectionStyle}>
        <label style={labelStyle}>When do you graduate?</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['2025', '2026', '2027', '2028+'].map(yr => (
            <button key={yr} onClick={() => update('graduation_year', yr)} style={chipStyle(form.graduation_year === yr)}>{yr}</button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Where do you want to work?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {PRESET_LOCATIONS.map(loc => (
            <button key={loc} onClick={() => update('location', loc)} style={chipStyle(form.location === loc)}>{loc}</button>
          ))}
        </div>
        <input
          value={isPresetLocation ? '' : form.location}
          onChange={e => update('location', e.target.value)}
          placeholder="Or type a city..."
          style={inputStyle}
        />
      </div>

      {/* Company Size */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Company size preference?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Big company (Fortune 500)', 'Mid-size', 'Startup', 'No preference'].map(opt => (
            <button key={opt} onClick={() => update('company_size_preference', opt)} style={chipStyle(form.company_size_preference === opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* Target Companies */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Any dream companies? (optional)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={companyInput}
            onChange={e => setCompanyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCompany()}
            placeholder="e.g. Google, Goldman Sachs, Nike..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={addCompany} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '0 16px', color: '#fff', cursor: 'pointer', fontSize: 22, fontWeight: 300, minHeight: 'auto' }}>+</button>
        </div>
        {form.target_companies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.target_companies.map(co => (
              <span key={co} style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#E85D20', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {co}
                <span onClick={() => update('target_companies', form.target_companies.filter(c => c !== co))} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 16, lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Biggest Struggle */}
      <div style={sectionStyle}>
        <label style={labelStyle}>What are you struggling with most right now?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {["Don't know where to begin", "Applied but no answers", "Not sure how to network"].map(opt => (
            <button key={opt} onClick={() => update('biggest_struggle', opt)} style={chipStyle(form.biggest_struggle === opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saved ? '#22C55E' : '#E85D20',
          border: 'none', borderRadius: 10,
          padding: '14px 40px', fontSize: 15,
          fontWeight: 600, color: '#fff',
          cursor: saving ? 'not-allowed' : 'pointer',
          width: '100%', fontFamily: "'DM Sans', sans-serif",
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save My Goals →'}
      </button>
    </div>
  );
}