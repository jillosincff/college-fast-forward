import React, { useState } from 'react';
import { Link2, Mail, Search, ArrowRight, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function LinkStudentStep({ 
  user,
  onComplete, 
  onSkip 
}) {
  const [mode, setMode] = useState('choose'); // 'choose', 'search', 'invite'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkedStudent, setLinkedStudent] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await base44.functions.invoke('searchGatorStudents', {
        query: searchQuery
      });
      setSearchResults(results.data?.students || []);
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
      setLinkSuccess(true);
      setTimeout(() => onComplete?.(student), 2000);
    } catch (error) {
      console.error('Failed to link student:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsSending(true);
    try {
      await base44.functions.invoke('sendGatorInvites', {
        emails: [inviteEmail],
        role: 'student',
        note: inviteName ? `${inviteName}, join College Fast Forward!` : `Join College Fast Forward!`
      });
      setLinkSuccess(true);
      setTimeout(() => onComplete?.({ email: inviteEmail, full_name: inviteName, pending: true }), 2000);
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (linkSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          {linkedStudent?.pending ? 'Invite Sent!' : 'Student Linked!'}
        </h2>
        <p className="text-slate-600">
          {linkedStudent?.pending 
            ? `We sent an invite to ${inviteEmail}. Once they join, your accounts will link automatically.`
            : `${linkedStudent?.full_name || 'Your student'} is now connected. Your karma will boost their requests!`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          Unlock Family Karma — Link Your Student
        </h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Parents who link their student get <strong>powerful boosts</strong>: Your help directly accelerates their requests.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">🚀 What you unlock:</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Your student's questions get <strong>pinned to the top</strong> of the feed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Every answer you give <strong>boosts their visibility</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Other parents see your linked student — more likely to help</span>
          </li>
        </ul>
      </div>

      {/* Mode Selection */}
      {mode === 'choose' && (
        <div className="space-y-3">
          <Button
            onClick={() => setMode('search')}
            className="w-full py-6 text-left justify-start gap-4 bg-white border-2 border-slate-200 text-slate-800 hover:border-[#0021A5] hover:bg-blue-50"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-[#0021A5]" />
            </div>
            <div>
              <div className="font-bold">My student is already on the platform</div>
              <div className="text-sm text-slate-500 font-normal">Search by name or email to link</div>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-slate-400" />
          </Button>
          
          <Button
            onClick={() => setMode('invite')}
            className="w-full py-6 text-left justify-start gap-4 bg-white border-2 border-slate-200 text-slate-800 hover:border-[#FA4616] hover:bg-orange-50"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#FA4616]" />
            </div>
            <div>
              <div className="font-bold">Invite my student to join</div>
              <div className="text-sm text-slate-500 font-normal">Send them an email invite — auto-links when they sign up</div>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-slate-400" />
          </Button>
        </div>
      )}

      {/* Search Mode */}
      {mode === 'search' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Search for your student
            </label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter name or email..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:border-[#0021A5] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold">
                      {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleLinkStudent(student)}>
                    Link
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <div className="text-center py-4">
              <p className="text-slate-500 mb-3">No students found with that name/email.</p>
              <Button variant="outline" onClick={() => setMode('invite')}>
                Send them an invite instead →
              </Button>
            </div>
          )}

          <Button variant="ghost" onClick={() => setMode('choose')} className="w-full">
            ← Back
          </Button>
        </div>
      )}

      {/* Invite Mode */}
      {mode === 'invite' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Student's name <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Student's email <span className="text-red-500">*</span>
            </label>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="student@email.com"
              type="email"
            />
          </div>

          <Button
            onClick={handleSendInvite}
            disabled={!inviteEmail.trim() || isSending}
            className="w-full py-6 bg-[#FA4616] hover:bg-[#d63a12] text-white font-bold"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Send Invite & Link Automatically
              </>
            )}
          </Button>

          <Button variant="ghost" onClick={() => setMode('choose')} className="w-full">
            ← Back
          </Button>
        </div>
      )}

      {/* Skip Option */}
      {mode === 'choose' && (
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={onSkip}
            className="w-full text-center py-3 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Skip for now</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Skip = no karma boosts for your student
            </p>
          </button>
        </div>
      )}
    </div>
  );
}