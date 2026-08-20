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
  // Short forms MUST be listed — a student who picks the "HR" chip types
  // literally "HR", which matches none of the long phrases. That miss is what
  // silently disabled the whole gate and served a Sales SDR to an HR student.
  hr: ['hr', 'human resources', 'human resource', 'recruiting', 'recruiter', 'recruitment', 'talent acquisition', 'talent', 'people operations', 'people ops', 'employee relations', 'benefits', 'compensation', 'personnel'],
  education: ['education', 'teaching', 'teacher', 'admissions', 'academic'],
};

// Titles that name no field at all — never a valid first-cycle hero for a
// real chip. "Analyst" is not a Sales job and not a Healthcare job.
export const GENERIC_TITLE = /^(sr\.?|senior|junior|jr\.?|entry[- ]level|associate|assistant|staff)?\s*(analyst|associate|specialist|coordinator|consultant|generalist|professional|representative)\b/i;

// Whole-word match. Substring matching is unsafe for short keys — 'hr' would
// match "threat", 'pr' would match "product", 'social' would match "sociable".
function hasWord(haystack, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

/**
 * Keyword list for a chip (role + industries combined), or null if unknown.
 * Scores EVERY bucket and returns the best match — returning the first bucket
 * that happened to contain a keyword made ambiguous chips resolve arbitrarily.
 */
export function chipKeywordsFor(chipText) {
  const combined = (chipText || '').toLowerCase().trim();
  if (!combined) return null;
  let best = null;
  let bestScore = 0;
  for (const kws of Object.values(ROLE_KEYWORDS)) {
    // Score = length of the longest matching keyword, so "human resources"
    // beats a stray one-word overlap from another bucket.
    let score = 0;
    for (const k of kws) {
      if (hasWord(combined, k)) score = Math.max(score, k.length);
    }
    if (score > bestScore) { bestScore = score; best = kws; }
  }
  return best;
}

/**
 * Title-only chip match. A generic "Specialist" whose DESCRIPTION mentions the
 * chip is NOT on-chip. Returns { ok, why } so callers can log rejections.
 */
export function checkOnChip(jobTitle, chipKeywords) {
  const title = (jobTitle || '').toLowerCase().trim();
  // Even when the chip is unrecognized, a field-less generic title is never a
  // legitimate hero — it's what lets "Analyst (Remote)" masquerade as a match.
  if (!chipKeywords) {
    return GENERIC_TITLE.test(title) ? { ok: false, why: 'junk' } : { ok: true, why: null };
  }
  if (chipKeywords.some(k => hasWord(title, k))) return { ok: true, why: null };
  return { ok: false, why: GENERIC_TITLE.test(title) ? 'junk' : 'off_chip' };
}