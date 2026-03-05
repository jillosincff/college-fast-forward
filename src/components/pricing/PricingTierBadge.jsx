import React from 'react';
import { Crown, Star, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Displays the user's pricing tier badge
 * 
 * Tiers:
 * - founding: 👑 FOUNDING MEMBER - Free Forever • Member #X
 * - early_adopter: ⭐ EARLY ADOPTER - $9/month Forever • Member #X  
 * - standard: ✓ MEMBER - $19/month • Member #X
 */
export default function PricingTierBadge({ user, showMemberNumber = true, size = 'default' }) {
  if (!user) return null;

  const tier = user.price_tier || (user.is_founding_member || user.is_founding_gator ? 'founding' : null);
  const memberNumber = user.member_number || user.founding_gator_number || user.signup_order;

  if (!tier) return null;

  const tierConfig = {
    founding: {
      icon: Crown,
      label: 'FOUNDING MEMBER',
      subtext: 'Free Forever',
      bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      textColor: 'text-white',
      iconColor: 'text-yellow-100',
      borderColor: 'border-yellow-300'
    },
    early_adopter: {
      icon: Star,
      label: 'EARLY ADOPTER',
      subtext: '$9/month Forever',
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      textColor: 'text-white',
      iconColor: 'text-blue-100',
      borderColor: 'border-blue-300'
    },
    standard: {
      icon: Check,
      label: 'MEMBER',
      subtext: '$29/month',
      bgColor: 'bg-gradient-to-r from-slate-500 to-slate-600',
      textColor: 'text-white',
      iconColor: 'text-slate-100',
      borderColor: 'border-slate-300'
    }
  };

  const config = tierConfig[tier] || tierConfig.standard;
  const Icon = config.icon;

  if (size === 'compact') {
    return (
      <Badge className={`${config.bgColor} ${config.textColor} border ${config.borderColor} px-2 py-1`}>
        <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
        <span className="text-xs font-semibold">{config.label}</span>
      </Badge>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bgColor} ${config.textColor} shadow-lg border ${config.borderColor}`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-wide">{config.label}</span>
        <span className="text-xs opacity-90">
          {config.subtext}
          {showMemberNumber && memberNumber && ` • Member #${memberNumber}`}
        </span>
      </div>
    </div>
  );
}