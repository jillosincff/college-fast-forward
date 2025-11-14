
import { useState, useEffect } from 'react';
import ConnectionCelebration from './ConnectionCelebration';
import EasterEggs from './EasterEggs';
import ConfettiCelebration from './ConfettiCelebration';
import ShareGatorNetworkManager from './ShareGatorNetworkManager';
import { useAuth } from '@/components/auth/AuthContext';

export default function ViralManager() {
  const { user } = useAuth();
  const [celebration, setCelebration] = useState({ show: false, data: null });
  const [showConfetti, setShowConfetti] = useState(false);

  // Listen for various app-wide events
  useEffect(() => {
    const handleConnection = (event) => {
      setCelebration({
        show: true,
        data: event.detail
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleChallenge = (event) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleInvite = (event) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };
    
    const handleMilestone = (event) => {
      // Trigger a longer confetti burst for milestones
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    };

    window.addEventListener('gator-connection-made', handleConnection);
    window.addEventListener('gator-challenge-completed', handleChallenge);
    window.addEventListener('gator-invite-sent', handleInvite);
    window.addEventListener('gator-milestone-reached', handleMilestone);
    
    return () => {
      window.removeEventListener('gator-connection-made', handleConnection);
      window.removeEventListener('gator-challenge-completed', handleChallenge);
      window.removeEventListener('gator-invite-sent', handleInvite);
      window.removeEventListener('gator-milestone-reached', handleMilestone);
    };
  }, []);

  const handleCelebrationComplete = () => {
    setCelebration({ show: false, data: null });
  };

  return (
    <>
      <ShareGatorNetworkManager />
      <ConnectionCelebration
        isVisible={celebration.show}
        connectionData={celebration.data}
        onComplete={handleCelebrationComplete}
      />
      
      <ConfettiCelebration isVisible={showConfetti} />
      
      <EasterEggs />
    </>
  );
}
