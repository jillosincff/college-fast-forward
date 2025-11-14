import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { navigate } from '@/components/utils/navigation';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { Message } from '@/entities/Message';
import { useAuth } from '@/components/auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const MyMessagesWidget = ({ onRefresh }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMessages = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 0; // No retries - fail fast
    const REQUEST_TIMEOUT_MS = 5000; // 5 seconds
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchWithTimeout = (timeoutMs) => {
        return Promise.race([
          Message.filter({ recipient_email: user.email }, '-created_date', 5),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
          )
        ]);
      };
      
      const fetchedMessages = await fetchWithTimeout(REQUEST_TIMEOUT_MS);
      setMessages(fetchedMessages || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      // Silently fail - messages widget is not critical
      console.log('Messages widget: Unable to load (non-critical)');
      setMessages([]);
      // Don't show error state for network issues - just show empty state
      if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
        setError(null);
      } else {
        setError('Unable to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMessageClick = async (msg) => {
    if (!msg.is_read) {
      try {
        await Message.update(msg.id, { is_read: true });
        loadMessages();
      } catch (error) {
        // Silent fail - not critical
      }
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const renderMessageItem = (msg) => (
    <div 
      key={msg.id} 
      className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
      onClick={() => handleMessageClick(msg)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm text-gray-800 truncate">{msg.subject}</p>
          {!msg.is_read && (
            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5">New</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">From: {msg.sender_email}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-lg">Messages</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('Messages')}>
            <ExternalLink className="h-4 w-4 text-gray-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => {
              loadMessages();
              if (onRefresh) onRefresh();
            }} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8">
            <InlineLoader text="Loading messages..." />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <Button size="sm" variant="outline" onClick={() => loadMessages()}>
              Try Again
            </Button>
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-1">
            {messages.map(renderMessageItem)}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-800">No Messages Yet</h4>
            <p className="text-sm text-gray-500 mt-1">
              Start a new conversation or wait for one to arrive.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyMessagesWidget;