import { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, Sparkles, Search, MapPin, ChevronDown, Users } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, markMagicMomentCompleted, trackConversionEvent } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { logJobApplied } from '@/lib/magicMomentLog';
import { buildLiveJobsList } from '@/lib/jobsPipeline';
import { applyUrlOf } from '@/lib/jobFreshness';
import { rankMoves, jobKeyOf } from '@/lib/magicMomentMoves';
import ExampleBestPathCard from '@/components/magic-moment/ExampleBestPathCard';
import LockedPeopleCard from '@/components/magic-moment/LockedPeopleCard';
import BestMoveCard from '@/components/magic-moment/BestMoveCard';
import CompanyInsiderBeat from '@/components/magic-moment/CompanyInsiderBeat';
import MagicMomentCompleteBeat from '@/components/magic-moment/MagicMomentCompleteBeat';

// REBUILT — guided recruiter loop (not a job board, not tailor-as-aha).
// Free MM wow = "I've got this": CLIFF picks ≤3 roles to pursue, each with a
// one-line honest why from real signals. Primary CTA (pressure-test) on #1
// opens Mock Interview for that role. Tailor / Apply / Add to Applied are
// demoted secondary actions that work unpaid on this free cycle.
// People / insiders are the unlock layer — shown per-company ONLY after the
// student taps "Interested", never auto, never via findCliffPeople on free.
// The always-on LockedPeopleCard stays collapsed at the very bottom as a
// fallback. MM is not auto-completed just because jobs loaded.

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
  const [proModalConfig, setProModalConfig] = useState(null);
  const [showCompleteBeat, setShowCompleteBeat] = useState(false);
  const completedRef = useRef(false);
  const paywallOpenedRef = useRef(false);
  const modalFromBeatRef = useRef(false);

  // Recruiter-loop state
  const [dismissedKeys, setDismissedKeys] = useState(() => new Set());
  const [interestedKey, setInterestedKey] = useState(null);
  const [showPeople, setShowPeople] = useState(false);

  const cg0 = authUser?.career_goals || {};
  const fallbackRole = (cg0.target_industries || [])[0] || '';
  const [searchRole, setSearchRole] = useState((cg0.target_roles || [])[0] || fallbackRole || '');
  const [searchLoc, setSearchLoc] = useState(cg0.location_preference || authUser?.location || '');
  const [user, setUser] = useState(authUser);

  useEffect(() => { if (authUser) setUser(authUser); }, [authUser]);

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
    setDismissedKeys(new Set());
    setInterestedKey(null);
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

    // ── Jobs fetch (does NOT wait on people, does NOT call findCliffPeople) ─
    (async () => {
      try {
        setJobsLoading(true);
        const { jobs, shortMessage: sm } = await buildLiveJobsList({
          role, industries, location, seeking: cg.seeking, chipText,
        });
        setJobsList(jobs);
        setShortMessage(sm);
        setJobsLoading(false);
        // Do NOT auto-complete MM just because jobs loaded. Completion fires
        // on a meaningful step (pressure-test / tailor / apply / add-applied)
        // or on Continue with free.
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setJobsLoading(false);
      }
    })();
  }, [user, runKey]);

  // Ranked pool — Pursue first, Stretch to fill. Off-screen / skip-tier jobs
  // never render. Top 3 shown; "Not for me" dismisses one and backfills.
  const seeking = user?.career_goals?.seeking;
  const rankedPool = useMemo(
    () => rankMoves(jobsList, { chipText: heroMeta.chipText, chipLabel: heroMeta.chipLabel, seeking }),
    [jobsList, heroMeta.chipText, heroMeta.chipLabel, seeking]
  );
  const visibleMoves = useMemo(() => {
    const kept = rankedPool.filter(m => !dismissedKeys.has(jobKeyOf(m.job)));
    return kept.slice(0, 3);
  }, [rankedPool, dismissedKeys]);

  useEffect(() => {
    if (!jobsLoading && visibleMoves.length > 0) {
      base44.analytics.track({ eventName: 'best_move_shown', properties: { count: visibleMoves.length } });
    }
  }, [jobsLoading, visibleMoves.length]);

  const handlePressureTest = (job) => {
    markComplete({ result_type: 'pressure_test' });
    base44.analytics.track({ eventName: 'pressure_test_started', properties: { company: job.name, role: job.job_title } });
    const params = new URLSearchParams({
      company: job.name || '',
      role: job.job_title || '',
      mm_free: '1',
    });
    const jd = (job.hiring_description || '').slice(0, 1000);
    if (jd) params.set('jd', jd);
    navigate(`/MockInterview?${params.toString()}`);
  };
  const handleTailor = (job) => {
    markComplete({ result_type: 'tailor' });
    const params = new URLSearchParams({
      from: 'apply_modal',
      company: job.name || '',
      role: job.job_title || '',
      jd: job.hiring_description || '',
      job_url: applyUrlOf(job) || '',
      location: job.location || '',
    });
    navigate(`/ResumeTailoring?${params.toString()}`);
  };
  const handleApply = (job) => {
    markComplete({ result_type: 'apply' });
    logJobApplied({ user, job });
  };
  const handleAddApplied = (job) => {
    markComplete({ result_type: 'add_applied' });
    logJobApplied({ user, job });
  };
  const handleNotForMe = (job) => {
    const k = jobKeyOf(job);
    setDismissedKeys(prev => { const n = new Set(prev); n.add(k); return n; });
    if (interestedKey === k) setInterestedKey(null);
  };
  const handleInterested = (job) => {
    setInterestedKey(jobKeyOf(job));
    base44.analytics.track({ eventName: 'move_interested', properties: { company: job.name, role: job.job_title } });
    base44.analytics.track({ eventName: 'insider_ask_shown', properties: { company: job.name } });
  };

  const handleAskParent = () => {
    paywallOpenedRef.current = true;
    setProModalConfig({ initialView: 'parent', source: 'magic_moment_parent' });
  };
  const handleUpgrade = () => {
    paywallOpenedRef.current = true;
    setProModalConfig({ initialView: 'main', source: 'magic_moment' });
  };

  const handleContinueFree = () => {
    markComplete({ result_type: 'continue_free' });
    if (!paywallOpenedRef.current) { setShowCompleteBeat(true); return; }
    navigate('/FreeTierDashboard');
  };

  const handleBeatAskParent = () => {
    setShowCompleteBeat(false); paywallOpenedRef.current = true; modalFromBeatRef.current = true;
    setProModalConfig({ initialView: 'parent', source: 'magic_moment_parent' });
  };
  const handleBeatUnlockPro = () => {
    setShowCompleteBeat(false); paywallOpenedRef.current = true; modalFromBeatRef.current = true;
    setProModalConfig({ initialView: 'main', source: 'magic_moment' });
  };
  const handleBeatDismiss = () => { setShowCompleteBeat(false); navigate('/FreeTierDashboard'); };

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

  const allPursue = visibleMoves.length > 0 && visibleMoves.every(m => m.verdict === 'pursue');
  const agentLine = visibleMoves.length > 0
    ? `Most of what's out there isn't worth your time. I picked ${visibleMoves.length} ${allPursue ? "I'd actually pursue" : 'worth a look'}${heroMeta.chipLabel ? ` for ${heroMeta.chipLabel}` : ''}${searchLoc ? ` in ${searchLoc}` : ''} — start with #1.`
    : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        {/* 1. Header — guided search */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your guided search</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            Here's your first plan.
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>
            {heroMeta.chipLabel ? `${heroMeta.chipLabel} roles` : 'Matching roles'}{searchLoc ? ` in ${searchLoc}` : ''}
          </p>
        </div>

        {SearchBar}

        {/* 2. EXAMPLE — job + Pursue + why + pressure-test next step (no alumni) */}
        <ExampleBestPathCard
          school={user?.school}
          chipText={heroMeta.chipText}
          chipLabel={heroMeta.chipLabel}
          city={searchLoc}
        />

        {/* 3. Today's Best Moves (≤3) + agent line — the free recruiter wow */}
        {jobsLoading ? (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Today's Best Moves" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 16, border: '2px solid #e9d5ff', borderTop: `2px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>CLIFF is ranking roles worth your time…</p>
            </div>
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: R, padding: '16px 18px', marginBottom: 16 }}>
            <p style={{ fontFamily: FONT, fontSize: 13, color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        ) : visibleMoves.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            {/* Agent line */}
            {agentLine && (
              <div style={{ background: '#faf5ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, margin: 0, lineHeight: 1.5 }}>
                  {agentLine}
                </p>
              </div>
            )}
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Today's Best Moves" />
            {shortMessage && (
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 10px', lineHeight: 1.4 }}>
                {shortMessage}
              </p>
            )}
            {visibleMoves.map((move, i) => {
              const k = jobKeyOf(move.job);
              return (
                <BestMoveCard
                  key={k}
                  move={move}
                  index={i}
                  onPressureTest={handlePressureTest}
                  onInterested={handleInterested}
                  onTailor={handleTailor}
                  onApply={handleApply}
                  onAddApplied={handleAddApplied}
                  onNotForMe={handleNotForMe}
                  insiderBeat={interestedKey === k ? (
                    <CompanyInsiderBeat company={move.job.name} onAskParent={handleAskParent} onUpgrade={handleUpgrade} />
                  ) : null}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Today's Best Moves" />
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No moves yet for this search.</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>Try a different role or location above.</p>
          </div>
        )}

        {/* 5. Continue with free — stays last (above the collapsed people fallback) */}
        {!jobsLoading && (
          <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
            <button onClick={handleContinueFree} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>
              Continue with free →
            </button>
          </div>
        )}

        {/* 4. People unlock — collapsed fallback at the very bottom. Only expands
            on tap; the primary insider path is the per-company beat after Interested. */}
        {!jobsLoading && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowPeople(s => !s)}
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, background: '#fff', border: `1px solid #e2e8f0`, borderRadius: 999, padding: '10px 14px', cursor: 'pointer', minHeight: 'auto' }}
            >
              <Users size={13} /> People from your school — unlock
              <ChevronDown size={13} style={{ transform: showPeople ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showPeople && (
              <div style={{ marginTop: 10 }}>
                <LockedPeopleCard
                  school={user?.school}
                  chipText={heroMeta.chipText}
                  chipLabel={heroMeta.chipLabel}
                  city={searchLoc}
                  onUpgrade={handleUpgrade}
                  onAskParent={handleAskParent}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {showCompleteBeat && (
        <MagicMomentCompleteBeat
          onAskParent={handleBeatAskParent}
          onUnlockPro={handleBeatUnlockPro}
          onDismiss={handleBeatDismiss}
        />
      )}
      {proModalConfig && (
        <ProUpgradeModal
          user={user}
          onClose={() => {
            setProModalConfig(null);
            if (modalFromBeatRef.current) {
              modalFromBeatRef.current = false;
              navigate('/FreeTierDashboard');
            }
          }}
          source={proModalConfig.source}
          initialView={proModalConfig.initialView}
        />
      )}
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