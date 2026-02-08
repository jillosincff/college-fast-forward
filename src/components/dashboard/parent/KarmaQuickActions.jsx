import React from 'react';
import { navigate } from '@/components/utils/navigation';

export default function KarmaQuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => navigate('Connections?tab=questions')}
        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition"
      >
        Answer Questions +15
      </button>
      <button
        onClick={() => navigate('Connections?tab=salaries')}
        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition"
      >
        Add Salary Data +25
      </button>
      <button
        onClick={() => navigate('Connections?tab=interviews')}
        className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium transition"
      >
        Share Interview Qs +15
      </button>
    </div>
  );
}