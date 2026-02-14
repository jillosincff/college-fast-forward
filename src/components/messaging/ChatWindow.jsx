import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Send, Paperclip, X, Download, FileText, Image, Loader2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function ChatWindow({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onLoadMore,
  hasMore,
  isLoading,
  isSending
}) {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    await onSendMessage(newMessage.trim(), attachments);
    setNewMessage('');
    setAttachments([]);
    textareaRef.current?.focus();
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
    
    const newAttachments = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        newAttachments.push({
          name: file.name,
          url: result.file_url,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatMessageDate = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday ' + format(d, 'h:mm a');
    return format(d, 'MMM d, h:mm a');
  };

  const otherParticipant = conversation?.participant_emails?.find(e => e !== currentUser?.email);
  const otherName = conversation?.participant_names?.[otherParticipant] || otherParticipant?.split('@')[0] || 'Unknown';

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Select a conversation</p>
          <p className="text-slate-400 text-sm">Choose from your conversations on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-h-0">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold flex-shrink-0">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 truncate">{otherName}</h3>
            {conversation.subject && (
              <p className="text-sm text-slate-500 truncate">{conversation.subject}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-slate-50">
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load earlier messages'}
          </button>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.sender_email === currentUser?.email;
          const showAvatar = index === 0 || messages[index - 1]?.sender_email !== msg.sender_email;
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {showAvatar && !isOwn && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(msg.sender_name || msg.sender_email)?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!showAvatar && !isOwn && <div className="w-8"></div>}

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'bg-[#0021A5] text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.body && (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                    )}
                    
                    {/* Attachments */}
                    {msg.attachments?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-100 hover:bg-slate-200'
                            } transition-colors`}
                          >
                            {att.type?.startsWith('image/') ? (
                              <img src={att.url} alt={att.name} className="w-32 h-32 object-cover rounded" />
                            ) : (
                              <>
                                {getFileIcon(att.type)}
                                <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                                <Download className="w-3 h-3 ml-auto" />
                              </>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-slate-400">
                      {formatMessageDate(msg.created_date)}
                    </span>
                    {isOwn && (
                      <span className="text-xs">
                        {msg.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200"
              >
                {getFileIcon(att.type)}
                <span className="text-sm text-slate-700 max-w-[120px] truncate">{att.name}</span>
                <span className="text-xs text-slate-400">{formatFileSize(att.size)}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-slate-200 sticky bottom-0 z-20 safe-area-bottom">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <Paperclip className="w-5 h-5 text-slate-500" />
            )}
          </Button>

          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
            className="bg-[#0021A5] hover:bg-[#001580] flex-shrink-0 min-w-[44px] min-h-[44px]"
            size="icon"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}