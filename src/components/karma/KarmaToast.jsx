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

  const { points_awarded, karma_level, boost_multiplier, next_tier } = karmaResult;

  // Check if tier changed by comparing old level from next_tier logic
  // If next_tier.name === karma_level, that means they just hit the max of current tier
  // We detect tier-up by checking if boost > 0 and level is not 'none'
  const tierLabel = TIER_LABELS[karma_level] || karma_level;
  const boostLabel = TIER_BOOSTS[karma_level] || `${boost_multiplier}x`;

  // Standard karma toast
  toast({
    title: `🔥 +${points_awarded} Family Karma earned!`,
    description: boost_multiplier > 0
      ? `Your student just got a ${boostLabel} boost.`
      : `${next_tier?.points_remaining || 0} more points to unlock ${TIER_LABELS[next_tier?.name] || 'next'} tier.`,
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