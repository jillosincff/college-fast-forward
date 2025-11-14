import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import ShareGatorNetworkModal from './ShareGatorNetworkModal';

export default function ShareGatorNetworkManager() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user has dismissed modal for 30 days
    const dismissedUntil = localStorage.getItem('gator_share_dismissed_until');
    if (dismissedUntil && new Date() < new Date(dismissedUntil)) {
      return;
    }

    // Check if user has already been shown the modal
    const hasSeenModal = localStorage.getItem('gator_share_modal_shown');
    if (hasSeenModal) return;

    // Check if user has taken a key action
    const keyActionTaken = checkKeyActionTaken();
    if (keyActionTaken) {
      // Wait a bit before showing to avoid interrupting the user
      setTimeout(() => {
        setShowModal(true);
        localStorage.setItem('gator_share_modal_shown', 'true');
      }, 2000);
    }
  }, [user]);

  const checkKeyActionTaken = () => {
    // Check various indicators that user is engaged
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
    const hasPostedRequest = localStorage.getItem('has_posted_request');
    const hasHelpedSomeone = localStorage.getItem('has_helped_someone');
    const hasUsedPlatform = localStorage.getItem('has_used_platform');

    // Show modal if:
    // - User has visited 3+ times, OR
    // - User has posted a request, OR  
    // - User has helped someone, OR
    // - User has used platform features
    return visitCount >= 3 || hasPostedRequest || hasHelpedSomeone || hasUsedPlatform;
  };

  // Track visit count
  useEffect(() => {
    const currentCount = parseInt(localStorage.getItem('visit_count') || '0');
    localStorage.setItem('visit_count', (currentCount + 1).toString());
  }, []);

  return (
    <ShareGatorNetworkModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
    />
  );
}