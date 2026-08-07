import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { buildLocationPayload, buildLocationMemories, normalizeLocation } from '@/lib/locationPrefs';
import { buildCareerGoalsFromOnboarding } from '@/lib/onboardingGoals';
import { processReferralMilestone } from '@/functions/processReferralMilestone';
import { saveParsedResume } from '@/lib/resumeText';
import LiveEngineLoader from './LiveEngineLoader';
import FunnelTransition from './FunnelTransition';
import OnboardingSteps1to4 from './OnboardingSteps1to4';
import OnboardingSteps5to8 from './OnboardingSteps5to8';
import OnboardingSteps9to13 from './OnboardingSteps9to13';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, SHADOW, GREEN,
  saveProgress, loadSavedProgress,
} from './onboardingShared';
import { saveServerProgress, loadServerProgress } from './serverProgress';

/**
 * The agent-hiring flow — 11 screens:
 * 1 Meet CLIFF · 2 Goal · 3 School · 4 Year · 5 Career interest ·
 * 6 Ideal opportunity · 7 Work location · 8 One priority · 9 Resume ·
 * 10 Reveal · 11 Our plan
 */
export default function OnboardingFlow({ onClose, onAlreadyAuthed, postAuth = false, resumeAtScreen = null }) {
  // Load saved progress for returning users. Positions saved by the old
  // 13-screen flow (or anything out of range) restart cleanly at 1.
  const saved = resumeAtScreen ? loadSavedProgress() : null;
  // Start on the first real question (screen 2 = "What are we working toward?").
  // Screen 1 ("Meet CLIFF") was a zero-input intro wall that caused 80% of
  // in-flow abandonment — students closed it instead of clicking through.
  const startScreen = (resumeAtScreen && resumeAtScreen >= 2 && resumeAtScreen <= 11) ? resumeAtScreen : 2;

  const [screen, setScreen] = useState(startScreen);
  const [analyzing, setAnalyzing] = useState(false);
  const [seeking, setSeeking] = useState(saved?.seeking ?? '');
  const [blockers, setBlockers] = useState(saved?.blockers ?? []);
  const [college, setCollege] = useState(() => {
    if (saved?.college) return saved.college;
    // Pre-fill from the landing page teaser search so students don't retype their school
    try { return localStorage.getItem('cff_teaser_school') || ''; } catch { return ''; }
  });
  const [yearLevel, setYearLevel] = useState(saved?.yearLevel ?? '');
  const [goalText, setGoalText] = useState(saved?.goalText ?? '');
  const [locationPref, setLocationPref] = useState(saved?.locationPref ?? '');
  const [locationCity, setLocationCity] = useState(saved?.locationCity ?? '');
  const [workLocation, setWorkLocation] = useState(saved?.workLocation ?? { types: [], locations: [], flexibility: '' });
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
  // Mirrors resumeData synchronously — next() is called in the same tick as
  // setResumeData(), before the state update re-renders, so reading the
  // `resumeData` closure there would still see the old (null) value and
  // wrongly skip the reveal screen (10) even after a successful parse.
  const hasResumeRef = useRef(!!resumeData);
  // Wrap setter so any resume data we produce is cached for 24h (zero server complexity).
  const setResumeData = (data) => {
    setResumeDataRaw(data);
    hasResumeRef.current = !!data;
    try {
      if (data) localStorage.setItem('cachedResumeData', JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  };
  const [showPaywall, setShowPaywall] = useState(false);
  const [quickMajor, setQuickMajor] = useState('');
  const [quickSkills, setQuickSkills] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [dataInputMode, setDataInputMode] = useState('choose');
  const [selectedIndustries, setSelectedIndustries] = useState(saved?.selectedIndustries ?? []);
  const [targetRoles, setTargetRoles] = useState(saved?.targetRoles ?? []);
  const fileRef = useRef();
  const [resumeSkipped, setResumeSkipped] = useState(false);

  // Fire-and-forget resume-funnel analytics
  const trackResume = (event_name, props = {}) => {
    base44.functions.invoke('logAnalyticsEvent', {
      event_name,
      properties: {
        year: yearLevel || '', seeking: seeking || '',
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        ...props,
      },
    }).catch(() => {});
  };

  // "Skip for now" confirmed — advance without a resume, keeping every prior answer
  const confirmResumeSkip = () => {
    setResumeSkipped(true);
    setDataInputMode('choose');
    next();
  };

  // Screen 1 (Meet CLIFF intro) is skipped, so the visible flow is 10 steps.
  // Internal screen numbers stay 2–11; display offset by 1 so the bar reads 1/10 → 10/10.
  const TOTAL = 10;
  const displayStep = screen - 1;

  // ── Abandonment event tracking ──────────────────────────────────────────
  const screenRef = useRef(startScreen);
  screenRef.current = screen;
  const completedRef = useRef(false); // set when saveAndAuth runs — never an abandonment
  const abandonLoggedRef = useRef(false); // log at most once per flow instance

  const logAbandonment = (reason) => {
    if (completedRef.current || abandonLoggedRef.current) return;
    abandonLoggedRef.current = true;
    try {
      // Stable anonymous id — most students aren't authenticated during onboarding
      let anonId = localStorage.getItem('cff_anon_id');
      if (!anonId) {
        anonId = Math.random().toString(36).slice(2, 12);
        localStorage.setItem('cff_anon_id', anonId);
      }
      const s = screenRef.current;
      base44.functions.invoke('logAnalyticsEvent', {
        event_name: 'onboarding_step_abandoned',
        anonymous_id: anonId,
        properties: { screen: s, step: s, reason },
      }).catch(() => {});
    } catch {}
  };

  // Restore progress from the account when this browser has none (new device,
  // cleared storage). Local progress always wins — it's the more recent source.
  useEffect(() => {
    let cancelled = false;
    const hasLocal = (() => {
      try { return !!localStorage.getItem('cff_onboarding_screen'); } catch { return false; }
    })();
    if (hasLocal) return;

    loadServerProgress().then((saved) => {
      if (cancelled || !saved) return;
      if (saved.seeking) setSeeking(saved.seeking);
      if (saved.college) setCollege(saved.college);
      if (saved.yearLevel) setYearLevel(saved.yearLevel);
      if (saved.goalText) setGoalText(saved.goalText);
      if (saved.blockers) setBlockers(saved.blockers);
      if (saved.selectedIndustries) setSelectedIndustries(saved.selectedIndustries);
      if (saved.targetRoles) setTargetRoles(saved.targetRoles);
      if (saved.locationPref) setLocationPref(saved.locationPref);
      if (saved.locationCity) setLocationCity(saved.locationCity);
      if (saved.workLocation) setWorkLocation(saved.workLocation);
      if (saved.resumeUrl) setResumeUrl(saved.resumeUrl);
      if (saved.screen >= 2 && saved.screen <= 11) setScreen(saved.screen);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // pagehide = real navigation away / tab close (does NOT fire on tab switch)
    const onPageHide = () => logAbandonment('left_page');
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  // Resume-funnel step views
  useEffect(() => {
    if (screen === 9) trackResume('onboarding_resume_step_viewed');
    if (screen === 10 && resumeData) trackResume('onboarding_resume_insight_viewed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Carry forward any location CLIFF already extracted from the ideal-opportunity
  // free text — never ask the student to repeat themselves.
  useEffect(() => {
    if (screen !== 7 || workLocation.types.length) return;
    const prefill = { types: [], locations: [], flexibility: '' };
    if (locationCity) {
      const rec = normalizeLocation(locationCity);
      if (rec) { prefill.types.push('specific_locations'); prefill.locations.push(rec); }
    }
    if (locationPref === 'remote') prefill.types.push('remote');
    if (prefill.types.length) setWorkLocation(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const next = () => {
    let newScreen = screen + 1;
    // Skippers have no resume — bypass the reveal screen (10),
    // which would otherwise render infinite "parsing" spinners.
    if (newScreen === 10 && !hasResumeRef.current) newScreen = 11;
    const answers = {
      cff_seeking: seeking,
      cff_college: college,
      cff_year: yearLevel,
      cff_goal_text: goalText,
      cff_blockers: blockers,
      cff_industries: selectedIndustries,
      cff_target_roles: targetRoles,
      cff_location_pref: locationPref,
      cff_location_city: locationCity,
      cff_work_location: workLocation,
      cff_resume_url: resumeUrl,
    };
    saveProgress(newScreen, answers);
    // Authenticated users also keep their progress on their account, so a return
    // visit on any device picks up where they left off.
    saveServerProgress(newScreen, answers);
    if (newScreen > 11) {
      if (onClose) onClose();
    } else {
      setScreen(newScreen);
    }
  };
  const back = () => {
    setScreen(s => {
      let prev = Math.max(1, s - 1);
      // Mirror the forward skip: no resume → reveal (10) doesn't exist for this user
      if (prev === 10 && !hasResumeRef.current) prev = 9;
      // Reset resume screen sub-mode when leaving via back
      if (s === 9) setDataInputMode('choose');
      return prev;
    });
  };

  // Single-select — "If I could solve ONE thing first…"
  const selectBlocker = (key) => setBlockers([key]);

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
    e.target.value = ''; // allow re-selecting the same file after a failure
    // Client-side guardrails: supported formats + size limit (shown on the step)
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext) || file.size > 10 * 1024 * 1024) {
      trackResume('onboarding_resume_parse_failed', { reason: file.size > 10 * 1024 * 1024 ? 'too_large' : 'unsupported_format' });
      setDataInputMode('failed');
      return;
    }
    // Note: a fresh upload is ALWAYS parsed — the 24h cache only restores
    // state for drop-off returns (handled at state init), never new files.
    trackResume('onboarding_resume_upload_started');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setResumeUrl(file_url);
      trackResume('onboarding_resume_upload_completed');
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
      // A filename alone is never proof of parsing — require real extracted content
      const hasContent = parsed && typeof parsed === 'object' &&
        (parsed.experience?.length || parsed.education?.length || parsed.skills?.length || (parsed.summary || '').trim());
      if (!hasContent) throw new Error('no_extractable_text');
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience } });
      // Persist the parse. Authenticated students get a Resume record now; everyone
      // else has it stashed and saved by GatorAuth after the OAuth round-trip.
      // Without this the parsed text dies with the browser session and CLIFF can
      // never tailor anything for them.
      try { localStorage.setItem('cff_resume_parsed', JSON.stringify(parsed)); } catch {}
      try { localStorage.setItem('cff_resume_filename', file.name || ''); } catch {}
      try {
        const authed = await base44.auth.me().catch(() => null);
        if (authed?.email) await saveParsedResume(base44, authed.email, parsed, file_url, file.name);
      } catch (saveErr) { console.warn('Resume save failed:', saveErr); }
      trackResume('onboarding_resume_parse_succeeded');
      setUploading(false);
      setDataInputMode('choose');
      next();
      return;
    } catch (err) {
      // Never lose progress — show recovery options instead of silently advancing
      trackResume('onboarding_resume_parse_failed', { reason: err?.message || 'parse_error' });
      setUploading(false);
      setDataInputMode('failed');
      return;
    }
  };

  const saveAndAuth = async (planType) => {
    // Mark completed BEFORE any redirect — the OAuth round-trip fires pagehide
    completedRef.current = true;
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_onboarding_questions_pending', 'true');
      // Clear resume screen tracker — onboarding is now complete
      localStorage.removeItem('cff_onboarding_screen');
      if (college) localStorage.setItem('cff_college', college);
      if (seeking) localStorage.setItem('cff_seeking', seeking);
      if (yearLevel) localStorage.setItem('cff_year', yearLevel);
      if (goalText) localStorage.setItem('cff_goal_text', goalText);
      if (blockers.length) localStorage.setItem('cff_blockers', JSON.stringify(blockers));
      if (selectedIndustries.length) localStorage.setItem('cff_industries', JSON.stringify(selectedIndustries));
      if (targetRoles.length) localStorage.setItem('cff_target_roles', JSON.stringify(targetRoles));
      if (resumeUrl) localStorage.setItem('cff_resume_url', resumeUrl);
      // Resume capture state — also read by GatorAuth's post-OAuth profile finalization
      const resumeStatus = resumeData ? 'ready' : 'not_provided';
      const resumeSource = resumeData
        ? (resumeData.isQuickStart ? 'built_with_cliff' : resumeData.isPasted ? 'pasted_text' : 'upload')
        : '';
      localStorage.setItem('cff_resume_status', resumeStatus);
      localStorage.setItem('cff_resume_source', resumeSource);
      localStorage.setItem('cff_resume_skipped', resumeSkipped ? 'true' : 'false');
      const loc = locationPref === 'remote' ? 'remote' : locationCity;
      if (loc) localStorage.setItem('cff_location', loc);
      // Structured work-location preferences — used by ranking + carried through OAuth
      const locPayload = buildLocationPayload(workLocation);
      try { localStorage.setItem('cff_location_prefs', JSON.stringify(locPayload)); } catch {}
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
              academic_year: yearLevel || '',
              career_blockers: blockers,
              resume_status: resumeStatus,
              resume_source: resumeSource,
              onboarding_resume_skipped: resumeSkipped,
              onboarding_resume_step_completed: true,
              ...(resumeUrl ? { resume_file_url: resumeUrl, resume_url: resumeUrl, resume_uploaded_at: new Date().toISOString() } : {}),
              ...locPayload,
              // Canonical search preferences — the same field the Edit Goals
              // modal and job searches read. Without this, the profile's
              // "My Search Preferences" section showed blank after onboarding.
              career_goals: buildCareerGoalsFromOnboarding({ seeking, industries: selectedIndustries, targetRoles, location: loc }),
              ...(loc ? { location: loc === 'remote' ? 'Remote' : loc } : {}),
            });
          // Explicit location statements → high-confidence CLIFF memories
          try {
            const locMems = buildLocationMemories(workLocation, currentUser.email);
            if (locMems.length) await base44.entities.StudentMemory.bulkCreate(locMems);
          } catch (memErr) {}
          // Event tracking: student profile onboarding completion (fire-and-forget)
          base44.functions.invoke('logAnalyticsEvent', {
            event_name: 'student_onboarding_completed',
            properties: {
              school: college || '',
              plan_type: planType || '',
              seeking: seeking || '',
              year: yearLevel || '',
              blockers_count: blockers.length,
              has_resume: !!resumeUrl,
              resume_status: resumeStatus,
              resume_skipped: resumeSkipped,
            },
          }).catch(() => {});
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
        // Full reload — the in-memory auth context still has the PRE-onboarding
        // user (no persona), so a plain hash change gets bounced by
        // OnboardingGuard back to GatorAuth → onboarding screen 1 (the
        // "Meet CLIFF" loop). Reloading re-fetches the updated user.
        window.location.hash = '#/FreeTierDashboard';
        window.location.reload();
      } else {
        if (onAlreadyAuthed) onAlreadyAuthed();
        else if (onClose) onClose();
      }
    } else {
      // Only unauthenticated users get routed through Google OAuth.
      // Flag that the funnel is DONE — after OAuth, GatorAuth finalizes the
      // profile from the saved answers instead of restarting onboarding.
      try { localStorage.setItem('cff_funnel_completed', 'true'); sessionStorage.setItem('cff_funnel_completed', 'true'); } catch {}
      const redirectPath = planType === 'free' ? '/#/FreeTierDashboard' : '/#/GatorAuth';
      base44.auth.loginWithProvider('google', window.location.origin + redirectPath);
    }
  };

  const isFullPageScreen = screen === 10; // resume reveal is full-page
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

  const card = { textAlign: 'center', maxWidth: 560, width: '100%' };

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
        input::placeholder, textarea::placeholder { color: #94A3B8; }
        /* Mobile: ensure single column, generous side padding */
        @media (max-width: 640px) {
          .onb-card { padding: 0 4px !important; }
          .onb-h1 { font-size: clamp(22px, 6vw, 32px) !important; }
          .onb-body { font-size: 16px !important; line-height: 1.6 !important; }
          .onb-btn-primary { padding: 18px 28px !important; font-size: 16px !important; min-height: 56px !important; }
          .onb-option-btn { padding: 16px !important; min-height: 56px !important; }
          .blocker-card-list { gap: 14px !important; }
          /* Before/After resume comparison stacks vertically on phones */
          .onb-ba-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Close Button ── */}
      <button onClick={() => { logAbandonment('closed_flow'); if (onClose) onClose(); }} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, minHeight: 'auto', borderRadius: '50%', background: CARD, border: '1px solid #E2E8F0', color: TEXT2, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW }}>✕</button>

      {/* ── Analyzing Loader (postAuth only) ── */}
      {analyzing && (
        <div style={{ textAlign: 'center', maxWidth: 520, width: '100%', animation: 'fadeUp 0.3s ease' }}>
          <LiveEngineLoader />
        </div>
      )}

      {/* ── Progress Bar ── */}
      {!analyzing && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E2E8F0' }}>
            <div style={{ height: '100%', width: `${(displayStep / TOTAL) * 100}%`, background: GREEN, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: FONT, fontSize: 12, color: TEXT3, fontWeight: 600 }}>
            {displayStep} / {TOTAL}
          </div>
        </>
      )}

      {/* ── Screen Transition Wrapper ── */}
      {!analyzing && <FunnelTransition screenKey={screen}>

        <OnboardingSteps1to4
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle} card={card}
          seeking={seeking} setSeeking={setSeeking}
        />

        <OnboardingSteps5to8
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle}
          college={college} setCollege={setCollege} fireReferralMilestone={fireReferralMilestone}
          yearLevel={yearLevel} setYearLevel={setYearLevel}
          selectedIndustries={selectedIndustries} setSelectedIndustries={setSelectedIndustries}
          targetRoles={targetRoles} setTargetRoles={setTargetRoles}
          goalText={goalText} setGoalText={setGoalText}
          setLocationPref={setLocationPref} setLocationCity={setLocationCity}
          seeking={seeking} workLocation={workLocation} setWorkLocation={setWorkLocation}
        />

        <OnboardingSteps9to13
          screen={screen} next={next} back={back}
          h1style={h1style} substyle={substyle}
          fileRef={fileRef} handleFileUpload={handleFileUpload}
          uploading={uploading} setUploading={setUploading}
          dataInputMode={dataInputMode} setDataInputMode={setDataInputMode}
          college={college} seeking={seeking} selectedIndustries={selectedIndustries}
          setResumeData={setResumeData}
          quickMajor={quickMajor} setQuickMajor={setQuickMajor}
          quickSkills={quickSkills} setQuickSkills={setQuickSkills}
          quickRole={quickRole} setQuickRole={setQuickRole}
          firstName={firstName} resumeData={resumeData}
          yearLevel={yearLevel}
          onSkipConfirm={confirmResumeSkip} trackResume={trackResume}
          blockers={blockers} selectBlocker={selectBlocker}
          targetRoles={targetRoles} locationCity={locationCity} locationPref={locationPref}
          saveAndAuth={saveAndAuth}
          showPaywall={showPaywall} setShowPaywall={setShowPaywall}
        />

      </FunnelTransition>}
    </div>
  );
}