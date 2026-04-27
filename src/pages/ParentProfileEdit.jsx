import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { ArrowLeft, Linkedin, Loader2 } from 'lucide-react';
import { proxycurlService } from '@/functions/proxycurlService';

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
  const [importingPhoto, setImportingPhoto] = useState(false);
  const [photoImported, setPhotoImported] = useState(false);
  const [photoImportError, setPhotoImportError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        company: user.current_company || user.company || '',
        careerBackground: user.career_background || '',
        industry: user.industry || '',
        introWillingness: user.intro_willingness || 'yes',
        directoryVisible: user.visible_in_directory !== false,
        linkedinUrl: user.linkedin_url || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: form.fullName.trim(),
        current_company: form.company.trim(),
        company: form.company.trim(),
        career_background: form.careerBackground.trim(),
        industry: form.industry,
        intro_willingness: form.introWillingness,
        visible_in_directory: form.directoryVisible,
        ...(form.linkedinUrl.trim() ? { linkedin_url: form.linkedinUrl.trim() } : {}),
      });
      if (refreshUser) refreshUser().catch(() => {});
      try { sessionStorage.removeItem('directoryDataCache'); } catch (e) { /* ok */ }
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('Profile'); }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', padding: '0 0 80px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

          {/* LinkedIn URL + Photo Import */}
          <div>
            <FieldLabel>
              LinkedIn Profile{' '}
              <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              <FieldInput
                value={form.linkedinUrl}
                onChange={e => { setForm(f => ({ ...f, linkedinUrl: e.target.value })); setPhotoImportError(''); setPhotoImported(false); }}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            {form.linkedinUrl.trim() && (
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  disabled={importingPhoto || photoImported}
                  onClick={async () => {
                    setImportingPhoto(true);
                    setPhotoImportError('');
                    try {
                      const res = await proxycurlService({ action: 'enrichParentProfile', params: { linkedinUrl: form.linkedinUrl.trim() } });
                      const photo = res?.data?.profile_pic;
                      if (photo) {
                        await base44.auth.updateMe({ profile_photo: photo, linkedin_url: form.linkedinUrl.trim() });
                        if (refreshUser) refreshUser().catch(() => {});
                        setPhotoImported(true);
                      } else {
                        setPhotoImportError('No photo found on this LinkedIn profile.');
                      }
                    } catch (e) {
                      setPhotoImportError('Could not import photo. Check the URL and try again.');
                    } finally {
                      setImportingPhoto(false);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                    color: photoImported ? '#4CAF50' : '#0a66c2',
                    background: photoImported ? 'rgba(76,175,80,0.1)' : 'rgba(10,102,194,0.1)',
                    border: `1px solid ${photoImported ? 'rgba(76,175,80,0.3)' : 'rgba(10,102,194,0.3)'}`,
                    borderRadius: 8, padding: '8px 16px', cursor: importingPhoto || photoImported ? 'not-allowed' : 'pointer',
                    minHeight: 'auto', opacity: importingPhoto ? 0.7 : 1,
                  }}
                >
                  {importingPhoto ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Linkedin size={14} />}
                  {photoImported ? '✓ Photo imported!' : importingPhoto ? 'Importing...' : 'Import profile photo from LinkedIn'}
                </button>
                {photoImportError && (
                  <p style={{ fontFamily: dmSans, fontSize: 12, color: '#EF4444', margin: '6px 0 0' }}>{photoImportError}</p>
                )}
              </div>
            )}
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