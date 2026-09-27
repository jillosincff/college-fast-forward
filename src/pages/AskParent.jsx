import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';

// Deep link from the one-time student email (utm_source=student_email). After
// login it opens the Ask-a-parent view directly. No onboarding/MM guard — any
// logged-in student can ask. Tagged source so the admin tile attributes it.
export default function AskParent() {
  const { user, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !user) navigateToLogin();
  }, [isLoadingAuth, user, navigateToLogin]);

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const close = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.hash = '#/FreeTierDashboard';
  };

  return <ProUpgradeModal user={user} source="student_email" initialView="parent" onClose={close} />;
}