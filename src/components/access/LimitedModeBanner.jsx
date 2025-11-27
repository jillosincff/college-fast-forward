import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles, X, Star } from 'lucide-react';
import GenerateInviteModal from '@/components/dashboard/GenerateInviteModal';
import { navigate } from '@/components/utils/navigation';

export default function LimitedModeBanner({ user, accessInfo, onDismiss }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for non-gator users or if not in limited mode
  if (!accessInfo?.isLimitedMode || isDismissed) return null;
  if (user?.persona !== 'gator') return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 shadow-lg relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                Limited Mode Active
              </p>
              <p className="text-white/90 text-xs sm:text-sm">
                {accessInfo.messagesRemaining} message{accessInfo.messagesRemaining !== 1 ? 's' : ''} remaining this month
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-4 py-2 text-sm shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Invite Parent for VIP ($9/mo)
            </Button>
            <Button
              onClick={() => navigate('Pricing')}
              variant="ghost"
              className="text-white/90 hover:bg-white/20 font-medium px-4 py-2 text-sm"
            >
              Learn More
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <GenerateInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteType="gator_to_parent"
        userPersona="gator"
        isUpgradeFlow={true}
      />
    </>
  );
}

/**
 * Inline VIP overlay for restricted features
 */
export function VIPOnlyOverlay({ featureName = "this feature", onInviteParent }) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center border border-slate-700 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-2xl" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-bold text-sm">VIP ACCESS REQUIRED</span>
          </div>
          
          <h3 className="text-white font-bold text-2xl mb-3">{featureName}</h3>
          <p className="text-slate-300 text-base mb-6 max-w-md mx-auto">
            Invite your parent to unlock full access to {featureName} and all premium features.
          </p>
          
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-3 text-lg shadow-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Invite Parent to Unlock
          </Button>
          
          <p className="text-slate-500 text-sm mt-4">
            Parent subscription: $9/month • Full access for you
          </p>
        </div>
      </div>

      <GenerateInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteType="gator_to_parent"
        userPersona="gator"
        isUpgradeFlow={true}
      />
    </>
  );
}

/**
 * Disabled button with VIP tooltip
 */
export function VIPLockedButton({ children, className = "", tooltipText = "VIP Only" }) {
  return (
    <div className="relative group">
      <Button
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
      >
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}