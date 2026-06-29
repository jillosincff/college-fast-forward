import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Linkedin, Loader2 } from 'lucide-react';
import { proxycurlService } from '@/functions/proxycurlService';

// ── Brand tokens (matched to ParentAllSet / StudentLandingPage) ──
const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const BG = '#f8f9ff';
const CARD = '#ffffff';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const FIELD_BG = '#f8f9ff';
const FIELD_BORDER = '#e2e8f0';

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
  const { user, refreshUser, isLoadingAuth } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    company: '',
    careerBackground: '',
    industry: '',
    introWillingness: 'yes',
    directoryVisible: true,
    linkedinUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Any edit to the form clears the saved confirmation so the button
  // accurately reflects whether there are unsaved changes.
  const updateForm = (updater) => { setSaved(false); setForm(updater); };
  const [importingPhoto, setImportingPhoto] = useState(false);
  const [photoImported, setPhotoImported] = useState(false);
  const [photoImportError, setPhotoImportError] = useState('');

  // Logged-out parent clicking the email link: send them to GatorAuth (the app's
  // own light/purple sign-in screen) with a return path back to this page.
  // Use React Router navigation (hash assignment) — a window.location.replace
  // race with the router was bouncing users to the landing page instead.
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      const returnTo = encodeURIComponent('/ParentProfileEdit');
      navigate('/GatorAuth?returnTo=' + returnTo);
    }
  }, [isLoadingAuth, user]);

  useEffect(() => {
    if (!document.getElementById('ppe-satoshi')) {
      const l = document.createElement('link');
      l.id = 'ppe-satoshi'; l.rel = 'stylesheet';
      l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap';
      document.head.appendChild(l);
    }
  }, []);

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
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', fontFamily: SF }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${INDIGO}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 500, color: TEXT2, margin: 0 }}>Taking you to sign in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SF, display: 'flex', flexDirection: 'column', padding: '0 0 80px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ flex: 1, maxWidth: 540, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: SF, fontWeight: 900, fontSize: 28, color: TEXT, textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
          Update your profile
        </h1>
        <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 400, color: TEXT2, textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
          Keep your information current so students can find and connect with you.
        </p>

        <div style={{
          background: CARD, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 18,
          padding: 'clamp(20px, 5vw, 28px)', boxShadow: SHADOW,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Full Name */}
          <div>
            <FieldLabel required>Full Name</FieldLabel>
            <FieldInput
              value={form.fullName}
              onChange={e => updateForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          {/* Company */}
          <div>
            <FieldLabel>
              Where do you work or have you worked?{' '}
              <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldInput
              value={form.company}
              onChange={e => updateForm(f => ({ ...f, company: e.target.value }))}
              placeholder="e.g. Disney, Goldman Sachs, Google..."
            />
          </div>

          {/* Career Background */}
          <div>
            <FieldLabel>
              Career Background{' '}
              <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldInput
              value={form.careerBackground}
              onChange={e => updateForm(f => ({ ...f, careerBackground: e.target.value }))}
              placeholder="e.g. 20 years in finance, former marketing exec, retired teacher..."
            />
          </div>

          {/* Industry */}
          <div>
            <FieldLabel>
              What industry are you in or have you worked in?{' '}
              <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <FieldSelect
              value={form.industry}
              onChange={e => updateForm(f => ({ ...f, industry: e.target.value }))}
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
                    onClick={() => updateForm(f => ({ ...f, introWillingness: opt.value }))}
                    style={{
                      flex: 1, minWidth: 110, padding: '10px 12px', borderRadius: 100,
                      fontFamily: SF, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                      minHeight: 'auto', whiteSpace: 'nowrap', textAlign: 'center',
                      background: selected ? GRAD_INDIGO : 'transparent',
                      color: selected ? '#fff' : INDIGO,
                      border: `1.5px solid ${selected ? 'transparent' : INDIGO_BORDER}`,
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
              <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              <FieldInput
                value={form.linkedinUrl}
                onChange={e => { updateForm(f => ({ ...f, linkedinUrl: e.target.value })); setPhotoImportError(''); setPhotoImported(false); }}
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
                    fontFamily: SF, fontSize: 13, fontWeight: 600,
                    color: photoImported ? '#16a34a' : '#0a66c2',
                    background: photoImported ? 'rgba(22,163,74,0.08)' : 'rgba(10,102,194,0.08)',
                    border: `1px solid ${photoImported ? 'rgba(22,163,74,0.3)' : 'rgba(10,102,194,0.3)'}`,
                    borderRadius: 8, padding: '8px 16px', cursor: importingPhoto || photoImported ? 'not-allowed' : 'pointer',
                    minHeight: 'auto', opacity: importingPhoto ? 0.7 : 1,
                  }}
                >
                  {importingPhoto ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Linkedin size={14} />}
                  {photoImported ? '✓ Photo imported!' : importingPhoto ? 'Importing...' : 'Import profile photo from LinkedIn'}
                </button>
                {photoImportError && (
                  <p style={{ fontFamily: SF, fontSize: 12, color: '#dc2626', margin: '6px 0 0' }}>{photoImportError}</p>
                )}
              </div>
            )}
          </div>

          {/* Directory Visibility */}
          <div>
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: INDIGO, marginBottom: 12 }}>
              Directory Visibility
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontFamily: SF, fontSize: 14, fontWeight: 400, color: TEXT, lineHeight: 1.5 }}>
                Make my profile visible to students
              </span>
              <button
                type="button"
                onClick={() => updateForm(f => ({ ...f, directoryVisible: !f.directoryVisible }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.directoryVisible ? INDIGO : '#cbd5e1',
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
              background: saved ? '#16a34a' : GRAD_INDIGO, color: '#fff',
              fontFamily: SF, fontSize: 15, fontWeight: 700,
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, minHeight: 52,
              boxShadow: saved ? 'none' : '0 8px 24px rgba(109,40,217,0.30)',
              transition: 'all 0.2s', marginTop: 8,
            }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>

          {saved && (
            <p style={{
              fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#16a34a',
              textAlign: 'center', margin: '-4px 0 0', lineHeight: 1.5,
            }}>
              Your profile has been saved. You can close this page or keep editing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block', fontFamily: SF, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.1em', color: INDIGO,
      marginBottom: 8,
    }}>
      {children}
      {required && <span style={{ color: '#dc2626' }}>*</span>}
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
        width: '100%', background: FIELD_BG, border: `1px solid ${FIELD_BORDER}`,
        borderRadius: 10, padding: '12px 14px', fontFamily: SF, fontSize: 14,
        color: TEXT, outline: 'none', boxSizing: 'border-box',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = INDIGO; }}
      onBlur={e => { e.currentTarget.style.borderColor = FIELD_BORDER; }}
    />
  );
}

function FieldSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', background: FIELD_BG, border: `1px solid ${FIELD_BORDER}`,
        borderRadius: 10, padding: '12px 14px', fontFamily: SF, fontSize: 14,
        color: value ? TEXT : TEXT3, outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
      }}
    >
      <option value="">Select industry</option>
      {options.map(opt => (
        <option key={opt} value={opt} style={{ background: '#fff', color: TEXT }}>
          {opt}
        </option>
      ))}
    </select>
  );
}