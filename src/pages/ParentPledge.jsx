import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import CFFPledgePage from '@/components/onboarding/parent/CFFPledgePage';

/**
 * Standalone pledge page for existing parents who never took the pledge.
 * After completing the pledge, goes straight to ParentDashboard (no post-pledge question).
 */
export default function ParentPledge() {
  const { user, refreshUser } = useAuth();

  const handlePledgeComplete = async () => {
    // Refresh user so pledge_taken=true is picked up by routing
    if (refreshUser) await refreshUser();
    // Existing parents skip the post-pledge question — go straight to dashboard
    navigate('ParentDashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <CFFPledgePage user={user} onComplete={handlePledgeComplete} />;
}