import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, ArrowLeft, Calendar, User, Building, Send, Inbox, Reply, Trash2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { formatDistanceToNow } from 'date-fns';
import { getUserMessages } from '@/functions/getUserMessages';

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  async function loadMessages() {
    setIsLoading(true);
    try {
      console.log('📥 Loading messages via backend function...');
      
      const result = await getUserMessages();
      const allMessages = result?.data?.messages || [];
      
      console.log('✅ Messages loaded:', allMessages.length);
      setMessages(allMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(messageId) {
    try {
      await base44.entities.Message.update(messageId, { is_read: true });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) {
      return;
    }
    
    try {
      await base44.entities.Message.delete(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      trackEvent('message_deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message. Please try again.');
    }
  }

  function handleReply(message) {
    setSelectedMessage(message);
    setReplyText('');
    setShowReplyDialog(true);
  }

  async function handleSendReply() {
    if (!replyText.trim() || !selectedMessage) return;

    setSendingReply(true);
    try {
      await base44.entities.Message.create({
        sender_email: user.email,
        recipient_email: selectedMessage.sender_email,
        subject: `Re: ${selectedMessage.subject}`,
        body: replyText,
        post_id: selectedMessage.post_id,
        post_title: selectedMessage.post_title,
        is_read: false
      });

      trackEvent('message_replied');
      setShowReplyDialog(false);
      setReplyText('');
      loadMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  }

  const filteredMessages = messages.filter(msg => {
    if (filterType === 'received') return msg.recipient_email === user.email;
    if (filterType === 'sent') return msg.sender_email === user.email;
    return true;
  });

  const stats = {
    total: messages.length,
    received: messages.filter(m => m.recipient_email === user.email).length,
    sent: messages.filter(m => m.sender_email === user.email).length,
    unread: messages.filter(m => m.recipient_email === user.email && !m.is_read).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('Dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-8 h-8 text-blue-600" />
                My Messages
              </h1>
              <p className="text-slate-600 mt-1">
                Conversations with parents and alumni
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <p className="text-sm text-slate-600">Total Messages</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.received}</div>
                <p className="text-sm text-slate-600">Received</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{stats.sent}</div>
                <p className="text-sm text-slate-600">Sent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.unread}</div>
                <p className="text-sm text-slate-600">Unread</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Filter:</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              const isReceived = msg.recipient_email === user.email;
              const otherParty = isReceived ? msg.sender_email : msg.recipient_email;
              
              return (
                <Card 
                  key={msg.id} 
                  className={`hover:shadow-lg transition-all ${!msg.is_read && isReceived ? 'border-l-4 border-l-blue-600 bg-blue-50/30' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isReceived ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                            {isReceived ? (
                              <Inbox className="w-6 h-6 text-blue-600" />
                            ) : (
                              <Send className="w-6 h-6 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900">
                                {msg.subject}
                              </h3>
                              {!msg.is_read && isReceived && (
                                <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {isReceived ? 'Received' : 'Sent'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                              <User className="w-4 h-4" />
                              <span>{isReceived ? 'From' : 'To'}: {otherParty}</span>
                            </div>

                            {msg.post_title && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <Building className="w-4 h-4" />
                                <span>Re: {msg.post_title}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}</span>
                            </div>
                            
                            <p className="text-slate-700 text-sm mb-4 whitespace-pre-wrap">{msg.body}</p>
                            
                            <div className="flex gap-2">
                              {isReceived && !msg.is_read && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsRead(msg.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                              {isReceived && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(msg)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Messages Yet</h3>
              <p className="text-slate-600 mb-4">
                When parents and alumni respond to your questions, you'll see their messages here
              </p>
              <Button onClick={() => navigate('StudentOnboarding')}>
                Ask a Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMessage && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-600 mb-1">Replying to:</p>
                <p className="font-semibold text-slate-900">{selectedMessage.sender_email}</p>
                <p className="text-sm text-slate-600 mt-2">Original message:</p>
                <p className="text-sm text-slate-700 italic">{selectedMessage.body.substring(0, 100)}...</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Your Reply</label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="h-32"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sendingReply}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {sendingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReplyDialog(false)}
                disabled={sendingReply}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}