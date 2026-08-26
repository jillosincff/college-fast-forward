// Shared helpers for CLIFF people-search functions (findWorkspaceConnections +
// findCliffPeople). Kept here so the opt-in graph lookup logic is identical in
// both — a divergence here is exactly how stale/wrong people get surfaced.

export function normCompany(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Builds a company-name matcher against a normalized target company token. */
export function makeCompanyMatcher(targetRaw: string) {
  const target = normCompany(targetRaw);
  return (name: string): boolean => {
    const c = normCompany(name);
    return !!c && (c.includes(target) || target.includes(c));
  };
}

export function roleTokens(s: string): string[] {
  return (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** Role-similarity score between a connection's title and the target role. */
export function roleRelevance(roleTitle: string, targetRole: string): number {
  const targetTokens = new Set(roleTokens(targetRole));
  if (!targetTokens.size || !roleTitle) return 0;
  let hits = 0;
  for (const t of roleTokens(roleTitle)) if (targetTokens.has(t)) hits++;
  return hits;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Dedupes connections by normalized name and ranks tier-first, then role-relevance.
 *  Input is shuffled first so ties (same tier + same relevance) are broken
 *  randomly — different calls return different people within the same tier. */
export function rankAndDedupe(
  connections: any[],
  targetRole: string,
  limit = 8,
): any[] {
  const shuffled = shuffle(connections);
  shuffled.sort((a, b) => (a.tier - b.tier) || (roleRelevance(b.role_title, targetRole) - roleRelevance(a.role_title, targetRole)));
  const seen = new Set<string>();
  const deduped = shuffled.filter((c) => {
    const k = normCompany(c.name);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return deduped.slice(0, limit);
}

/**
 * Layer 2 — public web research for real alumni of [school] at [company].
 * Jesse-style query via LLM + internet context. Returns ONLY facts that appear
 * in a real public source, with the source URL. Never fabricates.
 *
 * Results are cached to DiscoveredAlumni (24h TTL) so repeat lookups are instant.
 * Extracted here so both findCliffPeople (Magic Moment) and findWorkspaceConnections
 * (Job Workspace) use the identical discovery logic — a divergence here is how
 * the workspace showed "no one found" while the Magic Moment found people.
 */
export async function runPublicAlumniSearch(
  sr: any,
  opts: {
    school: string;
    schoolCode: string;
    companyName: string;
    targetRole?: string;
    chipText?: string;
    location?: string;
  },
): Promise<any[]> {
  const { school, schoolCode, companyName, targetRole, chipText, location } = opts;
  if (!school) return [];

  const connections: any[] = [];
  try {
    const roleHint = targetRole || chipText || 'a relevant role';
    const prompt = `Find 3 real people who are alumni of ${school} and currently work at ${companyName}, ideally in ${roleHint} or an adjacent function. For each person give: name, title (their job title at ${companyName}), source_url (the LinkedIn profile URL or other public page where you found them), and summary (one sentence on why they're a good connection for the student). Only include real people you found via web search — do not fabricate. Return as JSON.`;

    const llmRes = await sr.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          people: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                source_url: { type: 'string' },
                summary: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const people = shuffle((llmRes?.people) || []);
    for (const p of people) {
      // Hard gate: no source URL = not verifiable = dropped. No name = dropped.
      if (!p.name || !p.source_url) continue;
      if (!/^https?:\/\//i.test(p.source_url)) continue;
      const isLinkedIn = /linkedin\.com/i.test(p.source_url);
      connections.push({
        tier: 4,
        source: 'public_web',
        name: p.name,
        role_title: p.title || null,
        company: companyName,
        school,
        graduation_year: null,
        linkedin_url: isLinkedIn ? p.source_url : null,
        persona: 'alumni',
        school_code: schoolCode,
        why: p.summary || `${school} alum found via public source`,
        label: 'Found publicly',
        source_url: p.source_url,
      });
    }

    // Cache the fresh public finds so the next cycle is instant.
    const toCache = connections.filter((c) => c.source === 'public_web').slice(0, 3);
    if (toCache.length && schoolCode) {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();
      for (const c of toCache) {
        try {
          const created = await sr.entities.DiscoveredAlumni.create({
            name: c.name,
            role_title: c.role_title || '',
            company: companyName,
            school_code: schoolCode,
            source_url: c.source_url,
            degree_info: c.graduation_year || '',
            location: location || '',
            linkedin_url: c.linkedin_url || '',
            description: c.why || '',
            verified: false,
            expires_at: expires,
            last_shown_at: nowIso,
          });
          if (created?.id) c._alumni_id = created.id;
        } catch (e) { /* cache best-effort */ }
      }
    }
  } catch (e) {
    // Layer 2 failure never breaks the cycle — we just have no public person.
  }
  return connections;
}

/** Stamps last_shown_at = now on served public-web alumni so the next student
 *  gets a different person (least-recently-shown surfaces first in Tier 2). */
export async function stampAlumniShown(sr: any, connections: any[]): Promise<void> {
  const nowIso = new Date().toISOString();
  for (const c of connections) {
    if (c.source !== 'public_web' || !c._alumni_id) continue;
    try {
      await sr.entities.DiscoveredAlumni.update(c._alumni_id, { last_shown_at: nowIso });
    } catch (e) { /* best-effort */ }
    delete c._alumni_id;
  }
}