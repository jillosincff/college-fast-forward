import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight, MessageSquare } from 'lucide-react';
import ConversationRow from './ConversationRow';

export default function ConversationsSection({ conversations = [] }) {
  if (conversations.length === 0) return null;
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          💬 Your Active Conversations
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('MyMessages')}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* Conversation rows */}
      <div className="divide-y divide-slate-100">
        {conversations.slice(0, 5).map((convo, idx) => (
          <ConversationRow key={convo.id || idx} conversation={convo} />
        ))}
      </div>
    </div>
  );
}