import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { useToast } from '@/components/ui/use-toast';

export default function ConnectGatorStep({ onComplete, onSkip }) {
  const { toast } = useToast();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [linkedStudent, setLinkedStudent] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Search for students by email or name
      const results = await base44.functions.invoke('searchUserForDirectory', {
        query: searchQuery,
        persona: 'gator'
      });
      setSearchResults(results.data?.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    try {
      await base44.functions.invoke('linkStudentsToParent', {
        studentEmailsOrNames: [student.email]
      });
      
      setLinkedStudent(student);
      setShowSearchModal(false);
      
      toast({
        title: "Student Linked! 🎉",
        description: `${student.full_name || student.email} is now connected to your account.`
      });
      
      // Continue to next step after brief delay
      setTimeout(() => onComplete(student), 1500);
    } catch (error) {
      console.error('Failed to link student:', error);
      toast({
        title: "Link Failed",
        description: "Could not link student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsSending(true);
    try {
      await base44.functions.invoke('sendGatorInvites', {
        emails: [inviteEmail],
        inviterName: inviteName || 'A Gator Parent',
        message: `Join the Gator Network to connect with UF parents and alumni who can help with your career!`
      });
      
      toast({
        title: "Invite Sent! 🐊",
        description: `We sent an invitation to ${inviteEmail}`
      });
      
      setShowInviteModal(false);
      onComplete(null); // Continue without linked student
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast({
        title: "Invite Failed",
        description: "Could not send invite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl">🐊</span>
      </div>
      
      <h2 className="text-3xl font-bold text-[#0021A5] mb-4">
        Connect With Your Gator
      </h2>
      
      <p className="text-lg text-slate-600 mb-8">
        Is your student already on College Fast Forward?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <Button
          onClick={() => setShowSearchModal(true)}
          size="lg"
          className="min-w-[220px] h-14 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ backgroundColor: '#0021A5' }}
        >
          <Search className="w-5 h-5 mr-2" />
          Yes – Search & Link Them
        </Button>
        
        <Button
          onClick={() => setShowInviteModal(true)}
          size="lg"
          className="min-w-[220px] h-14 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ backgroundColor: '#FA4616' }}
        >
          <Mail className="w-5 h-5 mr-2" />
          No – Send Them an Invite
        </Button>
      </div>

      <button
        onClick={onSkip}
        className="text-slate-500 hover:text-slate-700 underline text-sm"
      >
        Skip for now
      </button>

      {linkedStudent && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Linked with {linkedStudent.full_name || linkedStudent.email}</span>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0021A5]">Search for Your Gator</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Email or Name</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="john.doe@ufl.edu or John Doe"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Results</Label>
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleLinkStudent(student)}>
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-4 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No students found. Try a different search or send them an invite.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  Send an Invite Instead
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#FA4616]">Invite Your Gator Student</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Name</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Student's Email *</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="john.doe@ufl.edu"
                type="email"
                className="mt-2"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                🐊 We'll send them an email invitation to join the Gator Network. 
                Once they sign up, you'll be automatically linked!
              </p>
            </div>

            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || isSending}
              className="w-full"
              style={{ backgroundColor: '#FA4616' }}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}