import { useState } from 'react';
import MagicMomentCompleteBeat from '@/components/magic-moment/MagicMomentCompleteBeat';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { hasProOfferBeenViewed } from '@/lib/tracking';

// Safety net: any student who completed the Magic Moment but never saw/logged
// the Pro/parent offer gets ONE soft beat when they land on the dashboard.
// MagicMomentCompleteBeat logs pro_offer_viewed (idempotent) on mount and sets
// the client flag, so this never re-shows after the offer has been seen once —
// it is not a forever-nag. Catches the "open a job → workspace → back to
// dashboard" exit path and any deep-link that bypassed the post-MM beat.
export default function PostMagicMomentOfferNet({ user }) {
  const [show, setShow] = useState(() => {
    if (!user) return false;
    if (user.magic_moment_completed !== true) return false;
    // Pro students / admins don't need the free→Pro offer
    if (user.subscription_status === 'active' || user.membership_tier === 'pro' || user.role === 'admin') return false;
    return !hasProOfferBeenViewed();
  });
  const [modal, setModal] = useState(null);
  if (!show) return null;

  return (
    <>
      <MagicMomentCompleteBeat
        onAskParent={() => setModal({ initialView: 'parent', source: 'post_mm_safety_net_parent' })}
        onUnlockPro={() => setModal({ initialView: 'main', source: 'post_mm_safety_net' })}
        onDismiss={() => setShow(false)}
      />
      {modal && (
        <ProUpgradeModal
          user={user}
          source={modal.source}
          initialView={modal.initialView}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}