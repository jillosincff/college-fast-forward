// ── CLIFF entitlement system — single source of truth for plan access ──
// FREE proves that CLIFF is smart. PRO lets CLIFF do the work.
// Never hard-code plan logic in components — query this module instead.
import { base44 } from '@/api/base44Client';
import { checkIsFastIQ } from '@/utils/isFastIQ';

export const PLAN_FREE = 'free';
export const PLAN_PRO = 'pro';

export const getPlan = (user) => (checkIsFastIQ(user) ? PLAN_PRO : PLAN_FREE);

// Account badge label — never show "Upgrade" language to an active Pro user
export const getPlanLabel = (user) => (getPlan(user) === PLAN_PRO ? 'CLIFF Pro' : 'Free');

// Free-tier access map.
// true  = full free access
// false = CLIFF Pro only
// { limit, period } = metered free access (enforced server-side by featureUsage)
const FREE_ACCESS = {
  // Guidance — free proves CLIFF is smart
  view_curated_jobs: true,
  daily_job_recommendations: { limit: 3, period: 'day' },
  save_jobs: true,
  track_applications: true,
  career_momentum: true,
  cliff_memory: true,
  cliff_chat_basic: { limit: 5, period: 'week' },
  resume_basic_review: true,
  discovery_basic: true,
  mock_interview_basic: { limit: 1, period: 'month' },
  // One-time magic moment: the student's first CLIFF-powered application is on us
  resume_tailor: { limit: 1, period: 'lifetime' },

  // Execution — CLIFF Pro does the work
  cliff_chat_unlimited: false,
  cover_letter_generate: false,
  application_answer_assist: false,
  job_workspace_full: false,
  company_research_full: false,
  connection_search: false,
  outreach_generate: false,
  follow_up_generate: false,
  mock_interview_full: false,
  discovery_full: false,
  weekly_career_brief: false,
};

// Does this user's plan include the capability at all (possibly metered)?
export const hasCapability = (user, capability) => {
  if (getPlan(user) === PLAN_PRO) return true;
  const access = FREE_ACCESS[capability];
  return access !== false && access !== undefined;
};

// Metering rule for this user+capability, or null when unlimited/unavailable
export const getUsageLimit = (user, capability) => {
  if (getPlan(user) === PLAN_PRO) return null;
  const access = FREE_ACCESS[capability];
  return typeof access === 'object' ? access : null;
};

// Server-checked remaining usage → { allowed, remaining, limit, period, unlimited? }
export const getUsageRemaining = async (user, capability) => {
  if (!getUsageLimit(user, capability)) {
    return { allowed: hasCapability(user, capability), unlimited: true, remaining: null };
  }
  const res = await base44.functions.invoke('featureUsage', { action: 'status', capability });
  return res.data;
};

// Consume one credit AFTER the output completes successfully (server-enforced)
export const consumeUsage = async (user, capability) => {
  if (!getUsageLimit(user, capability)) {
    return { allowed: hasCapability(user, capability), unlimited: true, remaining: null };
  }
  const res = await base44.functions.invoke('featureUsage', { action: 'consume', capability });
  return res.data;
};