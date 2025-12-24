import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Send, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function RecommendHelperModal({ isOpen, onClose, question, currentUser }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [personalNote, setPersonalNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    setIsSearching(true);
    try {
      const result = await base44.functions.invoke('searchUsersForTagging', {
        query: searchQuery,
        limit: 10
      });
      
      // Filter out the current user and the question poster
      const filtered = (result.data?.users || []).filter(u => 
        u.email !== currentUser?.email && 
        u.email !== question?.created_by
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSendRecommendation = async () => {
    if (!selectedUser || !question) return;
    
    setIsSending(true);
    try {
      await base44.functions.invoke('sendHelperRecommendation', {
        questionId: question.id,
        questionTitle: question.title || question.role || 'A question',
        questionDescription: question.description,
        questionPosterName: question.poster_name || question.poster_first_name,
        recommendedUserEmail: selectedUser.email,
        recommendedUserName: selectedUser.full_name,
        recommenderName: currentUser.full_name || currentUser.email.split('@')[0],
        recommenderEmail: currentUser.email,
        personalNote: personalNote.trim()
      });
      
      setSent(true);
      toast({
        title: "🏷️ Recommendation Sent!",
        description: `${selectedUser.full_name || selectedUser.email} has been notified.`
      });
      
      // Close after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to send recommendation:', error);
      toast({
        title: "Failed to send",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setPersonalNote('');
    setSent(false);
    onClose();
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Recommend a Helper
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Recommendation Sent!</h3>
            <p className="text-slate-600 mt-2">
              {selectedUser?.full_name || 'They'} will be notified about this question.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Question Preview */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Recommending for:</p>
              <p className="font-medium text-slate-900 text-sm line-clamp-2">
                "{question.title || question.role}"
              </p>
            </div>

            {/* Selected User or Search */}
            {selectedUser ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedUser.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedUser.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {selectedUser.current_company || selectedUser.current_position || selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium">Search for a helper</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name or email..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || searchQuery.length < 2}
                    size="icon"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.current_company || user.current_position || user.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <p className="text-sm text-slate-500 mt-2 text-center py-4">
                    No users found. Try a different search.
                  </p>
                )}
              </div>
            )}

            {/* Personal Note */}
            {selectedUser && (
              <div>
                <Label className="text-sm font-medium">Add a note (optional)</Label>
                <Textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder={`Why do you think ${selectedUser.full_name?.split(' ')[0]} can help?`}
                  className="mt-2 h-20"
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 mt-1">{personalNote.length}/200</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSendRecommendation}
                disabled={!selectedUser || isSending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}