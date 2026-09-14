// Rank the live job pool into Pursue / Stretch using only real signals we
// already have (live flag, on-chip role match, in-market vs remote tier).
// No fake "hiring manager" reasons. Skip-tier / off-chip jobs never reach here
// — buildLiveJobsList already filtered them off-screen.

import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';

const TIER_RANK = { same_location: 0, nearby: 1, remote: 2, other: 3 };

export function rankMoves(jobs, { chipText, chipLabel } = {}) {
  const chipKeywords = chipKeywordsFor(chipText);
  const label = chipLabel || 'role';

  const scored = (jobs || []).map(job => {
    const tier = job._tier || 'other';
    const loc = job.location || '';
    const isRemote = /\bremote\b|work\s*from\s*home/i.test(loc);
    const inMarket = tier === 'same_location' || tier === 'nearby';
    const onChip = checkOnChip(job.job_title, chipKeywords).ok;

    let score = 0;
    if (job.live) score += 3;
    if (onChip) score += 3;
    if (inMarket) score += 2;
    else if (isRemote) score += 1;

    // Honest verdict from real signals: a live, on-chip, in-market OR remote
    // role is something CLIFF would pursue. Anything else (cross-metro, no
    // remote tag) is a stretch used only to fill up to 3.
    const verdict = job.live && onChip && (inMarket || isRemote) ? 'pursue' : 'stretch';

    let why;
    if (inMarket) {
      why = `Hiring now in ${loc || 'your area'}${onChip ? ` — strong ${label} fit` : ''}.`;
    } else if (isRemote) {
      why = `Remote role${onChip ? ` — solid ${label} fit` : ''}; no in-market match yet.`;
    } else {
      why = `Hiring now${onChip ? ` — ${label} fit` : ''}; outside your market.`;
    }

    return { job, verdict, why, score, tier, inMarket, isRemote, onChip };
  });

  // Pursue first (by score, then tier), then Stretch — so visible top-3 are
  // always the strongest Pursue roles, with Stretch only filling gaps.
  scored.sort((a, b) => {
    if (a.verdict !== b.verdict) return a.verdict === 'pursue' ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return TIER_RANK[a.tier] - TIER_RANK[b.tier];
  });

  return scored;
}

export const jobKeyOf = (j) => ((j?.name || '') + '|' + (j?.job_title || '')).toLowerCase();