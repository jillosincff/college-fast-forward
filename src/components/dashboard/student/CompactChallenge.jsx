import React from 'react';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

export default function CompactChallenge({ user, onLogIntro }) {
  const introsLogged = user?.intros_logged_count || 0;
  const daysRemaining = 15; // Simplified - would calculate from challenge start
  
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">
            🎯 30-Day Challenge
          </p>
          <p className="text-sm text-slate-600">
            Get 3 intros to earn your badge!
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-bold text-slate-900">{introsLogged}/3</p>
          <p className="text-xs text-slate-500">{daysRemaining} days</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogIntro}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap"
        >
          Log Intro →
        </Button>
      </div>
    </div>
  );
}