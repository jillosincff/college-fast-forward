// Builds the locked "more roles with people on the inside" stack.
//
// Rule: curated volume, never spray-and-pray. A row only earns its place if
// CLIFF confirmed a real insider at that company, so we check people for the
// candidate companies rather than padding the list with cold inventory.

/** Stable identity for a job so the hero and duplicates are excluded. */
export const jobKey = (j) => `${(j?.name || '').toLowerCase()}|${(j?.job_title || '').toLowerCase()}`;

const toRow = (job, insiderCount) => ({
  name: job.name,
  job_title: job.job_title,
  location: job.location,
  logo_url: job.logo_url,
  insiderCount,
});

/**
 * Fills the rail up to `want` LIVE roles (real apply URL).
 *
 * Volume rule: the plan needs confirmed openings, not only insider paths.
 * Insider-backed warm hits ship first (highest value, free); the rest of the
 * on-chip in-market URL-bearing candidates ship as plain live roles with no
 * insider badge. A dead posting + two people is a networking card — this is
 * what makes it a plan with volume.
 *
 * @param known  Already-scanned hits: [{ job, conns }] — reused for free.
 * @param candidates  On-chip in-market jobs with a real apply URL.
 * @param excludeKeys  Job keys already used (the hero).
 */
export async function buildInsiderRail({ base44, user, role, chipText, location, known = [], candidates = [], excludeKeys = [], want = 5 }) {
  const used = new Set(excludeKeys);
  const rows = [];

  // 1. Insider-backed warm hits — free, lead with these.
  for (const hit of known) {
    const k = jobKey(hit.job);
    if (used.has(k)) continue;
    used.add(k);
    rows.push(toRow(hit.job, hit.conns.length));
    if (rows.length >= want) return rows;
  }

  // 2. Live roles with a real apply URL — confirmed openings as volume.
  //    No insider required; the badge only ships where the warm scan found one.
  for (const j of candidates) {
    const k = jobKey(j);
    if (used.has(k)) continue;
    used.add(k);
    rows.push(toRow(j, 0));
    if (rows.length >= want) break;
  }

  return rows;
}