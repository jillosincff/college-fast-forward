import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function KarmaQuickActions() {
  const { user } = useAuth();

  // Calculate profile completeness
  const profilePercent = [user?.company, user?.linkedin_url, user?.title, user?.profile_image].filter(Boolean).length * 25;
  const profileComplete = profilePercent >= 100;

  return (
    <>
      <button
        onClick={() => navigate('Connections?tab=questions')}
        className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
      >
        Answer Questions <span className="font-bold text-blue-300">+15</span>
      </button>
      <button
        onClick={() => navigate('PostOpportunity')}
        className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
      >
        Post a Job <span className="font-bold text-green-300">+10</span>
      </button>
      {profileComplete ? (
        <button
          onClick={() => navigate('GatorDirectory')}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
        >
          🔍 Browse Directory
        </button>
      ) : (
        <button
          onClick={() => navigate('ProfileEdit')}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
        >
          👤 Complete Your Profile
        </button>
      )}
    </>
  );
}