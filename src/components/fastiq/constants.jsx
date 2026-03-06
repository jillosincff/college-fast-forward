// Shared FASTIQ constants for industries, roles, position types, and start timelines

export const POSITION_TYPES = [
  { value: 'summer_internship', label: 'Summer Internship', emoji: '☀️' },
  { value: 'semester_internship', label: 'Semester/Year-long Internship or Co-op', emoji: '📋' },
  { value: 'entry_level', label: 'Entry-level / New Grad (full-time)', emoji: '🎓' },
  { value: 'experienced', label: 'Experienced Position (2+ years experience)', emoji: '💼' },
  { value: 'exploring', label: "I'm just exploring — not actively searching yet", emoji: '🔍' },
];

export const START_TIMELINES = [
  { value: 'immediately', label: 'Immediately / ASAP', emoji: '🔥' },
  { value: 'summer_2026', label: 'This summer (Summer 2026)', emoji: '☀️' },
  { value: 'fall_2026', label: 'Fall 2026', emoji: '🍂' },
  { value: 'spring_2027', label: 'Spring 2027', emoji: '🌸' },
  { value: 'after_graduation', label: 'After graduation', emoji: '🎓' },
  { value: 'browsing', label: "I'm just browsing for now", emoji: '👀' },
];

/**
 * Get a human-readable label for a position_type value.
 * Also returns search keywords and role label for use in backend/UI.
 */
export function getPositionTypeConfig(positionType) {
  const configs = {
    summer_internship: {
      label: 'Summer Internship',
      shortLabel: 'Internships',
      searchTerms: 'summer internship, intern',
      roleLabel: 'internship',
      rolesFoundLabel: 'internships',
      salaryLabel: 'Intern Compensation',
      outreachPhrase: 'a summer internship',
    },
    semester_internship: {
      label: 'Internship / Co-op',
      shortLabel: 'Internships',
      searchTerms: 'internship, co-op, cooperative education',
      roleLabel: 'internship',
      rolesFoundLabel: 'internships',
      salaryLabel: 'Intern Compensation',
      outreachPhrase: 'an internship or co-op',
    },
    entry_level: {
      label: 'Entry-level / New Grad',
      shortLabel: 'Entry-level roles',
      searchTerms: 'entry-level, new grad, associate, junior',
      roleLabel: 'entry-level role',
      rolesFoundLabel: 'entry-level roles',
      salaryLabel: 'Entry-level Salary',
      outreachPhrase: 'an entry-level position',
    },
    experienced: {
      label: 'Experienced Position',
      shortLabel: 'Mid-level roles',
      searchTerms: 'mid-level, experienced, 2-5 years',
      roleLabel: 'mid-level role',
      rolesFoundLabel: 'mid-level roles',
      salaryLabel: 'Salary Range',
      outreachPhrase: 'a position',
    },
    exploring: {
      label: 'Exploring',
      shortLabel: 'Roles',
      searchTerms: 'entry-level, internship, new grad',
      roleLabel: 'role',
      rolesFoundLabel: 'roles',
      salaryLabel: 'Salary Range',
      outreachPhrase: 'opportunities',
    },
  };
  return configs[positionType] || configs.entry_level;
}

export const INDUSTRIES = [
  'Technology & Software', 'Financial Services & Banking', 'Consulting & Professional Services',
  'Healthcare & Biotech', 'Media & Entertainment', 'Consumer Products & Retail',
  'Real Estate & Construction', 'Energy & Sustainability', 'Education & EdTech',
  'Government & Public Policy', 'Nonprofit & Social Impact', 'Sports & Athletics',
  'Advertising & Public Relations', 'Hospitality & Travel', 'Manufacturing & Supply Chain',
  'Legal Services', 'Aerospace & Defense', 'Telecommunications', 'Automotive', 'Food & Beverage',
];

export const ROLE_TYPES = [
  'Marketing', 'Engineering', 'Finance & Accounting', 'Sales & Business Development',
  'Operations', 'Product Management', 'Design & Creative', 'Data & Analytics',
  'Human Resources', 'Communications & PR', 'Research', 'General Management', 'Other',
];

// Map old single-value industries to closest new industry
export const LEGACY_INDUSTRY_MAP = {
  'Technology': 'Technology & Software',
  'Finance': 'Financial Services & Banking',
  'Consulting': 'Consulting & Professional Services',
  'Healthcare': 'Healthcare & Biotech',
  'Media & Entertainment': 'Media & Entertainment',
  'Real Estate': 'Real Estate & Construction',
  'Education': 'Education & EdTech',
  'Government': 'Government & Public Policy',
  'Nonprofit': 'Nonprofit & Social Impact',
  'Retail': 'Consumer Products & Retail',
  'Energy': 'Energy & Sustainability',
  'Law': 'Legal Services',
  // Old role-as-industry values → map to no industry, but suggest as role
  'Marketing': null,
  'Engineering': null,
};

// Map old role-as-industry values to a suggested role
export const LEGACY_ROLE_MAP = {
  'Marketing': 'Marketing',
  'Engineering': 'Engineering',
};

/**
 * Parse a comma-separated industry string from a profile,
 * mapping legacy values to new ones. Returns an array of valid industry strings.
 */
export function migrateIndustries(industryStr) {
  if (!industryStr) return [];
  const parts = industryStr.split(',').map(s => s.trim()).filter(Boolean);
  const migrated = [];
  for (const part of parts) {
    if (INDUSTRIES.includes(part)) {
      migrated.push(part);
    } else if (LEGACY_INDUSTRY_MAP[part] !== undefined) {
      const mapped = LEGACY_INDUSTRY_MAP[part];
      if (mapped && !migrated.includes(mapped)) migrated.push(mapped);
    }
  }
  return migrated;
}

/**
 * Parse a comma-separated role string and also check for legacy industry-as-role values.
 */
export function migrateRoles(roleStr, industryStr) {
  const roles = [];
  // Parse existing target_role
  if (roleStr) {
    const parts = roleStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (ROLE_TYPES.includes(part) && !roles.includes(part)) roles.push(part);
    }
  }
  // Check if old industry values were actually roles
  if (industryStr) {
    const parts = industryStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const suggestedRole = LEGACY_ROLE_MAP[part];
      if (suggestedRole && !roles.includes(suggestedRole)) {
        roles.push(suggestedRole);
      }
    }
  }
  return roles;
}