// Consolidated Help Categories (5 universal categories)
// Used for both giving help (multi-select) and requesting help (single-select)

export const HELP_CATEGORIES = [
  {
    id: 'career_guidance',
    label: 'Career guidance',
    icon: '💼',
    description: 'Career paths, transitions, mentorship, salary advice',
    keywords: ['career', 'advice', 'mentor', 'salary', 'negotiate', 'transition', 'path', 'guidance'],
  },
  {
    id: 'jobs_referrals',
    label: 'Jobs & referrals',
    icon: '🔍',
    description: 'Job search help, referrals, sharing opportunities',
    keywords: ['job', 'internship', 'referral', 'hiring', 'opportunity', 'apply', 'leads'],
  },
  {
    id: 'resume_interviews',
    label: 'Resume & interviews',
    icon: '📄',
    description: 'Resume review, LinkedIn optimization, mock interviews',
    keywords: ['resume', 'cv', 'linkedin', 'interview', 'mock', 'prep', 'feedback'],
  },
  {
    id: 'industry_insights',
    label: 'Industry insights',
    icon: '🏢',
    description: 'Day-to-day work, breaking into a field, career paths',
    keywords: ['industry', 'field', 'sector', 'work', 'day-to-day', 'culture', 'trends'],
  },
  {
    id: 'introductions',
    label: 'Introductions',
    icon: '🤝',
    description: 'Connecting with specific people or companies',
    keywords: ['introduction', 'connect', 'network', 'intro', 'meet', 'networking'],
  },
];

// Migration map from old category IDs to new ones
export const CATEGORY_MIGRATION_MAP = {
  // Career guidance consolidation
  'career_advice': 'career_guidance',
  'career_advice_guidance': 'career_guidance',
  'salary_negotiation': 'career_guidance',
  'salary_negotiation_tips': 'career_guidance',
  'salary_tips': 'career_guidance',
  'general_mentorship': 'career_guidance',
  'mentorship': 'career_guidance',
  'grad_school': 'career_guidance',
  'grad_school_advice': 'career_guidance',
  
  // Jobs & referrals
  'job_referrals': 'jobs_referrals',
  'job_internship_referrals': 'jobs_referrals',
  'job_leads': 'jobs_referrals',
  'job_search': 'jobs_referrals',
  'new_job_search': 'jobs_referrals',
  
  // Resume & interviews
  'resume_review': 'resume_interviews',
  'resume_linkedin_review': 'resume_interviews',
  'resume_feedback': 'resume_interviews',
  'resume': 'resume_interviews',
  'mock_interviews': 'resume_interviews',
  'interview_prep': 'resume_interviews',
  'interviews': 'resume_interviews',
  
  // Industry insights
  'industry_insights': 'industry_insights',
  
  // Introductions
  'networking': 'introductions',
  'networking_introductions': 'introductions',
  'introductions': 'introductions',
  
  // Alumni request types migration
  'career_transition': 'career_guidance',
  'industry_shift': 'industry_insights',
  'business_advice': 'career_guidance',
  'introduction_request': 'introductions',
  'general': 'career_guidance',
};

// Helper functions
export const getCategoryById = (id) => 
  HELP_CATEGORIES.find(c => c.id === id);

export const getCategoryLabel = (id) => 
  getCategoryById(id)?.label || id;

export const getCategoryIcon = (id) => 
  getCategoryById(id)?.icon || '💬';

export const getCategoryDescription = (id) =>
  getCategoryById(id)?.description || '';

// Migrate old category ID to new one
export const migrateCategory = (oldId) => 
  CATEGORY_MIGRATION_MAP[oldId] || oldId;

// Migrate array of categories (with deduplication)
export const migrateCategories = (oldCategories) => {
  if (!oldCategories || !Array.isArray(oldCategories)) return [];
  return [...new Set(oldCategories.map(migrateCategory))];
};

// For dropdowns/selects
export const CATEGORY_OPTIONS = HELP_CATEGORIES.map(c => ({
  value: c.id,
  label: c.label,
  icon: c.icon,
  description: c.description,
}));

// Related categories for matching algorithm
export const RELATED_CATEGORIES = {
  'career_guidance': ['industry_insights'],
  'jobs_referrals': ['introductions', 'career_guidance'],
  'resume_interviews': ['career_guidance'],
  'industry_insights': ['career_guidance'],
  'introductions': ['industry_insights'],
};

export default HELP_CATEGORIES;