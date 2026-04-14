import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { ArrowLeft } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

const INDUSTRIES = [
  'Accounting & Finance', 'Advertising & Marketing', 'Architecture & Design',
  'Consulting', 'Education', 'Engineering & Technology', 'Entertainment & Media',
  'Fashion & Retail', 'Government & Public Policy', 'Healthcare & Life Sciences',
  'Hospitality & Tourism', 'Investment Banking & Private Equity', 'Law & Legal Services',
  'Manufacturing & Operations', 'Non-Profit & Social Impact', 'Real Estate',
  'Sales & Business Development', 'Sports & Athletics', 'Supply Chain & Logistics', 'Other',
];

const INTRO_OPTIONS = [
  { value: 'yes', label: 'Yes, happy to help' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'not_now', label: 'Not right now' },
];

export default function ParentProfileEdit() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    company: '',
    careerBackground: '',
    industry: '',
    introWillingness: 'yes',
    directoryVisible: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        company: user.current_company || user.company || '',
        careerBackground: user.career_background || '',
        industry: user.industry || '',
        introWillingness: user.intro_willingness || 'yes',
        directoryVisible: user.visible_in_directory !== false,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      full_name: form.fullName.trim(),
      current_company: form.company.trim(),
      company: form.company.trim(),
      career_background: form.careerBackground.trim(),
      industry: form.industry,
      industries: form.industry ? [form.industry] : [],
      intro_willingness: form.introWillingness,
      visible_in_directory: form.directoryVisible,
      directory_consent_given: form.directoryVisible,
    });
    if (refreshUser) await refreshUser();
    // Clear directory cache so updated profile appears immediately
    try { sessionStorage.removeItem('directoryDataCache'); } catch (e) { /* ok */ }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('Profile'); }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        background: '#0d1117', borderBottom: '1px solid #1A1A1A',
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

      <div style={{ flex: 1, maxWidth: 540, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#f4f0e8', textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
          Update your profile
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
          Keep your information current so students can find and connect with you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Full Name */}
          <div>
            <FieldLabel required>Full Name</FieldLabel>
            <FieldInput
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          {/* Company */}
          <div>
            <FieldLabel>
              Where do you work or have you worked?{' '}
              <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldInput
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="e.g. Disney, Goldman Sachs, Google..."
            />
          </div>

          {/* Career Background */}
          <div>
            <FieldLabel>
              Career Background{' '}
              <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldInput
              value={form.careerBackground}
              onChange={e => setForm(f => ({ ...f, careerBackground: e.target.value }))}
              placeholder="e.g. 20 years in finance, former marketing exec, retired teacher..."
            />
          </div>

          {/* Industry */}
          <div>
            <FieldLabel>
              What industry are you in or have you worked in?{' '}
              <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldSelect
              value={form.industry}
              onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              options={INDUSTRIES}
            />
          </div>

          {/* Intro Willingness */}
          <div>
            <FieldLabel>Are you open to making introductions for students?</FieldLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {INTRO_OPTIONS.map(opt => {
                const selected = form.introWillingness === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, introWillingness: opt.value }))}
                    style={{
                      flex: 1, minWidth: 110, padding: '10px 12px', borderRadius: 100,
                      fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                      minHeight: 'auto', whiteSpace: 'nowrap', textAlign: 'center',
                      background: selected ? ORANGE : 'transparent',
                      color: selected ? '#fff' : ORANGE,
                      border: `1.5px solid ${ORANGE}`,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directory Visibility */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
              Directory Visibility
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#f4f0e8', lineHeight: 1.5 }}>
                Make my profile visible to students
              </span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, directoryVisible: !f.directoryVisible }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.directoryVisible ? ORANGE : '#444',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0, minHeight: 'auto', minWidth: 44,
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, left: form.directoryVisible ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 100, border: 'none',
              background: saved ? '#4CAF50' : ORANGE, color: '#fff',
              fontFamily: dmSans, fontSize: 15, fontWeight: 600,
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, minHeight: 'auto', transition: 'background 0.2s', marginTop: 8,
            }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE,
      marginBottom: 8,
    }}>
      {children}
      {required && <span style={{ color: '#ff6b6b' }}>*</span>}
    </label>
  );
}

function FieldInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
        borderRadius: 10, padding: '12px 14px', fontFamily: dmSans, fontSize: 14,
        color: '#fff', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

function FieldSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
        borderRadius: 10, padding: '12px 14px', fontFamily: dmSans, fontSize: 14,
        color: value ? '#fff' : '#666', outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
      }}
    >
      <option value="">Select industry</option>
      {options.map(opt => (
        <option key={opt} value={opt} style={{ background: '#1A1A1A' }}>
          {opt}
        </option>
      ))}
    </select>
  );
}