import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#7c3aed';

const INDUSTRIES = [
  'Accounting & Finance', 'Advertising & Marketing', 'Architecture & Design',
  'Consulting', 'Education', 'Engineering & Technology', 'Entertainment & Media',
  'Fashion & Retail', 'Government & Public Policy', 'Healthcare & Life Sciences',
  'Hospitality & Tourism', 'Investment Banking & Private Equity', 'Law & Legal Services',
  'Manufacturing & Operations', 'Non-Profit & Social Impact', 'Real Estate',
  'Sales & Business Development', 'Sports & Athletics', 'Supply Chain & Logistics', 'Other',
];

const HELP_TYPES = [
  { value: 'networking_intros', label: 'Making introductions' },
  { value: 'career_advice', label: 'Career advice' },
  { value: 'resume_review', label: 'Resume / LinkedIn review' },
  { value: 'interview_prep', label: 'Interview prep' },
  { value: 'job_referrals', label: 'Job referrals' },
  { value: 'industry_insights', label: 'Industry insights' },
];

const inputStyle = {
  width: '100%',
  background: '#f9f9f9',
  border: '1px solid #e0e0e0',
  borderRadius: 10,
  padding: '12px 14px',
  fontFamily: dmSans,
  fontSize: 14,
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontFamily: dmSans,
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#888',
  marginBottom: 8,
};

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    school: '',
    gradYear: '',
    industry: '',
    company: '',
    linkedinUrl: '',
    helpTypes: [],
  });

  const isAlumni = user?.persona === 'alumni' || user?.roles?.includes('alumni');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        bio: user.bio || '',
        school: user.school || user.school_name || user.university || '',
        gradYear: user.graduation_year || '',
        industry: user.industry || '',
        company: user.current_company || user.company || '',
        linkedinUrl: user.linkedin_url || '',
        helpTypes: user.ways_to_help || user.help_types || [],
      });
    }
  }, [user]);

  const toggleHelp = (val) => {
    setForm(prev => ({
      ...prev,
      helpTypes: prev.helpTypes.includes(val)
        ? prev.helpTypes.filter(v => v !== val)
        : [...prev.helpTypes, val],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        full_name: form.fullName.trim(),
        bio: form.bio.trim(),
        school: form.school.trim(),
        school_name: form.school.trim(),
        university: form.school.trim(),
        graduation_year: form.gradYear,
        industry: form.industry,
        linkedin_url: form.linkedinUrl.trim(),
      };

      if (isAlumni) {
        updateData.current_company = form.company.trim();
        updateData.company = form.company.trim();
        updateData.ways_to_help = form.helpTypes;
        updateData.help_types = form.helpTypes;
      }

      await base44.auth.updateMe(updateData);
      if (refreshUser) { try { await refreshUser(); } catch (e) {} }
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('Profile'); }, 1200);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #eee',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate('Profile')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: ORANGE,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, minHeight: 'auto', padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#1a1a1a', marginBottom: 8 }}>
          Edit Profile
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 32 }}>
          Keep your information current so others can find and connect with you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name" style={inputStyle} />
          </div>

          {/* School */}
          <div>
            <label style={labelStyle}>School / University</label>
            <SchoolSearchInput value={form.school} onChange={val => setForm(f => ({ ...f, school: val }))} />
          </div>

          {/* Grad Year */}
          <div>
            <label style={labelStyle}>Graduation Year</label>
            <input value={form.gradYear}
              onChange={e => setForm(f => ({ ...f, gradYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              placeholder="e.g. 2022" maxLength={4} style={inputStyle} />
          </div>

          {/* Industry */}
          <div>
            <label style={labelStyle}>Industry</label>
            <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer', color: form.industry ? '#1a1a1a' : '#999' }}>
              <option value="">Select your industry</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          {/* Company (alumni only) */}
          {isAlumni && (
            <div>
              <label style={labelStyle}>Current Company <span style={{ color: '#bbb', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="e.g. Google, Goldman Sachs..." style={inputStyle} />
            </div>
          )}

          {/* LinkedIn */}
          <div>
            <label style={labelStyle}>LinkedIn URL <span style={{ color: '#bbb', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio <span style={{ color: '#bbb', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="A short bio about yourself..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Help types (alumni only) */}
          {isAlumni && (
            <div>
              <label style={labelStyle}>How can you help students?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {HELP_TYPES.map(({ value, label }) => {
                  const selected = form.helpTypes.includes(value);
                  return (
                    <button key={value} type="button" onClick={() => toggleHelp(value)} style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                      border: `1.5px solid ${selected ? ORANGE : '#e0e0e0'}`,
                      background: selected ? 'rgba(124,58,237,0.06)' : '#fff',
                      color: selected ? '#1a1a1a' : '#888',
                      fontFamily: dmSans, fontSize: 14, fontWeight: selected ? 600 : 400,
                      cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
                    }}>
                      {selected ? '✓ ' : ''}{label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving || saved} style={{
            width: '100%', padding: '14px 24px', borderRadius: 100, border: 'none',
            background: saved ? '#4CAF50' : ORANGE, color: '#fff',
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            cursor: saving || saved ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, minHeight: 'auto', marginTop: 8,
          }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}