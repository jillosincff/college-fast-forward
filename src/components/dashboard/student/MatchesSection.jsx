import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import MatchCard from './MatchCard';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function MatchesSection({ matches, user, onMessageMatch }) {
  const messagedCount = matches.filter(m => 
    m.status === 'student_connected' || m.status === 'intro_made'
  ).length;
  
  const unmessagedMatches = matches.filter(m => 
    m.status !== 'student_connected' && m.status !== 'intro_made'
  );
  
  // Show top 3 matches
  const displayMatches = matches.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-slate-100">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
          🤝 {matches.length} People Ready to Help You
        </h2>
        <p className="text-slate-600 mt-1">
          Message them to start a conversation
        </p>
        
        {/* Tip */}
        {unmessagedMatches.length > 0 && messagedCount < 3 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> Students who message 3+ matches get responses 80% faster!
            </p>
          </div>
        )}
      </div>
      
      {/* Match Cards */}
      <div className="p-5 md:p-6 space-y-4">
        {displayMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onMessage={onMessageMatch}
          />
        ))}
      </div>
      
      {/* View All */}
      {matches.length > 3 && (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <Button
            variant="outline"
            onClick={() => navigate('MyMatches')}
            className="w-full border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
          >
            View All {matches.length} Matches
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}