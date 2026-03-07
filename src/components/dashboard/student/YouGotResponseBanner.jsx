import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export default function YouGotResponseBanner({ user, unreadMessages = [] }) {
  if (!unreadMessages || unreadMessages.length === 0) return null;

  return (
    <section className="rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="bg-gradient-to-r from-[#0021A5] to-blue-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {unreadMessages.length} Unread {unreadMessages.length === 1 ? 'Message' : 'Messages'}
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('MyMessages')}
            className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-semibold"
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {unreadMessages.slice(0, 3).map((msg) => {
          const senderName = msg.sender_name || msg.sender_email?.split('@')[0] || 'Someone';
          const initials = senderName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const preview = msg.body?.substring(0, 120) || msg.subject || 'New message...';

          return (
            <Card 
              key={msg.id} 
              className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`MyMessages?id=${msg.conversation_id || msg.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {senderName}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatTimeAgo(msg.created_date)}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="text-sm text-slate-700 font-medium truncate mb-0.5">{msg.subject}</p>
                    )}
                    <p className="text-slate-500 text-sm line-clamp-2">
                      {preview}{preview.length >= 120 ? '...' : ''}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {unreadMessages.length > 3 && (
          <Button
            variant="outline"
            onClick={() => navigate('MyMessages')}
            className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            View All {unreadMessages.length} Messages
          </Button>
        )}
      </div>
    </section>
  );
}