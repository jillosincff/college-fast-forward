import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { processReferralMilestone } from '@/functions/processReferralMilestone';
import LiveEngineLoader from './LiveEngineLoader';
import FunnelTransition from './FunnelTransition';
import OnboardingSteps1to4 from './OnboardingSteps1to4';
import OnboardingSteps5to8 from './OnboardingSteps5to8';
import OnboardingSteps9to13 from './OnboardingSteps9to13';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, SHADOW, GREEN,
  saveProgress, loadSavedProgress,
} from './onboardingShared';

export default function OnboardingFlow({ onClose, onAlreadyAuthed, postAuth = false, resumeAtScreen = null }) {
  // Load saved progress for returning users
  const saved = resumeAtScreen ? loadSavedProgress() : null;
  const startScreen = resumeAtScreen || 1;

  const [screen, setScreen] = useState(startScreen);
  const [analyzing, setAnalyzing] = useState(false); // analyzing loader after university
  const [frustration, setFrustration] = useState(saved?.frustration ?? 5);
  const [seeking, setSeeking] = useState(saved?.seeking ?? '');
  const [blockers, setBlockers] = useState(saved?.blockers ?? []);
  const [college, setCollege] = useState(() => {
    if (saved?.college) return saved.college;
    // Pre-fill from the landing page teaser search so students don't retype their school
    try { return localStorage.getItem('cff_teaser_school') || ''; } catch { return ''; }
  });
  const [locationPref, setLocationPref] = useState(saved?.locationPref ?? '');
  const [locationCity, setLocationCity] = useState(saved?.locationCity ?? '');
  const [citySuggestionsClosed, setCitySuggestionsClosed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(saved?.resumeUrl ?? '');
  const [resumeData, setResumeDataRaw] = useState(() => {
    // V1 resume cache: restore parsed/optimized data if the user dropped off
    // earlier (within 24h) so we never re-fire the LLM on return.
    try {
      const raw = localStorage.getItem('cachedResumeData');
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (data && ts && (Date.now() - ts) < 24 * 60 * 60 * 1000) return data;
      localStorage.removeItem('cachedResumeData');
    } catch {}
    return null;
  });
  // Wrap setter so any resume data we produce is cached for 24h (zero server complexity).
  const setResumeData = (data) => {
    setResumeDataRaw(data);
    try {
      if (data) localStorage.setItem('cachedResumeData', JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  };
  const [showPaywall, setShowPaywall] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState('');
  const [quickMajor, setQuickMajor] = useState('');
  const [quickSkills, setQuickSkills] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [dataInputMode, setDataInputMode] = useState('choose');
  const [hoveredExpert, setHoveredExpert] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [analyzingFrustration, setAnalyzingFrustration] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState(saved?.selectedIndustries ?? []);
  const [targetRoles, setTargetRoles] = useState(saved?.targetRoles ?? []);
  const fileRef = useRef();

  const TOTAL = 13;

  const next = () => {
    let newScreen = screen + 1;
    // Skippers have no resume — bypass the Before/After screen (11),
    // which would otherwise render infinite "parsing" spinners.
    if (newScreen === 11 && !resumeData) newScreen = 12;
    saveProgress(newScreen, {
      cff_seeking: seeking,
      cff_college: college,
      cff_frustration: frustration,
      cff_blockers: blockers,
      cff_industries: selectedIndustries,
      cff_target_roles: targetRoles,
      cff_location_pref: locationPref,
      cff_location_city: locationCity,
      cff_resume_url: resumeUrl,
    });
    if (newScreen > 13) {
      if (onClose) onClose();
    } else {
      setScreen(newScreen);
    }
  };
  const back = () => {
    setScreen(s => {
      let prev = Math.max(1, s - 1);
      // Mirror the forward skip: no resume → screen 11 doesn't exist for this user
      if (prev === 11 && !resumeData) prev = 10;
      // Reset screen 9 sub-mode when leaving screen 9 via back
      if (s === 9) setDataInputMode('choose');
      return prev;
    });
  };

  const toggleBlocker = (key) => {
    setBlockers(prev => prev.includes(key) ? prev.filter(k => k !== key) : prev.length < 2 ? [...prev, key] : prev);
  };

  // Fire referral milestone when referee hits the school step
  const fireReferralMilestone = async (schoolName) => {
    try {
      const referrerUserId = localStorage.getItem('cff_referrer_id');
      if (!referrerUserId) return;
      // Build a deterministic hash from a session-stable token (no PII at this point)
      const raw = referrerUserId + '_' + (Date.now() - (Date.now() % 86400000)); // day-bucket
      const msgBuffer = new TextEncoder().encode(raw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      processReferralMilestone({
        referrerUserId,
        refereeEmailHash: hashHex,
        schoolShortName: schoolName || '',
      }).catch(() => {}); // fire-and-forget — never block the UI
    } catch {}
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Note: a fresh upload is ALWAYS parsed — the 24h cache only restores
    // state for drop-off returns (handled at state init), never new files.
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setResumeUrl(file_url);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a resume parser. Analyze this resume file and return TWO versions.
CRITICAL RULES:
- Extract the REAL person's name exactly as it appears at the top of the resume. Do NOT use placeholders like "John Doe" or "Jane Smith".
- If you cannot clearly read the name, return an empty string for name — never guess or fabricate.
- All fields must be plain string values, NOT nested objects or JSON strings.
- Do NOT invent or change any content except for "optimized_experience" bullets.

1. "original": Extract EXACT content — name, contact info, education, experience with original bullets, skills, activities.
2. "optimized_experience": Same experience entries but bullet points rewritten to be stronger, results-oriented, ATS-friendly. Keep company names, titles, dates, locations EXACTLY the same.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            original: {
              type: 'object',
              properties: {
                name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
                linkedin: { type: 'string' }, location: { type: 'string' }, summary: { type: 'string' },
                education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
                experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
                skills: { type: 'array', items: { type: 'string' } },
                activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
              }
            },
            optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
          }
        }
      });
      // Safely parse: if original is a string (LLM returned raw JSON string), parse it
      let parsed = result.original;
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch {} }
      // Sanitize each field: if any top-level field is an object or stringified JSON, extract string value
      if (parsed && typeof parsed === 'object') {
        ['name','email','phone','linkedin','location','summary'].forEach(k => {
          if (parsed[k]) {
            if (typeof parsed[k] === 'object') {
              parsed[k] = parsed[k].value || parsed[k].text || JSON.stringify(parsed[k]);
            }
            // If it's a string that looks like JSON, try to extract the actual value
            if (typeof parsed[k] === 'string' && parsed[k].startsWith('{')) {
              try {
                const nested = JSON.parse(parsed[k]);
                parsed[k] = nested[k] || nested.name || nested.value || nested.text || parsed[k];
              } catch {}
            }
          }
        });
      }
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience } });
      setUploading(false);
      next();
      return;
      } catch (err) {
      setUploading(false);
      next();
      return;
      }
    setUploading(false);
  };

  const saveAndAuth = async (planType) => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_onboarding_questions_pending', 'true');
      // Clear resume screen tracker — onboarding is now complete
      localStorage.removeItem('cff_onboarding_screen');
      if (college) localStorage.setItem('cff_college', college);
      if (seeking) localStorage.setItem('cff_seeking', seeking);
      if (blockers.length) localStorage.setItem('cff_blockers', JSON.stringify(blockers));
      if (selectedIndustries.length) localStorage.setItem('cff_industries', JSON.stringify(selectedIndustries));
      if (targetRoles.length) localStorage.setItem('cff_target_roles', JSON.stringify(targetRoles));
      if (frustration) localStorage.setItem('cff_frustration', String(frustration));
      if (resumeUrl) localStorage.setItem('cff_resume_url', resumeUrl);
      const loc = locationPref === 'remote' ? 'remote' : locationCity;
      if (loc) localStorage.setItem('cff_location', loc);
      if (planType === 'free') localStorage.setItem('cff_plan_type', 'free');
      // Zeigarnik close: surface an "unfinished draft" card on first dashboard visit
      localStorage.setItem('cff_first_draft_pending', 'true');
      if (blockers.includes('no_direction')) localStorage.setItem('cff_career_unsure', 'true');
      
      // CRITICAL: Update user profile with persona if already authenticated
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          await base44.auth.updateMe({
              persona: 'student',
              roles: ['student'],
              onboarding_completed: true,
              school: college || '',
              // Use the canonical name→code map (matches ParentNetworkProfile codes like "UF").
              // Unknown schools get '' — the validateOnboardingSchoolCode automation alerts on those.
              school_code: (deriveSchoolCode(college) || '').toUpperCase(),
              career_blockers: blockers,
            });
        }
      } catch (updateErr) {
        console.warn('Failed to update user persona during onboarding:', updateErr);
      }
    } catch (e) {}
    // Deterministic routing: if the user is ALREADY authenticated, never trigger
    // an OAuth round-trip — push them straight to their destination.
    let alreadyAuthed = false;
    try { alreadyAuthed = !!(await base44.auth.me().catch(() => null)); } catch {}

    if (postAuth || onAlreadyAuthed || alreadyAuthed) {
      if (planType === 'free') {
        window.location.hash = '#/FreeTierDashboard';
      } else {
        if (onAlreadyAuthed) onAlreadyAuthed();
        else if (onClose) onClose();
      }
    } else {
      // Only unauthenticated users get routed through Google OAuth.
      const redirectPath = planType === 'free' ? '/#/FreeTierDashboard' : '/#/GatorAuth';
      base44.auth.loginWithProvider('google', window.location.origin + redirectPath);
    }
  };

  const isFullPageScreen = screen >= 11;
  const rawName = resumeData?.original?.name;
  const authFirstName = (() => {
    try { return sessionStorage.getItem('cff_auth_first_name') || null; } catch { return null; }
  })();
  // Guard against LLM placeholder names like "John Doe", "Jane Smith", "Name Surname"
  const PLACEHOLDER_NAMES = ['john doe', 'jane doe', 'jane smith', 'john smith', 'name surname', 'first last', 'your name'];
  const resumeFirstName = (() => {
    if (typeof rawName !== 'string' || !rawName.trim()) return null;
    if (PLACEHOLDER_NAMES.includes(rawName.trim().toLowerCase())) return null;
    return rawName.split(' ')[0] || null;
  })();
  const firstName = resumeFirstName || authFirstName || null;

  const shell = {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: BG,
    opacity: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: isFullPageScreen ? '60px 20px 60px' : '100px 20px 80px',
    fontFamily: FONT,
    overflowY: 'auto',
    overflowX: 'hidden',
    isolation: 'isolate',
  };

  // Card wrapper for screens 1–8
  const card = { textAlign: 'center', maxWidth: 560, width: '100%' };

  // Heading styles for screens 1–8
  const h1style = {
    fontFamily: FONT, fontSize: 'clamp(24px, 4vw, 38px)',
    fontWeight: 800, color: TEXT, lineHeight: 1.15,
    letterSpacing: '-0.03em', margin: '0 0 14px',
  };
  const substyle = {
    fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 16px)',
    color: TEXT2, lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 440,
  };

  return (
    <div style={shell}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94A3B8; }
        /* Mobile: ensure single column, generous side padding */
        @media (max-width: 640px) {
          .onb-card { padding: 0 4px !important; }
          .onb-h1 { font-size: clamp(22px, 6vw, 32px) !important; }
          .onb-body { font-size: 16px !important; line-height: 1.6 !important; }
          .onb-btn-primary { padding: 18px 28px !important; font-size: 16px !important; min-height: 56px !important; }
          .onb-option-btn { padding: 16px !important; min-height: 56px !important; }
          .blocker-card-list { gap: 14px !important; }
        }
      `}</style>

      {/* ── Close Button ── */}
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, minHeight: 'auto', borderRadius: '50%', background: CARD, border: '1px solid #E2E8F0', color: TEXT2, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW }}>✕</button>

      {/* Welcome back banner intentionally removed */}

      {/* ── Analyzing Loader (postAuth only) ── */}
      {analyzing && (
        <div style={{ textAlign: 'center', maxWidth: 520, width: '100%', animation: 'fadeUp 0.3s ease' }}>
          <LiveEngineLoader />
        </div>
      )}



      {/* ── Progress Bar (screens 1–8, or postAuth steps) ── */}
      {!analyzing && screen < 10 && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E2E8F0' }}>
            <div style={{ height: '100%', width: `${(screen / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: FONT, fontSize: 12, color: TEXT3, fontWeight: 600 }}>
            {screen} / {TOTAL}
          </div>
        </>
      )}

      {/* ── Screen Transition Wrapper ── */}
      {!analyzing && <FunnelTransition screenKey={screen}>

        <OnboardingSteps1to4
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle} card={card}
          hoveredExpert={hoveredExpert} setHoveredExpert={setHoveredExpert}
          selectedExpert={selectedExpert} setSelectedExpert={setSelectedExpert}
          blockers={blockers}
          frustration={frustration} setFrustration={setFrustration}
          analyzingFrustration={analyzingFrustration} setAnalyzingFrustration={setAnalyzingFrustration}
          seeking={seeking} setSeeking={setSeeking}
        />

        <OnboardingSteps5to8
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle} card={card}
          selectedIndustries={selectedIndustries} setSelectedIndustries={setSelectedIndustries}
          targetRoles={targetRoles} setTargetRoles={setTargetRoles}
          blockers={blockers} toggleBlocker={toggleBlocker}
          college={college} setCollege={setCollege} fireReferralMilestone={fireReferralMilestone}
          locationPref={locationPref} setLocationPref={setLocationPref}
          locationCity={locationCity} setLocationCity={setLocationCity}
          citySuggestionsClosed={citySuggestionsClosed} setCitySuggestionsClosed={setCitySuggestionsClosed}
        />

        <OnboardingSteps9to13
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle}
          fileRef={fileRef} handleFileUpload={handleFileUpload}
          uploading={uploading} setUploading={setUploading}
          dataInputMode={dataInputMode} setDataInputMode={setDataInputMode}
          college={college} seeking={seeking} selectedIndustries={selectedIndustries}
          linkedinInput={linkedinInput} setLinkedinInput={setLinkedinInput} setResumeData={setResumeData}
          quickMajor={quickMajor} setQuickMajor={setQuickMajor}
          quickSkills={quickSkills} setQuickSkills={setQuickSkills}
          quickRole={quickRole} setQuickRole={setQuickRole}
          firstName={firstName} resumeData={resumeData}
          targetRoles={targetRoles} locationCity={locationCity} locationPref={locationPref}
          blockers={blockers} saveAndAuth={saveAndAuth}
          showPaywall={showPaywall} setShowPaywall={setShowPaywall}
          frustration={frustration}
        />

      </FunnelTransition>}
    </div>
  );
}