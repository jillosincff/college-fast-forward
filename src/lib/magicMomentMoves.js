// Rank the live job pool into Pursue / Stretch using only real signals.
// Senior / years-in-seat titles are HARD-FILTERED out for students — never
// rendered, never backfilled, never in a "Show me 3 different moves" refetch —
// because all three Magic Moment paths (display, Not-for-me backfill, refetch)
// run through rankMoves, so the filter covers them all.
//
// Fields used (all real, on each job / in ctx):
//   job.live       — live-verified posting (buildLiveJobsList)
//   job._tier      — same_location | nearby | remote | other (jobsPipeline.makeTierOf)
//   job.location    — raw location string
//   job.job_title   — on-chip match (chipGate) + intern/FT/junior detection + senior filter
//   job.posted_date / last_seen — freshness (isDateFresh)
//   onChip          — checkOnChip(title, chipKeywordsFor(chipText))
//   seeking         — career_goals.seeking ('internship' | 'fulltime' | 'both'/'either')
//   levelOk         — intern/FT match vs seeking (title heuristic)
//
// Verdict (honest — prefer fewer Pursues over padding with Stretch):
//   pursue  = live && onChip && levelOk && (inMarket || isRemote)
//   stretch = everything else (cross-metro 'other' tier, or level-mismatch)
// Why: each job carries an ordered list of REAL reason fragments (level term,
//   specific role-keyword match, location, freshness, level caveat). The page
//   assigns distinct leads across the visible 3 so cards never clone.

import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { isDateFresh } from '@/lib/jobFreshness';

const TIER_RANK = { same_location: 0, nearby: 1, remote: 2, other: 3 };

// Senior / years-in-seat titles are never shown to students — not even as Stretch.
const SENIOR_RE = /\b(vp|vice president|director|head of|senior|sr|principal|chief|controller|lead)\b/i;

const findMatchedKeyword = (title, keywords) => {
  if (!keywords) return null;
  let best = null;
  for (const k of keywords) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${esc}\\b`, 'i').test(title || '')) {
      if (!best || k.length > best.length) best = k;
    }
  }
  return best;
};

export function rankMoves(jobs, { chipText, chipLabel, seeking } = {}) {
  const chipKeywords = chipKeywordsFor(chipText);
  const label = chipLabel || 'role';
  const seek = (seeking || '').toLowerCase();

  const scored = (jobs || [])
    .filter(job => !SENIOR_RE.test(job.job_title || ''))   // hard filter — no senior roles
    .map(job => {
      const tier = job._tier || 'other';
      const loc = job.location || '';
      const isRemote = /\bremote\b|work\s*from\s*home/i.test(loc);
      const inMarket = tier === 'same_location' || tier === 'nearby';
      const onChip = checkOnChip(job.job_title, chipKeywords).ok;

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

      // Distinct why-lines — ordered real reasons; the page dedupes leads.
      const t = (job.job_title || '').toLowerCase();
      const matchedKw = findMatchedKeyword(job.job_title, chipKeywords);
      const reasons = [];
      if (!levelOk) {
        reasons.push(seek === 'internship'
          ? `Full-time — you're after internships.`
          : `Internship — you're after full-time.`);
      }
      if (isIntern) reasons.push('Internship — real experience.');
      else if (/\bnew\s*grad|entry[-\s]?level|graduate\b/.test(t)) reasons.push('Entry-level — new-grad friendly.');
      else if (/\banalyst\b/.test(t)) reasons.push('Analyst — classic first step.');
      else if (/\bcoordinator\b/.test(t)) reasons.push('Coordinator — easy on-ramp.');
      else if (/\bassistant\b/.test(t)) reasons.push('Assistant — foot in the door.');
      else if (/\bassociate\b/.test(t)) reasons.push('Associate — junior-friendly.');
      else if (/\bclerk\b/.test(t)) reasons.push('Clerk — entry-level admin.');
      if (matchedKw) reasons.push(`Strong "${matchedKw}" match.`);
      else if (onChip) reasons.push(`On-track for ${label}.`);
      if (inMarket) reasons.push(`Hiring in ${loc || 'your area'}.`);
      else if (isRemote) reasons.push('Remote — apply from anywhere.');
      else reasons.push('Outside your metro.');
      if (isDateFresh(job)) reasons.push('Just posted.');

      return { job, verdict, why: reasons[0] || 'Worth a look.', reasons, score, tier, inMarket, isRemote, onChip, levelOk };
    });

  scored.sort((a, b) => {
    if (a.verdict !== b.verdict) return a.verdict === 'pursue' ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return TIER_RANK[a.tier] - TIER_RANK[b.tier];
  });

  return scored;
}

export const jobKeyOf = (j) => ((j?.name || '') + '|' + (j?.job_title || '')).toLowerCase();