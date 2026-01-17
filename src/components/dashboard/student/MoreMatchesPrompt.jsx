import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight } from 'lucide-react';
import MatchCard from './MatchCard';

export default function MoreMatchesPrompt({ 
  unmessagedMatches, 
  totalMatches,
  onMessageMatch,
  isWaitingForResponses = false 
}) {
  if (!unmessagedMatches || unmessagedMatches.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-slate-100">
        <h2 className="text-lg md:text-xl font-bold text-slate-900">
          🤝 {unmessagedMatches.length} More {unmessagedMatches.length === 1 ? 'Person' : 'People'} Who Can Help
        </h2>
        {isWaitingForResponses && (
          <p className="text-slate-600 mt-1 text-sm">
            Still waiting? Message more matches to increase your chances of getting help quickly.
          </p>
        )}
      </div>
      
      {/* Show top 2-3 unmessaged matches */}
      <div className="p-5 md:p-6 space-y-4">
        {unmessagedMatches.slice(0, 2).map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onMessage={onMessageMatch}
          />
        ))}
      </div>
      
      {/* View All */}
      {unmessagedMatches.length > 2 && (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <Button
            variant="outline"
            onClick={() => navigate('MyMatches')}
            className="w-full border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
          >
            View All {totalMatches} Matches
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}