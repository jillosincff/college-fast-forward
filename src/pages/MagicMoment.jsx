import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, Sparkles, Search, MapPin } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, markMagicMomentCompleted, trackConversionEvent } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { logJobApplied } from '@/lib/magicMomentLog';
import { buildLiveJobsList } from '@/lib/jobsPipeline';
import ExampleBestPathCard from '@/components/magic-moment/ExampleBestPathCard';
import LockedPeopleCard from '@/components/magic-moment/LockedPeopleCard';
import JobsList from '@/components/magic-moment/JobsList';

// REBUILT first session — SELLS the play immediately.
// Screen 1: instant Example Best Path (no search, no hang).
// Screen 2: real jobs pipeline (metro → state → remote, chip gate, no NYC leak).
// People / Best Path are PAID — no findCliffPeople during onboarding.
// Free users see a locked people card + pre-filled LinkedIn + Upgrade/Ask parent.

const pill = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '14px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', gap: 8,
  ...extra,
});

export default function MagicMoment() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [shortMessage, setShortMessage] = useState('');
  const [error, setError] = useState('');
  const [heroMeta, setHeroMeta] = useState({ chipLabel: '', chipText: '' });
  const [proModalConfig, setProModalConfig] = useState(null); // { initialView, source }
  const completedRef = useRef(false);

  const cg0 = authUser?.career_goals || {};
  const fallbackRole = (cg0.target_industries || [])[0] || '';
  const [searchRole, setSearchRole] = useState((cg0.target_roles || [])[0] || fallbackRole || '');
  const [searchLoc, setSearchLoc] = useState(cg0.location_preference || authUser?.location || '');
  const [user, setUser] = useState(authUser);

  // Keep local user in sync with auth — don't freeze the first null while auth loads.
  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchRole.trim() && !searchLoc.trim()) return;
    const updatedGoals = {
      ...cg0,
      target_roles: searchRole.trim() ? [searchRole.trim()] : (cg0.target_roles || []),
      target_industries: [],
      location_preference: searchLoc.trim() || undefined,
      seeking: cg0.seeking || 'both',
      saved_at: new Date().toISOString(),
    };
    try { await base44.auth.updateMe({ career_goals: updatedGoals, location: searchLoc.trim() || undefined }); } catch (e) {}
    const freshUser = { ...authUser, career_goals: updatedGoals, location: searchLoc.trim() };
    setUser(freshUser);
    ranRef.current = false;
    setJobsList([]);
    setJobsLoading(true);
    setShortMessage('');
    setError('');
    setRunKey(k => k + 1);
  };

  const [runKey, setRunKey] = useState(0);

  const markComplete = (opts) => {
    if (completedRef.current) return;
    completedRef.current = true;
    base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
    trackMagicMomentCompleted(opts);
    trackConversionEvent('magic_moment_completed', { result_type: opts.result_type }).catch(() => {});
    markMagicMomentCompleted();
    base44.auth.updateMe({ magic_moment_completed: true }).catch(() => {});
  };

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;
    trackConversionEvent('magic_moment_offered', { trigger: 'post_onboarding' })
      .then(() => trackConversionEvent('magic_moment_started', { trigger: 'post_onboarding' }));
    trackMagicMomentStarted({
      target_field: ((user.career_goals?.target_industries) || []).join(', '),
      target_role: (user.career_goals?.target_roles || [])[0] || '',
      school: user.school || '',
    });

    const cg = user.career_goals || {};
    const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
    const industries = cg.target_industries || [];
    const location = cg.location_preference || '';
    const _chipSeen = new Set();
    const chipParts = [role, ...(industries || [])].filter(p => {
      const k = (p || '').toLowerCase().trim();
      if (!k || _chipSeen.has(k)) return false;
      _chipSeen.add(k); return true;
    });
    const chipText = chipParts.join(' ').trim();
    const chipLabel = industries[0] || role || '';
    setHeroMeta({ chipLabel, chipText });

    // ── Jobs fetch (does NOT wait on people) ─────────────────────────────
    (async () => {
      try {
        setJobsLoading(true);
        const { jobs, shortMessage: sm } = await buildLiveJobsList({
          role, industries, location, seeking: cg.seeking, chipText,
        });
        setJobsList(jobs);
        setShortMessage(sm);
        setJobsLoading(false);
        if (jobs.length > 0) {
          markComplete({
            jobs_count: jobs.length,
            people_count: 0,
            best_path: false,
            people_source: 'locked_free',
            result_type: 'jobs_only',
            hero_job_title: jobs[0]?.job_title || '',
            hero_company: jobs[0]?.name || '',
            has_tailored_resume: false,
          });
        }
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setJobsLoading(false);
      }
    })();
  }, [user, runKey]);

  const handleRowApply = (job) => { logJobApplied({ user, job }); };

  const handleAskParent = () => setProModalConfig({ initialView: 'parent', source: 'magic_moment_parent' });
  const handleUpgrade = () => setProModalConfig({ initialView: 'main', source: 'magic_moment' });

  // Tapping "Continue with free" marks the cycle complete.
  const handleContinueFree = () => {
    markComplete({ result_type: 'continue_free' });
    navigate('/FreeTierDashboard');
  };

  const SearchBar = (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 180px', position: 'relative' }}>
        <Search size={14} color={INDIGO_DIM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={searchRole}
          onChange={e => setSearchRole(e.target.value)}
          placeholder="Role (e.g. HR, Marketing, Finance)"
          style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT, background: CARD,
            border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '11px 14px 11px 36px', outline: 'none' }}
        />
      </div>
      <div style={{ flex: '1 1 160px', position: 'relative' }}>
        <MapPin size={14} color={INDIGO_DIM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={searchLoc}
          onChange={e => setSearchLoc(e.target.value)}
          placeholder="Location (e.g. Miami, FL)"
          style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT, background: CARD,
            border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '11px 14px 11px 36px', outline: 'none' }}
        />
      </div>
      <button type="submit" style={pill({ padding: '11px 20px' })}>Search</button>
    </form>
  );

  const jobsVisible = !jobsLoading && jobsList.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            Here's how CLIFF works.
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>
            {heroMeta.chipLabel ? `${heroMeta.chipLabel} roles` : 'Matching roles'}{searchLoc ? ` in ${searchLoc}` : ''}
          </p>
        </div>

        {SearchBar}

        {/* Screen 1 — Example Best Path (instant, no search) */}
        <ExampleBestPathCard
          school={user?.school}
          chipText={heroMeta.chipText}
          chipLabel={heroMeta.chipLabel}
          city={searchLoc}
        />

        {/* Screen 2 — Their real jobs (free taste).
            Only the first 2–3 render here; the people-lock card interrupts,
            then the remaining jobs continue below it. */}
        {jobsLoading ? (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Jobs for you" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 16, border: '2px solid #e9d5ff', borderTop: `2px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Finding jobs for you…</p>
            </div>
          </div>
        ) : jobsList.length > 0 ? (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Jobs for you" />
            {shortMessage && (
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 10px', lineHeight: 1.4 }}>
                {shortMessage}
              </p>
            )}
            <JobsList jobs={jobsList.slice(0, 3)} onApply={handleRowApply} />
          </div>
        ) : (
          <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No jobs found for this search.</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>Try a different role or location above.</p>
          </div>
        )}

        {/* People — locked for free (no findCliffPeople during onboarding).
            Sits ABOVE the long jobs list so the pay module interrupts right
            after the first 2–3 jobs, not after all of them. Ask a parent is
            primary; Unlock with Pro is secondary. */}
        <LockedPeopleCard
          school={user?.school}
          chipText={heroMeta.chipText}
          chipLabel={heroMeta.chipLabel}
          city={searchLoc}
          onUpgrade={handleUpgrade}
          onAskParent={handleAskParent}
        />

        {/* Remaining jobs — the long list continues below the people lock */}
        {!jobsLoading && jobsList.length > 3 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="More jobs for you" />
            <JobsList jobs={jobsList.slice(3)} onApply={handleRowApply} />
          </div>
        )}

        {/* Continue your plan — stays last */}
        {!jobsLoading && (
          <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
            <button onClick={handleContinueFree} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
              Continue with free →
            </button>
          </div>
        )}
      </div>
      {proModalConfig && <ProUpgradeModal user={user} onClose={() => setProModalConfig(null)} source={proModalConfig.source} initialView={proModalConfig.initialView} />}
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      {icon}
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}