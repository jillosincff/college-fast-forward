import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { MessageSquare, ArrowRight } from 'lucide-react';

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
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export default function UnreadResponsesSection({ unreadMessages }) {
  if (!unreadMessages || unreadMessages.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden">
      {/* Header with orange accent */}
      <div className="bg-gradient-to-r from-[#FA4616] to-orange-500 px-6 py-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          💬 {unreadMessages.length} New {unreadMessages.length === 1 ? 'Response' : 'Responses'}!
        </h2>
      </div>
      
      {/* Response cards */}
      <div className="p-5 md:p-6 space-y-4">
        {unreadMessages.slice(0, 3).map((msg) => {
          const senderName = msg.sender_name || msg.sender_email?.split('@')[0] || 'Someone';
          const initials = senderName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const preview = msg.body?.substring(0, 120) || 'New message...';
          
          return (
            <div 
              key={msg.id}
              className="bg-white rounded-xl border-2 border-orange-100 p-4 md:p-5 hover:shadow-lg hover:border-orange-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{senderName} responded</p>
                    {msg.subject && (
                      <p className="text-sm text-slate-600">{msg.subject}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {formatTimeAgo(msg.created_date)}
                </span>
              </div>
              
              {/* Message preview */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                <p className="text-slate-700 text-sm line-clamp-2">
                  "{preview}{preview.length >= 120 ? '...' : ''}"
                </p>
              </div>
              
              {/* CTA */}
              <div className="flex justify-end">
                <Button
                  onClick={() => navigate(`MyMessages?id=${msg.conversation_id || msg.id}`)}
                  className="bg-[#0021A5] hover:bg-blue-800 text-white"
                >
                  Read & Reply
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          );
        })}
        
        {/* View all if more than 3 */}
        {unreadMessages.length > 3 && (
          <Button
            variant="outline"
            onClick={() => navigate('MyMessages')}
            className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            View All {unreadMessages.length} Responses
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}