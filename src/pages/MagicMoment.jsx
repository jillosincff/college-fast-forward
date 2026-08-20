import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parsedResumeToText, saveParsedResume } from '@/lib/resumeText';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  VIOLET, GRAD_INDIGO, SHADOW, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Users, Mail, Sparkles } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, trackOutreachCopied, markMagicMomentCompleted } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import SoftWallModal from '@/components/conversion/SoftWallModal';
import { getCuratedFallback, getChipCuratedJobs, detectChipKey } from '../../base44/shared/curatedJobs';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import MagicMomentLoader from '@/components/magic-moment/MagicMomentLoader';
import HeroJobHeader from '@/components/magic-moment/HeroJobHeader';
import HeroPeople from '@/components/magic-moment/HeroPeople';
import HeroOutreach from '@/components/magic-moment/HeroOutreach';
import HeroResume from '@/components/magic-moment/HeroResume';
import LockedJobsRail from '@/components/magic-moment/LockedJobsRail';

// The free Magic Moment — one complete plan cycle shown on a single screen:
// a high-fit job, a tailored resume, real alumni at the company, and a
// ready-to-send warm outreach draft. Everything after this is the hard paywall.

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
const ghostBtn = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff',
  border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '13px 20px', cursor: 'pointer', minHeight: 'auto',
  display: 'inline-flex', alignItems: 'center', gap: 8, ...extra,
});

export default function MagicMoment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [phase, setPhase] = useState('Finding a high-fit job…');
  const [job, setJob] = useState(null);
  const [tailored, setTailored] = useState(null);
  const [connections, setConnections] = useState([]);
  const [outreach, setOutreach] = useState(null);
  const [copied, setCopied] = useState(false);
  // Sticks once the student copies — `copied` is only a 2.6s toast flag.
  const [revealPaywall, setRevealPaywall] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showSoftWall, setShowSoftWall] = useState(false);
  const [error, setError] = useState('');
  const [lockedJobs, setLockedJobs] = useState([]);
  // Only claim "matches your {chip}" when the hero actually passed the chip gate.
  const [heroMeta, setHeroMeta] = useState({ onChip: false, chipLabel: '' });

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;
    trackMagicMomentStarted({
      target_field: ((user.career_goals?.target_industries) || []).join(', '),
      target_role: (user.career_goals?.target_roles || [])[0] || '',
      school: user.school || '',
    });
    (async () => {
      try {
        const cg = user.career_goals || {};
        const role = (cg.target_roles || [])[0] || '';
        const industries = cg.target_industries || [];
        const location = cg.location_preference || '';

        // 1. Find a high-fit job — LOCATION + LEGITIMACY first, people second,
        //    remote only as a last resort. The free first cycle must NEVER
        //    bait-and-switch a New York student into a remote "build your own
        //    biz" posting just because the title keyword matched.
        //    Priority: same-location+warm → nearby/metro+warm → same-location
        //    cold → nearby cold → remote (anywhere) ONLY if all of those fail.
        const fetchJobs = async (locOverride) => {
          const loc = locOverride !== undefined ? locOverride : location;
          const r = await base44.functions.invoke('getLiveJobMatchesFn', {
            career_goals: { role, industries, locations: loc ? [loc] : [], seeking: cg.seeking || 'both' },
            force_refresh: true,
          });
          return r?.data?.companies || r?.companies || [];
        };

        // Parse the student's location intent into city/state tokens for tiering.
        const locParts = (location || '').split(',').map(p => p.trim()).filter(Boolean);
        const userCity = locParts[0] || '';
        const userState = locParts[1] || '';

        // Partition a pool by location fit. "Widen" means metro/hybrid/adjacent
        // in the SAME market — never a different work mode. Pure Remote is its
        // own last-resort tier; "Remote in NY" stays in-market as nearby.
        const tierOf = (j) => {
          const loc = (j.location || '').toLowerCase();
          if (!loc) return 'other';
          const isRemote = /\bremote\b|work\s*from\s*home/.test(loc);
          const cityHit = userCity && loc.includes(userCity.toLowerCase());
          const stateHit = userState && loc.includes(userState.toLowerCase());
          if (isRemote) return (stateHit || cityHit) ? 'nearby' : 'remote';
          if (cityHit) return 'same_location';
          if (stateHit) return 'nearby';
          return 'other';
        };

        // Junk / hustle postings destroy trust in the first cycle — exclude them
        // entirely (independent / 1099 / own biz / partner program / MLM / etc.).
        const isJunk = (j) => /\b(independent|1099|own business|own biz|build your own|be your own|partner program|independent partner|work[- ]from[- ]home opportunity|unlimited earning|franchise|mlm|multi[- ]level)\b/i
          .test(`${j.job_title || ''} ${j.hiring_description || ''}`);

        // Tie-breaker for cold fallback: prefer real employee-style roles.
        const looksLikeRealRole = (j) => /\b(intern|analyst|coordinator|associate|assistant|specialist|trainee|graduate)\b/i.test(j.job_title || '');

        // ── Role fidelity ───────────────────────────────────────────────────
        // The first-cycle job must clearly match the student's chip. A generic
        // "Associate" with no marketing/brand/content in the title is a safety-
        // net result, not a Wow. We partition the pool into on-chip and off-chip;
        // off-chip is only touched as an absolute last resort (in-market only —
        // cold + generic + remote is an automatic fail).
        // The chip is everything the student told us: role + industry.
        const chipText = `${role || ''} ${(industries || []).join(' ')}`.trim();
        const chipLabel = industries[0] || role || '';
        const chipKeywords = chipKeywordsFor(chipText);
        const rejected = [];
        const logReject = (j, why) => rejected.push({
          job_id: j.job_id || j.id || null, title: j.job_title || '', company: j.name || '', why_rejected: why,
        });
        // Title-only match for the first cycle — a generic "Specialist" whose
        // DESCRIPTION happens to mention the chip is NOT on-chip.
        const isOnChip = (j) => {
          const { ok, why } = checkOnChip(j.job_title, chipKeywords);
          if (!ok) { logReject(j, why); return false; }
          return true;
        };

        const legit = (arr) => arr.filter(j => !isJunk(j));
        const onChip = (arr) => arr.filter(j => isOnChip(j));
        const byTier = (arr) => {
          const b = { same_location: [], nearby: [], remote: [], other: [] };
          for (const j of arr) b[tierOf(j)].push(j);
          return b;
        };

        let gated = false;
        let jobsScanned = 0;
        const alumniMap = {};
        let sourcePool = [];
        // Scan a pool in batches for the first job with a real insider. Stops at
        // the first warm hit so high-volume targets (Finance + NYC) almost never
        // return cold. Returns { job, conns } or null.
        const scanForWarm = async (pool) => {
          const MAX = Math.min(pool.length, 18);
          for (let start = 0; start < MAX; start += 6) {
            const batch = pool.slice(start, start + 6);
            if (!batch.length) break;
            const results = await Promise.all(batch.map(j =>
              base44.functions.invoke('findWorkspaceConnections', { companyName: j.name, targetRole: j.job_title || role, magic_moment: true })
                .then(r => ({ job: j, res: r }))
                .catch(() => ({ job: j, res: { connections: [] } }))
            ));
            if (results.some(r => r.res?.data?.upgrade_required || r.res?.upgrade_required)) { gated = true; return null; }
            jobsScanned += batch.length;
            for (const r of results) {
              const c = r.res?.data?.connections || r.res?.connections || [];
              alumniMap[r.job.name] = c.length;
              if (c.length > 0) return { job: r.job, conns: c };
            }
          }
          return null;
        };
        const pickCold = (pool) => (pool.length ? (pool.find(looksLikeRealRole) || pool[0]) : null);

        // Run the full tiered selection (warm → cold, same-location → nearby)
        // on a bucket set. Returns { job, conns, resultType } or null.
        const selectFromBuckets = async (b, prefix) => {
          if (gated) return null;
          let hit = await scanForWarm(b.same_location);
          if (hit) return { job: hit.job, conns: hit.conns, resultType: `${prefix}warm_same_location` };
          if (gated) return null;
          hit = await scanForWarm(b.nearby);
          if (hit) return { job: hit.job, conns: hit.conns, resultType: `${prefix}warm_nearby` };
          if (gated) return null;
          if (b.same_location.length) return { job: pickCold(b.same_location), conns: [], resultType: `${prefix}cold_same_location` };
          if (b.nearby.length) return { job: pickCold(b.nearby), conns: [], resultType: `${prefix}cold_nearby` };
          return null;
        };

        setPhase('Finding a high-fit job…');
        // On-chip pool first — titles/descriptions that clearly match the chip.
        const rawJobs = legit(await fetchJobs(location));
        let buckets = byTier(onChip(rawJobs));

        // In-market widen (state/metro) before ever touching remote — only when
        // the same-city pull came back thin. Never widen to "anywhere" here.
        if (!buckets.same_location.length && !buckets.nearby.length) {
          setPhase('Widening the search…');
          await new Promise(res => setTimeout(res, 900));
          if (userState) {
            const rawWiden = legit(await fetchJobs(userState));
            const wb = byTier(onChip(rawWiden));
            buckets.same_location.push(...wb.same_location);
            buckets.nearby.push(...wb.nearby);
          }
        }

        // ── Tiered selection: on-chip first, people-first, location-first ────
        setPhase('Finding people on the inside…');
        let topJob = null, conns = [], resultType = 'empty';
        const onChipResult = await selectFromBuckets(buckets, '');
        if (onChipResult) { topJob = onChipResult.job; conns = onChipResult.conns; resultType = onChipResult.resultType; sourcePool = [...buckets.same_location, ...buckets.nearby]; }

        if (gated) { setShowSoftWall(true); setPhase(null); return; }

        // ── Curated BEFORE remote ────────────────────────────────────────────
        // Curated jobs are on-chip, in-market, real companies (Google, Meta,
        // NBCUniversal…) — exactly where alumni/parents are most likely to be.
        // Warm-scan them first: a Marketing Coordinator at Google WITH a UF alum
        // beats a cold one. Only fall back to cold curated if no warm curated
        // match exists.
        if (!topJob) {
          setPhase('Checking insider connections…');
          // Role first, then the student's industry chip — never a generic pull,
          // which is how a Healthcare student ended up with a Deloitte "Analyst".
          // Chip-specific curated inventory ONLY (role AND industry are both
          // considered). Generic inventory is allowed exclusively when the chip
          // itself is unknown — otherwise a Healthcare student would get the
          // shared "Deloitte Analyst" that Sales students also get.
          const chipCurated = getChipCuratedJobs(chipText, location);
          const knownChip = !!detectChipKey(chipText) || !!chipKeywords;
          const basePool = chipCurated.length > 0
            ? chipCurated
            : (knownChip ? [] : getCuratedFallback(role || industries[0] || '', location));
          // In-market before remote, and every candidate must pass the chip gate.
          const gate = onChip(basePool);
          const pool = gate.length > 0 ? gate : (knownChip ? [] : basePool);
          const inMarket = pool.filter(j => tierOf(j) !== 'remote');
          const curatedPool = inMarket.length > 0 ? inMarket : pool;
          sourcePool = curatedPool;
          const curatedWarm = curatedPool.length > 0 ? await scanForWarm(curatedPool) : null;
          if (curatedWarm) { topJob = curatedWarm.job; conns = curatedWarm.conns; resultType = 'curated_warm'; }
          else if (curatedPool.length) { topJob = curatedPool[0]; conns = []; resultType = 'curated_fallback'; }
          if (topJob) console.log('[MagicMoment] Served curated job:', topJob.name, topJob.job_title, resultType);
        }

        // ── Remote / anywhere — last resort ──────────────────────────────────
        // Only when no on-chip in-market job (live or curated) exists at all.
        if (!topJob && !gated) {
          setPhase('Looking beyond your market…');
          const rawAny = legit(await fetchJobs(''));
          const ab = byTier(onChip(rawAny));
          const remotePool = ab.remote.length ? ab.remote : [...ab.same_location, ...ab.nearby, ...ab.remote, ...ab.other];
          sourcePool = remotePool;
          const hit = await scanForWarm(remotePool);
          if (hit) { topJob = hit.job; conns = hit.conns; resultType = 'remote_fallback_warm'; }
          else { const cj = pickCold(remotePool); if (cj) { topJob = cj; resultType = 'remote_fallback'; } }
        }

        // NO off-chip fallback. A hero that doesn't pass the chip gate is worse
        // than no hero — it makes the whole product look fake. Last resort is
        // chip-shaped curated inventory; if even that is empty we say so.
        if (!topJob) {
          const lastResort = onChip(getChipCuratedJobs(chipText, location));
          if (lastResort.length) { topJob = lastResort[0]; conns = []; resultType = 'curated_fallback'; sourcePool = lastResort; }
        }

        // ── Hard final gate ───────────────────────────────────────────────
        // Regardless of which path produced topJob (live / curated / cached /
        // stale bundle), re-run the chip gate on the chosen hero and log it.
        // If the chip is known and the hero FAILS the title-only gate, it is
        // NEVER rendered — fall to the honest empty state. This is the single
        // guarantee that a generic "Analyst (Remote-Eligible)" can never reach
        // the screen stamped "matches your Marketing/Sales/Healthcare".
        if (topJob) {
          const finalOnChip = !chipKeywords ? null : isOnChip(topJob);
          console.log('[MagicMoment] HERO PICK', {
            job_id: topJob.job_id || topJob.id || null,
            title: topJob.job_title,
            company: topJob.name,
            chip: chipText,
            isOnChip: finalOnChip,
            source: resultType,
          });
          if (chipKeywords && !finalOnChip) {
            console.log('[MagicMoment] Rejected off-chip hero — refusing to render:', topJob.name, topJob.job_title);
            topJob = null;
            resultType = 'rejected_off_chip';
          }
        }

        if (rejected.length) console.log('[MagicMoment] rejected candidates:', rejected);
        if (!topJob) {
          console.log('[MagicMoment] no on-chip job found for chip:', chipText, location);
          setError(`CLIFF couldn't find a ${chipLabel || 'matching'} role that meets its bar yet. Try again shortly — it won't show you a job that isn't a real match.`);
          setPhase(null);
          return;
        }
        setHeroMeta({ onChip: !chipKeywords ? false : isOnChip(topJob), chipLabel });
        setJob(topJob);
        setConnections(conns.slice(0, 3));
        const heroKey = `${topJob?.name || ''}|${topJob?.job_title || ''}`;
        setLockedJobs(sourcePool
          .filter(j => `${j.name || ''}|${j.job_title || ''}` !== heroKey)
          .slice(0, 5)
          .map(j => ({ name: j.name, job_title: j.job_title, location: j.location, logo_url: j.logo_url, hasAlumni: (alumniMap[j.name] || 0) > 0 })));
        const matchType = conns.length > 0 ? 'warm' : 'cold';
        const locationMatch = resultType.includes('remote') ? 'remote'
          : (resultType.includes('same_location') || resultType.includes('nearby') || resultType.includes('curated')) ? 'same_market'
          : 'fallback';
        const targetField = industries[0] || role || 'your target';

        // 2. Resume — only tailor if the student uploaded one. No uploaded
        //    resume = honest empty card ("Upload your resume and CLIFF will
        //    tailor it to this job"), not a fake starter. The cycle still
        //    completes with job + alumni + outreach.
        let tailoredResult = null;
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
            setPhase('Tailoring your resume for this role…');
            try {
              const tailRes = await base44.functions.invoke('tailorResume', {
                resumeText, jobTitle: topJob.job_title, companyName: topJob.name,
                jobDescription: topJob.hiring_description || '',
              });
              tailoredResult = tailRes?.data || tailRes;
            } catch (e) { /* tailor best-effort */ }
            if (tailoredResult) setTailored(tailoredResult);
          }
          // No uploaded resume → tailored stays null → UI shows honest upload card
        } catch (e) { /* resume tailoring is best-effort — don't block the plan */ }

        // Alumni were already surfaced above when picking the job with a real
        // insider — nothing to do here.

        // 4. Write the outreach — warm if an alum was found, cold fallback otherwise
        const top = conns[0];
        const hasAlumni = !!top;
        setPhase(hasAlumni ? 'Writing your warm outreach…' : 'Writing your outreach…');
        try {
          const outRes = await base44.functions.invoke('generateOutreachDraft', {
            studentName: user.full_name || '',
            major: cg.target_industries?.[0] || '',
            targetRole: topJob.job_title || role,
            graduationYear: user.graduation_year || '',
            school: user.school || '',
            alumniName: hasAlumni ? top.name : '',
            alumniTitle: hasAlumni ? (top.role_title || '') : (topJob.job_title || role),
            alumniCompany: topJob.name,
            cold: !hasAlumni,
            magic_moment: true,
          });
          if (outRes?.data?.upgrade_required || outRes?.upgrade_required) { setShowSoftWall(true); setPhase(null); return; }
          const outData = outRes?.data || outRes;
          setOutreach({ ...outData, message: normalizeOutreachMessage(outData?.message), cold: !hasAlumni });
        } catch (e) {
          // Graceful fallback — never leave the user with an empty outreach block.
          const roleLabel = topJob.job_title || role || 'this role';
          const schoolLabel = user.school ? ` at ${user.school}` : '';
          const first = hasAlumni ? (top.name.split(' ')[0] || 'there') : '';
          const msg = hasAlumni
            ? `Hey ${first} — I'm a student${schoolLabel} and just applied to the ${roleLabel} role at ${topJob.name}. I saw you're on the team and would love any quick advice on standing out. Thanks either way.`
            : `Hi — I'm a student${schoolLabel} interested in the ${roleLabel} role at ${topJob.name}. I'd value any quick advice on how to stand out. Thanks either way.`;
          setOutreach({ message: msg, cold: !hasAlumni });
        }

        base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
        trackMagicMomentCompleted({
          hero_job_title: topJob?.job_title || '',
          hero_company: topJob?.name || '',
          alumni_count: conns?.length || 0,
          has_tailored_resume: !!tailored,
          outreach_cold: !conns?.[0],
          match_type: matchType,
          result_type: resultType,
          location_match: locationMatch,
          jobs_scanned: jobsScanned,
        });
        markMagicMomentCompleted();
        setPhase(null);
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setPhase(null);
      }
    })();
  }, [user]);

  const fitReason = job
    ? `Hiring now for ${job.job_title}${job.location ? ` in ${job.location}` : ''}${heroMeta.onChip && heroMeta.chipLabel ? ` — matches your ${heroMeta.chipLabel}.` : '.'}`
    : '';

  const handlePrimaryAction = async () => {
    const text = outreach?.message || '';
    if (!text) return;
    // 1. Copy the full draft to the clipboard (with a fallback for insecure contexts)
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(text);
      copiedOk = true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        copiedOk = true;
      } catch (e2) {}
    }
    // 2. Track reliably
    trackOutreachCopied({ company: job?.name || '', alumni: connections[0]?.name || '', cold: !!outreach?.cold });
    // 3. Open LinkedIn — alum's profile if we have it, else a people search for hiring managers at the company
    const top = connections[0];
    let url;
    if (top?.linkedin_url) {
      url = top.linkedin_url;
    } else if (outreach?.cold) {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${job?.name || ''} ${job?.job_title || ''} recruiter OR hiring`)}`;
    } else {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((top?.name || '') + ' ' + (job?.name || ''))}`;
    }
    try { window.open(url, '_blank', 'noopener'); } catch (e) {}
    // 4. Confirmation — tells them the draft is on the clipboard even if the popup was blocked
    setRevealPaywall(true);
    if (copiedOk) { setCopied(true); setTimeout(() => setCopied(false), 2600); }
  };

  const downloadResume = () => {
    if (!tailored?.tailoredResume?.tailored_content && !tailored?.tailored_content) return;
    const content = tailored.tailoredResume?.tailored_content || tailored.tailored_content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `CLIFF-tailored-${(job?.name || 'resume').replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase) return <MagicMomentLoader phase={phase} />;

  // ── Error state ────────────────────────────────────────────────
  if (error && !job) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, marginBottom: 20 }}>{error}</p>
          <button onClick={() => navigate('/FreeTierDashboard')} style={pill({})}>Go to dashboard →</button>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────
  const isWarm = connections.length > 0;
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div data-testid="mm-free-cycle-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            {isWarm ? 'CLIFF found someone on the inside.' : "Here's a role to start with."}
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>
            {isWarm
              ? 'One complete path — ready to send. The rest is unlocked with Pro.'
              : "We didn't find an alum at this company yet — here's your outreach draft anyway."}
          </p>
        </div>

        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '22px 20px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
          <HeroJobHeader job={job} fitReason={fitReason} />
          <div style={{ height: 1, background: '#f1e9ff', margin: '16px 0' }} />
          <SectionLabel icon={<Users size={14} color={INDIGO_DIM} />} label="People on the inside" />
          <HeroPeople connections={connections} companyName={job?.name} />
          <div style={{ height: 1, background: '#f1e9ff', margin: '16px 0' }} />
          <SectionLabel icon={<Mail size={14} color={INDIGO_DIM} />} label="Your outreach draft" />
          <HeroOutreach outreach={outreach} copied={copied} onCopy={handlePrimaryAction} onAskParent={() => setShowPro(true)} />
          <div style={{ height: 1, background: '#f1e9ff', margin: '16px 0' }} />
          <HeroResume tailored={tailored} onDownload={downloadResume} />
        </div>

        {user?.subscription_status !== 'active' && (
          <LockedJobsRail
            jobs={lockedJobs}
            isWarm={isWarm}
            revealed={isWarm || revealPaywall}
            onUnlock={() => setShowPro(true)}
            onAskParent={() => setShowPro(true)}
          />
        )}
      </div>
      {showPro && <ProUpgradeModal user={user} onClose={() => setShowPro(false)} source="magic_moment" />}
      {showSoftWall && <SoftWallModal user={user} onClose={() => setShowSoftWall(false)} source="soft_wall" />}
    </div>
  );
}

// Normalizes the outreach message so a raw/fenced JSON response from the LLM
// never reaches the screen. Extracts the body field and unescapes line breaks.
function normalizeOutreachMessage(raw) {
  if (!raw) return '';
  let text = String(raw);
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const extract = (str) => {
    try {
      const obj = JSON.parse(str);
      return obj.body || obj.message || '';
    } catch (e) { return ''; }
  };
  if (text.trim().startsWith('{')) {
    const body = extract(text) || extract(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    if (body) return body.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
}

function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      {icon}
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}