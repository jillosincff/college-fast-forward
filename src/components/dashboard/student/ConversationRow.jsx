import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

export default function ConversationRow({ conversation }) {
  // Handle both conversation objects and match objects
  const name = conversation.participant_names 
    ? Object.values(conversation.participant_names).find(n => n) 
    : (conversation.helper_name || conversation.parent_name || conversation.professionalDisplayName || 'Contact');
  
  const lastMessage = conversation.last_message_at || conversation.lastMessageAt || 
                      conversation.updated_date || conversation.student_connected_at;
  
  const initials = name?.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
  
  const handleClick = () => {
    navigate(`MyMessages${conversation.id ? `?id=${conversation.id}` : ''}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)' }}
        >
          {initials}
        </div>
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">
            Last message {formatTimeAgo(lastMessage)}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Open →
      </Button>
    </div>
  );
}