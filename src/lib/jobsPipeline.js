// Shared jobs pipeline — Jobs list = you can apply.
// Only live-verified roles with apply URLs appear. Non-hiring companies
// are never shown in the Jobs list. If the in-market live pool is short,
// fills with live remote roles and surfaces an honest short-pool message.
import { base44 } from '@/api/base44Client';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { checkJobLive, hasApplyUrl } from '@/lib/jobFreshness';

const TIER_ORDER = { same_location: 0, nearby: 1, remote: 2, other: 3 };

const isJunk = (j) => /\b(independent|1099|own business|own biz|build your own|be your own|partner program|independent partner|work[- ]from[- ]home opportunity|unlimited earning|franchise|mlm|multi[- ]level)\b/i
  .test(`${j.job_title || ''} ${j.hiring_description || ''}`);

const isNonStudentLevel = (j) => /\b(charge nurse|director of nursing|nurse manager|nursing supervisor|clinical director|VP of|vice president|chief .+ officer|head of|department head|senior director|principal engineer)\b/i
  .test(j.job_title || '');

function makeTierOf(userCity, userState) {
  return (j) => {
    const loc = (j.location || '').toLowerCase();
    if (!loc) return 'other';
    if (/\bremote\b|work\s*from\s*home/.test(loc)) return 'remote';
    if (userCity && loc.includes(userCity.toLowerCase())) return 'same_location';
    if (userState && loc.includes(userState.toLowerCase())) return 'nearby';
    return 'other';
  };
}

/**
 * @returns { jobs, shortMessage }
 *   jobs         — only live-verified roles with apply URLs, sorted by tier
 *   shortMessage — set when the in-market pool was short and remote fill was used
 */
export async function buildLiveJobsList({ role, industries, location, seeking, chipText, maxJobs = 10 }) {
  const chipKeywords = chipKeywordsFor(chipText);
  const isOnChip = (j) => checkOnChip(j.job_title, chipKeywords).ok;
  const legit = (arr) => arr.filter(j => !isJunk(j) && !isNonStudentLevel(j));
  const onChip = (arr) => arr.filter(j => isOnChip(j));

  const locParts = (location || '').split(',').map(p => p.trim()).filter(Boolean);
  const userCity = locParts[0] || '';
  const userState = locParts[1] || '';
  const tierOf = makeTierOf(userCity, userState);

  const fetchJobs = async (locOverride) => {
    const loc = locOverride !== undefined ? locOverride : location;
    try {
      const r = await base44.functions.invoke('getLiveJobMatchesFn', {
        career_goals: { role, industries, locations: [loc], seeking: seeking || 'both' },
        force_refresh: true,
      });
      return r?.data?.companies || r?.companies || [];
    } catch (e) {
      return [];
    }
  };

  const dedupe = (arr) => {
    const seen = new Set();
    const out = [];
    for (const j of arr) {
      const k = ((j.name || '') + '|' + (j.job_title || '')).toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(j);
    }
    return out;
  };

  // Live-check candidates; keep only verified-live roles with apply URLs.
  const liveCheck = async (arr) => {
    const checked = await Promise.all(
      arr.map(async (job) => {
        const chk = await checkJobLive(base44, job);
        return { ...job, live: chk.ok, _tier: tierOf(job) };
      })
    );
    return checked.filter(j => j.live === true && hasApplyUrl(j));
  };

  // 1. Fetch metro, then state if short
  let pool = onChip(legit(await fetchJobs(location)));
  if (pool.length < 5 && userState) {
    pool = [...pool, ...onChip(legit(await fetchJobs(userState)))];
  }
  pool = dedupe(pool);

  // 2. Exclude cross-metro jobs when user has a market
  const hasMarket = !!(userCity || userState);
  const inMarket = hasMarket ? pool.filter(j => tierOf(j) !== 'other') : pool;

  // 3. Live-check all candidates, keep only verified live.
  //    Pro requests more — check a wider pool so we can return up to maxJobs.
  const checkLimit = maxJobs > 10 ? Math.min(maxJobs + 10, 35) : 10;
  let liveJobs = await liveCheck(inMarket.slice(0, checkLimit));

  // 4. If short, fill with live remote
  let shortMessage = '';
  if (liveJobs.length < 3) {
    shortMessage = `Few live roles in ${userCity || userState || 'your area'} right now — showing remote roles you can apply to.`;
    const remoteRaw = onChip(legit(await fetchJobs('Remote')));
    const remoteNew = remoteRaw.filter(j => {
      const k = ((j.name || '') + '|' + (j.job_title || '')).toLowerCase();
      return !liveJobs.some(lj => ((lj.name || '') + '|' + (lj.job_title || '')).toLowerCase() === k);
    });
    const remoteLimit = maxJobs > 10 ? 15 : 6;
    const remoteLive = await liveCheck(remoteNew.slice(0, remoteLimit));
    liveJobs = [...liveJobs, ...remoteLive];
  }

  // 5. Sort by tier (metro → state → remote), cap at maxJobs
  const tierRank = (j) => TIER_ORDER[j._tier] ?? 3;
  liveJobs.sort((a, b) => tierRank(a) - tierRank(b));

  return { jobs: liveJobs.slice(0, maxJobs), shortMessage };
}