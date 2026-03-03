import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Link2, ArrowRight, UserCheck, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from 'lodash';

export default function LinkStudentModal({ open, onOpenChange, onLinked }) {
  const { toast } = useToast();
  const [step, setStep] = useState('search'); // 'search' | 'manual'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [linking, setLinking] = useState(false);
  const [manualEmail, setManualEmail] = useState('');

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setSearching(true);
      setHasSearched(true);
      try {
        const res = await base44.functions.invoke('searchGatorStudents', { query: q.trim() });
        setResults(res.data?.students || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400),
    []
  );

  const handleQueryChange = (val) => {
    setQuery(val);
    doSearch(val);
  };

  const handleSelectStudent = async (student) => {
    setLinking(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: student.email });
      const data = res.data;
      if (data.already_linked) {
        toast({ title: 'Already linked!', description: `${student.full_name || student.email} is already connected.` });
      } else if (data.linked) {
        toast({ title: `🎉 ${student.full_name || student.email} is now linked!`, description: 'Start helping students to earn Karma and boost their questions!' });
      }
      onOpenChange(false);
      resetState();
      if (onLinked) onLinked(data);
    } catch (error) {
      console.error('Link failed:', error);
      toast({ title: 'Link failed', description: error?.response?.data?.error || 'Please try again.', variant: 'destructive' });
    } finally {
      setLinking(false);
    }
  };

  const handleManualLink = async () => {
    if (!manualEmail.trim()) return;
    setLinking(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: manualEmail.trim() });
      const data = res.data;
      if (data.already_linked) {
        toast({ title: 'Already linked!', description: 'This student is already connected to your account.' });
      } else if (data.linked) {
        const studentName = data.student_name || manualEmail.split('@')[0];
        toast({ title: `🎉 ${studentName} is now linked!`, description: 'Start helping students to earn Karma and boost their questions!' });
      } else if (data.pending) {
        toast({ title: '✅ Link saved!', description: `We'll auto-connect when ${manualEmail.split('@')[0]} joins.` });
      }
      onOpenChange(false);
      resetState();
      if (onLinked) onLinked(data);
    } catch (error) {
      console.error('Link failed:', error);
      toast({ title: 'Link failed', description: error?.response?.data?.error || 'Please try again.', variant: 'destructive' });
    } finally {
      setLinking(false);
    }
  };

  const resetState = () => {
    setStep('search');
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setManualEmail('');
  };

  const getDisplayName = (student) => {
    if (!student.full_name?.trim()) return student.email?.split('@')[0] || 'Unknown';
    const name = student.full_name;
    if (name.includes(',')) {
      const parts = name.split(',').map(s => s.trim());
      return `${parts[1] || ''} ${parts[0] || ''}`.trim();
    }
    return name;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetState(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #0021A5, #003DCE)' }}>
            <Link2 className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">Link Your Student</DialogTitle>
          <p className="text-center text-gray-500 text-sm mt-1">
            {step === 'search'
              ? "Search by name or email to find your student on CFF"
              : "Enter your student's email to link them"}
          </p>
        </DialogHeader>

        {step === 'search' && (
          <div className="space-y-4 py-2">
            {/* Search Input */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Student Name or Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="e.g. John Doe or john@ufl.edu"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Loading */}
            {searching && (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {/* Results */}
            {!searching && results.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                <Label className="text-xs text-slate-500">{results.length} student{results.length !== 1 ? 's' : ''} found</Label>
                {results.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    disabled={linking}
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition text-left"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: '#0021A5' }}>
                      {(getDisplayName(student)?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{getDisplayName(student)}</p>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                    {linking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!searching && hasSearched && results.length === 0 && query.trim().length >= 2 && (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-1">No students found for "{query}"</p>
                <p className="text-xs text-slate-400">They may not have signed up yet</p>
              </div>
            )}

            {/* Switch to manual email */}
            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  setStep('manual');
                  // Pre-fill email if query looks like an email
                  if (query.includes('@')) setManualEmail(query);
                }}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition"
                style={{ color: '#0021A5' }}
              >
                <Mail className="w-4 h-4" />
                Enter email manually instead
              </button>
            </div>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Student Email</Label>
              <Input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="student@ufl.edu"
                onKeyDown={(e) => e.key === 'Enter' && manualEmail.trim() && !linking && handleManualLink()}
                disabled={linking}
                autoFocus
              />
            </div>
            <Button
              onClick={handleManualLink}
              disabled={linking || !manualEmail.trim()}
              className="w-full text-white font-semibold"
              style={{ backgroundColor: '#0021A5' }}
            >
              {linking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
              {linking ? 'Linking...' : 'Link Student'}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              If they haven't signed up yet, we'll auto-connect when they join.
            </p>
            <button
              onClick={() => setStep('search')}
              className="w-full text-sm text-slate-500 hover:text-slate-700 py-1 transition"
            >
              ← Back to search
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}