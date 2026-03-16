// Display tiers (user-facing) — Bronze · Silver · Gold · Platinum
// Thresholds: 0 · 50 · 150 · 300
export const KARMA_DISPLAY_TIERS = [
  { name: 'Bronze',   threshold: 0 },
  { name: 'Silver',   threshold: 50 },
  { name: 'Gold',     threshold: 150 },
  { name: 'Platinum', threshold: 300 },
];

// Action point values — pulled from awardKarma backend function KARMA_VALUES
export const KARMA_ACTION_POINTS = {
  answer: 15,
  intro_made: 15,
  referral_given: 50,
  onboarding_complete: 50,
  best_answer: 25,
  upvote_received: 3,
  salary_submitted: 25,
  interview_question_submitted: 15,
  message_responded: 10,
  mock_interview: 30,
  outcome_reported: 75,
  opportunity_posted: 20,
};

/**
 * Returns { tierName, points, nextTierName, nextTierThreshold, pointsToNext }
 */
export function getKarmaDisplayInfo(totalPoints) {
  const pts = totalPoints || 0;
  let currentTier = KARMA_DISPLAY_TIERS[0];
  let nextTier = null;

  for (let i = 0; i < KARMA_DISPLAY_TIERS.length; i++) {
    if (pts >= KARMA_DISPLAY_TIERS[i].threshold) {
      currentTier = KARMA_DISPLAY_TIERS[i];
      nextTier = KARMA_DISPLAY_TIERS[i + 1] || null;
    }
  }

  return {
    tierName: currentTier.name,
    points: pts,
    nextTierName: nextTier ? nextTier.name : null,
    nextTierThreshold: nextTier ? nextTier.threshold : null,
    pointsToNext: nextTier ? nextTier.threshold - pts : 0,
  };
}