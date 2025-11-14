import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { User } from '@/entities/User';
import { getGreeting, displayName } from '@/components/utils/greetingLogic';

export default function ParentWelcomeHero({
  stats = { intros: 0, requestsViewed: 0, newParents: 0 }
}) {
  const { user, updateAuthContextUser } = useAuth();
  const [hasAttemptedUpdate, setHasAttemptedUpdate] = useState(false);
  
  // Use the greeting logic to get the correct greeting and first name
  const { greeting, firstName, isFirstTime } = getGreeting(user);

  // This effect updates the flag in the database for the *next* visit.
  useEffect(() => {
    // Only run this logic if onboarding is complete, it's their first time, AND we haven't already tried to update.
    if (user?.onboarding_completed && isFirstTime && user?.id && !hasAttemptedUpdate) {
      const markDashboardSeen = async () => {
        try {
          // Immediately set the flag to prevent re-runs, even if the parent component re-renders.
          setHasAttemptedUpdate(true);
          await User.updateMyUserData({ has_seen_dashboard: true });
          updateAuthContextUser({ ...user, has_seen_dashboard: true });
        } catch (error) {
          console.error('Failed to mark dashboard as seen:', error);
          // Do not reset the flag, to avoid loops on persistent errors.
        }
      };
      markDashboardSeen();
    }
  }, [isFirstTime, user, updateAuthContextUser, hasAttemptedUpdate]);

  const handlePostOpportunity = () => {
    trackEvent('cta_post_opportunity_clicked', { location: 'hero' });
    navigate('PostOpportunity');
  };

  const handleViewImpact = () => {
    trackEvent('cta_view_impact_clicked', { location: 'hero' });
    navigate('MyImpact');
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#0021A5] to-[#FA4616] border"
      aria-label="Parent dashboard welcome"
    >
      {/* soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          <span aria-hidden="true" className="mr-1">👋</span>
          {greeting}, {firstName}!
        </h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-white opacity-90">
          Your experience is making a difference for Gators. Track your impact, conversations, and opportunities here.
        </p>

        {/* CTAs */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handlePostOpportunity}
            className="inline-flex items-center rounded-xl bg-white text-[#FA4616] px-4 py-2 shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-opacity font-semibold"
          >
            Post an Opportunity
          </button>
          <button
            onClick={handleViewImpact}
            className="inline-flex items-center rounded-xl border border-white px-4 py-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors font-semibold"
          >
            View My Impact
          </button>
        </div>

        {/* Optional mini-stats (hide if all zero) */}
        {(stats.intros > 0 || stats.requestsViewed > 0 || stats.newParents > 0) ? (
          <div className="mt-6 flex flex-wrap gap-4 text-center">
            {stats.intros > 0 && (
              <div className="flex-1 min-w-[120px]">
                <p className="text-3xl font-extrabold text-white">{stats.intros}</p>
                <p className="text-xs text-white opacity-80 uppercase font-bold tracking-wider">Intros</p>
              </div>
            )}
            {stats.requestsViewed > 0 && (
              <div className="flex-1 min-w-[120px]">
                <p className="text-3xl font-extrabold text-white">{stats.requestsViewed}</p>
                <p className="text-xs text-white opacity-80 uppercase font-bold tracking-wider">Requests Viewed</p>
              </div>
            )}
            {stats.newParents > 0 && (
              <div className="flex-1 min-w-[120px]">
                <p className="text-3xl font-extrabold text-white">{stats.newParents}</p>
                <p className="text-xs text-white opacity-80 uppercase font-bold tracking-wider">New Parents</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}