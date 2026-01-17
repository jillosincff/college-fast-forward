import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight, CheckCircle, MessageSquare } from 'lucide-react';

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

export default function AllCaughtUpSection({ activeConversations = [], messagedMatches = [] }) {
  // Use conversations if available, otherwise fall back to messaged matches
  const convos = activeConversations.length > 0 ? activeConversations : messagedMatches;
  const convoCount = convos.length;

  return (
    <div className="space-y-6">
      {/* All caught up card */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden">
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
            className="bg-[#0021A5] hover:bg-blue-800 text-white px-8 py-3 text-lg font-semibold"
            style={{ 
              background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)',
              boxShadow: '0 4px 12px rgba(0, 33, 165, 0.3)'
            }}
          >
            Ask Another Question →
          </Button>
        </div>
      </div>

      {/* Active conversations */}
      {convoCount > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
          
          <div className="divide-y divide-slate-100">
            {convos.slice(0, 5).map((convo, idx) => {
              // Handle both conversation objects and match objects
              const name = convo.participant_names 
                ? Object.values(convo.participant_names).find(n => n) 
                : (convo.helper_name || convo.parent_name || 'Contact');
              const lastMessage = convo.last_message_at || convo.updated_date || convo.student_connected_at;
              
              return (
                <div 
                  key={convo.id || idx}
                  onClick={() => navigate(`MyMessages${convo.id ? `?id=${convo.id}` : ''}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {name?.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
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
                      navigate(`MyMessages${convo.id ? `?id=${convo.id}` : ''}`);
                    }}
                  >
                    Open →
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}