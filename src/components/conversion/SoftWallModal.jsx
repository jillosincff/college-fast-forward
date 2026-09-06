import { useEffect, useRef } from 'react';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { trackSoftWallViewed, trackSoftWallUpgradeClicked } from '@/lib/tracking';

// Show the actual offer at the gated action, not another screen before pricing.
export default function SoftWallModal({ user, onClose, source = 'soft_wall' }) {
  const viewed = useRef(false);
  useEffect(() => {
    if (!user?.id || viewed.current) return;
    viewed.current = true;
    trackSoftWallViewed({ source });
  }, [user?.id, source]);
  return <ProUpgradeModal user={user} onClose={onClose} source={source}
    onIntent={(cta) => trackSoftWallUpgradeClicked({ source, cta })} />;
}