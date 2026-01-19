import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Message } from '@/entities/Message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';
import RecipientProfileCard from '@/components/messaging/RecipientProfileCard';
import MessageTemplatesSelector, { generateMessageTemplates } from '@/components/messaging/MessageTemplates';
import { trackEvent } from '@/components/utils/analytics';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [messageTemplates, setMessageTemplates] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadConversation();
  }, [user, recipientId]);

  const loadConversation = async () => {
    setLoading(true);
    
    // Get params from URL
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const toEmail = urlParams.get('to');
    const toName = urlParams.get('name');
    const matchId = urlParams.get('matchId');
    
    console.log('🔍 MessageComposer: Loading with to:', toEmail, 'name:', toName, 'matchId:', matchId, 'recipientId:', recipientId);
    
    let recipientUser = null;
    
    // PRIORITY 0: Direct email from URL params (most reliable - comes from match data)
    if (toEmail && toEmail.includes('@')) {
      recipientUser = {
        id: toEmail,
        email: toEmail,
        full_name: toName || toEmail.split('@')[0],
        persona: 'parent'
      };
      
      // Try to enrich with more data from ParentExpertise
      try {
        const expertise = await base44.entities.ParentExpertise.filter({ parent_email: toEmail });
        if (expertise?.length > 0) {
          recipientUser.full_name = expertise[0].parent_name || recipientUser.full_name;
          recipientUser.job_title = expertise[0].current_role;
          recipientUser.current_company = expertise[0].current_company;
        }
      } catch (e) {
        console.log('⚠️ ParentExpertise enrichment failed:', e.message);
      }
      
      console.log('✅ Found recipient from URL params:', recipientUser.email);
    }
    
    // PRIORITY 1: Check Match records for cached parent info (if no direct email)
    if (!recipientUser && recipientId) {
      try {
        console.log('🔍 Trying Match lookup for recipientId:', recipientId);
        const matches = await base44.entities.Match.filter({ parent_id: recipientId }, undefined, 1);
        if (matches?.length > 0 && matches[0].parent_email) {
          recipientUser = {
            id: recipientId,
            email: matches[0].parent_email,
            full_name: matches[0].parent_name,
            persona: 'parent',
            job_title: matches[0].parent_role,
            current_company: matches[0].parent_company
          };
          console.log('✅ Found recipient from Match cache:', recipientUser.email);
        }
      } catch (e) {
        console.log('⚠️ Match lookup failed:', e.message);
      }
    }
    
    // PRIORITY 2: Look up from ParentExpertise by parent_id
    if (!recipientUser && recipientId) {
      try {
        console.log('🔍 Trying ParentExpertise lookup for parent_id:', recipientId);
        const expertise = await base44.entities.ParentExpertise.filter({ parent_id: recipientId });
        if (expertise?.length > 0 && expertise[0].parent_email) {
          recipientUser = {
            id: recipientId,
            email: expertise[0].parent_email,
            full_name: expertise[0].parent_name,
            persona: 'parent',
            job_title: expertise[0].current_role,
            current_company: expertise[0].current_company
          };
          console.log('✅ Found recipient from ParentExpertise:', recipientUser.email);
        }
      } catch (e) {
        console.log('⚠️ ParentExpertise lookup failed:', e.message);
      }
    }
    
    // PRIORITY 3: Check if recipientId is already an email
    if (!recipientUser && recipientId && recipientId.includes('@')) {
      recipientUser = {
        id: recipientId,
        email: recipientId,
        full_name: recipientId.split('@')[0],
        persona: 'parent'
      };
      console.log('✅ Using recipientId as email:', recipientUser.email);
    }

    if (recipientUser) {
      setRecipient(recipientUser);
      console.log('✅ Recipient set:', recipientUser.full_name, recipientUser.email);
      
      // Generate dynamic templates based on student and recipient
      const templates = generateMessageTemplates(user, recipientUser);
      setMessageTemplates(templates);
    } else {
      console.log('❌ No recipient found for id:', recipientId, 'or email:', toEmail);
    }

    // Load existing messages between these users
    if (recipientUser?.email) {
      try {
        const sentMessages = await Message.filter({
          sender_email: user.email,
          recipient_email: recipientUser.email
        }, 'created_date');
        
        const receivedMessages = await Message.filter({
          sender_email: recipientUser.email,
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
            try {
              await Message.update(msg.id, { is_read: true });
            } catch (e) {
              console.log('Could not mark message as read:', e.message);
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Failed to load messages:', e.message);
      }
    }
    
    setLoading(false);
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

      // Send email notification - with safeguards
      const recipientEmail = recipient.email;
      const senderEmail = user.email;
      
      // Don't notify if sending to yourself or invalid email
      if (recipientEmail && 
          recipientEmail.includes('@') && 
          recipientEmail !== senderEmail) {
        try {
          await base44.functions.invoke('sendMessageNotification', {
            messageId: message.id,
            recipientEmail: recipientEmail,
            recipientName: recipient.full_name || recipientEmail.split('@')[0],
            senderName: user.full_name || senderEmail.split('@')[0],
            senderEmail: senderEmail,
            subject: isFirstMessage ? `Message from ${user.full_name || user.email}` : `Re: Message`,
            messageBody: newMessage.trim()
          });
          console.log('✅ Email notification sent');
        } catch (emailError) {
          console.log('⚠️ Email notification failed:', emailError.message);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setNewMessage(template.message);
    setSelectedTemplateId(template.id);
    
    trackEvent('message_template_selected', {
      template_id: template.id,
      recipient_email: recipient?.email
    });
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

  const recipientFirstName = recipient?.full_name?.split(' ')[0] || 'them';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('MyMessages')}
            className="text-slate-600 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card - Context from dashboard */}
        <RecipientProfileCard recipient={recipient} />

        {/* Message Thread */}
        <div className="space-y-4 mb-6">
          {messages.length === 0 && isFirstMessage && (
            <div className="text-center py-6">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">Start a conversation with {recipientFirstName}</p>
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
                      ? 'bg-[#0021A5] rounded-br-sm' 
                      : 'bg-white border border-slate-200 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed" style={{ color: isMine ? '#ffffff' : '#0f172a' }}>{msg.body}</p>
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_date).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* First Message Templates - Dynamic based on recipient */}
        {isFirstMessage && messageTemplates.length > 0 && (
          <div className="mb-6">
            <MessageTemplatesSelector
              templates={messageTemplates}
              onSelect={handleTemplateSelect}
              selectedId={selectedTemplateId}
            />
          </div>
        )}

        {/* Message Composer */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value.slice(0, 5000));
              if (selectedTemplateId) setSelectedTemplateId(null); // Clear selection if they edit
            }}
            placeholder={`Message ${recipientFirstName}...`}
            rows={5}
            className="resize-none border-slate-200 focus:border-blue-500"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-slate-400">{newMessage.length}/5000</span>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-[#FA4616] hover:bg-orange-600 gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}