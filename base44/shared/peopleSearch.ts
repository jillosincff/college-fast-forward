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

/** Dedupes connections by normalized name and ranks tier-first, then role-relevance. */
export function rankAndDedupe(
  connections: any[],
  targetRole: string,
  limit = 8,
): any[] {
  connections.sort((a, b) => (a.tier - b.tier) || (roleRelevance(b.role_title, targetRole) - roleRelevance(a.role_title, targetRole)));
  const seen = new Set<string>();
  const deduped = connections.filter((c) => {
    const k = normCompany(c.name);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return deduped.slice(0, limit);
}