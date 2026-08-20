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
 * Fills the rail up to `want` insider-backed roles.
 * @param known  Already-scanned hits: [{ job, conns }] — reused for free.
 * @param candidates  Additional on-chip jobs to check for insiders.
 * @param excludeKeys  Job keys already used (the hero).
 */
export async function buildInsiderRail({ base44, user, role, chipText, location, known = [], candidates = [], excludeKeys = [], want = 5 }) {
  const used = new Set(excludeKeys);
  const rows = [];

  for (const hit of known) {
    const k = jobKey(hit.job);
    if (used.has(k)) continue;
    used.add(k);
    rows.push(toRow(hit.job, hit.conns.length));
    if (rows.length >= want) return rows;
  }

  // One batched people-check over fresh candidates — only keepers get shown.
  const fresh = candidates.filter((j) => {
    const k = jobKey(j);
    if (used.has(k)) return false;
    used.add(k);
    return true;
  }).slice(0, 10);

  if (fresh.length) {
    const results = await Promise.all(fresh.map(j =>
      base44.functions.invoke('findCliffPeople', {
        companyName: j.name, targetRole: j.job_title || role, magic_moment: true,
        schoolName: user?.school, schoolCode: user?.school_code, chipText, location,
      })
        .then(r => ({ job: j, conns: r?.data?.connections || r?.connections || [] }))
        .catch(() => ({ job: j, conns: [] }))
    ));
    for (const r of results) {
      if (!r.conns.length) continue;
      rows.push(toRow(r.job, r.conns.length));
      if (rows.length >= want) break;
    }
  }

  return rows;
}