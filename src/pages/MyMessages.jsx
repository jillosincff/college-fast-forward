import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  ArrowLeft, 
  Plus, 
  Search, 
  Menu,
  X
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import ConversationList from '@/components/messaging/ConversationList';
import ChatWindow from '@/components/messaging/ChatWindow';
import NewConversationModal from '@/components/messaging/NewConversationModal';

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0);

  const MESSAGES_PER_PAGE = 50;

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoadingConvs(true);
    try {
      // Load actual conversations
      let convs = [];
      try {
        convs = await base44.entities.Conversation.filter(
          { participant_emails: { $contains: user.email } },
          '-last_message_at'
        ) || [];
      } catch (e) {
        console.log('Conversation filter failed, trying alternate method');
        convs = [];
      }

      // Also load orphan messages (messages without conversation_id) and create virtual conversations
      try {
        const orphanMessages = await base44.entities.Message.filter(
          { recipient_email: user.email },
          '-created_date',
          50
        );
        
        // Group orphan messages by sender
        const orphanBySender = {};
        orphanMessages?.filter(m => !m.conversation_id).forEach(msg => {
          if (!orphanBySender[msg.sender_email]) {
            orphanBySender[msg.sender_email] = [];
          }
          orphanBySender[msg.sender_email].push(msg);
        });

        // Create virtual conversations for orphan messages
        Object.entries(orphanBySender).forEach(([senderEmail, msgs]) => {
          const latestMsg = msgs[0];
          // Check if we already have a conversation with this sender
          const existingConv = convs.find(c => c.participant_emails?.includes(senderEmail));
          if (!existingConv) {
            convs.push({
              id: `orphan-${senderEmail}`,
              participant_emails: [user.email, senderEmail],
              participant_names: {
                [senderEmail]: latestMsg.sender_name || senderEmail.split('@')[0]
              },
              subject: latestMsg.subject,
              last_message_preview: latestMsg.body?.substring(0, 100),
              last_message_at: latestMsg.created_date,
              last_message_sender: senderEmail,
              unread_count: {
                [user.email]: msgs.filter(m => !m.is_read).length
              },
              related_post_id: latestMsg.post_id,
              related_post_title: latestMsg.post_title,
              _isOrphan: true,
              _orphanMessages: msgs
            });
          }
        });
      } catch (e) {
        console.log('Could not load orphan messages:', e);
      }

      // Sort by last message
      convs.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      setConversations(convs);

      // Check URL for specific conversation
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const convId = urlParams.get('conv');
      if (convId) {
        const conv = convs.find(c => c.id === convId);
        if (conv) {
          handleSelectConversation(conv);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConvs(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Polling for new messages
  useEffect(() => {
    if (!user?.email) return;

    const pollInterval = setInterval(() => {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation.id, false);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [user?.email, selectedConversation, loadConversations]);

  // Load messages for selected conversation
  const loadMessages = async (conversationId, showLoading = true) => {
    if (!conversationId) return;

    if (showLoading) setIsLoadingMessages(true);
    try {
      const msgs = await base44.entities.Message.filter(
        { conversation_id: conversationId },
        'created_date',
        MESSAGES_PER_PAGE
      );
      setMessages(msgs || []);
      setHasMoreMessages((msgs?.length || 0) >= MESSAGES_PER_PAGE);
      setMessageOffset(msgs?.length || 0);

      // Mark messages as read
      const unreadMsgs = msgs?.filter(m => !m.is_read && m.recipient_email === user?.email) || [];
      for (const msg of unreadMsgs) {
        await base44.entities.Message.update(msg.id, { 
          is_read: true, 
          read_at: new Date().toISOString() 
        });
      }

      // Update unread count in conversation
      if (unreadMsgs.length > 0) {
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          await base44.entities.Conversation.update(conversationId, {
            unread_count: {
              ...conv.unread_count,
              [user.email]: 0
            }
          });
          setConversations(prev => prev.map(c => 
            c.id === conversationId 
              ? { ...c, unread_count: { ...c.unread_count, [user.email]: 0 } }
              : c
          ));
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || isLoadingMessages) return;

    setIsLoadingMessages(true);
    try {
      const moreMsgs = await base44.entities.Message.filter(
        { conversation_id: selectedConversation.id },
        'created_date',
        MESSAGES_PER_PAGE,
        messageOffset
      );
      setMessages(prev => [...(moreMsgs || []), ...prev]);
      setHasMoreMessages((moreMsgs?.length || 0) >= MESSAGES_PER_PAGE);
      setMessageOffset(prev => prev + (moreMsgs?.length || 0));
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowMobileSidebar(false);
    loadMessages(conv.id);
  };

  const handleSendMessage = async (text, attachments) => {
    if (!selectedConversation || (!text && attachments.length === 0)) return;

    setIsSending(true);
    try {
      const otherEmail = selectedConversation.participant_emails.find(e => e !== user.email);

      // Create message
      const newMsg = await base44.entities.Message.create({
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        sender_name: user.full_name || user.email.split('@')[0],
        recipient_email: otherEmail,
        subject: selectedConversation.subject || 'Message',
        body: text,
        attachments: attachments.length > 0 ? attachments : undefined,
        is_read: false,
        message_type: 'text'
      });

      // Update conversation
      await base44.entities.Conversation.update(selectedConversation.id, {
        last_message_preview: text.substring(0, 100) || '📎 Attachment',
        last_message_at: new Date().toISOString(),
        last_message_sender: user.email,
        unread_count: {
          ...selectedConversation.unread_count,
          [otherEmail]: (selectedConversation.unread_count?.[otherEmail] || 0) + 1
        }
      });

      // Add to local state
      setMessages(prev => [...prev, newMsg]);
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id
          ? {
              ...c,
              last_message_preview: text.substring(0, 100) || '📎 Attachment',
              last_message_at: new Date().toISOString(),
              last_message_sender: user.email
            }
          : c
      ).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)));

      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipientEmail: otherEmail,
          title: `New message from ${user.full_name || 'Someone'}`,
          body: text.substring(0, 100) || 'Sent an attachment',
          url: `#MyMessages?conv=${selectedConversation.id}`
        });
      } catch (e) {
        console.log('Push notification failed:', e);
      }

      // Send email notification
      try {
        await base44.functions.invoke('sendMessageNotification', {
          recipientEmail: otherEmail,
          senderName: user.full_name || user.email.split('@')[0],
          senderEmail: user.email,
          subject: selectedConversation.subject || 'New message',
          messageBody: text
        });
      } catch (e) {
        console.log('Email notification failed:', e);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationCreated = (conv) => {
    loadConversations();
    handleSelectConversation(conv);
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const otherEmail = conv.participant_emails?.find(e => e !== user?.email) || '';
    const otherName = conv.participant_names?.[otherEmail] || '';
    return (
      otherEmail.toLowerCase().includes(query) ||
      otherName.toLowerCase().includes(query) ||
      conv.subject?.toLowerCase().includes(query)
    );
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-96px)] flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('Dashboard')}
            className="lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden"
          >
            {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="hidden sm:inline">Messages</span>
          </h1>
        </div>
        
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-[#0021A5] hover:bg-[#001580]"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Message</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className={`
          ${showMobileSidebar ? 'flex' : 'hidden'} 
          lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-slate-200 bg-white
          absolute lg:relative z-10 h-full
        `}>
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id}
              onSelect={handleSelectConversation}
              currentUserEmail={user?.email}
              isLoading={isLoadingConvs}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className={`
          ${!showMobileSidebar ? 'flex' : 'hidden'} 
          lg:flex flex-1 flex-col
        `}>
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onLoadMore={loadMoreMessages}
            hasMore={hasMoreMessages}
            isLoading={isLoadingMessages}
            isSending={isSending}
          />
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        currentUser={user}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}