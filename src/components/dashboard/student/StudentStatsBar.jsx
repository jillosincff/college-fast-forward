import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Users, MessageSquare, Clock } from 'lucide-react';

export default function StudentStatsBar({ 
  activeQuestions = 0, 
  matchCount = 0, 
  messagesSent = 0,
  isWaitingForMatches = false 
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
        <CardContent className="pt-4 pb-4 text-center px-2">
          <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-0.5">
            {activeQuestions}
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-tight">
            {activeQuestions === 1 ? 'Question' : 'Questions'}<br className="hidden md:inline" /> Active
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
        <CardContent className="pt-4 pb-4 text-center px-2">
          {isWaitingForMatches ? (
            <>
              <div className="text-2xl md:text-3xl mb-0.5">⏳</div>
              <p className="text-xs md:text-sm text-slate-600 leading-tight">
                Finding<br className="hidden md:inline" /> Matches
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-0.5">
                {matchCount}
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-tight">
                {matchCount === 1 ? 'Match' : 'Matches'}<br className="hidden md:inline" /> Ready
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
        <CardContent className="pt-4 pb-4 text-center px-2">
          <div className="text-2xl md:text-3xl font-bold text-green-600 mb-0.5">
            {messagesSent}
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-tight">
            Messages<br className="hidden md:inline" /> Sent
          </p>
        </CardContent>
      </Card>
    </div>
  );
}