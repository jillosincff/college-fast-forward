import React from 'react';
import StatsCards from './StatsCards';

const UF_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #001878 50%, #0021A5 100%)';

export default function DashboardHeader({ 
  firstName,
  user,
  stats, 
  state 
}) {
  // Don't show header for new users (they get their own welcome)
  if (state === 'new_user') return null;

  const major = user?.major || user?.student_major || '';
  const classYear = user?.graduation_year || user?.student_year || '';
  const subtitle = [major, classYear].filter(Boolean).join(' · ');
  
  return (
    <header 
      className="text-white"
      style={{ background: UF_GRADIENT }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <h1 className="text-xl md:text-3xl font-bold text-white">
          Welcome back, {firstName}! 👋
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-white/70 mt-1 mb-4">
            🐊 UF{subtitle ? ` · ${subtitle}` : ''}
          </p>
        )}
        {!subtitle && <div className="mb-4" />}
        <StatsCards stats={stats} state={state} />
      </div>
    </header>
  );
}