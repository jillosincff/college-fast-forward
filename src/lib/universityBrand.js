/**
 * University Brand Directory
 * Maps school_code → brand config (full name, short name, mascot, colors)
 * Falls back to a generic "Campus" config for unknown schools.
 */

export const UNIVERSITY_BRAND_DIRECTORY = {
  uf:      { fullName: 'University of Florida',        shortName: 'UF',         mascotName: 'Gators',      badgeLabel: 'Gators',      networkLabel: 'UF Gators' },
  fsu:     { fullName: 'Florida State University',     shortName: 'FSU',        mascotName: 'Seminoles',   badgeLabel: 'Seminoles',   networkLabel: 'FSU Seminoles' },
  ucf:     { fullName: 'University of Central Florida',shortName: 'UCF',        mascotName: 'Knights',     badgeLabel: 'Knights',     networkLabel: 'UCF Knights' },
  fau:     { fullName: 'Florida Atlantic University',  shortName: 'FAU',        mascotName: 'Owls',        badgeLabel: 'Owls',        networkLabel: 'FAU Owls' },
  usc:     { fullName: 'University of South Carolina', shortName: 'USC',        mascotName: 'Gamecocks',   badgeLabel: 'Gamecocks',   networkLabel: 'USC Gamecocks' },
  osu:     { fullName: 'Ohio State University',        shortName: 'Ohio State', mascotName: 'Buckeyes',    badgeLabel: 'Buckeyes',    networkLabel: 'Ohio State Buckeyes' },
  umich:   { fullName: 'University of Michigan',       shortName: 'Michigan',   mascotName: 'Wolverines',  badgeLabel: 'Wolverines',  networkLabel: 'Michigan Wolverines' },
  uga:     { fullName: 'University of Georgia',        shortName: 'UGA',        mascotName: 'Bulldogs',    badgeLabel: 'Bulldogs',    networkLabel: 'UGA Bulldogs' },
  psu:     { fullName: 'Penn State University',        shortName: 'Penn State', mascotName: 'Nittany Lions',badgeLabel: 'Nittany Lions',networkLabel: 'Penn State Lions' },
  tulane:  { fullName: 'Tulane University',            shortName: 'Tulane',     mascotName: 'Green Wave',  badgeLabel: 'Green Wave',  networkLabel: 'Tulane Green Wave' },
  umd:     { fullName: 'University of Maryland',       shortName: 'UMD',        mascotName: 'Terrapins',   badgeLabel: 'Terrapins',   networkLabel: 'UMD Terrapins' },
  udel:    { fullName: 'University of Delaware',       shortName: 'UDel',       mascotName: 'Blue Hens',   badgeLabel: 'Blue Hens',   networkLabel: 'UDel Blue Hens' },
  jmu:     { fullName: 'James Madison University',     shortName: 'JMU',        mascotName: 'Dukes',       badgeLabel: 'Dukes',       networkLabel: 'JMU Dukes' },
  miami:   { fullName: 'University of Miami',          shortName: 'UM',         mascotName: 'Hurricanes',  badgeLabel: 'Hurricanes',  networkLabel: 'UM Hurricanes' },
  utexas:  { fullName: 'University of Texas',          shortName: 'UT Austin',  mascotName: 'Longhorns',   badgeLabel: 'Longhorns',   networkLabel: 'UT Longhorns' },
  uky:     { fullName: 'University of Kentucky',       shortName: 'UK',         mascotName: 'Wildcats',    badgeLabel: 'Wildcats',    networkLabel: 'UK Wildcats' },
  ucb:     { fullName: 'UC Berkeley',                  shortName: 'Cal',        mascotName: 'Golden Bears', badgeLabel: 'Golden Bears', networkLabel: 'Cal Bears' },
  babson:  { fullName: 'Babson College',               shortName: 'Babson',     mascotName: 'Beavers',     badgeLabel: 'Beavers',     networkLabel: 'Babson Beavers' },
  default: { fullName: 'Your University',              shortName: 'Campus',     mascotName: 'Alumni',      badgeLabel: 'Connected',   networkLabel: 'Campus Alumni' },
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