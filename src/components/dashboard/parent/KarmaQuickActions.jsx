import React from 'react';
import { navigate } from '@/components/utils/navigation';

export default function KarmaQuickActions() {
  return (
    <>
      <button
        onClick={() => navigate('Connections?tab=questions')}
        className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
      >
        Answer Questions <span className="font-bold text-blue-300">+15</span>
      </button>
      <button
        onClick={() => navigate('Connections?tab=salaries')}
        className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
      >
        Add Salary Data <span className="font-bold text-green-300">+25</span>
      </button>
      <button
        onClick={() => navigate('Connections?tab=interviews')}
        className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-white/25 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur transition whitespace-nowrap"
      >
        Share Interview Qs <span className="font-bold text-purple-300">+15</span>
      </button>
    </>
  );
}