import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';

// One current offer: actual Stripe prices, no expired founding rates or trial promises.
export default function PlanSelectionModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;
  return <ProUpgradeModal user={user} onClose={onClose} source="plan_selection" />;
}