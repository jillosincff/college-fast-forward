import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

export default function FirstMessageNudgeModal({ topMatch, allMatchesCount, onMessage, onBrowse, onClose }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('firstMessageNudgeDismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
    } else {
      trackEvent('first_message_nudge_shown', { top_match_id: topMatch?.id });
    }
  }, []);

  if (dismissed || !topMatch) return null;

  const handleDismiss = () => {
    localStorage.setItem('firstMessageNudgeDismissed', 'true');
    setDismissed(true);
    trackEvent('first_message_nudge_dismissed', {});
    onClose?.();
  };

  const handleMessage = () => {
    trackEvent('first_message_nudge_clicked', { match_id: topMatch.id });
    handleDismiss();
    onMessage?.(topMatch);
  };

  const handleBrowseAll = () => {
    trackEvent('first_message_nudge_browse', {});
    handleDismiss();
    onBrowse?.();
  };

  const displayName = topMatch.helper_name || topMatch.parent_name || 'UF Professional';
  const firstName = displayName.split(' ')[0];
  const title = topMatch.helper_title || topMatch.parent_title || topMatch.title || '';
  const company = topMatch.helper_company || topMatch.parent_company || topMatch.company || '';
  const studentsHelped = topMatch.students_helped_count || topMatch.studentsHelpedCount || 0;

  // Get match reasons
  const matchReasons = topMatch.match_reasons || topMatch.matchReasons || [];

  const getInitials = (name) => {
    if (!name) return 'UF';
    return name
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-xl font-bold text-gray-900">
            Ready to make your first connection?
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Students who message 3+ parents get responses <span className="font-semibold">80% faster</span>.
          </p>
        </div>
        
        {/* Top match card */}
        <div className="border-2 border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
            >
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              {(title || company) && (
                <p className="text-sm text-gray-500 truncate">
                  {title}{title && company && ' at '}{company}
                </p>
              )}
            </div>
          </div>
          
          {matchReasons.length > 0 && (
            <p className="text-sm text-gray-400 mb-3">
              ✨ {matchReasons.slice(0, 3).join(' · ')}
            </p>
          )}
          
          {studentsHelped > 0 && (
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <span className="text-green-500">✓</span>
              {firstName} has helped {studentsHelped} student{studentsHelped > 1 ? 's' : ''} this month.
            </p>
          )}
          
          <button
            onClick={handleMessage}
            className="w-full py-3 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)`,
              boxShadow: `0 4px 12px ${UF_BLUE}40`
            }}
          >
            Message {firstName} →
          </button>
        </div>
        
        {/* Browse alternative */}
        <button
          onClick={handleBrowseAll}
          className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Browse all {allMatchesCount} matches instead
        </button>
      </div>
    </div>
  );
}