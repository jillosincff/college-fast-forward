import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function InsightsHero({ totalMembers, totalQuestions, totalSalaryReports }) {
  return (
    <div className="bg-gradient-to-br from-[#0021A5] via-[#001878] to-[#0021A5] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Lightbulb className="w-7 h-7 text-yellow-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">CFF Insights</h1>
        </div>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-8">
          Real-time intelligence from the Gator network — powered by data from students, parents, and alumni.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalMembers || '900+'}</p>
            <p className="text-xs text-white/60 mt-1">Members</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalQuestions || 0}</p>
            <p className="text-xs text-white/60 mt-1">Questions</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalSalaryReports || 0}</p>
            <p className="text-xs text-white/60 mt-1">Salary Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}