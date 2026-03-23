export const SCHOOL_NAMES = {
  'uf': 'University of Florida',
  'usc': 'University of Southern California',
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
};

export const normalizeSchool = (code) =>
  SCHOOL_NAMES[code?.toLowerCase?.() ?? ''] || code || '';