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
      const result = await base44.functions.invoke('searchGatorStudents', {
        query: searchQuery
      });
      
      setSearchResults(result.data?.students || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      toast({
        title: "Search Failed",
        description: error.message || "Could not search for students",
        variant: "destructive"
      });
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
      const result = await base44.functions.invoke('sendGatorInvites', {
        emails: [inviteEmail],
        role: 'student',
        campus: 'UF',
        note: inviteName ? `${inviteName}, join College Fast Forward to connect with the Gator community!` : null
      });
      
      console.log('sendGatorInvites result:', result);
      
      if (result.data?.error) {
        throw new Error(result.data.details || result.data.error);
      }
      
      if (result.data?.sent?.length > 0) {
        toast({
          title: "Invite Sent! 🐊",
          description: `We sent an invitation to ${inviteEmail}`
        });
        
        setShowInviteModal(false);
        onComplete(null);
      } else if (result.data?.alreadyUsers?.length > 0) {
        toast({
          title: "Already Registered",
          description: "This email is already registered. Try searching for them instead!",
          variant: "destructive"
        });
      } else if (result.data?.invalid?.length > 0) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to send invite');
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast({
        title: "Invite Failed",
        description: error.message || "Could not send invite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-center py-6">
      {/* Logo/Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-[#FA4616] to-[#FF8A5B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <span className="text-4xl">🐊</span>
      </div>
      
      {/* Welcome Text */}
      <h2 className="text-3xl md:text-4xl font-bold mb-2">
        <span className="text-slate-800">Welcome to</span><br />
        <span className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] bg-clip-text text-transparent">College Fast Forward!</span>
        <span className="ml-2">🎉</span>
      </h2>
      
      <p className="text-slate-600 mt-4 mb-2">
        You're joining a vibrant network of Gators, parents, and alumni<br className="hidden sm:block" />
        accelerating your college success.
      </p>
      
      <p className="text-slate-500 text-sm mb-8">
        Let's set up your profile to unlock opportunities.
      </p>

      {/* Single prominent CTA */}
      <Button
        onClick={() => setShowSearchModal(true)}
        size="lg"
        className="w-full max-w-sm h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all bg-[#0021A5] hover:bg-[#001580]"
      >
        Let's Get Started
        <span className="ml-2">→</span>
      </Button>
      
      <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
        <span>✨</span> Takes just 2 minutes
      </p>

      {linkedStudent && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Linked with {linkedStudent.full_name || linkedStudent.email}</span>
          </div>
        </div>
      )}

      {/* Search Modal - Now serves as the main flow */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Connect With Your Gator</DialogTitle>
          </DialogHeader>
          
          <p className="text-slate-600 text-sm -mt-2 mb-4">
            Is your student already on College Fast Forward?
          </p>
          
          <div className="space-y-4">
            {/* Two clear options */}
            <div className="grid gap-3">
              <div 
                className="p-4 border-2 border-slate-200 rounded-xl hover:border-[#0021A5] hover:bg-blue-50/50 cursor-pointer transition-all group"
                onClick={() => {/* Stay in search mode */}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#0021A5]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Yes – Find & Link Them</p>
                    <p className="text-sm text-slate-500">Search by name or email</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-4 border-2 border-slate-200 rounded-xl hover:border-[#FA4616] hover:bg-orange-50/50 cursor-pointer transition-all group"
                onClick={() => {
                  setShowSearchModal(false);
                  setShowInviteModal(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#FA4616]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">No – Send Them an Invite</p>
                    <p className="text-sm text-slate-500">We'll email them to join</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search input (initially hidden, shows when user clicks first option) */}
            <div className="pt-2 border-t border-slate-100">
              <Label className="text-sm font-medium text-slate-700">Search for your student</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Email or name..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching} className="bg-[#0021A5]">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Results</Label>
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleLinkStudent(student)} className="bg-[#0021A5]">
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-3 text-slate-500 bg-slate-50 rounded-lg">
                <p className="text-sm">No students found with that name/email.</p>
                <Button
                  variant="link"
                  className="mt-1 text-[#FA4616]"
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  Send them an invite instead →
                </Button>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowSearchModal(false);
                onSkip();
              }}
              className="w-full text-slate-400 hover:text-slate-600 text-sm py-2"
            >
              Skip for now – I'll do this later
            </button>
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