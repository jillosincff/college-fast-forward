// Job posting freshness rules for the Magic Moment.
// "Apply" / "Hiring now" may only ship when the posting is confirmed live:
// either dated within the freshness window, or URL-revalidated server-side
// at pick time via the validateJobPosting backend function.

const FRESH_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export const applyUrlOf = (j) => j?.job_url || j?.apply_url || j?.url || '';
export const hasApplyUrl = (j) => !!applyUrlOf(j);

// Frontend safety net — mirrors the backend cleaning in getLiveJobMatchesFn.
// Strips class-year parentheticals, trailing location pollution, and country
// suffixes from employer names so cached leads also render clean.
const TRAILING_COUNTRY = /\s+(australia|united states|united kingdom|canada|india|germany|france|ireland|singapore|netherlands|united arab emirates|new zealand|uk|usa|us)$/i;
export function cleanCompanyName(name) {
  if (!name) return name;
  return name.replace(TRAILING_COUNTRY, '').trim() || name;
}
export function cleanJobTitle(title) {
  if (!title) return title;
  let cleaned = title.replace(/\s*\([^)]*(class of|graduating|graduat|20\d{2})[^)]*\)\s*/gi, ' ');
  // Strip trailing "City, State, Country" location pollution (3+ comma-separated
  // capitalized groups). A real job title never ends with this pattern.
  cleaned = cleaned.replace(/\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?(?:,\s*[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?){2,}\s*$/g, '');
  return cleaned.replace(/\s{2,}/g, ' ').trim() || title;
}
export function cleanJobDisplay(job) {
  if (!job) return job;
  return {
    ...job,
    name: cleanCompanyName(job.name),
    job_title: cleanJobTitle(job.job_title),
  };
}

export function isDateFresh(job) {
  const d = job?.last_seen || job?.last_seen_at || job?.posted_date || job?.date_posted || job?.posted_at;
  if (!d) return false;
  const t = Date.parse(d);
  return Number.isFinite(t) && (Date.now() - t) <= FRESH_WINDOW_MS;
}

/**
 * Full freshness check for a hero candidate.
 * Returns { ok, why } — why is one of: fresh | validated | missing_url | stale-http reasons (http_fail | closed).
 */
export async function checkJobLive(base44, job) {
  const url = applyUrlOf(job);
  if (!url) return { ok: false, why: 'missing_url' };
  if (isDateFresh(job)) return { ok: true, why: 'fresh' };
  try {
    const r = await base44.functions.invoke('validateJobPosting', { url, title: job?.job_title || '', company: job?.name || '' });
    const d = r?.data || r;
    if (d?.live) return { ok: true, why: 'validated' };
    return { ok: false, why: d?.reason || 'http_fail' };
  } catch (e) {
    return { ok: false, why: 'http_fail' };
  }
}