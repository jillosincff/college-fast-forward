import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Circle, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect, 
  currentUserEmail,
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No conversations yet</p>
        <p className="text-slate-400 text-xs mt-1">Start a conversation by messaging someone</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map(conv => {
        const otherParticipant = conv.participant_emails?.find(e => e !== currentUserEmail) || 'Unknown';
        const otherName = conv.participant_names?.[otherParticipant] || otherParticipant.split('@')[0];
        const unreadCount = conv.unread_count?.[currentUserEmail] || 0;
        const isSelected = selectedId === conv.id;
        const isArchived = conv.is_archived?.[currentUserEmail];

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
              isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
            } ${isArchived ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {otherName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-slate-900 truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {otherName}
                  </span>
                  <div className="flex items-center gap-2">
                    {isArchived && <Archive className="w-3 h-3 text-slate-400" />}
                    {unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {conv.subject && (
                  <p className="text-sm font-medium text-slate-700 truncate mb-0.5">
                    {conv.subject}
                  </p>
                )}

                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {conv.last_message_sender === currentUserEmail && 'You: '}
                  {conv.last_message_preview || 'No messages yet'}
                </p>

                {conv.last_message_at && (
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                  </p>
                )}

                {conv.related_post_title && (
                  <p className="text-xs text-blue-600 mt-1 truncate">
                    Re: {conv.related_post_title}
                  </p>
                )}
              </div>

              {/* Unread indicator */}
              {unreadCount > 0 && (
                <Circle className="w-2 h-2 fill-blue-600 text-blue-600 flex-shrink-0 mt-2" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}