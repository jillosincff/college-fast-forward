import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, Sparkles, Search, MapPin, ArrowRight } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, markMagicMomentCompleted, trackConversionEvent } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { getChipCuratedJobs } from '../../base44/shared/curatedJobs';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { checkJobLive } from '@/lib/jobFreshness';
import { logJobApplied } from '@/lib/magicMomentLog';
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
  const { user: initialUser } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showPro, setShowPro] = useState(false);
  const [error, setError] = useState('');
  const [heroMeta, setHeroMeta] = useState({ chipLabel: '', chipText: '' });

  const cg0 = initialUser?.career_goals || {};
  const fallbackRole = (cg0.target_industries || [])[0] || '';
  const [searchRole, setSearchRole] = useState((cg0.target_roles || [])[0] || fallbackRole || '');
  const [searchLoc, setSearchLoc] = useState(cg0.location_preference || initialUser?.location || '');
  const [user, setUser] = useState(initialUser);

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
    const freshUser = { ...initialUser, career_goals: updatedGoals, location: searchLoc.trim() };
    setUser(freshUser);
    ranRef.current = false;
    setJobsList([]);
    setJobsLoading(true);
    setError('');
    setRunKey(k => k + 1);
  };

  const [runKey, setRunKey] = useState(0);

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
    (async () => {
      try {
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
        const chipKeywords = chipKeywordsFor(chipText);
        setHeroMeta({ chipLabel, chipText });

        const locParts = (location || '').split(',').map(p => p.trim()).filter(Boolean);
        const userCity = locParts[0] || '';
        const userState = locParts[1] || '';
        const hasMarket = !!(userCity || userState);

        const tierOf = (j) => {
          const loc = (j.location || '').toLowerCase();
          if (!loc) return 'other';
          const isRemote = /\bremote\b|work\s*from\s*home/.test(loc);
          const cityHit = userCity && loc.includes(userCity.toLowerCase());
          const stateHit = userState && loc.includes(userState.toLowerCase());
          if (isRemote) return 'remote';
          if (cityHit) return 'same_location';
          if (stateHit) return 'nearby';
          return 'other';
        };

        const isJunk = (j) => /\b(independent|1099|own business|own biz|build your own|be your own|partner program|independent partner|work[- ]from[- ]home opportunity|unlimited earning|franchise|mlm|multi[- ]level)\b/i
          .test(`${j.job_title || ''} ${j.hiring_description || ''}`);
        const isNonStudentLevel = (j) => /\b(charge nurse|director of nursing|nurse manager|nursing supervisor|clinical director|VP of|vice president|chief .+ officer|head of|department head|senior director|principal engineer)\b/i
          .test(j.job_title || '');
        const isOnChip = (j) => checkOnChip(j.job_title, chipKeywords).ok;
        const legit = (arr) => arr.filter(j => !isJunk(j) && !isNonStudentLevel(j));
        const onChip = (arr) => arr.filter(j => isOnChip(j));

        const fetchJobs = async (locOverride) => {
          const loc = locOverride !== undefined ? locOverride : location;
          try {
            const r = await base44.functions.invoke('getLiveJobMatchesFn', {
              career_goals: { role, industries, locations: [loc], seeking: cg.seeking || 'both' },
              force_refresh: true,
            });
            return r?.data?.companies || r?.companies || [];
          } catch (e) {
            return [];
          }
        };

        // ── JOBS ONLY — no findCliffPeople, no people hang ──
        setJobsLoading(true);
        const metroRaw = await fetchJobs(location);
        let lj = onChip(legit(metroRaw));

        if (lj.length < 3 && userState) {
          const stateRaw = await fetchJobs(userState);
          lj = [...lj, ...onChip(legit(stateRaw))];
        }

        const seenLive = new Set();
        const liveUnique = [];
        for (const j of lj) {
          const k = ((j.name || '') + '|' + (j.job_title || '')).toLowerCase();
          if (seenLive.has(k)) continue;
          seenLive.add(k);
          liveUnique.push(j);
        }

        const cj = onChip(getChipCuratedJobs(chipText, location));
        const oj = [...liveUnique, ...cj];

        const seenJ = new Set();
        const dedupedJ = [];
        for (const j of oj) {
          const k = (j.name + '|' + j.job_title).toLowerCase();
          if (seenJ.has(k)) continue;
          if (hasMarket) {
            const t = tierOf(j);
            if (t === 'other') continue; // never bait-and-switch with another metro
          }
          seenJ.add(k);
          dedupedJ.push(j);
        }
        if (dedupedJ.length === 0 && oj.length > 0) {
          for (const j of oj) {
            const k = (j.name + '|' + j.job_title).toLowerCase();
            if (seenJ.has(k)) continue;
            seenJ.add(k);
            dedupedJ.push(j);
          }
        }
        const tierOrder = { same_location: 0, nearby: 1, remote: 2, other: 3 };
        const tierRank = (j) => tierOrder[tierOf(j)] ?? 3;
        dedupedJ.sort((a, b) => tierRank(a) - tierRank(b));
        const topJobs = dedupedJ.slice(0, 8);

        const LIVE_CHECK_LIMIT = 4;
        const liveChecked = await Promise.all(
          topJobs.map(async (job, i) => {
            if (i >= LIVE_CHECK_LIMIT) return { ...job, live: undefined, _tier: tierOf(job) };
            const chk = await checkJobLive(base44, job);
            return { ...job, live: chk.ok, _tier: tierOf(job) };
          })
        );
        const _finalRank = (j) => tierOrder[j._tier] ?? tierOf(j) ?? 3;
        liveChecked.sort((a, b) => _finalRank(a) - _finalRank(b));

        setJobsList(liveChecked);
        setJobsLoading(false);

        // ── Track completion ──
        base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
        trackMagicMomentCompleted({
          jobs_count: liveChecked.length,
          people_count: 0,
          best_path: false,
          people_source: 'locked_free',
          result_type: 'jobs_only',
          hero_job_title: liveChecked[0]?.job_title || '',
          hero_company: liveChecked[0]?.name || '',
          has_tailored_resume: false,
        });
        trackConversionEvent('magic_moment_completed', {
          jobs_count: liveChecked.length,
          people_count: 0,
          best_path: false,
          result_type: 'jobs_only',
        });
        markMagicMomentCompleted();
        base44.auth.updateMe({ magic_moment_completed: true }).catch(() => {});
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setJobsLoading(false);
      }
    })();
  }, [user, runKey]);

  const handleRowApply = (job) => { logJobApplied({ user, job }); };

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

        {/* Screen 2 — Their real jobs (free taste) */}
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
            {(() => {
              const hasInMarket = jobsList.some(j => j._tier === 'same_location' || j._tier === 'nearby');
              const allRemote = !hasInMarket && jobsList.every(j => j._tier === 'remote' || !j._tier);
              return allRemote && searchLoc ? (
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 10px', lineHeight: 1.4 }}>
                  No roles found specifically in {searchLoc} — showing remote roles in your field.
                </p>
              ) : null;
            })()}
            <JobsList jobs={jobsList} onApply={handleRowApply} />
          </div>
        ) : (
          <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No jobs found for this search.</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>Try a different role or location above.</p>
          </div>
        )}

        {/* People — locked for free users (no findCliffPeople during onboarding) */}
        <LockedPeopleCard
          school={user?.school}
          chipText={heroMeta.chipText}
          chipLabel={heroMeta.chipLabel}
          city={searchLoc}
          onUpgrade={() => setShowPro(true)}
          onAskParent={() => setShowPro(true)}
        />

        {/* Paywall — after example + jobs visible */}
        {jobsVisible && (
          <div style={{ background: GRAD_INDIGO, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center', boxShadow: SHADOW_MD }}>
            <Sparkles size={20} color="#fff" style={{ marginBottom: 8 }} />
            <h2 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Unlock your full plan</h2>
            <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Get real alumni from your school, tailored resumes, and daily scouted jobs — all powered by CLIFF.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPro(true)} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: INDIGO_DIM, background: '#fff', border: 'none', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}>
                Upgrade to Pro
              </button>
              <button onClick={() => setShowPro(true)} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}>
                Ask a parent
              </button>
            </div>
          </div>
        )}

        {/* Continue your plan — only after example + jobs are visible */}
        {!jobsLoading && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={() => navigate('/FreeTierDashboard')} style={pill({})}>
              Continue your plan <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
      {showPro && <ProUpgradeModal user={user} onClose={() => setShowPro(false)} source="magic_moment" />}
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