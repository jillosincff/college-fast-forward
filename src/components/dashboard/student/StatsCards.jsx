import React from 'react';

const UF_ORANGE = '#FA4616';

export default function StatsCards({ stats, state }) {
  const { 
    activeQuestions = 0, 
    totalMatches = 0, 
    messagesSent = 0,
    unreadResponses = 0,
    activeConversations = 0 
  } = stats || {};
  
  // Dynamic middle card
  const getMiddleCard = () => {
    if (state === 'waiting_matches') {
      return { value: '⏳', label: 'Finding', sublabel: 'Matches' };
    }
    return { value: totalMatches, label: totalMatches === 1 ? 'Match' : 'Matches', sublabel: 'Total' };
  };

  // Dynamic right card
  const getRightCard = () => {
    if (unreadResponses > 0) {
      return { 
        value: unreadResponses, 
        label: 'NEW', 
        sublabel: 'Responses',
        highlight: true 
      };
    }
    if (state === 'all_caught_up') {
      return { value: activeConversations, label: activeConversations === 1 ? 'Convo' : 'Convos', sublabel: 'Active' };
    }
    return { value: messagesSent, label: 'Messages', sublabel: 'Sent' };
  };

  const middleCard = getMiddleCard();
  const rightCard = getRightCard();

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {/* Active Questions */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <div className="text-2xl md:text-3xl font-bold">{activeQuestions}</div>
        <div className="text-xs md:text-sm text-white/70">
          {activeQuestions === 1 ? 'Question' : 'Questions'}
        </div>
        <div className="text-xs text-white/50">Active</div>
      </div>

      {/* Matches */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-3 md:p-4 text-center border border-white/20">
        <div className="text-2xl md:text-3xl font-bold">{middleCard.value}</div>
        <div className="text-xs md:text-sm text-white/70">{middleCard.label}</div>
        <div className="text-xs text-white/50">{middleCard.sublabel}</div>
      </div>

      {/* Responses / Messages / Conversations */}
      <div 
        className={`backdrop-blur rounded-2xl p-3 md:p-4 text-center border ${
          rightCard.highlight 
            ? 'bg-white/20 border-white/40' 
            : 'bg-white/10 border-white/20'
        }`}
        style={rightCard.highlight ? {
          boxShadow: `0 0 20px ${UF_ORANGE}50`
        } : {}}
      >
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="text-2xl md:text-3xl font-bold">{rightCard.value}</span>
          {rightCard.highlight && (
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: UF_ORANGE }}
            />
          )}
        </div>
        <div 
          className="text-xs md:text-sm font-medium"
          style={{ color: rightCard.highlight ? UF_ORANGE : 'rgba(255,255,255,0.7)' }}
        >
          {rightCard.label}
        </div>
        <div className="text-xs text-white/50">{rightCard.sublabel}</div>
      </div>
    </div>
  );
}