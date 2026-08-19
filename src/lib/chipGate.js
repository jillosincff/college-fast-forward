// Chip fidelity gate — the single source of truth for "is this job on-chip?".
// Extracted so the Magic Moment picker and the CI fixture assert the SAME rules.

export const ROLE_KEYWORDS = {
  marketing: ['marketing', 'brand', 'content', 'communications', 'social media', 'social', 'public relations', 'growth', 'advertising', 'campaign', 'digital marketing', 'product marketing', 'content marketing'],
  sales: ['sales', 'account executive', 'business development', 'sales development', 'sdr', 'bdr', 'account manager', 'inside sales'],
  communications: ['communications', 'public relations', 'pr', 'content', 'media relations', 'corporate communications', 'internal communications'],
  finance: ['finance', 'financial', 'investment', 'banking', 'accounting', 'audit', 'treasury', 'risk'],
  software: ['software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'fullstack', 'programmer'],
  operations: ['operations', 'supply chain', 'logistics'],
  consulting: ['consulting', 'consultant', 'strategy'],
  healthcare: ['healthcare', 'health', 'clinical', 'hospital', 'patient', 'medical', 'nurse', 'nursing', 'allied health', 'pharma', 'biotech', 'research coordinator'],
  data: ['data', 'analytics', 'business intelligence', 'quantitative'],
  product: ['product', 'ux', 'user experience'],
  hr: ['human resources', 'recruiting', 'talent acquisition', 'people operations'],
  education: ['education', 'teaching', 'admissions', 'academic'],
};

// Titles that name no field at all — never a valid first-cycle hero for a
// real chip. "Analyst" is not a Sales job and not a Healthcare job.
export const GENERIC_TITLE = /^(sr\.?|senior|junior|jr\.?|entry[- ]level|associate|assistant|staff)?\s*(analyst|associate|specialist|coordinator|consultant|generalist|professional|representative)\b/i;

/** Keyword list for a chip (role + industries combined), or null if unknown. */
export function chipKeywordsFor(chipText) {
  const combined = (chipText || '').toLowerCase();
  if (!combined) return null;
  for (const kws of Object.values(ROLE_KEYWORDS)) {
    if (kws.some(k => combined.includes(k))) return kws;
  }
  return null;
}

/**
 * Title-only chip match. A generic "Specialist" whose DESCRIPTION mentions the
 * chip is NOT on-chip. Returns { ok, why } so callers can log rejections.
 */
export function checkOnChip(jobTitle, chipKeywords) {
  const title = (jobTitle || '').toLowerCase().trim();
  if (!chipKeywords) return { ok: true, why: null };
  if (chipKeywords.some(k => title.includes(k))) return { ok: true, why: null };
  return { ok: false, why: GENERIC_TITLE.test(title) ? 'junk' : 'off_chip' };
}