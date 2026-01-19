import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import MatchCard from './MatchCard';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

export default function MatchesSection({ matches = [], user, onMessageMatch }) {
  const totalCount = matches.length;
  const messagedMatches = matches.filter(m => 
    m.status === 'student_connected' || m.status === 'intro_made'
  );
  const unmessagedMatches = matches.filter(m => 
    m.status !== 'student_connected' && m.status !== 'intro_made'
  );
  const messagedCount = messagedMatches.length;
  const remainingCount = unmessagedMatches.length;

  if (totalCount === 0) return null;

  // Show unmessaged matches first, then messaged ones
  const displayMatches = [...unmessagedMatches, ...messagedMatches].slice(0, 5);

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div 
        className="px-4 md:px-6 py-4 md:py-5 border-b"
        style={{ 
          background: 'linear-gradient(90deg, #E8ECF8 0%, #F8FAFC 100%)',
          borderColor: `${UF_BLUE}10`
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              🤝 {remainingCount > 0 ? `${remainingCount} People Ready to Help You` : 'Your Matches'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Message them directly — don't wait for them to come to you!
            </p>
          </div>
          
          {messagedCount > 0 && (
            <div 
              className="text-sm font-medium px-3 py-1 rounded-full self-start"
              style={{ 
                backgroundColor: `${UF_ORANGE}15`,
                color: UF_ORANGE
              }}
            >
              {messagedCount} messaged
            </div>
          )}
        </div>

        {/* Social proof tip */}
        {messagedCount < 3 && remainingCount > 0 && (
          <div 
            className="mt-4 p-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: `${UF_ORANGE}10` }}
          >
            <span>💡</span>
            <p className="text-sm" style={{ color: UF_ORANGE }}>
              <strong>Tip:</strong> Students who message 3+ matches get responses 80% faster!
            </p>
          </div>
        )}
      </div>

      {/* Match Cards */}
      <div className="p-3 md:p-4 space-y-3">
        {displayMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onMessage={onMessageMatch}
          />
        ))}
      </div>

      {/* Footer */}
      {totalCount > 5 && (
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-t text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('MyMatches')}
            className="font-semibold px-6 py-2 rounded-xl transition hover:scale-105"
            style={{ 
              color: UF_BLUE,
              backgroundColor: `${UF_BLUE}10`
            }}
          >
            View All {totalCount} Matches →
          </Button>
        </div>
      )}

      {/* Browse Directory CTA */}
      <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">🔍 Want more options?</p>
            <p className="text-xs text-gray-500">Browse the full directory to find anyone who can help.</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('GatorDirectory')}
            className="font-semibold text-sm"
          >
            Browse Directory →
          </Button>
        </div>
      </div>
    </section>
  );
}