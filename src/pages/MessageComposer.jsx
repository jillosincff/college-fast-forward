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
import { checkAndMarkActivation } from '@/components/utils/checkAndMarkActivation';

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

        // Award karma for responding to a message (parents/alumni only)
        const isParentOrAlumni = user.persona === 'parent' || user.persona === 'alumni' || 
                                 user.roles?.includes('parent') || user.roles?.includes('alumni');
        if (isParentOrAlumni) {
          base44.functions.invoke('awardKarma', {
            parentUserId: user.id,
            parentEmail: user.email,
            parentName: user.full_name,
            actionType: 'message_responded',
            referenceType: 'message',
            referenceId: message.id,
            description: 'Sent a message'
          }).catch(e => console.log('Message karma failed (non-critical):', e.message));
        }
      }
      // Mark activation for message sender (parents AND students)
      checkAndMarkActivation(user.id, 'sent_message');

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
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTop: '3px solid #E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!recipient) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>User Not Found</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>We couldn't find this user. Head back to your messages.</p>
          <button onClick={() => navigate('MyMessages')} style={{
            background: '#E85D20', color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px 24px',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            ← Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const recipientFirstName = recipient?.full_name?.split(' ')[0] || 'them';
  const dmSans = "'DM Sans', system-ui, sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 24px', display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={() => navigate('MyMessages')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 13, fontWeight: 400,
            color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6,
            minHeight: 'auto', padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E85D20'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          ← Back
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: 700, margin: '0 auto', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 14,
          borderLeft: '4px solid #E85D20',
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%', background: '#E85D20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {(recipient?.full_name?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>
              {recipient?.full_name || recipient?.email}
            </p>
            {recipient?.current_company && (
              <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '4px 0 0' }}>
                {recipient.job_title ? `${recipient.job_title} at ${recipient.current_company}` : recipient.current_company}
              </p>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
          {messages.length === 0 && isFirstMessage && (
            <div style={{ textAlign: 'center', paddingY: 32, color: 'rgba(255,255,255,0.4)', fontFamily: dmSans, fontSize: 14 }}>
              Start a conversation with {recipientFirstName}
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMine = msg.sender_email === user.email;
            return (
              <div key={msg.id || idx} style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                gap: 8,
              }}>
                <div style={{ maxWidth: '80%' }}>
                  <div style={{
                    background: isMine ? '#0021A5' : 'rgba(255,255,255,0.08)',
                    color: isMine ? '#fff' : 'rgba(255,255,255,0.85)',
                    borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '11px 15px',
                    fontFamily: dmSans, fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.body}
                  </div>
                  <p style={{
                    fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)',
                    margin: '5px 0 0', textAlign: isMine ? 'right' : 'left',
                  }}>
                    {new Date(msg.created_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Composer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18 }}>
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value.slice(0, 5000));
              if (selectedTemplateId) setSelectedTemplateId(null);
            }}
            placeholder={`Message ${recipientFirstName}...`}
            style={{
              width: '100%', fontFamily: dmSans, fontSize: 13, color: '#fff',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '12px 14px', boxSizing: 'border-box',
              resize: 'vertical', minHeight: 80, maxHeight: 200,
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(232,93,32,0.4)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 }}>
            <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              {newMessage.length}/5000
            </span>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              style={{
                background: !newMessage.trim() || sending ? 'rgba(232,93,32,0.5)' : '#E85D20',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 22px', fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                minHeight: 'auto', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!(!newMessage.trim() || sending)) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}