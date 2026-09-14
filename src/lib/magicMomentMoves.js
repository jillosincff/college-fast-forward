// Rank the live job pool into Pursue / Stretch using only real signals we
// already have. No fake "hiring manager" reasons. Skip-tier / off-chip jobs
// never reach here — buildLiveJobsList already filtered them off-screen.
//
// Fields used (all real, already available on each job / in ctx):
//   job.live       — live-verified posting with an apply URL (buildLiveJobsList)
//   job._tier      — same_location | nearby | remote | other (jobsPipeline.makeTierOf)
//   job.location    — raw location string
//   job.job_title   — on-chip match (chipGate) + intern/FT detection
//   onChip          — checkOnChip(title, chipKeywordsFor(chipText))
//   seeking         — career_goals.seeking ('internship' | 'fulltime' | 'both'/'either')
//   levelOk         — intern/FT match vs seeking (title heuristic)
//
// Verdict (honest — prefer fewer Pursues over padding with Stretch):
//   pursue  = live && onChip && levelOk && (inMarket || isRemote)
//   stretch = everything else (cross-metro 'other' tier, or level-mismatch)
// Stretch only fills the top-3 when fewer than 3 Pursues exist.

import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';

const TIER_RANK = { same_location: 0, nearby: 1, remote: 2, other: 3 };

export function rankMoves(jobs, { chipText, chipLabel, seeking } = {}) {
  const chipKeywords = chipKeywordsFor(chipText);
  const label = chipLabel || 'role';
  const seek = (seeking || '').toLowerCase();

  const scored = (jobs || []).map(job => {
    const tier = job._tier || 'other';
    const loc = job.location || '';
    const isRemote = /\bremote\b|work\s*from\s*home/i.test(loc);
    const inMarket = tier === 'same_location' || tier === 'nearby';
    const onChip = checkOnChip(job.job_title, chipKeywords).ok;

    // Intern vs full-time match vs stated seeking intent (title heuristic).
    const isIntern = /\bintern(ship)?\b/i.test(job.job_title || '');
    let levelOk = true;
    if (seek === 'internship' && !isIntern) levelOk = false;
    if ((seek === 'fulltime' || seek === 'full_time' || seek === 'full-time') && isIntern) levelOk = false;

    let score = 0;
    if (job.live) score += 3;
    if (onChip) score += 3;
    if (inMarket) score += 2;
    else if (isRemote) score += 1;
    if (levelOk) score += 1; else score -= 2;

    const verdict = (job.live && onChip && levelOk && (inMarket || isRemote)) ? 'pursue' : 'stretch';

    let why;
    if (!levelOk) {
      why = seek === 'internship'
        ? `Full-time role — you're targeting internships${onChip ? `; ${label} fit` : ''}.`
        : `Internship — you're targeting full-time roles${onChip ? `; ${label} fit` : ''}.`;
    } else if (inMarket) {
      why = `Hiring now in ${loc || 'your area'}${onChip ? ` — strong ${label} fit` : ''}.`;
    } else if (isRemote) {
      why = `Remote role${onChip ? ` — solid ${label} fit` : ''}; no in-market match yet.`;
    } else {
      why = `Hiring now${onChip ? ` — ${label} fit` : ''}; outside your market.`;
    }

    return { job, verdict, why, score, tier, inMarket, isRemote, onChip, levelOk };
  });

  scored.sort((a, b) => {
    if (a.verdict !== b.verdict) return a.verdict === 'pursue' ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return TIER_RANK[a.tier] - TIER_RANK[b.tier];
  });

  return scored;
}

export const jobKeyOf = (j) => ((j?.name || '') + '|' + (j?.job_title || '')).toLowerCase();