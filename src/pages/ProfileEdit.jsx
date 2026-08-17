import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import CareerFocusCard from '@/components/profile/CareerFocusCard';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const CARD = '#ffffff';
const R = 14;
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

const NOT_ENROLLED = 'Recent grad / not enrolled';

const inputStyle = {
  width: '100%', background: '#f8f9ff',
  border: '1px solid #E2E8F0', borderRadius: 10,
  padding: '12px 14px', fontFamily: FONT, fontSize: 14,
  color: TEXT, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', marginBottom: 8,
};

const sectionCard = {
  background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px',
};

const chipBtn = (active) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 600,
  color: active ? '#fff' : '#6d28d9',
  background: active ? GRAD_INDIGO : '#fff',
  border: `1.5px solid ${active ? INDIGO : INDIGO_BORDER}`,
  borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto',
  transition: 'all 0.15s', textAlign: 'left',
});

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    school: '',
    notEnrolled: false,
    linkedinUrl: '',
    resumeUrl: '',
    resumeName: '',
  });

  useEffect(() => {
    if (user) {
      const storedResume = localStorage.getItem('cff_resume_url') || '';
      setForm(prev => ({
        ...prev,
        fullName: user.full_name || user.first_name || '',
        school: user.school || user.school_name || user.university || '',
        notEnrolled: (user.school || '') === NOT_ENROLLED,
        linkedinUrl: user.linkedin_url || '',
        resumeUrl: user.resume_url || user.resume_file_url || storedResume,
        resumeName: user.resume_url || user.resume_file_url ? 'Resume on file' : '',
      }));
    }
  }, [user]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update('resumeUrl', file_url);
      update('resumeName', file.name);
      if (user?.email) {
        await base44.entities.Resume.create({
          student_email: user.email,
          name: file.name,
          original_file_name: file.name,
          original_file_url: file_url,
          is_active: true,
        });
      }
    } catch (err) {
      console.error('Resume upload failed:', err);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const schoolValue = form.notEnrolled ? NOT_ENROLLED : form.school.trim();
      // Keep localStorage in sync with onboarding keys so the profile,
      // onboarding, and CLIFF never disagree.
      try {
        localStorage.setItem('cff_college', schoolValue);
        if (form.resumeUrl) {
          localStorage.setItem('cff_resume_url', form.resumeUrl);
          localStorage.setItem('cff_resume_status', 'provided');
        }
        if (form.linkedinUrl.trim()) localStorage.setItem('cff_linkedin_url', form.linkedinUrl.trim());
      } catch (e) {}

      const updateData = {
        full_name: form.fullName.trim(),
        school: schoolValue,
        school_name: schoolValue,
        university: schoolValue,
        ...(form.linkedinUrl.trim() ? { linkedin_url: form.linkedinUrl.trim() } : {}),
        ...(form.resumeUrl ? { resume_url: form.resumeUrl, resume_file_url: form.resumeUrl, resume_status: 'provided' } : {}),
      };
      // Derive school_code for alumni / parent surfacing when actually enrolled.
      if (!form.notEnrolled && form.school.trim()) {
        const code = deriveSchoolCode(form.school.trim());
        if (code) updateData.school_code = code.toUpperCase();
      }
      await base44.auth.updateMe(updateData);

      // Rebuild career_goals location if the student previously had one,
      // so school + goals stay consistent for matching.
      try {
        const existingGoals = user?.career_goals || {};
        if (existingGoals && Object.keys(existingGoals).length) {
          await base44.functions.invoke('refreshDailyDrop', {}).catch(() => {});
        }
      } catch (e) {}

      if (refreshUser) { try { await refreshUser(); } catch (e) {} }
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('Profile'); }, 1000);
    } catch (err) {
      console.error('Profile save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid rgba(109,40,217,0.10)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate('Profile')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: INDIGO,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: FONT, fontSize: 13, fontWeight: 600, minHeight: 'auto', padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', width: '100%', padding: '32px 20px 80px' }}>
        <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: TEXT, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Edit Profile
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, marginBottom: 28 }}>
          Keep your search details current — CLIFF uses these to match jobs, alumni, and your plan.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ── School ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>School</p>
            <SchoolSearchInput
              value={form.notEnrolled ? '' : form.school}
              onChange={(val) => { update('school', val); update('notEnrolled', false); }}
              light
            />
            <button
              type="button"
              onClick={() => { update('notEnrolled', !form.notEnrolled); if (!form.notEnrolled) update('school', ''); }}
              style={{ marginTop: 12, ...chipBtn(form.notEnrolled) }}
            >
              {form.notEnrolled ? '✓ Recent grad / not currently enrolled' : 'Recent grad / not currently enrolled'}
            </button>
          </div>

          {/* ── Career Focus (target role / industry + location) — single source of truth ── */}
          <CareerFocusCard user={user} onUpdated={() => refreshUser?.()} />

          {/* ── LinkedIn ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>LinkedIn <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none' }}>(optional)</span></p>
            <input value={form.linkedinUrl} onChange={e => update('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
          </div>

          {/* ── Resume ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Resume <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none' }}>(optional)</span></p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
            {form.resumeUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, flex: 1 }}>{form.resumeName || 'Resume on file'}</p>
                <button type="button" onClick={() => fileRef.current?.click()} style={{
                  fontFamily: FONT, fontSize: 12, fontWeight: 600, color: INDIGO,
                  background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`,
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer', minHeight: 'auto',
                }}>Replace</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingResume} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px', borderRadius: 10, cursor: uploadingResume ? 'not-allowed' : 'pointer',
                minHeight: 'auto', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: INDIGO,
                background: INDIGO_LIGHT, border: `1.5px dashed ${INDIGO_BORDER}`,
                opacity: uploadingResume ? 0.6 : 1,
              }}>
                {uploadingResume ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(109,40,217,0.3)', borderTop: '2px solid #6d28d9', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Uploading...
                  </>
                ) : (
                  <><Upload size={16} /> Upload Resume (PDF or Word)</>
                )}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </button>
            )}
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving || saved} style={{
            width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none',
            background: saved ? '#10b981' : GRAD_INDIGO, color: '#fff',
            fontFamily: FONT, fontSize: 15, fontWeight: 700,
            cursor: saving || saved ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, minHeight: 'auto', marginTop: 4,
            boxShadow: '0 4px 14px rgba(109,40,217,0.25)',
          }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}