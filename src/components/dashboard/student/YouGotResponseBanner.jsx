import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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
  const [thankedIds, setThankedIds] = useState(new Set());
  const [thankingId, setThankingId] = useState(null);

  if (!unreadMessages || unreadMessages.length === 0) return null;

  const handleThank = async (msg) => {
    setThankingId(msg.id);
    try {
      // Award karma to the responder (parent/alumni)
      try {
        await base44.functions.invoke('awardKarma', {
          parentEmail: msg.sender_email,
          actionType: 'upvote_received',
          description: `Thanked by ${user.full_name || user.email} for their response`
        });
      } catch (e) {
        console.log('Parent karma award failed (non-critical):', e.message);
      }

      // Create a notification for the responder
      try {
        await base44.entities.Notification.create({
          user_email: msg.sender_email,
          recipient_email: msg.sender_email,
          type: 'new_message',
          title: '👍 Your answer was helpful!',
          message: `${user.first_name || user.full_name?.split(/[\s,]+/)[0] || 'A student'} thanked you for your response.`,
          action_url: 'MyMessages',
          action_label: 'View',
          priority: 'normal',
        });
      } catch (e) {
        console.log('Thank notification failed (non-critical):', e.message);
      }

      setThankedIds(prev => new Set([...prev, msg.id]));
    } catch (err) {
      console.error('Thank failed:', err);
    } finally {
      setThankingId(null);
    }
  };

  return (
    <section className="rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-gradient-to-r from-[#FA4616] to-orange-500 px-5 py-4">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          🎉 You Got {unreadMessages.length === 1 ? 'a Response' : `${unreadMessages.length} Responses`}!
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {unreadMessages.slice(0, 3).map((msg) => {
          const senderName = msg.sender_name || msg.sender_email?.split('@')[0] || 'Someone';
          const senderFirstName = senderName.split(/[\s,]+/)[0];
          const initials = senderName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const preview = msg.body?.substring(0, 100) || msg.subject || 'New message...';
          const isThanked = thankedIds.has(msg.id);

          return (
            <Card key={msg.id} className="border-2 border-orange-100 hover:border-orange-300 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">
                      {senderName} <span className="font-normal text-slate-500">answered your question</span>
                    </p>
                    {msg.subject && (
                      <p className="text-sm text-slate-500 truncate">Re: {msg.subject}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(msg.created_date)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                  <p className="text-slate-700 text-sm line-clamp-2">
                    "{preview}{preview.length >= 100 ? '...' : ''}"
                  </p>
                </div>

                {isThanked ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Thanked {senderFirstName}!
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`MyMessages?id=${msg.conversation_id || msg.id}`)}
                      className="bg-[#0021A5] hover:bg-blue-800 text-white"
                    >
                      Read & Reply <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleThank(msg)}
                      disabled={thankingId === msg.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      {thankingId === msg.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4 mr-1" />
                      )}
                      Yes, thank {senderFirstName}!
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`MyMessages?id=${msg.conversation_id || msg.id}`)}
                      className="flex-shrink-0"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" /> Not quite
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {unreadMessages.length > 3 && (
          <Button
            variant="outline"
            onClick={() => navigate('MyMessages')}
            className="w-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            View All {unreadMessages.length} Responses <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </section>
  );
}