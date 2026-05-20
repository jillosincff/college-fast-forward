/**
 * University Brand Directory
 * Maps school_code → brand config (full name, short name, mascot, colors)
 * Falls back to a generic "Campus" config for unknown schools.
 */

export const UNIVERSITY_BRAND_DIRECTORY = {
  uf:      { fullName: 'University of Florida',         shortName: 'UF',         networkLabel: 'UF Alumni' },
  fsu:     { fullName: 'Florida State University',      shortName: 'FSU',        networkLabel: 'FSU Alumni' },
  ucf:     { fullName: 'University of Central Florida', shortName: 'UCF',        networkLabel: 'UCF Alumni' },
  fau:     { fullName: 'Florida Atlantic University',   shortName: 'FAU',        networkLabel: 'FAU Alumni' },
  usc:     { fullName: 'University of South Carolina',  shortName: 'USC',        networkLabel: 'USC Alumni' },
  osu:     { fullName: 'Ohio State University',         shortName: 'Ohio State', networkLabel: 'Ohio State Alumni' },
  umich:   { fullName: 'University of Michigan',        shortName: 'Michigan',   networkLabel: 'Michigan Alumni' },
  uga:     { fullName: 'University of Georgia',         shortName: 'UGA',        networkLabel: 'UGA Alumni' },
  psu:     { fullName: 'Penn State University',         shortName: 'Penn State', networkLabel: 'Penn State Alumni' },
  tulane:  { fullName: 'Tulane University',             shortName: 'Tulane',     networkLabel: 'Tulane Alumni' },
  umd:     { fullName: 'University of Maryland',        shortName: 'UMD',        networkLabel: 'UMD Alumni' },
  udel:    { fullName: 'University of Delaware',        shortName: 'UDel',       networkLabel: 'UDel Alumni' },
  jmu:     { fullName: 'James Madison University',      shortName: 'JMU',        networkLabel: 'JMU Alumni' },
  miami:   { fullName: 'University of Miami',           shortName: 'UM',         networkLabel: 'UM Alumni' },
  utexas:  { fullName: 'University of Texas',           shortName: 'UT Austin',  networkLabel: 'UT Austin Alumni' },
  uky:     { fullName: 'University of Kentucky',        shortName: 'UK',         networkLabel: 'UK Alumni' },
  ucb:     { fullName: 'UC Berkeley',                   shortName: 'Cal',        networkLabel: 'Cal Alumni' },
  babson:  { fullName: 'Babson College',                shortName: 'Babson',     networkLabel: 'Babson Alumni' },
  default: { fullName: 'Your University',               shortName: 'Campus',     networkLabel: 'Campus Alumni' },
};

/**
 * Resolves brand config from a school_code string.
 * Accepts codes like 'uf', 'ufl', 'UF', school names, etc.
 */
export function getUniversityBrand(schoolCode) {
  if (!schoolCode) return UNIVERSITY_BRAND_DIRECTORY.default;
  const key = schoolCode.toLowerCase().trim();

  // Aliases
  const ALIASES = { ufl: 'uf', 'university of florida': 'uf', 'florida state': 'fsu', 'florida state university': 'fsu', 'ohio state': 'osu', 'penn state': 'psu', 'penn state university': 'psu' };
  const resolved = ALIASES[key] || key;

  return UNIVERSITY_BRAND_DIRECTORY[resolved] || UNIVERSITY_BRAND_DIRECTORY.default;
}