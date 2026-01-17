import React from 'react';
import { Button } from '@/components/ui/button';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';
const UF_BUTTON_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)';

export default function ChallengeCard({ challenge, onLogIntro }) {
  const introsLogged = challenge?.introsLogged || challenge?.challenge_intros_logged || 0;
  const goal = challenge?.goal || 3;
  const daysRemaining = challenge?.daysRemaining || challenge?.days_remaining || 30;
  const isComplete = challenge?.isComplete || introsLogged >= goal;
  
  const progress = Math.min((introsLogged / goal) * 100, 100);
  const introsNeeded = Math.max(goal - introsLogged, 0);
  
  return (
    <section className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">🎯</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">30-Day Challenge</h3>
            <p className="text-sm text-gray-500">
              {introsLogged}/{goal} intros · {daysRemaining} days left
            </p>
            {!isComplete && introsNeeded > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {introsNeeded} more intro{introsNeeded !== 1 ? 's' : ''} to earn your badge!
              </p>
            )}
          </div>
        </div>
        
        {isComplete ? (
          <span 
            className="font-semibold text-sm px-3 py-1 rounded-full flex-shrink-0"
            style={{ 
              backgroundColor: `${UF_ORANGE}20`,
              color: UF_ORANGE
            }}
          >
            ✓ Complete!
          </span>
        ) : (
          <Button 
            onClick={onLogIntro}
            variant="ghost"
            className="font-semibold text-sm px-4 py-2 rounded-xl transition flex-shrink-0"
            style={{ 
              backgroundColor: `${UF_BLUE}10`,
              color: UF_BLUE
            }}
          >
            Log Intro →
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`,
            background: UF_BUTTON_GRADIENT
          }}
        />
      </div>
    </section>
  );
}