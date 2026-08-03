// Builds the canonical career_goals object (the same shape EditGoalsModal saves
// and job searches read) from raw onboarding answers, so the profile and
// searches always match what the student told us during onboarding.

const INDUSTRY_LABELS = {
  tech: 'Tech & Engineering',
  business: 'Business & Finance',
  marketing: 'Marketing & Media',
  healthcare: 'Healthcare & Bio',
  law_gov: 'Law & Government',
  creative: 'Creative & Entertainment',
};

export function industryLabel(key) {
  if (INDUSTRY_LABELS[key]) return INDUSTRY_LABELS[key];
  if (typeof key === 'string') return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return String(key);
}

export function buildCareerGoalsFromOnboarding({ seeking = '', industries = [], targetRoles = [], location = '' }) {
  const seekingMap = { internship: 'internship', fulltime: 'fulltime', both: 'both', exploring: 'both' };
  const loc = location === 'remote' ? 'Remote' : (location || '');
  return {
    seeking: seekingMap[seeking] || 'both',
    target_roles: (targetRoles || []).filter(Boolean),
    target_industries: (industries || []).filter(Boolean).map(industryLabel),
    ...(loc ? { location_preference: loc } : {}),
    saved_at: new Date().toISOString(),
    source: 'onboarding',
  };
}