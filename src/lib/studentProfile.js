// Frontend mirror of base44/shared/studentProfile.ts — same resolution rules so
// the dashboard never displays a different identity than the backend searched for.
// Backend functions import the .ts module; browser code imports this one.

const STOPWORDS = new Set([
  'and', 'or', 'of', 'the', 'a', 'an', 'in', 'for', 'to',
  'entry', 'level', 'intern', 'internship', 'fulltime', 'full', 'time', 'role', 'roles', 'job', 'jobs',
]);

const INTERN_RE = /\bintern(ship)?s?\b|\bco[- ]?op\b/i;
const FULLTIME_RE = /\bfull[- ]?time\b|\bentry[- ]level\b|\bnew ?grad\b|\bgraduate program\b/i;

export function fieldKeywords(field, extra = []) {
  const raw = [field || '', ...extra].join(' ').toLowerCase();
  return [...new Set(raw.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !STOPWORDS.has(w)))];
}

/** Resolve the student's level (internship / fulltime / both) from their goals. */
export function resolveLevel(careerGoals = {}, user = {}) {
  const explicit = String(careerGoals.seeking || careerGoals.employment_type || user.employment_type || '').toLowerCase();
  if (explicit.includes('intern')) return { level: 'internship', known: true };
  if (explicit.includes('full') || explicit.includes('entry')) return { level: 'fulltime', known: true };
  // The student's own role wording states the level even when `seeking` was never saved.
  const roleText = (Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles, careerGoals.role])
    .filter(Boolean).join(' ');
  if (INTERN_RE.test(roleText)) return { level: 'internship', known: true };
  if (FULLTIME_RE.test(roleText)) return { level: 'fulltime', known: true };
  return { level: 'both', known: false };
}

/** The student's focus field — the chip every surface must agree with. */
export function resolveField(careerGoals = {}, user = {}) {
  const roles = (Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles, careerGoals.role]).filter(Boolean);
  const industries = (Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : (careerGoals.industries || [])).filter(Boolean);
  return roles[0] || industries[0] || user.target_industry || null;
}

/** True when a job's level contradicts the student's stated level. */
export function violatesLevel(level, title, employmentType = '') {
  if (level === 'both') return false;
  const isIntern = INTERN_RE.test(`${title} ${employmentType}`);
  return level === 'internship' ? !isIntern : isIntern;
}