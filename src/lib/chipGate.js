// Chip fidelity gate — the single source of truth for "is this job on-chip?".
// Extracted so the Magic Moment picker and the CI fixture assert the SAME rules.

export const ROLE_KEYWORDS = {
  marketing: ['marketing', 'brand', 'content', 'communications', 'social media', 'social', 'public relations', 'growth', 'advertising', 'campaign', 'digital marketing', 'product marketing', 'content marketing'],
  sales: ['sales', 'account executive', 'business development', 'sales development', 'sdr', 'bdr', 'account manager', 'inside sales'],
  communications: ['communications', 'public relations', 'pr', 'content', 'media relations', 'corporate communications', 'internal communications'],
  finance: ['finance', 'financial', 'investment', 'banking', 'accounting', 'audit', 'treasury', 'risk', 'credit', 'wealth', 'markets', 'fp&a', 'fp and a', 'portfolio', 'asset management', 'valuation', 'underwriting', 'underwriter', 'actuarial', 'equity research', 'fixed income', 'lending', 'mortgage', 'private equity', 'asset management'],
  software: ['software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'fullstack', 'programmer'],
  operations: ['operations', 'supply chain', 'logistics'],
  consulting: ['consulting', 'consultant', 'strategy'],
  healthcare: ['healthcare', 'health', 'clinical', 'hospital', 'patient', 'medical', 'nurse', 'nursing', 'allied health', 'allied', 'pharma', 'biotech', 'research coordinator', 'surgical', 'surgery', 'radiology', 'pharmacy', 'pharmacist', 'therapist', 'therapy', 'sonographer', 'technologist', 'lab technician', 'laboratory', 'dental', 'behavioral health', 'mental health', 'care coordinator', 'care tech', 'registrar', 'health coordinator', 'medical assistant', 'patient access', 'patient registration', 'patient services'],
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
 * Title-only chip match. Returns { ok, why } so callers can log rejections.
 *
 * Logic (inverted from the original strict-keyword gate):
 * 1. A field-less generic title ("Analyst", "Specialist", "Associate") is NEVER
 *    a legitimate hero — it could belong to any chip.
 * 2. A direct chip-keyword hit in the title is always on-chip.
 * 3. If the chip is unknown, any non-generic title passes (the synonym query
 *    already filtered contextually).
 * 4. If the chip IS known but the title has no direct keyword hit, the job was
 *    returned by a chip-specific synonym query — so it IS contextually on-chip.
 *    Accept it UNLESS the title clearly belongs to a DIFFERENT chip (e.g. a
 *    "Software Engineer" served to a Marketing student). This is what stops a
 *    "Summer Analyst" at PIMCO from being rejected just because "summer" isn't
 *    in the finance keyword list — the search found it BECAUSE it's finance.
 */
export function checkOnChip(jobTitle, chipKeywords) {
  const title = (jobTitle || '').toLowerCase().trim();
  // A direct chip-keyword hit ANYWHERE in the title is always on-chip — even
  // when the title starts with a generic word. "Coordinator, Clinical Research"
  // is a healthcare role despite starting with "Coordinator"; without this
  // ordering, the GENERIC_TITLE regex rejected it as 'junk' and emptied the
  // on-chip pool for thin markets (Healthcare + Miami, etc.).
  if (chipKeywords && chipKeywords.some(k => hasWord(title, k))) return { ok: true, why: null };
  if (GENERIC_TITLE.test(title)) return { ok: false, why: 'junk' };
  if (!chipKeywords) return { ok: true, why: null };
  // Known chip, no direct keyword. Reject only if the title names a DIFFERENT chip.
  for (const kws of Object.values(ROLE_KEYWORDS)) {
    if (kws === chipKeywords) continue;
    if (kws.some(k => hasWord(title, k))) return { ok: false, why: 'other_chip' };
  }
  return { ok: true, why: null };
}