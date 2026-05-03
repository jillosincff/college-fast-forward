import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { deriveSchoolCode } from '@/lib/schoolNames';
import { useOnboardingProgress } from '@/lib/useOnboardingProgress';
import { useAlumniSearch } from '@/lib/useAlumniSearch';
import { logAnalyticsEvent } from '@/functions/logAnalyticsEvent';

import ProgressHeader from '@/components/onboarding-v2/ProgressHeader';
import WelcomeScreen from '@/components/onboarding-v2/WelcomeScreen';
import SchoolStep from '@/components/onboarding-v2/SchoolStep';
import ChipQuestion from '@/components/onboarding-v2/ChipQuestion';
import MirrorCard from '@/components/onboarding-v2/MirrorCard';
import Act2Transition from '@/components/onboarding-v2/Act2Transition';
import AlumniDemoSearch from '@/components/onboarding-v2/AlumniDemoSearch';
import OutreachDraftPreview from '@/components/onboarding-v2/OutreachDraftPreview';
import AhaScreen from '@/components/onboarding-v2/AhaScreen';
import PersonalizedSummary from '@/components/onboarding-v2/PersonalizedSummary';
import CommitmentScreen from '@/components/onboarding-v2/CommitmentScreen';
import FastIQPaywallScreen from '@/components/onboarding-v2/FastIQPaywallScreen';
import { BG } from '@/components/onboarding-v2/theme';

/* ── Screen catalog ──
 * Each entry knows its act and how it counts in that act's progress.
 * The catalog is the single source of truth for ordering — when re-arranging
 * the funnel, edit it here and nothing else needs to move.
 */
const SCREEN_WELCOME = 'welcome';
const SCREEN_SCHOOL = 'school';
const SCREEN_Q_CHALLENGE = 'q_challenge';
const SCREEN_MIRROR_1 = 'mirror_1';
const SCREEN_Q_ROLES = 'q_roles';
const SCREEN_Q_COMPANIES = 'q_companies';
const SCREEN_Q_INTROS = 'q_intros';
const SCREEN_Q_UNLOCK = 'q_unlock';
const SCREEN_MIRROR_2 = 'mirror_2';
const SCREEN_ACT2_INTRO = 'act2_intro';
const SCREEN_SEARCH = 'search';
const SCREEN_DRAFT = 'draft';
const SCREEN_AHA = 'aha';
const SCREEN_SUMMARY = 'summary';
const SCREEN_COMMIT = 'commit';
const SCREEN_PAYWALL = 'paywall';

const FLOW = [
  { key: SCREEN_WELCOME, act: 1 },
  { key: SCREEN_SCHOOL, act: 1 },
  { key: SCREEN_Q_CHALLENGE, act: 1 },
  { key: SCREEN_MIRROR_1, act: 1 },
  { key: SCREEN_Q_ROLES, act: 1 },
  { key: SCREEN_Q_COMPANIES, act: 1 },
  { key: SCREEN_Q_INTROS, act: 1 },
  { key: SCREEN_Q_UNLOCK, act: 1 },
  { key: SCREEN_MIRROR_2, act: 1 },
  { key: SCREEN_ACT2_INTRO, act: 2 },
  { key: SCREEN_SEARCH, act: 2 },
  { key: SCREEN_DRAFT, act: 2 },
  { key: SCREEN_AHA, act: 2 },
  { key: SCREEN_SUMMARY, act: 3 },
  { key: SCREEN_COMMIT, act: 3 },
  { key: SCREEN_PAYWALL, act: 3 },
];

const ACT_TOTALS = FLOW.reduce((acc, s) => {
  acc[s.act] = (acc[s.act] || 0) + 1;
  return acc;
}, {});

const SCHOOL_LIKE_COMPANIES = ['Google', 'Disney', 'JPMorgan', 'Deloitte', 'Apple', 'Meta', 'Goldman Sachs', 'McKinsey', 'Microsoft', 'Bain', 'BCG'];

const CHALLENGE_OPTIONS = [
  { value: 'no_network', label: "I don't have a network", emoji: '🪢' },
  { value: 'cold_apps', label: 'Cold apps go nowhere', emoji: '🧊' },
  { value: 'unsure_target', label: "I don't know what I want", emoji: '🧭' },
  { value: 'imposter', label: 'I feel like an imposter', emoji: '🫥' },
];

const ROLE_OPTIONS = [
  { label: 'Marketing', emoji: '📣' },
  { label: 'Finance / Banking', emoji: '💰' },
  { label: 'Consulting', emoji: '📊' },
  { label: 'Tech / Engineering', emoji: '💻' },
  { label: 'Product Management', emoji: '🧩' },
  { label: 'Sports / Entertainment', emoji: '🏟️' },
  { label: 'Healthcare', emoji: '🩺' },
  { label: 'Startups', emoji: '🚀' },
  { value: 'unsure', label: 'Not sure yet', emoji: '🤷' },
];

const INTROS_OPTIONS = [
  { value: '0', label: 'Zero', emoji: '🫥' },
  { value: '1_2', label: '1 or 2', emoji: '🤝' },
  { value: '3_5', label: '3 to 5', emoji: '🎯' },
  { value: '6_plus', label: '6 or more', emoji: '⭐' },
];

const UNLOCK_OPTIONS = [
  { value: 'referral', label: 'A referral', emoji: '🚪' },
  { value: 'advice', label: 'Real career advice', emoji: '🧠' },
  { value: 'foot_in_door', label: 'A foot in the door', emoji: '🦶' },
  { value: 'confidence', label: 'Confidence', emoji: '🔥' },
];

const formatCompanyList = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    return raw.split(',').map(c => c.trim()).filter(Boolean);
  }
  return [];
};

export default function StudentOnboardingV2() {
  const { user, refreshUser, isLoadingAuth } = useAuth();
  const params = useParams();
  const entry = params.entry === 'invited' ? 'invited' : 'self';
  const parentNameFromInvite = params.parent || '';
  const prefilledSchool = params.school || '';

  const { step, answers, hydrated, setStep, setAnswer, reset } = useOnboardingProgress(user);
  const [signingIn, setSigningIn] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pickedAlum, setPickedAlum] = useState(null);

  const screenKey = FLOW[step]?.key || SCREEN_WELCOME;
  const act = FLOW[step]?.act || 1;
  const actTotal = ACT_TOTALS[act];
  const screenInAct = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= step; i += 1) {
      if (FLOW[i]?.act === act) count += 1;
    }
    return count;
  }, [step, act]);

  // Load fonts (mirror existing onboarding behavior).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('onb-v2-fonts')) return;
    const link = document.createElement('link');
    link.id = 'onb-v2-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
    document.head.appendChild(link);
  }, []);

  // If returning user has finished onboarding, jump them to the right home.
  useEffect(() => {
    if (!user) return;
    if (user.onboarding_completed) {
      const isParent = user.persona === 'parent' || user.roles?.includes('parent');
      if (isParent) navigate('ParentHome');
      else if (user.persona === 'alumni') navigate('AlumniHome');
      else navigate('FreeTierDashboard');
    }
  }, [user]);

  // Pre-fill from the invited link when the user lands on the school step.
  useEffect(() => {
    if (!hydrated) return;
    if (prefilledSchool && !answers.school) setAnswer('school', prefilledSchool);
    if (parentNameFromInvite && !answers.invitedBy) setAnswer('invitedBy', parentNameFromInvite);
  }, [hydrated, prefilledSchool, parentNameFromInvite, answers.school, answers.invitedBy, setAnswer]);

  // After OAuth completes the user lands back on the welcome screen — auto-advance.
  useEffect(() => {
    if (!hydrated) return;
    if (screenKey === SCREEN_WELCOME && user) {
      const firstFromName = user.full_name?.split(' ')[0];
      if (firstFromName && !answers.firstName) setAnswer('firstName', firstFromName);
      // Don't auto-advance; let the user actively tap the "I'm ready" button.
    }
     
  }, [hydrated, user, screenKey]);

  // Analytics for every screen.
  useEffect(() => {
    if (!hydrated) return;
    logAnalyticsEvent({
      event_name: 'onboarding_v2_screen_view',
      properties: { screen: screenKey, screen_index: step, act, entry },
    }).catch(() => {});
  }, [screenKey, step, act, entry, hydrated]);

  const goNext = useCallback(() => {
    setStep(s => Math.min(FLOW.length - 1, s + 1));
  }, [setStep]);

  const goBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, [setStep]);

  const handleSignIn = () => {
    setSigningIn(true);
    setErrorMsg(null);
    try {
      localStorage.setItem('pending_invite_role', entry === 'invited' ? 'gator' : 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
    } catch { /* private browsing */ }
    const callback = `${window.location.origin}/#/StudentOnboardingV2${entry === 'invited' ? `?entry=invited&parent=${encodeURIComponent(parentNameFromInvite)}&school=${encodeURIComponent(prefilledSchool)}` : ''}`;
    base44.auth.redirectToLogin(callback);
  };

  const handleSchoolSubmit = async ({ firstName, school, year }) => {
    setSavingProfile(true);
    setErrorMsg(null);
    setAnswer('firstName', firstName);
    setAnswer('school', school);
    setAnswer('year', year);

    try {
      if (user) {
        const schoolCode = deriveSchoolCode(school);
        const persona = entry === 'invited' ? 'gator' : (user.persona || 'student');
        const roles = user.roles?.length ? user.roles : [persona];
        await base44.auth.updateMe({
          persona,
          roles,
          school,
          school_name: school,
          university: school,
          ...(schoolCode ? { school_code: schoolCode } : {}),
          first_name: firstName,
          ...(user.full_name ? {} : { full_name: firstName }),
          onboarding_completed: false,
        });
        if (refreshUser) await refreshUser();
      }
      goNext();
    } catch (e) {
      console.error('Profile save failed:', e);
      setErrorMsg('Could not save your details. Try once more.');
    } finally {
      setSavingProfile(false);
    }
  };

  const persistFastTrackTargets = useCallback((next) => {
    // Best-effort upsert so the dashboard sees their goals immediately.
    if (!user?.email) return;
    const companies = formatCompanyList(next.targetCompanies).map(name => ({ name }));
    const payload = {
      user_email: user.email,
      target_role: (next.targetRoles || [])[0] || '',
      target_industries: next.targetRoles || [],
      target_companies: companies,
    };
    base44.entities.FastTrackProProfile.filter({ user_email: user.email }).then((existing) => {
      if (existing?.[0]) return base44.entities.FastTrackProProfile.update(existing[0].id, payload);
      return base44.entities.FastTrackProProfile.create(payload);
    }).catch(() => {});
  }, [user?.email]);

  const completeOnboarding = useCallback(async (path) => {
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_v2_path: path,
      });
      if (refreshUser) await refreshUser();
      reset();
      navigate('FreeTierDashboard');
    } catch (e) {
      console.error('Mark complete failed:', e);
      navigate('FreeTierDashboard');
    }
  }, [refreshUser, reset]);

  if (isLoadingAuth || !hydrated) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#E85D20', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Welcome screen (full-bleed, no sticky header).
  if (screenKey === SCREEN_WELCOME) {
    return (
      <WelcomeScreen
        entry={entry}
        parentName={parentNameFromInvite || answers.invitedBy}
        schoolName={answers.school || prefilledSchool}
        authed={!!user}
        loading={signingIn}
        error={errorMsg}
        onSignIn={handleSignIn}
        onContinue={goNext}
      />
    );
  }

  // From here on, every screen wears the sticky progress header.
  const wrap = (children) => (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <ProgressHeader act={act} screenInAct={screenInAct} totalInAct={actTotal} onBack={step > 0 ? goBack : null} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  switch (screenKey) {
    case SCREEN_SCHOOL:
      return wrap(
        <SchoolStep
          initialFirstName={answers.firstName || user?.full_name?.split(' ')[0] || ''}
          initialSchool={answers.school || prefilledSchool}
          initialYear={answers.year || ''}
          loading={savingProfile}
          onSubmit={handleSchoolSubmit}
        />,
      );

    case SCREEN_Q_CHALLENGE:
      return wrap(
        <ChipQuestion
          label="Question 1 of 5"
          title="What's the hardest part of your job search right now?"
          subtitle="Pick the one that hits hardest. We'll mirror this back in your plan."
          options={CHALLENGE_OPTIONS}
          value={answers.challenge}
          onChange={(v) => setAnswer('challenge', v)}
          onContinue={goNext}
        />,
      );

    case SCREEN_MIRROR_1: {
      const challengeLine = {
        no_network: "you're missing warm intros",
        cold_apps: "your applications are vanishing into the void",
        unsure_target: "you're still figuring out what you want",
        imposter: "you'd kill for someone to vouch for you",
      }[answers.challenge] || 'the search feels heavy right now';
      return wrap(
        <MirrorCard
          eyebrow="Read back"
          headline={`${answers.firstName || 'You'}, you said ${challengeLine}.`}
          subhead={`That's the #1 thing every ${answers.school || 'college'} student tells us in their first week. Good news: it's also the most fixable.`}
          onContinue={goNext}
        />,
      );
    }

    case SCREEN_Q_ROLES:
      return wrap(
        <ChipQuestion
          label="Question 2 of 5"
          title="Which roles or industries are you targeting?"
          subtitle="Pick as many as fit. Add your own if it's not here."
          multi
          allowOther
          exclusiveValue="unsure"
          options={ROLE_OPTIONS}
          value={answers.targetRoles || []}
          onChange={(v) => {
            const next = { ...answers, targetRoles: v };
            setAnswer('targetRoles', v);
            persistFastTrackTargets(next);
          }}
          onContinue={goNext}
        />,
      );

    case SCREEN_Q_COMPANIES:
      return wrap(
        <ChipQuestion
          label="Question 3 of 5"
          title="Any specific companies on your list?"
          subtitle="Tap a few you'd love to land at — or add your own. We'll search alumni at these places in a minute."
          multi
          allowOther
          options={SCHOOL_LIKE_COMPANIES.map(c => ({ label: c }))}
          value={answers.targetCompanies || []}
          onChange={(v) => {
            setAnswer('targetCompanies', v);
            persistFastTrackTargets({ ...answers, targetCompanies: v });
          }}
          onContinue={goNext}
        />,
      );

    case SCREEN_Q_INTROS:
      return wrap(
        <ChipQuestion
          label="Question 4 of 5"
          title="How many warm intros to alumni or parents do you have today?"
          subtitle="Be honest — this is just for you. It calibrates what we recommend next."
          options={INTROS_OPTIONS}
          value={answers.warmIntros}
          onChange={(v) => setAnswer('warmIntros', v)}
          onContinue={goNext}
        />,
      );

    case SCREEN_Q_UNLOCK:
      return wrap(
        <ChipQuestion
          label="Question 5 of 5"
          title="If one strong connection said yes, what would it unlock?"
          subtitle="The unlock you pick shapes how we coach you."
          options={UNLOCK_OPTIONS}
          value={answers.unlock}
          onChange={(v) => setAnswer('unlock', v)}
          onContinue={goNext}
        />,
      );

    case SCREEN_MIRROR_2: {
      const intros = { '0': 'zero', '1_2': '1–2', '3_5': '3–5', '6_plus': '6+' }[answers.warmIntros] || 'a few';
      const unlock = ({
        referral: 'a referral',
        advice: 'real advice',
        foot_in_door: 'a foot in the door',
        confidence: 'the confidence boost you need',
      })[answers.unlock] || 'the right intro';
      const company = (answers.targetCompanies || [])[0];
      const role = (answers.targetRoles || [])[0];
      const target = company ? `at ${company}` : role ? `in ${role}` : '';
      return wrap(
        <MirrorCard
          eyebrow="Snapshot"
          headline={`Targeting ${role || 'a role you love'} ${target ? target : ''} with ${intros} warm intros today.`}
          subhead={`One ${answers.school || 'school'} alum saying yes is ${unlock} — and it could happen this week.`}
          onContinue={goNext}
          continueLabel="Show me how"
        />,
      );
    }

    case SCREEN_ACT2_INTRO:
      return wrap(
        <Act2Transition schoolName={answers.school} onContinue={goNext} />,
      );

    case SCREEN_SEARCH:
      return wrap(
        <SearchOrchestrator
          user={user}
          schoolName={answers.school}
          answers={answers}
          onPick={(alum) => { setPickedAlum(alum); goNext(); }}
        />,
      );

    case SCREEN_DRAFT:
      if (!pickedAlum) {
        // User refreshed mid-flow — bounce them back to the search.
        setStep(FLOW.findIndex(s => s.key === SCREEN_SEARCH));
        return wrap(<div />);
      }
      return wrap(
        <DraftOrchestrator
          user={user}
          schoolName={answers.school}
          answers={answers}
          alum={pickedAlum}
          onSent={() => goNext()}
          onSkip={() => goNext()}
        />,
      );

    case SCREEN_AHA:
      return wrap(
        <AhaScreen alumName={pickedAlum?.full_name} onContinue={goNext} />,
      );

    case SCREEN_SUMMARY:
      return wrap(
        <PersonalizedSummary answers={answers} onContinue={goNext} />,
      );

    case SCREEN_COMMIT:
      return wrap(
        <CommitmentScreen schoolName={answers.school} onContinue={goNext} />,
      );

    case SCREEN_PAYWALL:
      return wrap(
        <FastIQPaywallScreen
          user={user}
          schoolName={answers.school}
          firstName={answers.firstName || user?.full_name?.split(' ')[0]}
          onContinueFree={() => completeOnboarding('free')}
        />,
      );

    default:
      return wrap(<div />);
  }
}

/* The search and draft screens own search state, but the orchestrator owns
 * navigation. Wrapping them keeps the search hook from re-running every time
 * the orchestrator re-renders. */
function SearchOrchestrator({ user, schoolName, answers, onPick }) {
  const { results, searching, error, search } = useAlumniSearch({ user, schoolName });
  return (
    <AlumniDemoSearch
      schoolName={schoolName}
      answers={answers}
      search={search}
      searching={searching}
      results={results}
      error={error}
      onPick={onPick}
    />
  );
}

function DraftOrchestrator({ user, schoolName, answers, alum, onSent, onSkip }) {
  const { generateDraft } = useAlumniSearch({ user, schoolName });
  // Pull preferred targetRole into context for better LLM drafts.
  const preferredRole = (answers.targetRoles || [])[0];
  const wrappedGenerate = useCallback((alumArg) => generateDraft(alumArg, {
    targetRole: preferredRole,
    studentName: answers.firstName || user?.full_name,
  }), [generateDraft, preferredRole, answers.firstName, user?.full_name]);
  return (
    <OutreachDraftPreview
      alum={alum}
      schoolName={schoolName}
      user={user}
      generateDraft={wrappedGenerate}
      onSent={onSent}
      onSkip={onSkip}
    />
  );
}
