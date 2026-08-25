// ── CLIFF Student Profile — the single source of truth ──────────────────────
// Every surface (daily drop, next-move queue, warm connections, career plan)
// must resolve the student's identity through this module. Before it existed,
// each surface read a different field: the feed searched `preferred_locations`,
// the plan read `graduation_year`, warm matching read a legacy `target_industry`,
// and the level (internship vs full-time) was never stored at all. That is how
// one student ended up with a marketing-internship chip, a full-time business
// development "best opportunity", and an engineering warm connection.
//
// Resolution order is always: explicit structured field → the student's own
// explicit words (StudentMemory, source 'explicit') → legacy flat field.
// Anything we cannot establish is returned as null/unknown — never guessed.

export type Level = 'internship' | 'fulltime' | 'both';

export interface StudentProfile {
  field: string | null;          // canonical focus chip, e.g. "Marketing"
  fieldTerms: string[];          // searchable keywords for the field
  level: Level;                  // internship / fulltime / both
  levelKnown: boolean;           // false when we had to fall back to 'both'
  locations: string[];           // preferred locations, most-trusted first
  primaryLocation: string;       // the one location used for retrieval ('' = anywhere)
  remotePreference: string;      // required / preferred / '' etc.
  strictLocation: boolean;       // student will not relocate
  school: string;
  stage: string | null;          // freshman…recent_grad, null when unknown
  stageKnown: boolean;
  graduationYear: number | null;
  major: string | null;
  exclusions: {
    industries: string[];
    companies: string[];
    locations: string[];
  };
  chip: string;                  // human summary, e.g. "Marketing internship in Florida"
}

const STOPWORDS = new Set([
  'and', 'or', 'of', 'the', 'a', 'an', 'in', 'for', 'to',
  'entry', 'level', 'intern', 'internship', 'fulltime', 'full', 'time', 'role', 'roles', 'job', 'jobs',
]);

const INTERN_RE = /\bintern(ship)?s?\b|\bco[- ]?op\b/i;
const FULLTIME_RE = /\bfull[- ]?time\b|\bentry[- ]level\b|\bnew ?grad\b|\bgraduate program\b/i;

const STAGE_ALIASES: Record<string, string> = {
  freshman: 'freshman', freshmen: 'freshman', '1': 'freshman', first_year: 'freshman',
  sophomore: 'sophomore', '2': 'sophomore',
  junior: 'junior', '3': 'junior',
  senior: 'senior', '4': 'senior',
  recent_grad: 'recent_grad', graduate: 'recent_grad', grad: 'recent_grad', alumni: 'recent_grad',
};

const lower = (v: unknown) => String(v ?? '').toLowerCase().trim();

/** Keywords a job title/description can be matched against for this field. */
export function fieldKeywords(field: string | null, extra: string[] = []): string[] {
  const raw = [field || '', ...extra].join(' ').toLowerCase();
  return [...new Set(raw.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !STOPWORDS.has(w)))];
}

/**
 * Resolve the canonical profile.
 * @param user     the User record (career_goals is authoritative)
 * @param memories StudentMemory rows for this student (active ones)
 */
export function resolveStudentProfile(user: any, memories: any[] = []): StudentProfile {
  const cg = user?.career_goals || {};
  const mems = Array.isArray(memories) ? memories : [];
  const memValues = (category: string, minConfidence = 50, explicitOnly = false) =>
    mems
      .filter(m => m.category === category
        && (m.confidence ?? 0) >= minConfidence
        && (!explicitOnly || m.source === 'explicit'))
      .map(m => lower(m.value))
      .filter(Boolean);

  // ── Field (the focus chip) ────────────────────────────────────────────────
  const goalRoles: string[] = (Array.isArray(cg.target_roles) ? cg.target_roles : [cg.target_roles, cg.role])
    .filter(Boolean).map(String);
  const goalIndustries: string[] = (Array.isArray(cg.target_industries) ? cg.target_industries : (cg.industries || []))
    .filter(Boolean).map(String);
  const memIndustries = memValues('preferred_industries', 70, true);
  const field = goalRoles[0] || goalIndustries[0] || memIndustries[0] || user?.target_industry || null;
  const fieldTerms = fieldKeywords(field, [...goalRoles.slice(1), ...goalIndustries]);

  // ── Level (internship vs full-time) ──────────────────────────────────────
  // Explicit setting wins. Otherwise read the student's own role wording —
  // "Marketing Internship" states the level even when `seeking` was never saved.
  const explicitSeeking = lower(cg.seeking || cg.employment_type || user?.employment_type);
  let level: Level = 'both';
  let levelKnown = false;
  if (explicitSeeking.includes('intern')) { level = 'internship'; levelKnown = true; }
  else if (explicitSeeking.includes('full') || explicitSeeking.includes('entry')) { level = 'fulltime'; levelKnown = true; }
  else {
    const roleText = goalRoles.join(' ');
    if (INTERN_RE.test(roleText)) { level = 'internship'; levelKnown = true; }
    else if (FULLTIME_RE.test(roleText)) { level = 'fulltime'; levelKnown = true; }
  }

  // ── Locations ────────────────────────────────────────────────────────────
  // Structured onboarding answers first, then the student's own explicit words,
  // then the legacy free-text goal/profile fields (often stale).
  const structured = (Array.isArray(user?.preferred_locations) ? user.preferred_locations : [])
    .map((l: any) => String(l?.display_label || l?.city || l?.metro || l?.state || '').trim())
    .filter(Boolean);
  const memLocations = memValues('preferred_locations', 70, true);
  const legacy = [cg.location_preference, user?.location_preference, user?.location]
    .map(v => String(v ?? '').trim()).filter(Boolean);
  const locations = [...new Set([...structured, ...memLocations, ...legacy])];

  const remotePreference = lower(user?.remote_preference);
  const primaryLocation = ['required', 'preferred'].includes(remotePreference)
    ? 'Remote'
    : (locations[0] || '');

  // ── Stage ────────────────────────────────────────────────────────────────
  let stage = STAGE_ALIASES[lower(user?.student_year || user?.class_year || user?.year || cg.student_year)] || null;
  const graduationYear = Number(user?.graduation_year || user?.grad_year || cg.graduation_year) || null;
  if (!stage && graduationYear) {
    const now = new Date();
    const academicEndYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    const yearsLeft = graduationYear - academicEndYear;
    if (yearsLeft < 0) stage = 'recent_grad';
    else if (yearsLeft <= 0) stage = 'senior';
    else if (yearsLeft === 1) stage = 'junior';
    else if (yearsLeft === 2) stage = 'sophomore';
    else stage = 'freshman';
  }

  // ── Exclusions — the student told us no; every surface must honour it ─────
  const exclusions = {
    industries: memValues('disliked_industries', 70),
    companies: memValues('avoided_companies', 70),
    locations: memValues('excluded_locations', 70),
  };

  // ── Human-readable chip, built from the same resolved values ─────────────
  const levelWord = level === 'internship' ? 'internship' : level === 'fulltime' ? 'full-time role' : 'role';
  const chip = [field || 'Career', levelWord, primaryLocation ? `in ${primaryLocation}` : '']
    .filter(Boolean).join(' ');

  return {
    field,
    fieldTerms,
    level,
    levelKnown,
    locations,
    primaryLocation,
    remotePreference,
    strictLocation: lower(user?.location_flexibility) === 'stay' || lower(user?.relocation_openness) === 'no',
    school: user?.school_code || user?.school || '',
    stage,
    stageKnown: !!stage,
    graduationYear,
    major: user?.major || cg.major || null,
    exclusions,
    chip,
  };
}

/** True when a job's level contradicts the student's stated level. */
export function violatesLevel(profile: StudentProfile, title: string, employmentType = ''): boolean {
  if (profile.level === 'both') return false;
  const isIntern = INTERN_RE.test(`${title} ${employmentType}`);
  return profile.level === 'internship' ? !isIntern : isIntern;
}

/** True when a job hits one of the student's explicit exclusions. */
export function violatesExclusions(profile: StudentProfile, job: { title?: string; company?: string; location?: string }): boolean {
  const title = lower(job.title);
  const company = lower(job.company);
  const location = lower(job.location);
  if (profile.exclusions.industries.some(v => title.includes(v))) return true;
  if (profile.exclusions.companies.some(v => company.includes(v))) return true;
  if (profile.exclusions.locations.some(v => location.includes(v))) return true;
  return false;
}