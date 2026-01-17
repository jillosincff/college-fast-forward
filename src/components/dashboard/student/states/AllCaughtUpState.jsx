import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { CheckCircle } from 'lucide-react';
import ConversationsSection from '../ConversationsSection';
import CompactOpportunities from '../CompactOpportunities';
import CompactChallenge from '../CompactChallenge';
import MoreMatchesPrompt from '../MoreMatchesPrompt';

export default function AllCaughtUpState({ 
  conversations = [],
  opportunities = [],
  challenge,
  student,
  unmessagedMatches = [],
  totalMatches = 0,
  onMessageMatch,
  onLogIntro
}) {
  const convoCount = conversations.length;
  
  return (
    <div className="space-y-6">
      {/* All Caught Up Card */}
      <div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ border: '2px solid #86EFAC' }}
      >
        <div className="p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            ✅ You're all caught up!
          </h2>
          <p className="text-slate-600 mb-6">
            {convoCount > 0 
              ? `You have ${convoCount} active conversation${convoCount === 1 ? '' : 's'}. Keep the momentum!`
              : 'Great work connecting with the network!'
            }
          </p>
          <Button
            onClick={() => navigate('PostRequest')}
            className="px-8 py-3 text-lg font-semibold text-white"
            style={{ 
              background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)',
              boxShadow: '0 4px 12px rgba(0, 33, 165, 0.3)'
            }}
          >
            Ask Another Question →
          </Button>
        </div>
      </div>

      {/* Active Conversations */}
      {convoCount > 0 && (
        <ConversationsSection conversations={conversations} />
      )}

      {/* More Matches to Message */}
      {unmessagedMatches.length > 0 && (
        <MoreMatchesPrompt 
          unmessagedMatches={unmessagedMatches}
          totalMatches={totalMatches}
          onMessageMatch={onMessageMatch}
        />
      )}

      {/* Latest Opportunities */}
      <CompactOpportunities 
        opportunities={opportunities} 
        title="💼 Latest Opportunities"
      />

      {/* 30-Day Challenge */}
      <CompactChallenge 
        user={student} 
        onLogIntro={onLogIntro}
      />
    </div>
  );
}