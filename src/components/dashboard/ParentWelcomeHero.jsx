import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';
import { User } from '@/entities/User';
import { getGreeting, displayName } from '@/components/utils/greetingLogic';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS, HERO_HEADING_CLASSES } from '@/components/home/HeroStyles';

export default function ParentWelcomeHero({
  stats = { intros: 0, requestsViewed: 0, newParents: 0 }
}) {
  const { user, updateAuthContextUser } = useAuth();
  const [hasAttemptedUpdate, setHasAttemptedUpdate] = useState(false);
  
  const { greeting, firstName, isFirstTime } = getGreeting(user);

  useEffect(() => {
    if (user?.onboarding_completed && isFirstTime && user?.id && !hasAttemptedUpdate) {
      const markDashboardSeen = async () => {
        try {
          setHasAttemptedUpdate(true);
          await User.updateMyUserData({ has_seen_dashboard: true });
          updateAuthContextUser({ ...user, has_seen_dashboard: true });
        } catch (error) {
          console.error('Failed to mark dashboard as seen:', error);
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
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 border"
      style={HERO_BG_GRADIENT}
      aria-label="Parent dashboard welcome"
    >
      {HERO_TEXTURE_OVERLAY}
      {HERO_GLOW_EFFECTS}

      <div className="relative">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          <span aria-hidden="true" className="mr-1">👋</span>
          {greeting}, {firstName}!
        </h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-white opacity-90">
          Your experience is making a difference for Gators. Track your impact, conversations, and opportunities here.
        </p>

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