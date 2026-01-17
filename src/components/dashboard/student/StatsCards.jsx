import React from 'react';

export default function StatsCards({ stats, state }) {
  const { activeQuestions, totalMatches, messagesSent, activeConversations } = stats;
  
  const isWaitingForMatches = state === 'waiting_matches';
  const isAllCaughtUp = state === 'all_caught_up';
  
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {/* Questions Active */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
        <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-0.5">
          {activeQuestions}
        </div>
        <p className="text-xs md:text-sm text-slate-600 leading-tight">
          {activeQuestions === 1 ? 'Question' : 'Questions'}
          <br className="hidden md:inline" /> Active
        </p>
      </div>
      
      {/* Matches */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
        {isWaitingForMatches ? (
          <>
            <div className="text-2xl md:text-3xl mb-0.5">⏳</div>
            <p className="text-xs md:text-sm text-slate-600 leading-tight">
              Finding
              <br className="hidden md:inline" /> Matches
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-0.5">
              {totalMatches}
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-tight">
              {totalMatches === 1 ? 'Match' : 'Matches'}
              <br className="hidden md:inline" /> Total
            </p>
          </>
        )}
      </div>
      
      {/* Messages Sent OR Convos Active */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
        {isAllCaughtUp ? (
          <>
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-0.5">
              {activeConversations}
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-tight">
              {activeConversations === 1 ? 'Convo' : 'Convos'}
              <br className="hidden md:inline" /> Active
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-0.5">
              {messagesSent}
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-tight">
              Messages
              <br className="hidden md:inline" /> Sent
            </p>
          </>
        )}
      </div>
    </div>
  );
}