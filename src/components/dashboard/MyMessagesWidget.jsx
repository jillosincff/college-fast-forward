import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';

export default function MyMessagesWidget({ messages: propMessages, loading: propLoading, expanded = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(propMessages || []);
  const [isLoading, setIsLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [error, setError] = useState(null);

  const loadMessages = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Only load messages for this specific user
      const userMessages = await Message.filter({
        $or: [
          { sender_email: user.email },
          { recipient_email: user.email }
        ]
      }, '-created_date', expanded ? 20 : 5);
      
      clearTimeout(timeoutId);
      setMessages(Array.isArray(userMessages) ? userMessages : []);
    } catch (error) {
      console.warn('Could not load recent messages:', error.message);
      setError('Unable to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, expanded]);

  useEffect(() => {
    // Only load messages if not provided via props and user exists
    if (propMessages === undefined && user?.email) {
      loadMessages();
    } else if (propMessages) {
      setMessages(propMessages);
      setIsLoading(false);
    }
  }, [user, propMessages, loadMessages]);

  const formatMessagePreview = (message) => {
    if (!message || !user?.email) return { otherUser: 'Unknown', preview: '', isFromMe: false, isUnread: false };
    
    const isFromMe = message.sender_email === user.email;
    const otherUserEmail = isFromMe ? message.recipient_email : message.sender_email;
    const preview = message.body?.length > 50 ? 
      message.body.substring(0, 50) + '...' : 
      message.body || message.subject || 'No content';
    
    return {
      otherUser: otherUserEmail ? otherUserEmail.split('@')[0] : 'Unknown',
      preview,
      isFromMe,
      isUnread: !message.is_read && !isFromMe
    };
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(expanded ? 6 : 3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">{error}</p>
            <Button variant="ghost" onClick={loadMessages} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, expanded ? 10 : 4).map((message) => {
                const { otherUser, preview, isFromMe, isUnread } = formatMessagePreview(message);
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                    onClick={() => navigate('Messages')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${isUnread ? 'text-blue-900' : 'text-slate-800'}`}>
                            {isFromMe ? `To: ${otherUser}` : `From: ${otherUser}`}
                          </span>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {preview}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                    </div>
                  </motion.div>
                );
              })}
              {!expanded && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('Messages')}
                  className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  View All Messages
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-4">No messages yet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('Connections')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Start Connecting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}