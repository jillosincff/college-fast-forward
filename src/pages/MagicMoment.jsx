import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parsedResumeToText, saveParsedResume } from '@/lib/resumeText';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  VIOLET, GRAD_INDIGO, SHADOW, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, Users, Sparkles, Search, MapPin, ExternalLink } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, markMagicMomentCompleted, trackConversionEvent } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import SoftWallModal from '@/components/conversion/SoftWallModal';
import { getChipCuratedJobs } from '../../base44/shared/curatedJobs';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { checkJobLive } from '@/lib/jobFreshness';
import { gatePersonReal } from '@/lib/magicMomentGates';
import MagicMomentLoader from '@/components/magic-moment/MagicMomentLoader';
import HeroResume from '@/components/magic-moment/HeroResume';
import JobsList from '@/components/magic-moment/JobsList';
import PeopleList from '@/components/magic-moment/PeopleList';
import BestPathCard from '@/components/magic-moment/BestPathCard';
import NextStepFooter from '@/components/magic-moment/NextStepFooter';
import { logJobApplied } from '@/lib/magicMomentLog';

// The free Magic Moment — rebuilt as two independent lists (jobs + people)
// with an optional best-path highlight when they overlap. Neither list depends
// on the other to render. The empty screen only fires when BOTH are truly
// empty after the full cascade.

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    linkedin: { type: 'string' },
    summary: { type: 'string' },
    education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
    experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
    activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
    skills: { type: 'array', items: { type: 'string' } },
  },
};

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

  const [phase, setPhase] = useState('Finding jobs and people for you…');
  const [jobsList, setJobsList] = useState([]);
  const [peopleList, setPeopleList] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [bestPath, setBestPath] = useState(null);
  const [tailored, setTailored] = useState(null);
  const [showPro, setShowPro] = useState(false);
  const [showSoftWall, setShowSoftWall] = useState(false);
  const [error, setError] = useState('');
  const [heroMeta, setHeroMeta] = useState({ chipLabel: '', chipText: '' });
  const [didAction, setDidAction] = useState(false);

  // Search bar state — lets the user (or tester) override role/location directly
  const cg0 = initialUser?.career_goals || {};
  // The 3-screen onboarding makes the specific role text optional — a student
  // who picks the "Marketing" chip but skips typing a role has empty
  // target_roles. Fall back to the field chip so the search still has a term.
  const fallbackRole = (cg0.target_industries || [])[0] || '';
  const [searchRole, setSearchRole] = useState((cg0.target_roles || [])[0] || fallbackRole || '');
  const [searchLoc, setSearchLoc] = useState(cg0.location_preference || initialUser?.location || '');
  const [user, setUser] = useState(initialUser);

  // Re-run the Magic Moment with an explicit role/location override.
  // Used by the search bar so the user can try "HR in Miami, FL" without
  // having to edit career_goals via a separate modal.
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
    setPhase('Finding jobs and people for you…');
    setJobsList([]);
    setPeopleList([]);
    setPeopleLoading(true);
    setBestPath(null);
    setTailored(null);
    setError('');
    // Force the effect to re-run with the new user object
    setRunKey(k => k + 1);
  };

  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;
    // Await offered BEFORE started so the funnel is sequential — offered can
    // never be skipped by a race that fires started but not offered.
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
        // Fall back to the field chip when no specific role was typed — the
        // 3-screen onboarding doesn't require it, so "Marketing" chip alone
        // must still produce a searchable role.
        const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
        const industries = cg.target_industries || [];
        const location = cg.location_preference || '';
        // Build chipText from UNIQUE tokens so role="Healthcare" + industries
        // ["Healthcare"] does not produce "Healthcare Healthcare" — which then
        // leaked into the outreach draft as "roles like Healthcare Healthcare".
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

        // ── Location parsing ─────────────────────────────────────────────
        const locParts = (location || '').split(',').map(p => p.trim()).filter(Boolean);
        const userCity = locParts[0] || '';
        const userState = locParts[1] || '';
        const hasMarket = !!(userCity || userState);

        // ── Shared gates ──────────────────────────────────────────────────
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

        // Filter out supervisory/licensed roles that are above student level —
        // e.g. "Charge Nurse" requires RN licensure + experience, not a student match.
        const isNonStudentLevel = (j) => /\b(charge nurse|director of nursing|nurse manager|nursing supervisor|clinical director|VP of|vice president|chief .+ officer|head of|department head|senior director|principal engineer)\b/i
          .test(j.job_title || '');

        const rejected = [];
        const isOnChip = (j) => {
          const { ok, why } = checkOnChip(j.job_title, chipKeywords);
          if (!ok) { rejected.push({ title: j.job_title, company: j.name, why_rejected: why }); return false; }
          return true;
        };

        const legit = (arr) => arr.filter(j => !isJunk(j) && !isNonStudentLevel(j));
        const onChip = (arr) => arr.filter(j => isOnChip(j));

        // ── 1. Fetch jobs (single live call + immediate curated fallback) ─
        // Each live API call takes 10-15s. The old cascade made up to 3 sequential
        // calls (39s+), which triggered platform-level timeouts that silently
        // killed the effect before the curated fallback could fire — the root
        // cause of "no matches found" even when the backend had results.
        const fetchJobs = async (locOverride) => {
          const loc = locOverride !== undefined ? locOverride : location;
          try {
            const r = await base44.functions.invoke('getLiveJobMatchesFn', {
              career_goals: { role, industries, locations: [loc], seeking: cg.seeking || 'both' },
              force_refresh: true,
            });
            return r?.data?.companies || r?.companies || [];
          } catch (e) {
            console.warn('[MagicMoment] fetchJobs error:', e?.message || e);
            return [];
          }
        };

        // ── Jobs + People IN PARALLEL ─────────────────────────────────────
        // These are independent lists (see header comment). Running them
        // concurrently cuts total wait from (jobs + people) to max(jobs, people).
        // The people search uses curated companies (instant — no dependency on
        // the live job API) and is capped at 4 companies with a HARD 40s deadline
        // so a slow Layer 2 LLM web-search can never hang the Magic Moment.

        const jobsPhase = async () => {
          setPhase('Finding matching jobs…');
          // ── Location debugging: log why Miami in-market might be 0 ──
          console.log('[MagicMoment] LOCATION', { raw: location, city: userCity, state: userState, hasMarket });

          const metroRaw = await fetchJobs(location);
          let lj = onChip(legit(metroRaw));
          console.log('[MagicMoment] JOBS', { stage: 'metro', jsearch_count: metroRaw.length, after_chip: lj.length });

          // ONE widening call to state if the metro was thin — don't stack a
          // third "anywhere" call (that's what pushed total time past 30s).
          if (lj.length < 3 && userState) {
            setPhase('Widening the search…');
            const stateRaw = await fetchJobs(userState);
            const stateJobs = onChip(legit(stateRaw));
            console.log('[MagicMoment] JOBS', { stage: 'state', jsearch_count: stateRaw.length, after_chip: stateJobs.length });
            lj = [...lj, ...stateJobs];
          }

          // Dedupe the LIVE pool first — the job API frequently returns the same
          // posting several times, which made a 1-job pool look like 3+ and
          // wrongly suppressed the curated list (one lonely remote card).
          const seenLive = new Set();
          const liveUnique = [];
          for (const j of lj) {
            const k = ((j.name || '') + '|' + (j.job_title || '')).toLowerCase();
            if (seenLive.has(k)) continue;
            seenLive.add(k);
            liveUnique.push(j);
          }
          const inMarketLive = hasMarket ? liveUnique.filter(j => ['same_location', 'nearby'].includes(tierOf(j))) : liveUnique;
          console.log('[MagicMoment] JOBS', { stage: 'live_deduped', unique: liveUnique.length, after_location: inMarketLive.length });

          // Curated roles top up the list so the cycle is never a single card.
          // In-market live jobs still SORT first (tierOrder below), so Miami
          // results always lead ahead of remote curated ones.
          const cj = onChip(getChipCuratedJobs(chipText, location));
          console.log('[MagicMoment] JOBS', { stage: 'curated', curated_count: cj.length });
          let oj = [...liveUnique, ...cj];

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
          // Safety net: if the location gate rejected EVERYTHING, fall back to
          // all on-chip jobs (sorted by tier) rather than showing "no matches found".
          if (dedupedJ.length === 0 && oj.length > 0) {
            for (const j of oj) {
              const k = (j.name + '|' + j.job_title).toLowerCase();
              if (seenJ.has(k)) continue;
              seenJ.add(k);
              dedupedJ.push(j);
            }
          }
          const tierOrder = { same_location: 0, nearby: 1, remote: 2, other: 3 };
          // BUG FIX: `0 || 3` === 3 in JS (0 is falsy), so same_location jobs
          // (rank 0) were treated as rank 3 and sorted BELOW remote (rank 2) —
          // that's why Miami jobs sat under remote UHC/CVS. Nullish coalescing
          // preserves 0.
          const tierRank = (j) => tierOrder[tierOf(j)] ?? 3;
          dedupedJ.sort((a, b) => tierRank(a) - tierRank(b));
          const topJobs = dedupedJ.slice(0, 8);

          setPhase('Confirming live postings…');
          // Only live-check the top 4 — the rest render without Apply until
          // validated. Checking all 8 added latency with diminishing returns.
          const LIVE_CHECK_LIMIT = 4;
          const liveChecked = await Promise.all(
            topJobs.map(async (job, i) => {
              if (i >= LIVE_CHECK_LIMIT) return { ...job, live: undefined, _tier: tierOf(job) };
              const chk = await checkJobLive(base44, job);
              return { ...job, live: chk.ok, _tier: tierOf(job) };
            })
          );
          // Defensive final sort on the computed _tier so in-market jobs are
          // guaranteed above remote in the rendered list.
          const _finalRank = (j) => tierOrder[j._tier] ?? tierOf(j) ?? 3;
          liveChecked.sort((a, b) => _finalRank(a) - _finalRank(b));
          return { liveChecked, topJobs };
        };

        const PEOPLE_DEADLINE_MS = 40_000;
        const peoplePhase = async () => {
          setPhase('Finding people from your school…');
          let peopleGated = false;
          const allPeople = [];
          let school_level_called = false;
          let school_level_error = '';

          // ── 1. ONE school-level search first ───────────────────────────────
          // "[School] alumni in healthcare in Miami" — NOT company-scoped. This
          // finds alumni in the field+market directly, so UM/UF healthcare alumni
          // in Miami surface even when no curated company has a cached match.
          // (The old code ONLY scanned curated companies — Humana/Teladoc/Cigna —
          //  and asked "who from your school works at THIS company?", which
          //  returned 0 when nobody was cached at those four firms.)
          try {
            school_level_called = true;
            const schoolRes = await base44.functions.invoke('findCliffPeople', {
              school_level: true, magic_moment: true,
              targetRole: role, chipText,
              schoolName: user.school, schoolCode: user.school_code,
              location,
            });
            if (schoolRes?.data?.upgrade_required || schoolRes?.upgrade_required) {
              peopleGated = true;
            } else {
              const conns = schoolRes?.data?.connections || schoolRes?.connections || [];
              for (const c of conns) allPeople.push(c);
            }
          } catch (e) {
            school_level_error = e?.message || String(e);
            console.warn('[MagicMoment] school-level people search error:', school_level_error);
          }

          // ── 2. Company scan (for Best Path) — only if school-level found nobody
          // Capped at 4 companies. Each batch is RACED against the remaining
          // deadline so a slow Layer 2 LLM web-search can't hang past 40s — the
          // old code awaited Promise.all of 4 searches (60s+), bypassing the cap.
          if (!peopleGated && allPeople.length === 0) {
            const scanCompanies = [...new Set(getChipCuratedJobs(chipText, location).map(j => j.name).filter(Boolean))]
              .filter(c => c.length > 1)
              .slice(0, 4);

            const deadline = Date.now() + PEOPLE_DEADLINE_MS;
            for (let i = 0; i < scanCompanies.length; i += 4) {
              const remaining = deadline - Date.now();
              if (remaining <= 0) break; // hard deadline — never hang
              const batch = scanCompanies.slice(i, i + 4);
              // Race the batch against the remaining deadline — if it times out,
              // drop the in-flight searches and proceed with what we have.
              const results = await Promise.race([
                Promise.all(batch.map(company =>
                  base44.functions.invoke('findCliffPeople', {
                    companyName: company, targetRole: role, magic_moment: true,
                    schoolName: user.school, schoolCode: user.school_code,
                    chipText, location,
                  }).then(r => ({ company, res: r }))
                    .catch(() => ({ company, res: { connections: [] } }))
                )),
                new Promise(resolve => setTimeout(() => resolve(null), remaining)),
              ]);
              if (results === null) break; // timed out — stop scanning
              if (results.some(r => r.res?.data?.upgrade_required || r.res?.upgrade_required)) {
                peopleGated = true; break;
              }
              for (const r of results) {
                const conns = r.res?.data?.connections || r.res?.connections || [];
                for (const c of conns) allPeople.push(c);
              }
            }
          }
          return { allPeople, peopleGated, school_level_called, school_level_error };
        };

        // ── Jobs + People: decoupled render ──────────────────────────────────
        // Jobs render FIRST (don't block on people). People attach when they
        // arrive — within the 40s deadline, or later in the background. The old
        // Promise.all waited for BOTH, so a 60s people search hung the loader.
        const jobsPromise = jobsPhase();
        const peoplePromise = peoplePhase();

        const jobsResult = await jobsPromise;
        const { liveChecked, topJobs } = jobsResult;
        setJobsList(liveChecked);
        setPhase(null); // FIRST PAINT — jobs render now

        // Shared handler: dedupe + filter to real + best-path detection.
        let _peopleState = { realPeople: [], best: null };
        const processPeople = (pr) => {
          if (!pr || pr.__timeout) return;
          setPeopleLoading(false);
          if (pr.peopleGated) { setShowSoftWall(true); return; }
          const peopleSeen = new Set();
          const realPeople = [];
          for (const p of pr.allPeople) {
            const key = (p.name || '').toLowerCase();
            if (!key || peopleSeen.has(key)) continue;
            const g = gatePersonReal(p);
            if (!g.ok) continue;
            peopleSeen.add(key);
            realPeople.push(p);
            if (realPeople.length >= 3) break;
          }
          setPeopleList(realPeople);

          // Detect best path (person company ∩ live job company)
          let best = null;
          for (const person of realPeople) {
            const pCompany = (person.company || '').toLowerCase();
            if (!pCompany) continue;
            for (const job of liveChecked) {
              // In-market curated jobs (e.g. Jackson Health) form a Best Path
              // even without a live HIRING check — a Jackson alum + a Jackson
              // posting is a real warm path. Live remote jobs still match too.
              const isInMarket = job._tier === 'same_location' || job._tier === 'nearby';
              if (!isInMarket && !job.live) continue;
              const jCompany = (job.name || '').toLowerCase();
              if (pCompany === jCompany || pCompany.includes(jCompany) || jCompany.includes(pCompany)) {
                best = { job, person };
                break;
              }
            }
            if (best) break;
          }
          setBestPath(best);
          _peopleState = { realPeople, best };
        };

        // Wait up to 40s for people; if they don't arrive, proceed and attach
        // them later whenever the promise resolves.
        let peopleTimedOut = false;
        let peopleResult = null;
        try {
          const raced = await Promise.race([
            peoplePromise,
            new Promise(resolve => setTimeout(() => resolve({ __timeout: true }), PEOPLE_DEADLINE_MS)),
          ]);
          if (raced?.__timeout) {
            peopleTimedOut = true;
          } else {
            peopleResult = raced;
            processPeople(raced);
          }
        } catch (e) {
          // peoplePhase shouldn't throw, but guard anyway
        }

        // If people timed out, stop the loader — jobs are already up, and
        // people attach in the background when they land (processPeople flips
        // the list then). Don't spin "Finding people…" forever.
        if (peopleTimedOut) {
          setPeopleLoading(false);
          peoplePromise.then(processPeople).catch(() => {});
        }

        const realPeople = _peopleState.realPeople;
        const best = _peopleState.best;

        // ── CONSOLIDATED RUN DIAGNOSTIC (one line per run) ───────────────
        // Tells us, from the exact run, whether school_level ran, what the
        // people search returned, and how many in-market live jobs survived
        // remote exclusion. No behavior change — logging only.
        const inMarketLiveCount = liveChecked.filter(
          j => j.live && j._tier && j._tier !== 'remote' && j._tier !== 'other'
        ).length;
        console.log('[MagicMoment] RUN', {
          LOCATION: { city: userCity, state: userState, hasMarket },
          JOBS: {
            inMarketLive: inMarketLiveCount,
            liveConfirmed: liveChecked.filter(j => j.live).length,
            totalChecked: liveChecked.length,
          },
          PEOPLE: {
            school_level_called: peopleResult?.school_level_called ?? (peopleTimedOut ? 'timed_out_pending' : false),
            people_count: realPeople.length,
            people_source: peopleSource,
            error: peopleResult?.school_level_error || '',
            people_gated: peopleResult?.peopleGated || false,
            timed_out: peopleTimedOut,
          },
        });

        if (peopleTimedOut && realPeople.length === 0) {
          // People still loading — note it on the page; they'll attach when ready.
          // Don't set a blocking phase; jobs are already rendered.
        }

        // ── Track completion (the cycle was shown to the student) ──────────
        base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
        const peopleSource = realPeople[0]?.source || 'none';
        const resultType = best
          ? 'best_path'
          : (liveChecked.length > 0 && realPeople.length > 0
              ? 'jobs_and_people'
              : (liveChecked.length > 0 ? 'jobs_only' : 'people_only'));
        const tailorFor = best?.job || liveChecked.find(j => j.live) || null;
        trackMagicMomentCompleted({
          jobs_count: liveChecked.length,
          people_count: realPeople.length,
          best_path: !!best,
          people_source: peopleSource,
          result_type: resultType,
          hero_job_title: tailorFor?.job_title || '',
          hero_company: tailorFor?.name || '',
          has_tailored_resume: false,
        });
        trackConversionEvent('magic_moment_completed', {
          jobs_count: liveChecked.length,
          people_count: realPeople.length,
          best_path: !!best,
          result_type: resultType,
        });
        markMagicMomentCompleted();
        // Set the user flag so OnboardingGuard stops redirecting to MM
        base44.auth.updateMe({ magic_moment_completed: true }).catch(() => {});

        console.log('[MagicMoment] RESULT', JSON.stringify({
          chip: chipText, location, jobs_count: liveChecked.length,
          live_jobs: liveChecked.filter(j => j.live).length,
          people_count: realPeople.length, best_path: !!best,
          people_source: peopleSource, result_type: resultType,
          reject_samples: rejected.slice(0, 10),
        }, null, 2));

        // ── Resume tailoring (background — updates `tailored` state when done) ──
        // Non-blocking: the lists are already rendered. If tailoring succeeds,
        // the resume card populates with the tailored result.
        if (tailorFor) {
          (async () => {
            try {
              const resumeUrl = user.resume_url || user.resume_file_url;
              let resumeText = '';
              if (resumeUrl) {
                let resumes = [];
                try { resumes = await base44.entities.Resume.filter({ student_email: user.email }, '-created_date', 5); } catch (e) {}
                resumeText = resumes?.[0]?.parsed_text || '';
                if (!resumeText) {
                  const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: resumeUrl, json_schema: RESUME_SCHEMA });
                  const parsed = extracted?.output || extracted;
                  resumeText = parsedResumeToText(parsed);
                  if (resumeText.length > 100) await saveParsedResume(base44, user.email, parsed, resumeUrl, '').catch(() => {});
                }
              }
              if (resumeText.length > 100) {
                const tailRes = await base44.functions.invoke('tailorResume', {
                  resumeText, jobTitle: tailorFor.job_title, companyName: tailorFor.name,
                  jobDescription: tailorFor.hiring_description || '',
                });
                const tr = tailRes?.data || tailRes;
                if (tr) setTailored(tr);
              }
            } catch (e) {}
          })();
        }
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setPhase(null);
      }
    })();
  }, [user, runKey]);

  const downloadResume = () => {
    if (!tailored?.tailoredResume?.tailored_content && !tailored?.tailored_content) return;
    const content = tailored.tailoredResume?.tailored_content || tailored.tailored_content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `CLIFF-tailored-resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase) return <MagicMomentLoader phase={phase} />;

  // Search bar — always visible so the user (or tester) can try any role + location
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

  // Empty ONLY when both lists are truly empty
  const bothEmpty = jobsList.length === 0 && peopleList.length === 0;

  if (error && bothEmpty) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', paddingBottom: 48 }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>Let's try that again.</h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>{error}</p>
          </div>
          {SearchBar}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/FreeTierDashboard')} style={pill({})}>Go to dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  const liveJobCompanies = jobsList.filter(j => j.live).map(j => (j.name || '').toLowerCase());

  // First meaningful action (apply or copy) — never blocks, just marks progress.
  const handleAction = () => setDidAction(true);
  const handleRowApply = (job) => { logJobApplied({ user, job }); setDidAction(true); };
  // Resume tailoring only ever targets a specific job: the Best Path role.
  const resumeTargetJob = bestPath?.job || null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div data-testid="mm-free-cycle-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            {bestPath ? 'CLIFF found your best path.' : 'Here are your matches.'}
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>
            {heroMeta.chipLabel ? `${heroMeta.chipLabel} roles` : 'Matching roles'}{peopleLoading ? ' — finding people from your school…' : (peopleList.length > 0 ? ' and people from your school.' : ' for you — no school connections found yet.')}
          </p>
        </div>

        {/* Search bar */}
        {SearchBar}

        {/* Empty-state prompt — when both lists are empty, show guidance instead of just the resume card */}
        {bothEmpty && !error && (
          <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
              No matches found for this search.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5 }}>
              Try a different role or location above — e.g. "HR" in "Miami, FL" or "Marketing" in "New York, NY".
            </p>
            <button onClick={() => navigate('/FreeTierDashboard')} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
              ← Back to dashboard
            </button>
          </div>
        )}

        {/* 1. Best path card (only when a real live job + a real school person at that company both exist) */}
        {bestPath && (
          <BestPathCard job={bestPath.job} person={bestPath.person} user={user} onAction={handleAction} />
        )}

        {/* 2. Jobs for you — excludes the Best Path job so it's not duplicated */}
        {(() => {
          const excludeKey = bestPath
            ? `${(bestPath.job.name || '')}|${(bestPath.job.job_title || '')}`.toLowerCase()
            : '';
          const remaining = excludeKey
            ? jobsList.filter(j => `${(j.name || '')}|${(j.job_title || '')}`.toLowerCase() !== excludeKey)
            : jobsList;
          if (!remaining.length) return null;
          // Honest location note: if the student asked for a market but every
          // job came back remote, don't pretend they're in-market.
          const hasInMarket = remaining.some(j => j._tier === 'same_location' || j._tier === 'nearby');
          const allRemote = !hasInMarket && remaining.every(j => j._tier === 'remote' || !j._tier);
          return (
            <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
              <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Jobs for you" />
              {allRemote && searchLoc && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '0 0 10px', lineHeight: 1.4 }}>
                  No roles found specifically in {searchLoc} — showing remote roles in your field.
                </p>
              )}
              <JobsList jobs={remaining} onApply={handleRowApply} />
            </div>
          );
        })()}

        {/* 3. People from your school in this lane — excludes the Best Path person */}
        {(() => {
          const excludeName = bestPath?.person?.name || '';
          const remaining = excludeName
            ? peopleList.filter(p => (p.name || '').toLowerCase().trim() !== excludeName.toLowerCase().trim())
            : peopleList;
          if (!remaining.length) {
            // While the school-level people search is still running, show a
            // loading state — NOT the "no connections" empty state. People
            // attach in the background when they land; this prevents the false
            // "no connections found" subtitle during the search window.
            if (peopleLoading) {
              return (
                <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
                  <SectionLabel icon={<Users size={14} color={INDIGO_DIM} />} label={heroMeta.chipLabel ? `People from your school in ${heroMeta.chipLabel.toLowerCase()}` : 'People from your school'} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, border: '2px solid #e9d5ff', borderTop: `2px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Finding people from your school…</p>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '4px 0 0', lineHeight: 1.4 }}>CLIFF is searching for alumni in this field. This usually takes a few seconds.</p>
                    </div>
                  </div>
                </div>
              );
            }
            // Honest empty state — search completed and found nobody.
            const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${user?.school || ''} ${heroMeta.chipText} ${searchLoc || ''}`)}`;
            return (
              <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
                <SectionLabel icon={<Users size={14} color={INDIGO_DIM} />} label="People from your school" />
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No connections found yet.</p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5 }}>
                  CLIFF couldn't find alumni from your school in this field right now. You can search LinkedIn directly:
                </p>
                <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: INDIGO, padding: '10px 16px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Search LinkedIn <ExternalLink size={12} />
                </a>
              </div>
            );
          }
          return (
            <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
              <SectionLabel icon={<Users size={14} color={INDIGO_DIM} />} label={heroMeta.chipLabel ? `People from your school in ${heroMeta.chipLabel.toLowerCase()}` : 'People from your school'} />
              <PeopleList people={remaining} user={user} liveJobCompanies={liveJobCompanies} chipText={heroMeta.chipText} onAction={handleAction} />
            </div>
          );
        })()}

        {/* 4. Resume — only with a tailored result or a specific target job */}
        {!bothEmpty && (
          <HeroResume tailored={tailored} onDownload={downloadResume} targetJob={resumeTargetJob} />
        )}

        {/* 5. Where they go next — always present, never a dead end */}
        {!bothEmpty && (
          <NextStepFooter
            didAction={didAction}
            peopleCount={peopleList.length}
            bestPathCompany={bestPath?.job?.name || ''}
            hasBestPath={!!bestPath}
            onUpgrade={() => setShowPro(true)}
          />
        )}
      </div>
      {showPro && <ProUpgradeModal user={user} onClose={() => setShowPro(false)} source="magic_moment" />}
      {showSoftWall && <SoftWallModal user={user} onClose={() => setShowSoftWall(false)} source="soft_wall" />}
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