import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Clock } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function MatchCard({ match, onMessage }) {
  const displayName = match.helper_name || match.parent_name || 'UF Helper';
  const firstName = displayName.split(/\s+/)[0];
  const initials = displayName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  const title = match.helper_title || match.parent_title || '';
  const company = match.helper_company || match.parent_company || '';
  const yearsExp = match.helper_years_experience || match.years_experience;
  
  const matchScore = match.match_score || match.relevance_score || 50;
  const matchPercent = Math.min(100, Math.max(0, matchScore));
  
  const isFastResponder = match.is_fast_responder || match.response_time_hours < 24;
  const hasMessaged = match.status === 'student_connected' || match.status === 'intro_made';

  const handleMessage = () => {
    if (onMessage) {
      onMessage(match);
    } else {
      // Navigate to message composer with match info
      navigate(`MessageComposer?to=${encodeURIComponent(match.helper_email || match.parent_email)}&name=${encodeURIComponent(displayName)}&matchId=${match.id}`);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-4 md:p-5 hover:shadow-lg hover:border-blue-200 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {initials}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-lg">{displayName}</h4>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {matchPercent}% match
            </span>
          </div>
          
          {(title || company) && (
            <p className="text-slate-600 text-sm mt-0.5">
              {title}{title && company ? ' at ' : ''}{company}
            </p>
          )}
          
          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isFastResponder && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                Fast responder
              </span>
            )}
            {yearsExp && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {yearsExp}+ years experience
              </span>
            )}
          </div>
        </div>
        
        {/* CTA */}
        <div className="flex-shrink-0">
          {hasMessaged ? (
            <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
              ✓ Messaged
            </span>
          ) : (
            <Button
              onClick={handleMessage}
              className="bg-[#0021A5] hover:bg-blue-800 text-white whitespace-nowrap"
            >
              Message {firstName} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}