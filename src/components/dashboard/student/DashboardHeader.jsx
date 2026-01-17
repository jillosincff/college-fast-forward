import React from 'react';
import StatsCards from './StatsCards';

const UF_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #001878 50%, #0021A5 100%)';

export default function DashboardHeader({ 
  firstName,
  stats, 
  state 
}) {
  // Don't show header for new users (they get their own welcome)
  if (state === 'new_user') return null;
  
  return (
    <header 
      className="text-white"
      style={{ background: UF_GRADIENT }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
          Welcome back, {firstName}! 👋
        </h1>
        <StatsCards stats={stats} state={state} />
      </div>
    </header>
  );
}