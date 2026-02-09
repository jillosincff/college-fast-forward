import React from 'react';
import { useToast } from '@/components/ui/use-toast';

const TIER_LABELS = {
  none: 'Getting Started',
  active: 'Active',
  engaged: 'Engaged',
  priority: 'Priority',
  champion: 'Champion'
};

const TIER_BOOSTS = {
  none: '0x',
  active: '+0.5x',
  engaged: '+1x',
  priority: '+2x',
  champion: '+3x'
};

export function showKarmaToast(toast, karmaResult) {
  if (!karmaResult) return;

  const { points_awarded, karma_level, boost_multiplier, next_tier, boosted_students, boosted_count } = karmaResult;

  const tierLabel = TIER_LABELS[karma_level] || karma_level;
  const boostLabel = TIER_BOOSTS[karma_level] || `${boost_multiplier}x`;

  // If parent has linked students with boosts applied, show the impactful boost toast
  if (boosted_count > 0 && boosted_students?.length > 0) {
    const studentName = boosted_students[0].name || 'your student';
    // Estimate position jump based on boost multiplier
    const estimatedJump = Math.max(1, Math.round(40 * 0.2 * (boost_multiplier || 0.5)));
    
    toast({
      title: `🔥 Your help just moved ${studentName}'s question up ~${estimatedJump} spots!`,
      description: `+${points_awarded} Family Karma earned • ${boostLabel} boost active`,
      duration: 3500,
    });
    return;
  }

  // If parent has boost but no students were boosted (no active questions)
  if (boost_multiplier > 0 && boosted_count === 0) {
    toast({
      title: `🔥 +${points_awarded} Family Karma earned!`,
      description: `${boostLabel} boost ready — it'll activate when your student posts a question.`,
      duration: 2500,
    });
    return;
  }

  // No linked student — nudge to link
  toast({
    title: `🔥 +${points_awarded} Family Karma earned!`,
    description: boost_multiplier > 0
      ? `Your student just got a ${boostLabel} boost.`
      : `Link your student to activate boosts! ${next_tier?.points_remaining || 0} pts to ${TIER_LABELS[next_tier?.name] || 'next'} tier.`,
    duration: 2200,
  });
}

export function showTierUpToast(toast, oldLevel, newLevel, boost) {
  if (!newLevel || newLevel === 'none' || oldLevel === newLevel) return;

  const tierLabel = TIER_LABELS[newLevel] || newLevel;
  const boostLabel = TIER_BOOSTS[newLevel] || `${boost}x`;

  toast({
    title: `🎉 You reached ${tierLabel}!`,
    description: `Your student now gets ${boostLabel} boost.`,
    duration: 3000,
  });
}

export default { showKarmaToast, showTierUpToast };