import React from 'react';
import { Button } from '@/components/ui/button';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';
const UF_BUTTON_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)';

export default function MatchCard({ match, onMessage }) {
  // Get display name - never show "Gator Parent"
  const displayName = match.helper_name || match.parent_name || match.displayName || 'UF Professional';
  const firstName = displayName.split(' ')[0];
  
  // Generate initials
  const initials = displayName
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'UF';
  
  const title = match.helper_title || match.parent_title || match.title || '';
  const company = match.helper_company || match.parent_company || match.company || '';
  const matchScore = match.match_score || match.matchScore || 85;
  const yearsExperience = match.years_experience || match.yearsExperience;
  const isFastResponder = match.is_fast_responder || match.isFastResponder;

  return (
    <div className="bg-gray-50 hover:bg-blue-50 rounded-2xl p-4 md:p-5 transition-all border-2 border-transparent hover:border-blue-100">
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Avatar */}
        <div 
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0 shadow-lg"
          style={{ background: UF_BUTTON_GRADIENT }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-base md:text-lg">
              {displayName}
            </span>
            <span 
              className="text-xs md:text-sm font-bold px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${UF_ORANGE}20`,
                color: UF_ORANGE
              }}
            >
              {matchScore}% match
            </span>
          </div>
          
          {(title || company) && (
            <p className="text-sm text-gray-600 mt-0.5 truncate">
              {title}
              {title && company && ' at '}
              {company}
            </p>
          )}

          {/* Match Reasons - Why you matched */}
          {(match.match_reasons || match.matchReasons)?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              ✨ {(match.match_reasons || match.matchReasons).slice(0, 3).join(' · ')}
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isFastResponder && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                ⚡ Fast responder
              </span>
            )}
            {yearsExperience && yearsExperience >= 10 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                {yearsExperience}+ years exp
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={() => onMessage?.(match)}
          className="flex-shrink-0 text-white font-semibold px-3 md:px-5 py-2 md:py-2.5 rounded-xl shadow-lg transition hover:scale-105 text-sm md:text-base"
          style={{ 
            background: UF_BUTTON_GRADIENT,
            boxShadow: `0 4px 12px ${UF_BLUE}30`
          }}
        >
          <span className="hidden sm:inline">Message {firstName} →</span>
          <span className="sm:hidden">Message →</span>
        </Button>
      </div>
    </div>
  );
}