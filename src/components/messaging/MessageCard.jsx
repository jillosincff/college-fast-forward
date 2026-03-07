import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Send, Paperclip, Loader2, X, FileText, Image, Download, Check, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

function formatMessageDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday ' + format(d, 'h:mm a');
  return format(d, 'MMM d, h:mm a');
}

function formatCardTimestamp(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function getFileIcon(type) {
  if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MessageCard({ 
  conversation, 
  currentUser, 
  userLookup,
  isExpanded, 
  onToggle, 
  onMessageSent 
}) {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const threadEndRef = useRef(null);

  const otherEmail = conversation.participant_emails?.find(e => e !== currentUser?.email) || '';
  
  // Resolve sender name: prefer userLookup, then conversation data, then email parse
  const resolvedUser = userLookup?.[otherEmail];
  const otherFullName = resolvedUser?.full_name || conversation.participant_names?.[otherEmail] || null;
  const otherName = otherFullName || otherEmail.split('@')[0];
  const otherRole = resolvedUser?.persona 
    ? resolvedUser.persona === 'parent' ? 'UF Parent' 
      : resolvedUser.persona === 'alumni' ? 'UF Alum' 
      : resolvedUser.persona === 'gator' ? 'UF Student' 
      : ''
    : '';
  
  const initials = otherFullName 
    ? otherFullName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : otherName.charAt(0).toUpperCase();

  const unreadCount = conversation.unread_count?.[currentUser?.email] || 0;
  const messages = (conversation._messages || []).sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  // Clean up subject line - remove redundant "A message from..." patterns
  const rawSubject = conversation.subject || conversation.related_post_title || '';
  const cleanSubject = rawSubject.replace(/^(A message from|Message from|New message from)\s+.+$/i, '').trim() 
    || conversation.related_post_title 
    || rawSubject 
    || 'Direct Message';

  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage?.body?.substring(0, 100) || conversation.last_message_preview || '';

  useEffect(() => {
    if (isExpanded && threadEndRef.current) {
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }, [isExpanded, messages.length]);

  // Mark messages as read when expanded
  useEffect(() => {
    if (!isExpanded || !currentUser?.email) return;
    const unreadMsgs = messages.filter(m => !m.is_read && m.recipient_email === currentUser.email);
    unreadMsgs.forEach(msg => {
      base44.entities.Message.update(msg.id, { is_read: true, read_at: new Date().toISOString() })
        .catch(() => {});
    });
  }, [isExpanded]);

  const handleSend = async () => {
    if (!replyText.trim() && attachments.length === 0) return;
    setIsSending(true);
    try {
      const newMsg = await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email.split('@')[0],
        recipient_email: otherEmail,
        subject: conversation.subject || 'Message',
        body: replyText.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        is_read: false,
        message_type: 'text'
      });

      // Update conversation entity if it exists
      try {
        await base44.entities.Conversation.update(conversation.id, {
          last_message_preview: replyText.substring(0, 100),
          last_message_at: new Date().toISOString(),
          last_message_sender: currentUser.email,
        });
      } catch (e) { /* orphan conversation, skip */ }

      // Send notifications (fire-and-forget)
      base44.functions.invoke('sendPushNotification', {
        recipientEmail: otherEmail,
        title: `New message from ${currentUser.full_name || 'Someone'}`,
        body: replyText.substring(0, 100),
        url: `#MyMessages?conv=${conversation.id}`
      }).catch(() => {});

      base44.functions.invoke('sendMessageNotification', {
        recipientEmail: otherEmail,
        senderName: currentUser.full_name || currentUser.email.split('@')[0],
        senderEmail: currentUser.email,
        subject: conversation.subject || 'New message',
        messageBody: replyText
      }).catch(() => {});

      // Award karma for parents/alumni
      const isHelper = currentUser.persona === 'parent' || currentUser.persona === 'alumni' ||
                       currentUser.roles?.includes('parent') || currentUser.roles?.includes('alumni');
      if (isHelper) {
        base44.functions.invoke('awardKarma', {
          parentUserId: currentUser.id,
          parentEmail: currentUser.email,
          parentName: currentUser.full_name,
          actionType: 'message_responded',
          referenceType: 'message',
          referenceId: newMsg.id,
          description: 'Responded to a message'
        }).catch(() => {});
      }

      setReplyText('');
      setAttachments([]);
      onMessageSent?.(conversation.id, newMsg);
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const newAtts = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        newAtts.push({ name: file.name, url: result.file_url, size: file.size, type: file.type });
      } catch (err) { console.error('Upload failed:', err); }
    }
    setAttachments(prev => [...prev, ...newAtts]);
    setUploading(false);
    e.target.value = '';
  };

  return (
    <Card className={`transition-all duration-200 ${isExpanded ? 'border-blue-300 shadow-lg' : 'hover:shadow-md hover:border-slate-300'} ${unreadCount > 0 && !isExpanded ? 'border-l-4 border-l-blue-600 bg-blue-50/30' : ''}`}>
      {/* Collapsed header - always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-900 truncate text-sm">
                {otherName}
              </span>
              {otherRole && (
                <span className="text-xs text-slate-400 flex-shrink-0">· {otherRole}</span>
              )}
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 h-4 ml-auto flex-shrink-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
              {cleanSubject}
            </p>
            {!isExpanded && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {lastMessage?.sender_email === currentUser?.email && 'You: '}
                {preview}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            <span className="text-xs text-slate-400">{formatCardTimestamp(conversation.last_message_at)}</span>
            {isExpanded 
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />
            }
          </div>
        </div>
      </button>

      {/* Expanded thread */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200">
              {/* Thread messages */}
              <div className="max-h-[400px] overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
                {messages.map((msg) => {
                  const isOwn = msg.sender_email === currentUser?.email;
                  const msgSenderLookup = userLookup?.[msg.sender_email];
                  const msgSenderName = isOwn 
                    ? 'You' 
                    : msgSenderLookup?.full_name || msg.sender_name || msg.sender_email?.split('@')[0];

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${isOwn ? 'text-blue-600' : 'text-slate-600'}`}>
                            {msgSenderName}
                          </span>
                          <span className="text-xs text-slate-400">{formatMessageDate(msg.created_date)}</span>
                          {isOwn && (
                            msg.is_read 
                              ? <CheckCheck className="w-3 h-3 text-blue-500" />
                              : <Check className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <div className={`rounded-xl px-3.5 py-2.5 ${
                          isOwn 
                            ? 'bg-[#0021A5] text-white rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.body && <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>}
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {msg.attachments.map((att, i) => (
                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                    isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-100 hover:bg-slate-200'
                                  }`}>
                                  {att.type?.startsWith('image/') 
                                    ? <img src={att.url} alt={att.name} className="w-28 h-28 object-cover rounded" />
                                    : <>
                                        {getFileIcon(att.type)}
                                        <span className="truncate max-w-[120px]">{att.name}</span>
                                        <Download className="w-3 h-3 ml-auto" />
                                      </>
                                  }
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              {/* Attachment preview */}
              {attachments.length > 0 && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border text-xs">
                        {getFileIcon(att.type)}
                        <span className="truncate max-w-[100px]">{att.name}</span>
                        <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply input */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl">
                <div className="flex items-end gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx" />
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex-shrink-0 h-9 w-9">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4 text-slate-500" />}
                  </Button>
                  <Textarea
                    ref={textareaRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a reply..."
                    className="flex-1 min-h-[40px] max-h-24 resize-none text-sm"
                    rows={1}
                  />
                  <Button onClick={handleSend} size="icon"
                    disabled={(!replyText.trim() && attachments.length === 0) || isSending}
                    className="bg-[#0021A5] hover:bg-[#001580] flex-shrink-0 h-9 w-9">
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}