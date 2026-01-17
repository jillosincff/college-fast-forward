import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { CheckCircle } from 'lucide-react';
import ConversationsSection from '../ConversationsSection';
import OpportunitiesSection from '../OpportunitiesSection';
import ChallengeCard from '../ChallengeCard';
import FamilyCard from '../FamilyCard';
import MoreMatchesPrompt from '../MoreMatchesPrompt';

const UF_BUTTON_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)';

export default function AllCaughtUpState({ 
  conversations = [],
  opportunities = [],
  challenge,
  student,
  unmessagedMatches = [],
  totalMatches = 0,
  linkedParents = [],
  onMessageMatch,
  onLogIntro,
  onInviteParent
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
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            ✅ You're all caught up!
          </h2>
          <p className="text-slate-600 mb-6">
            {convoCount > 0 
              ? `You have ${convoCount} active conversation${convoCount === 1 ? '' : 's'}. Keep the momentum!`
              : 'Great work connecting with the UF network!'
            }
          </p>
          <Button
            onClick={() => navigate('PostRequest')}
            className="px-6 md:px-8 py-3 text-base md:text-lg font-semibold text-white"
            style={{ 
              background: UF_BUTTON_GRADIENT,
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
      <OpportunitiesSection 
        opportunities={opportunities} 
        title="💼 Latest Opportunities"
        compact
      />

      {/* 30-Day Challenge */}
      <ChallengeCard 
        challenge={challenge} 
        onLogIntro={onLogIntro}
      />

      {/* Family Card (collapsed) */}
      <FamilyCard 
        familyKarmaBoost={student?.familyKarmaBoost || student?.family_karma_boost || 0}
        linkedParents={linkedParents}
        onInviteParent={onInviteParent}
        collapsed={true}
      />
    </div>
  );
}