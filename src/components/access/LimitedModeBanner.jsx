import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles, X } from 'lucide-react';
import GenerateInviteModal from '@/components/dashboard/GenerateInviteModal';

export default function LimitedModeBanner({ user, accessInfo, onDismiss }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!accessInfo?.isLimitedMode || isDismissed) return null;

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
              Unlock VIP Access ($9/mo)
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
export function VIPOnlyOverlay({ feature = "this feature", onInviteParent }) {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">VIP Only</h3>
        <p className="text-white/80 text-sm mb-4 max-w-xs">
          Ask your parent to upgrade for full access to {feature}
        </p>
        {onInviteParent && (
          <Button
            onClick={onInviteParent}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Invite Parent
          </Button>
        )}
      </div>
    </div>
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