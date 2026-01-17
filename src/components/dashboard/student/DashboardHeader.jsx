import React from 'react';
import StatsCards from './StatsCards';

export default function DashboardHeader({ 
  student, 
  stats, 
  state,
  firstName 
}) {
  // Don't show header for new users (they get their own welcome)
  if (state === 'new_user') return null;
  
  return (
    <div 
      className="text-white py-6 px-4"
      style={{ 
        background: 'linear-gradient(135deg, #0021A5 0%, #001878 50%, #0021A5 100%)' 
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-3xl font-bold text-white mb-4">
          Welcome back, {firstName}! 👋
        </h1>
        
        <StatsCards 
          stats={stats}
          state={state}
        />
      </div>
    </div>
  );
}