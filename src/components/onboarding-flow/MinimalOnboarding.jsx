import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { buildCareerGoalsFromOnboarding } from '@/lib/onboardingGoals';
import {
  TOP_SCHOOLS, FONT, BG, CARD, TEXT, TEXT2, TEXT3,
  INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { ArrowRight, Upload, X, GraduationCap, Briefcase, MapPin, FileText, Loader2 } from 'lucide-react';

// Minimal pre-auth onboarding. Collects ONLY what the Magic Moment needs:
// school, target role/industry, preferred location, optional resume.
// No emotional/reflective questions — those move to AFTER the Magic Moment.
// Saves answers to localStorage, triggers Google OAuth, and lands on the
// Magic Moment. Goal: reach the free cycle in under 90 seconds.

const TARGET_CHIPS = ['Marketing', 'Finance', 'Software', 'Sales', 'Operations', "Other / I'm open"];
const LOC_CHIPS = ['Remote', 'Open to relocate'];

const chipBtn = (active) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 600,
  color: active ? '#fff' : INDIGO_DIM,
  background: active ? GRAD_INDIGO : '#fff',
  border: `1.5px solid ${active ? INDIGO : INDIGO_BORDER}`,
  borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto',
  transition: 'all 0.15s',
});

const primaryBtn = (busy) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff',
  background: GRAD_INDIGO, border: 'none', borderRadius: 999,
  padding: '15px 24px', cursor: busy ? 'default' : 'pointer',
  boxShadow: '0 6px 18px rgba(109,40,217,0.35)', opacity: busy ? 0.7 : 1,
});

const inputStyle = {
  width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 15, color: TEXT,
  background: BG, border: `1.5px solid #E2E8F0`, borderRadius: 12, padding: '13px 14px',
  outline: 'none', transition: 'border-color 0.15s',
};
const labelStyle = { fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 };

export default function MinimalOnboarding({ onClose }) {
  const [step, setStep] = useState(1);
  const [school, setSchool] = useState('');
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [chips, setChips] = useState([]);
  const [roleText, setRoleText] = useState('');
  const [city, setCity] = useState('');
  const [locChips, setLocChips] = useState([]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setResumeUrl(file_url);
      setResumeName(file.name);
    } catch (e) {
      setError('Upload failed — you can skip and add it later.');
    }
    setUploading(false);
  };

  const finish = async () => {
    setSaving(true); setError('');
    const schoolValue = notEnrolled ? 'Recent grad / not enrolled' : school.trim();
    const targetRoles = roleText.trim() ? [roleText.trim()] : [];
    const isRemote = locChips.includes('Remote');
    const locationForGoals = isRemote ? 'remote' : city.trim();

    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_college', schoolValue);
      localStorage.setItem('cff_seeking', 'both');
      localStorage.setItem('cff_industries', JSON.stringify(chips));
      localStorage.setItem('cff_target_roles', JSON.stringify(targetRoles));
      if (locationForGoals) localStorage.setItem('cff_location', locationForGoals);
      if (resumeUrl) {
        localStorage.setItem('cff_resume_url', resumeUrl);
        localStorage.setItem('cff_resume_status', 'provided');
        localStorage.setItem('cff_resume_source', 'upload');
        localStorage.setItem('cff_resume_skipped', 'false');
      } else {
        localStorage.setItem('cff_resume_status', 'not_provided');
        localStorage.setItem('cff_resume_skipped', 'true');
      }
    } catch (e) {}

    // If already authenticated, finalize in-place and go straight to the Magic Moment.
    let me = null;
    try { me = await base44.auth.me().catch(() => null); } catch (e) {}
    if (me) {
      try {
        await base44.auth.updateMe({
          persona: 'student', roles: ['student'], onboarding_completed: true, is_new_signup: true,
          school: schoolValue,
          ...(notEnrolled ? {} : { school_code: (deriveSchoolCode(school) || '').toUpperCase() }),
          career_goals: buildCareerGoalsFromOnboarding({ seeking: 'both', industries: chips, targetRoles, location: locationForGoals }),
          ...(locationForGoals ? { location: isRemote ? 'Remote' : locationForGoals } : {}),
          ...(resumeUrl ? { resume_url: resumeUrl, resume_file_url: resumeUrl, resume_uploaded_at: new Date().toISOString(), resume_status: 'provided' } : { resume_status: 'not_provided' }),
        });
      } catch (e) {}
      window.location.hash = '#/MagicMoment';
      window.location.reload();
      return;
    }

    // Unauthenticated → flag funnel done and trigger Google OAuth.
    // GatorAuth finalizes the profile from localStorage, then routes to the Magic Moment.
    try { localStorage.setItem('cff_funnel_completed', 'true'); sessionStorage.setItem('cff_funnel_completed', 'true'); } catch (e) {}
    base44.auth.loginWithProvider('google', window.location.origin + '/#/GatorAuth');
  };

  const canStep2 = chips.length > 0 || roleText.trim().length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', overflowY: 'auto', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={() => { if (onClose) onClose(); }} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, minHeight: 'auto', borderRadius: '50%', background: CARD, border: '1px solid #E2E8F0', color: TEXT2, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: step >= s ? 28 : 8, height: 8, borderRadius: 999, background: step >= s ? GRAD_INDIGO : '#e9d5ff', transition: 'all 0.2s' }} />
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontFamily: FONT }}>{error}</div>
        )}

        {/* STEP 1 — School */}
        {step === 1 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '28px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <GraduationCap size={16} color={INDIGO} />
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1 of 3</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: TEXT, margin: '0 0 6px', lineHeight: 1.25 }}>Where do you go to school?</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 20px' }}>CLIFF uses your school to find alumni connections at the companies you want.</p>
            <label style={labelStyle}>Your school</label>
            <input
              list="min-schools" type="text" value={school} placeholder="Search your university…"
              onChange={(e) => { setSchool(e.target.value); setNotEnrolled(false); }}
              style={inputStyle}
            />
            <datalist id="min-schools">
              {TOP_SCHOOLS.map((s) => <option key={s} value={s} />)}
            </datalist>
            <button
              onClick={() => { setNotEnrolled(true); setSchool(''); }}
              style={{ marginTop: 12, ...chipBtn(notEnrolled) }}
            >
              {notEnrolled ? '✓ Recent grad / not currently enrolled' : 'Recent grad / not currently enrolled'}
            </button>
            <div style={{ marginTop: 28 }}>
              <button
                onClick={() => { if (school.trim() || notEnrolled) { setError(''); setStep(2); } else setError('Pick your school or tap "not currently enrolled".'); }}
                style={primaryBtn(false)}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Target role/industry + location */}
        {step === 2 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '28px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Briefcase size={16} color={INDIGO} />
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 2 of 3</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: TEXT, margin: '0 0 6px', lineHeight: 1.25 }}>What kind of role are you after?</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 18px' }}>Pick a field — add a specific role if you have one in mind.</p>

            <label style={labelStyle}>Target field</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TARGET_CHIPS.map((c) => (
                <button key={c} onClick={() => toggle(chips, setChips, c)} style={chipBtn(chips.includes(c))}>{c}</button>
              ))}
            </div>

            <label style={labelStyle}>Specific role (optional)</label>
            <input type="text" value={roleText} placeholder="e.g. Marketing Intern, Data Analyst…"
              onChange={(e) => setRoleText(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MapPin size={13} color={INDIGO} />
              <label style={{ ...labelStyle, marginBottom: 0 }}>Preferred location</label>
            </div>
            <input type="text" value={city} placeholder="City, State (e.g. Austin, TX)"
              onChange={(e) => setCity(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LOC_CHIPS.map((c) => (
                <button key={c} onClick={() => toggle(locChips, setLocChips, c)} style={chipBtn(locChips.includes(c))}>{c}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button onClick={() => setStep(1)} style={{ ...chipBtn(false), flex: '0 0 auto' }}>← Back</button>
              <button
                onClick={() => { if (canStep2) { setError(''); setStep(3); } else setError('Pick a target field or type a role.'); }}
                style={{ ...primaryBtn(false), flex: 1 }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Optional resume */}
        {step === 3 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '28px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FileText size={16} color={INDIGO} />
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 3 of 3 · Optional</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: TEXT, margin: '0 0 6px', lineHeight: 1.25 }}>Got a resume?</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 18px' }}>Upload it and CLIFF will tailor a version for your first matched job. You can skip this and add it later.</p>

            {!resumeUrl ? (
              <label style={{ display: 'block', border: `2px dashed ${INDIGO_BORDER}`, borderRadius: 14, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: BG }}>
                <input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files?.[0])} />
                {uploading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, color: INDIGO_DIM }}>
                    <Loader2 size={16} className="animate-spin" /> Uploading…
                  </div>
                ) : (
                  <>
                    <Upload size={22} color={INDIGO} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM }}>Tap to upload your resume</span>
                    <span style={{ display: 'block', fontFamily: FONT, fontSize: 12, color: TEXT3, marginTop: 4 }}>PDF, DOC, or TXT</span>
                  </>
                )}
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
                <FileText size={18} color={INDIGO} />
                <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeName}</span>
                <button onClick={() => { setResumeUrl(''); setResumeName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: TEXT3 }}><X size={16} /></button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button onClick={() => setStep(2)} style={{ ...chipBtn(false), flex: '0 0 auto' }}>← Back</button>
              <button onClick={finish} disabled={saving || uploading} style={{ ...primaryBtn(saving || uploading), flex: 1 }}>
                {saving ? <><Loader2 size={16} className="animate-spin" /> Building your plan…</> : <>Find my first job <ArrowRight size={16} /></>}
              </button>
            </div>
            <button onClick={finish} disabled={saving || uploading} style={{ width: '100%', background: 'none', border: 'none', fontFamily: FONT, fontSize: 13, color: TEXT3, cursor: 'pointer', marginTop: 12, minHeight: 'auto' }}>
              Skip resume for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}