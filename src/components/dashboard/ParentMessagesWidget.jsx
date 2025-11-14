import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import UserAvatar from '@/components/common/UserAvatar';

export default function ParentMessagesWidget({ messages, loading }) {
  // Mock messages for demonstration
  const mockMessages = [
    {
      id: '1',
      sender_name: 'Alex Rodriguez',
      subject: 'Thank you for the introduction!',
      body: 'Hi! Just wanted to thank you for connecting me with Sarah at Google. The informational interview went great and I learned so much about the tech industry.',
      created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: false,
      sender_persona: 'student'
    },
    {
      id: '2',
      sender_name: 'Maria Santos',
      subject: 'Following up on finance advice',
      body: 'Hello! I took your advice about networking at the UF Finance Alumni event and it was incredibly helpful. I wanted to update you on my job search progress.',
      created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      sender_persona: 'student'
    },
    {
      id: '3',
      sender_name: 'Jennifer Park',
      subject: 'Parent network connection',
      body: 'Hi! Another UF parent here. I saw your profile and would love to connect about our experiences helping our kids navigate their careers.',
      created_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      sender_persona: 'parent'
    }
  ];

  const displayMessages = messages && messages.length > 0 ? messages : mockMessages;

  const handleViewAllMessages = () => {
    trackEvent('parent_view_all_messages_clicked');
    navigate('Messages');
  };

  const handleMessageClick = (messageId) => {
    trackEvent('parent_message_clicked', { messageId });
    navigate('Messages', { message: messageId });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPersonaColor = (persona) => {
    switch (persona) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'alumni': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </motion.div>
          <div>
            <div className="text-xl font-bold text-slate-900">Recent Messages</div>
            <div className="text-sm text-slate-600 font-normal">
              Latest conversations from your network
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {displayMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold text-slate-900 mb-2">No Messages Yet</h3>
            <p className="text-slate-600 text-sm mb-4">
              Start helping students to receive thank you messages and updates!
            </p>
            <Button onClick={() => navigate('Connections')} variant="outline">
              Help Students
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayMessages.slice(0, 3).map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleMessageClick(message.id)}
                className={`bg-white rounded-xl p-4 border cursor-pointer hover:shadow-sm transition-all ${
                  !message.is_read ? 'border-purple-200 ring-2 ring-purple-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={{ full_name: message.sender_name }} className="w-8 h-8" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">
                        {message.sender_name}
                      </h4>
                      {message.sender_persona && (
                        <Badge className={`text-xs ${getPersonaColor(message.sender_persona)} border-0`}>
                          {message.sender_persona}
                        </Badge>
                      )}
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1 line-clamp-1">
                      {message.subject}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {message.body}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(message.created_date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
             
            <Button 
              onClick={handleViewAllMessages}
              variant="outline" 
              className="w-full mt-4 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              View All Messages
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}