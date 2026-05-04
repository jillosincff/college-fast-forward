export const SCHOOL_NAMES = {
  'uf': 'University of Florida',
  'usc': 'University of South Carolina',
  'osu': 'Ohio State University',
  'ucf': 'University of Central Florida',
  'umich': 'University of Michigan',
  'udel': 'University of Delaware',
  'uga': 'University of Georgia',
  'psu': 'Penn State University',
  'tulane': 'Tulane University',
  'umd': 'University of Maryland',
  'fau': 'Florida Atlantic University',
  'fsu': 'Florida State University',
  'jmu': 'James Madison University',
  'miami': 'University of Miami',
  'utexas': 'University of Texas',
  'uky': 'University of Kentucky',
  'ucb': 'University of California, Berkeley',
  'babson': 'Babson College',
};

// Reverse map: normalized school name / alias → code
// Used by all onboarding flows to derive school_code from school_name
const NAME_TO_CODE = {
  'university of florida': 'uf',
  'university of south carolina': 'usc',
  'ohio state university': 'osu',
  'ohio state': 'osu',
  'university of central florida': 'ucf',
  'university of michigan': 'umich',
  'university of delaware': 'udel',
  'university of georgia': 'uga',
  'penn state university': 'psu',
  'pennsylvania state university': 'psu',
  'penn state': 'psu',
  'tulane university': 'tulane',
  'university of maryland': 'umd',
  'florida atlantic university': 'fau',
  'florida state university': 'fsu',
  'james madison university': 'jmu',
  'university of miami': 'miami',
  'university of texas': 'utexas',
  'university of texas at austin': 'utexas',
  'university of kentucky': 'uky',
  // common abbreviations / aliases
  'uf': 'uf',
  'ufl': 'uf',
  'usc': 'usc',
  'osu': 'osu',
  'ucf': 'ucf',
  'umich': 'umich',
  'udel': 'udel',
  'uga': 'uga',
  'psu': 'psu',
  'tulane': 'tulane',
  'umd': 'umd',
  'fau': 'fau',
  'fsu': 'fsu',
  'jmu': 'jmu',
  'miami': 'miami',
  'utexas': 'utexas',
  'ut austin': 'utexas',
  'uky': 'uky',
  'uk': 'uky',
  'university of california, berkeley': 'ucb',
  'university of california berkeley': 'ucb',
  'uc berkeley': 'ucb',
  'berkeley': 'ucb',
  'ucb': 'ucb',
  'babson college': 'babson',
  'babson': 'babson',
};

/**
 * Derive a school_code from any school name string.
 * Strips extra whitespace, lowercases, then checks canonical names and aliases.
 * Returns null if no match found.
 */
export const deriveSchoolCode = (schoolName) => {
  if (!schoolName) return null;
  const normalized = schoolName.trim().replace(/\s+/g, ' ').toLowerCase();
  return NAME_TO_CODE[normalized] || null;
};

export const normalizeSchool = (code) =>
  SCHOOL_NAMES[code?.toLowerCase?.() ?? ''] || code || '';