import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Inbox,
  Loader2
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import MessageCard from '@/components/messaging/MessageCard';
import NewConversationModal from '@/components/messaging/NewConversationModal';

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [userLookup, setUserLookup] = useState({});

  // Load user names for all conversation participants
  const loadUserLookup = useCallback(async (emails) => {
    if (!emails || emails.length === 0) return;
    try {
      const users = await base44.entities.User.list('-created_date', 500);
      const lookup = {};
      (users || []).forEach(u => {
        if (u.email) lookup[u.email] = { full_name: u.full_name, persona: u.persona, roles: u.roles };
      });
      setUserLookup(lookup);
    } catch (e) {
      console.log('User lookup failed (non-critical):', e.message);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      let allMessagesRaw = [];
      try {
        const result = await base44.entities.Message.list('-created_date', 200);
        allMessagesRaw = result || [];
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
      
      const receivedMessages = allMessagesRaw.filter(m => m.recipient_email === user.email);
      const sentMessages = allMessagesRaw.filter(m => m.sender_email === user.email);
      const allMessages = [...receivedMessages, ...sentMessages];
      
      if (allMessages.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }
      
      // Group by conversation
      const conversationMap = new Map();
      
      allMessages.forEach(msg => {
        const otherEmail = msg.sender_email === user.email ? msg.recipient_email : msg.sender_email;
        if (!otherEmail) return;
        const key = msg.conversation_id || `thread-${otherEmail}`;
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            id: msg.conversation_id || `orphan-${otherEmail}`,
            participant_emails: [user.email, otherEmail],
            participant_names: {
              [otherEmail]: msg.sender_email === user.email 
                ? (msg.recipient_email?.split('@')[0] || 'Unknown')
                : (msg.sender_name || msg.sender_email?.split('@')[0] || 'Unknown')
            },
            subject: msg.subject,
            last_message_preview: msg.body?.substring(0, 100),
            last_message_at: msg.created_date,
            last_message_sender: msg.sender_email,
            unread_count: { [user.email]: 0 },
            related_post_id: msg.post_id,
            related_post_title: msg.post_title,
            _messages: [],
          });
        }
        
        const conv = conversationMap.get(key);
        if (!conv._messages.find(m => m.id === msg.id)) {
          conv._messages.push(msg);
        }
        
        if (!msg.is_read && msg.recipient_email === user.email) {
          conv.unread_count[user.email] = (conv.unread_count[user.email] || 0) + 1;
        }
        
        if (new Date(msg.created_date) > new Date(conv.last_message_at)) {
          conv.last_message_at = msg.created_date;
          conv.last_message_preview = msg.body?.substring(0, 100);
          conv.last_message_sender = msg.sender_email;
        }
      });
      
      const convs = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      
      setConversations(convs);

      // Collect unique emails and load user data
      const uniqueEmails = new Set();
      convs.forEach(c => c.participant_emails?.forEach(e => { if (e !== user.email) uniqueEmails.add(e); }));
      loadUserLookup([...uniqueEmails]);

      // Auto-expand from URL param
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const convId = urlParams.get('conv') || urlParams.get('id');
      if (convId) {
        const match = convs.find(c => c.id === convId);
        if (match) setExpandedId(match.id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, loadUserLookup]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Poll for new messages
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, [user?.email, loadConversations]);

  // Listen for refresh events from dashboard banner
  useEffect(() => {
    const handler = () => loadConversations();
    document.addEventListener('cff:refresh-messages', handler);
    return () => document.removeEventListener('cff:refresh-messages', handler);
  }, [loadConversations]);

  const handleMessageSent = (convId, newMsg) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      return {
        ...c,
        _messages: [...(c._messages || []), newMsg],
        last_message_preview: newMsg.body?.substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_sender: user.email,
      };
    }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
  };

  const handleConversationCreated = (conv) => {
    loadConversations();
    setExpandedId(conv.id);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherEmail = conv.participant_emails?.find(e => e !== user?.email) || '';
    const otherName = userLookup[otherEmail]?.full_name || conv.participant_names?.[otherEmail] || '';
    return (
      otherEmail.toLowerCase().includes(q) ||
      otherName.toLowerCase().includes(q) ||
      conv.subject?.toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count?.[user?.email] || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Messages
          </h1>
          {totalUnread > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{totalUnread} unread</p>
          )}
        </div>
        <Button onClick={() => setShowNewModal(true)} className="bg-[#0021A5] hover:bg-[#001580]">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Search */}
      {conversations.length > 3 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or subject..."
            className="pl-9"
          />
        </div>
      )}

      {/* Conversation cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {searchQuery ? 'Try a different search' : 'Start a conversation with someone in the network'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowNewModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Start a Conversation
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map(conv => (
            <MessageCard
              key={conv.id}
              conversation={conv}
              currentUser={user}
              userLookup={userLookup}
              isExpanded={expandedId === conv.id}
              onToggle={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
              onMessageSent={handleMessageSent}
            />
          ))}
        </div>
      )}

      <NewConversationModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        currentUser={user}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}