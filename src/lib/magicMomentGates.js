// Magic Moment gates — one pure function per gate, shared with tests the way
// chipGate is. Each returns { ok, why } so the picker logs rejections and the
// release-bar test can assert the fail conditions (dead Apply, costume title,
// missing stack, invented person) on the live path.
//
// Gate 5 (Apply/message/track) is an action, not a predicate — it lives in
// MagicMoment's handlers. The other five are here.

import { hasApplyUrl, isDateFresh, applyUrlOf } from './jobFreshness.js';
import { chipKeywordsFor, checkOnChip } from './chipGate.js';

// Gate 1 — Job is real (sync pre-filter): apply URL present + posted ≤14 days.
// The async URL re-validation (page loads, not closed, title on page) lives in
// checkJobLive (jobFreshness.js); this is the cheap field check whose result
// feeds the hero log's url_ok.
export function gateJobRealSync(job) {
  if (!job) return { ok: false, why: 'no_job' };
  if (!hasApplyUrl(job)) return { ok: false, why: 'missing_url' };
  if (!isDateFresh(job)) return { ok: false, why: 'stale_or_undated' };
  return { ok: true, why: 'fresh' };
}

// Gate 2 — Job matches the student: title passes the chip gate. A generic
// "Analyst" never gets stamped "matches your Sales".
export function gateJobMatches(job, chipText) {
  if (!job) return { ok: false, why: 'no_job' };
  const kw = chipKeywordsFor(chipText);
  if (!kw || !kw.length) return { ok: true, why: 'no_chip_keywords' };
  return checkOnChip(job.job_title, kw);
}

// Gate 2b — Job is in the student's market (or remote). A New York role served
// to an Austin search is a bait-and-switch. UNCONDITIONAL: when the student has
// no parseable market, only remote jobs pass (location-agnostic by definition).
// This is the gate that closes the Squarespace/NYC → Austin leak — it runs on
// the initial pick AND on every live-replacement candidate.
export function gateLocation(job, { userCity, userState } = {}) {
  if (!job) return { ok: false, why: 'no_job' };
  const loc = (job.location || '').toLowerCase();
  if (!loc) return { ok: false, why: 'no_location' };
  if (/\bremote\b|work\s*from\s*home/.test(loc)) return { ok: true, why: 'remote' };
  if (userCity && loc.includes(userCity.toLowerCase())) return { ok: true, why: 'metro' };
  if (userState && loc.includes(userState.toLowerCase())) return { ok: true, why: 'state' };
  return { ok: false, why: 'out_of_market' };
}

// Derive the widen tier label from a resultType string for logging + the UI
// widen line. metro = same city, state = same state, remote = anywhere, curated =
// metro-scoped inventory.
export function widenTierOf(resultType = '') {
  if (resultType.includes('same_location')) return 'metro';
  if (resultType.includes('nearby')) return 'state';
  if (resultType.includes('remote')) return 'remote';
  if (resultType.includes('curated')) return 'curated';
  return '';
}

// Gate 3 — Person is real: name + (title or company) + a public source URL.
// No invented bios; an empty/partial record never ships as an insider.
export function gatePersonReal(person) {
  if (!person) return { ok: false, why: 'no_person' };
  if (!person.name || !String(person.name).trim()) return { ok: false, why: 'no_name' };
  if (!person.role_title && !person.company) return { ok: false, why: 'no_role_or_company' };
  const src = person.linkedin_url || person.source_url;
  if (!src || !/^https?:\/\//i.test(src)) return { ok: false, why: 'no_source' };
  return { ok: true, why: person.source || 'ok' };
}

// Gate 4 — Draft is honest: present, and never claims "applied" when the
// posting isn't live. The draft builder is fact-only (no guessed major).
export function gateDraftHonest(draft, { applied, live } = {}) {
  if (!draft || !draft.message) return { ok: false, why: 'no_draft' };
  if (applied && !live) return { ok: false, why: 'applied_but_not_live' };
  return { ok: true, why: 'ok' };
}

// Gate 6 — Volume: ≥4 more on-chip roles on the first screen (phone + iPad).
export function gateVolume(railJobs, min = 4) {
  const n = Array.isArray(railJobs) ? railJobs.length : 0;
  return { ok: n >= min, why: n >= min ? 'ok' : `only_${n}` };
}

// Build the structured hero log row — the "log every hero" contract.
export function buildHeroLog({ job, chipOk, urlOk, personFound, peopleSource, railCount, resultType, chipText, widenTier }) {
  return {
    job_id: job?.job_id || job?.id || null,
    company: job?.name || '',
    title: job?.job_title || '',
    url: applyUrlOf(job),
    url_ok: !!urlOk,
    chip_ok: !!chipOk,
    person_found: !!personFound,
    people_source: peopleSource || 'none',
    rail_count: railCount || 0,
    result_type: resultType || '',
    widen_tier: widenTier || widenTierOf(resultType),
    chip: chipText || '',
    at: new Date().toISOString(),
  };
}

// Log every hero: structured console line + analytics event. Swallows errors
// so logging never breaks the cycle.
export function logHeroPick(base44, row) {
  try { console.log('[MagicMoment] HERO LOG', JSON.stringify(row)); } catch (e) {}
  try {
    base44?.analytics?.track?.({
      eventName: 'magic_moment_hero_pick',
      properties: {
        job_id: row?.job_id || '',
        url_ok: !!row?.url_ok,
        chip_ok: !!row?.chip_ok,
        person_found: !!row?.person_found,
        people_source: row?.people_source || 'none',
        rail_count: row?.rail_count || 0,
      },
    });
  } catch (e) {}
}