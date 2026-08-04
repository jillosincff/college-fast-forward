import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import CareerFocusCard from '@/components/profile/CareerFocusCard';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const VIOLET = '#7c3aed';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const TEAL = '#06b6d4';
const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const CARD = '#ffffff';
const R = 14;
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';

const BLOCKERS = [
  { key: 'resume', icon: '📄', label: "Resume isn't getting responses" },
  { key: 'ghosted', icon: '👻', label: 'Getting ghosted after applying' },
  { key: 'no_direction', icon: '🧩', label: 'Not sure what I want to do' },
  { key: 'which_jobs', icon: '🔍', label: "Don't know which jobs to apply for" },
  { key: 'outreach', icon: '🤝', label: "Don't know how to reach the right people" },
  { key: 'disorganized', icon: '📁', label: 'Disorganized and losing track' },
  { key: 'interviews', icon: '🎤', label: 'Interviewing makes me nervous' },
];

const inputStyle = {
  width: '100%', background: '#f8f9ff',
  border: '1px solid #E2E8F0', borderRadius: 10,
  padding: '12px 14px', fontFamily: FONT, fontSize: 14,
  color: TEXT, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: VIOLET, marginBottom: 8,
};

const sectionCard = {
  background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px',
};

function readOnboardingData() {
  try {
    return {
      frustration: parseInt(localStorage.getItem('cff_frustration') || '5', 10) || 5,
      blockers: JSON.parse(localStorage.getItem('cff_blockers') || '[]'),
      college: localStorage.getItem('cff_college') || '',
      resumeUrl: localStorage.getItem('cff_resume_url') || '',
    };
  } catch {
    return { frustration: 5, blockers: [], college: '', resumeUrl: '' };
  }
}

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', school: '', gradYear: '', linkedinUrl: '',
    parentCompany: '',
    ...readOnboardingData(),
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: user.full_name || user.first_name || '',
        school: user.school || user.school_name || user.university || prev.college || '',
        gradYear: user.graduation_year || '',
        linkedinUrl: user.linkedin_url || '',
      }));
    }
    // Load parent company
    (async () => {
      if (user?.id) {
        try {
          const records = await base44.entities.ParentNetworkProfile.filter({ created_by_id: user.id });
          if (records?.length > 0) {
            setForm(prev => ({ ...prev, parentCompany: records[0].company_name || '' }));
          }
        } catch (e) { /* non-blocking */ }
      }
    })();
  }, [user]);

  // If navigated here to add parent info, scroll straight to that section
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('focus') === 'parent') {
      setTimeout(() => {
        document.getElementById('parent-network-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleBlocker = (key) => {
    setForm(prev => {
      const has = prev.blockers.includes(key);
      if (has) return { ...prev, blockers: prev.blockers.filter(k => k !== key) };
      if (prev.blockers.length >= 2) return prev;
      return { ...prev, blockers: [...prev.blockers, key] };
    });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update('resumeUrl', file_url);
      // Save to Resume entity
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
      // Save to localStorage
      const lsMap = {
        cff_frustration: String(form.frustration),
        cff_blockers: JSON.stringify(form.blockers),
        cff_college: form.school,
      };
      if (form.resumeUrl) lsMap.cff_resume_url = form.resumeUrl;
      Object.entries(lsMap).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} });

      // Save to User entity
      const updateData = {
        full_name: form.fullName.trim(),
        first_name: form.fullName.trim().split(' ')[0],
        school: form.school.trim(),
        school_name: form.school.trim(),
        university: form.school.trim(),
        graduation_year: form.gradYear,
        linkedin_url: form.linkedinUrl.trim(),
        career_blockers: form.blockers,
      };
      await base44.auth.updateMe(updateData);

      // Save parent company to ParentNetworkProfile
      if (form.parentCompany.trim()) {
        try {
          const existing = await base44.entities.ParentNetworkProfile.filter({ created_by_id: user.id });
          if (existing?.length > 0) {
            await base44.entities.ParentNetworkProfile.update(existing[0].id, { company_name: form.parentCompany.trim() });
          } else {
            await base44.entities.ParentNetworkProfile.create({
              first_name: form.fullName.trim().split(' ')[0] || 'Student',
              last_name: form.fullName.trim().split(' ').slice(1).join(' ') || 'Student',
              company_name: form.parentCompany.trim(),
              company_domain: form.parentCompany.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
              role_title: 'Parent/Guardian',
              is_active: true,
            });
          }
        } catch (e) { /* non-blocking */ }
      }

      if (refreshUser) { try { await refreshUser(); } catch (e) {} }
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('Profile'); }, 1200);
    } catch (err) {
      console.error('Profile save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const frustEmoji = form.frustration <= 2 ? '😌' : form.frustration <= 4 ? '😐' : form.frustration <= 6 ? '😟' : form.frustration <= 8 ? '😰' : '🆘';
  const frustColor = form.frustration <= 3 ? '#10b981' : form.frustration <= 6 ? '#F59E0B' : '#EF4444';
  const frustPct = ((form.frustration - 1) / 9) * 100;

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
          Keep your career data current so your agent can match you with the right opportunities.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ── Section: Basic Info ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Basic Info</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <input value={form.fullName} onChange={e => update('fullName', e.target.value)}
                placeholder="Your full name" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>School / University</label>
              <SchoolSearchInput value={form.school} onChange={val => update('school', val)} light />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Graduation Year</label>
              <input value={form.gradYear}
                onChange={e => update('gradYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 2026" maxLength={4} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>LinkedIn URL <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input value={form.linkedinUrl} onChange={e => update('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
            </div>
          </div>

          {/* ── Section: Career Focus — single source of truth (career_goals) ── */}
          <CareerFocusCard user={user} onUpdated={() => refreshUser?.()} />

          {/* ── Section: Frustration Level ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Frustration Level</p>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 36, lineHeight: 1 }}>{frustEmoji}</span>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 800, color: frustColor }}>{form.frustration}</span>
                <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT3 }}> /10</span>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <style>{`.frust-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 100px; outline: none; cursor: pointer; background: linear-gradient(to right, ${frustColor} 0%, ${frustColor} ${frustPct}%, #E2E8F0 ${frustPct}%, #E2E8F0 100%); }
              .frust-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: grab; }
              .frust-slider::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2.5px solid ${frustColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: grab; }`}</style>
              <input type="range" min="1" max="10" value={form.frustration}
                onChange={e => update('frustration', Number(e.target.value))}
                className="frust-slider" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>Not at all</span>
              <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>Losing my mind</span>
            </div>
          </div>

          {/* ── Section: Roadblocks ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Your Roadblocks <span style={{ color: TEXT3, fontWeight: 400, textTransform: 'none' }}>(max 2)</span></p>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, marginBottom: 16 }}>These tell your agent which tools to prioritize for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BLOCKERS.map(b => {
                const active = form.blockers.includes(b.key);
                const maxed = form.blockers.length >= 2 && !active;
                return (
                  <button key={b.key} type="button" onClick={() => !maxed && toggleBlocker(b.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    cursor: maxed ? 'default' : 'pointer', minHeight: 'auto',
                    border: `1.5px solid ${active ? TEAL : '#E2E8F0'}`,
                    background: active ? TEAL_LIGHT : '#fff',
                    opacity: maxed ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 18, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? TEAL_LIGHT : '#f8f9ff', borderRadius: 8, border: `1px solid ${TEAL_BORDER}`, flexShrink: 0 }}>{b.icon}</span>
                    <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#065F46' : TEXT2 }}>{b.label}</span>
                    {active && <CheckCircle2 size={18} style={{ color: TEAL }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section: Resume ── */}
          <div style={sectionCard}>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Resume</p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
            {form.resumeUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, flex: 1 }}>Resume on file</p>
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