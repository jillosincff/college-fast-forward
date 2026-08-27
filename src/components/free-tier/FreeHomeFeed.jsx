import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, ExternalLink, ArrowRight, MapPin } from 'lucide-react';
import { getChipCuratedJobs } from '../../../base44/shared/curatedJobs';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { checkJobLive } from '@/lib/jobFreshness';
import { logJobApplied } from '@/lib/magicMomentLog';
import LockedPeopleCard from '@/components/magic-moment/LockedPeopleCard';
import JobsList from '@/components/magic-moment/JobsList';

// Free home — continues the Magic Moment cycle. Four sections, no demo data:
// 1) Next move (one real job), 2) Unlock people banner, 3) Jobs list, 4) History link.
// People stay locked on free — no fake warm-connection card.

export default function FreeHomeFeed({ user, onUpgrade }) {
  const navigate = useNavigate();
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [heroMeta, setHeroMeta] = useState({ chipLabel: '', chipText: '' });
  const [nextIdx, setNextIdx] = useState(0);

  useEffect(() => {
    if (!user) return;
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
            if (t === 'other') continue;
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
        setNextIdx(0);
        setJobsLoading(false);
      } catch (e) {
        setJobsLoading(false);
      }
    })();
  }, [user]);

  const nextJob = jobsList[nextIdx] || null;
  const city = user?.career_goals?.location_preference || user?.location || '';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 100px', fontFamily: FONT }}>
      {/* 1. Next move — one real job */}
      {jobsLoading ? (
        <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '24px 18px', marginBottom: 16, boxShadow: SHADOW_MD, textAlign: 'center' }}>
          <div style={{ width: 20, height: 20, border: '2.5px solid #e9d5ff', borderTop: `2.5px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Finding your next move…</p>
        </div>
      ) : nextJob ? (
        <NextMoveCard
          job={nextJob}
          city={city}
          onApply={() => logJobApplied({ user, job: nextJob })}
          onDidIt={() => { logJobApplied({ user, job: nextJob }); setNextIdx(i => Math.min(i + 1, jobsList.length)); }}
        />
      ) : jobsList.length > 0 ? (
        <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>You're all caught up.</p>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>CLIFF refreshes matches daily — check back tomorrow for new opportunities.</p>
        </div>
      ) : (
        <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No jobs matched right now.</p>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>CLIFF refreshes matches daily. Try editing your goals to widen the search.</p>
        </div>
      )}

      {/* 2. Unlock people banner (locked on free, same Stripe checkout) */}
      <LockedPeopleCard
        school={user?.school}
        chipText={heroMeta.chipText}
        chipLabel={heroMeta.chipLabel}
        city={city}
        onUpgrade={onUpgrade}
        onAskParent={onUpgrade}
      />

      {/* 3. Jobs for you — same list logic as Magic Moment */}
      {!jobsLoading && jobsList.length > 1 && (
        <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Briefcase size={14} color={INDIGO_DIM} />
            <span style={{ fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>More jobs for you</span>
          </div>
          <JobsList jobs={jobsList.filter((_, i) => i !== nextIdx)} excludeJobKey={nextJob ? `${nextJob.name}|${nextJob.job_title}` : ''} onApply={(job) => logJobApplied({ user, job })} />
        </div>
      )}

      {/* 4. Application history — quiet link, only real applied jobs */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <button onClick={() => navigate('/ApplicationTracker')} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
          Application history <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </button>
      </div>
    </div>
  );
}

function NextMoveCard({ job, city, onApply, onDidIt }) {
  const jobUrl = job.job_url || job.url || '#';
  const tierLabel = job._tier === 'same_location' || job._tier === 'nearby'
    ? `Matches your ${city || 'location'} preference`
    : job._tier === 'remote'
      ? 'Remote role in your field'
      : '';
  return (
    <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', borderRadius: R, padding: '22px 18px', marginBottom: 16, boxShadow: SHADOW_MD, color: '#fff' }}>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>Your next move</p>
      <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
        Apply to {job.job_title} at {job.name}
      </h2>
      {tierLabel && (
        <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={13} /> {tierLabel}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {jobUrl !== '#' && (
          <a href={jobUrl} target="_blank" rel="noopener noreferrer" onClick={onApply} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '12px 22px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            Apply <ExternalLink size={14} />
          </a>
        )}
        <button onClick={onDidIt} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 999, padding: '12px 18px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Did it <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}