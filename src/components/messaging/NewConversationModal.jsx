import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Send, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewConversationModal({ 
  open, 
  onOpenChange, 
  currentUser,
  onConversationCreated 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await base44.functions.invoke('searchUserForDirectory', {
        query: searchQuery,
        limit: 10
      });
      setSearchResults(result.data?.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;

    setIsSending(true);
    try {
      // Check for existing conversation
      const existingConvs = await base44.entities.Conversation.filter({
        participant_emails: { $contains: selectedUser.email }
      });
      
      const existingConv = existingConvs.find(c => 
        c.participant_emails?.includes(currentUser.email) && 
        c.participant_emails?.includes(selectedUser.email)
      );

      let conversation;
      
      if (existingConv) {
        conversation = existingConv;
      } else {
        // Create new conversation
        conversation = await base44.entities.Conversation.create({
          participant_emails: [currentUser.email, selectedUser.email],
          participant_names: {
            [currentUser.email]: currentUser.full_name || currentUser.email.split('@')[0],
            [selectedUser.email]: selectedUser.full_name || selectedUser.email.split('@')[0]
          },
          subject: subject.trim() || undefined,
          last_message_preview: message.trim().substring(0, 100),
          last_message_at: new Date().toISOString(),
          last_message_sender: currentUser.email,
          unread_count: {
            [currentUser.email]: 0,
            [selectedUser.email]: 1
          }
        });
      }

      // Create message
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email.split('@')[0],
        recipient_email: selectedUser.email,
        subject: subject.trim() || 'New message',
        body: message.trim(),
        is_read: false,
        message_type: 'text'
      });

      // Update conversation
      await base44.entities.Conversation.update(conversation.id, {
        last_message_preview: message.trim().substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_sender: currentUser.email,
        unread_count: {
          ...conversation.unread_count,
          [selectedUser.email]: (conversation.unread_count?.[selectedUser.email] || 0) + 1
        }
      });

      // Send push notification
      try {
        await base44.functions.invoke('sendPushNotification', {
          recipientEmail: selectedUser.email,
          title: `New message from ${currentUser.full_name || 'Someone'}`,
          body: message.trim().substring(0, 100),
          url: `#MyMessages?conv=${conversation.id}`
        });
      } catch (e) {
        console.log('Push notification failed:', e);
      }

      onConversationCreated(conversation);
      onOpenChange(false);
      
      // Reset form
      setSelectedUser(null);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient Selection */}
          {!selectedUser ? (
            <div>
              <Label className="text-sm font-medium">To:</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg divide-y">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold">
                        {(user.full_name || user.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        {user.current_position && (
                          <p className="text-xs text-slate-400">{user.current_position}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold">
                {(selectedUser.full_name || selectedUser.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{selectedUser.full_name || 'Unknown'}</p>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Change
              </Button>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label className="text-sm font-medium">Subject (optional)</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="mt-2"
            />
          </div>

          {/* Message */}
          <div>
            <Label className="text-sm font-medium">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="mt-2 h-32"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedUser || !message.trim() || isSending}
              className="bg-[#0021A5] hover:bg-[#001580]"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}