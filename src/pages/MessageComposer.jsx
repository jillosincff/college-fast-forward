import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Message } from '@/entities/Message';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, Zap, MessageSquare, User } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { motion } from 'framer-motion';

// Message templates for first-time messages
const MESSAGE_TEMPLATES = [
  {
    id: 'intro',
    label: 'Quick Introduction',
    template: (parentName, topic) => `Hi ${parentName}! I saw your profile and thought you might be able to help. ${topic ? `I'm trying to figure out ${topic} and ` : ''}would love to hear your perspective if you have a few minutes.`
  },
  {
    id: 'specific',
    label: 'Specific Question',
    template: (parentName, topic) => `Hi ${parentName}! I'm a UF student exploring my career options. ${topic ? `I'm particularly interested in ${topic}. ` : ''}Would you mind sharing some advice from your experience?`
  },
  {
    id: 'coffee_chat',
    label: 'Coffee Chat Request',
    template: (parentName) => `Hi ${parentName}! I'd love to learn more about your career path and get your advice. Would you be open to a quick 15-minute chat sometime?`
  }
];

export default function MessageComposer() {
  const { user } = useAuth();
  const params = useParams();
  const recipientId = params.recipient;
  
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  useEffect(() => {
    if (!user || !recipientId) {
      setLoading(false);
      return;
    }
    loadConversation();
  }, [user, recipientId]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      // Load recipient info
      const users = await base44.entities.User.filter({ id: recipientId });
      if (users && users.length > 0) {
        setRecipient(users[0]);
      }

      // Load existing messages between these users
      const sentMessages = await Message.filter({
        sender_email: user.email,
        recipient_email: users[0]?.email
      }, 'created_date');
      
      const receivedMessages = await Message.filter({
        sender_email: users[0]?.email,
        recipient_email: user.email
      }, 'created_date');

      // Combine and sort by date
      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      
      setMessages(allMessages);
      setIsFirstMessage(allMessages.length === 0);

      // Mark received messages as read
      for (const msg of receivedMessages || []) {
        if (!msg.is_read) {
          await Message.update(msg.id, { is_read: true });
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !recipient) return;

    setSending(true);
    try {
      const message = await Message.create({
        sender_email: user.email,
        recipient_email: recipient.email,
        subject: isFirstMessage ? `Message from ${user.full_name || user.email}` : `Re: Message`,
        body: newMessage.trim(),
        is_read: false
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setIsFirstMessage(false);

      // Send email notification
      try {
        await base44.functions.invoke('sendMessageNotification', {
          recipientEmail: recipient.email,
          senderName: user.full_name || user.email,
          senderEmail: user.email,
          messagePreview: newMessage.substring(0, 200)
        });
      } catch (emailError) {
        console.log('Email notification may not have sent:', emailError);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (template) => {
    const topic = user?.major || '';
    const parentName = recipient?.full_name?.split(' ')[0] || 'there';
    setNewMessage(template.template(parentName, topic));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-4">We couldn't find this user.</p>
          <Button onClick={() => navigate('Dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('MyMessages')}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <UserAvatar user={recipient} className="w-10 h-10" />
              <div>
                <h1 className="font-bold text-slate-900">{recipient.full_name || 'User'}</h1>
                <p className="text-sm text-slate-500">
                  {recipient.job_title && recipient.current_company 
                    ? `${recipient.job_title} at ${recipient.current_company}`
                    : recipient.persona === 'parent' ? 'Gator Parent' : 'Gator Student'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Message Thread */}
        <div className="space-y-4 mb-6 min-h-[200px]">
          {messages.length === 0 && isFirstMessage && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Start a conversation with {recipient.full_name?.split(' ')[0] || 'them'}</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMine = msg.sender_email === user.email;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isMine ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    isMine 
                      ? 'bg-[#0021A5] text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_date).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* First Message Templates */}
        {isFirstMessage && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-800 mb-3">
                💡 Not sure what to say? Try one of these:
              </p>
              <div className="space-y-2">
                {MESSAGE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm"
                  >
                    <span className="font-medium text-blue-700">{template.label}</span>
                    <p className="text-slate-600 text-xs mt-1 line-clamp-2">
                      {template.template(recipient.full_name?.split(' ')[0] || 'there', '').substring(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message Composer */}
        <Card>
          <CardContent className="p-4">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 5000))}
              placeholder={`Message ${recipient.full_name?.split(' ')[0] || 'them'}...`}
              rows={4}
              className="resize-none border-slate-200 focus:border-blue-500"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">{newMessage.length}/5000</span>
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="bg-[#FA4616] hover:bg-orange-600"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}